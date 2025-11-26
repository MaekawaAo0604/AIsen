import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {google} from "googleapis";
import OpenAI from "openai";

admin.initializeApp();

const db = admin.firestore();

// OpenAI client (lazy initialization)
let openaiClient: OpenAI | null = null;

/**
 * Get or initialize OpenAI client
 * @return {OpenAI} OpenAI client instance
 */
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Inbox tasks AI organizing function
 * Called from frontend to analyze and classify tasks using AI
 * and move them to the default board
 */
export const organizeInboxTasks = functions
  .runWith({timeoutSeconds: 540, memory: "2GB"})
  .https.onCall(async (data, context) => {
    // Authenticate user
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const userId = context.auth.uid;

    // Check if user has Pro plan
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const userPlan = userData?.plan || "free";

    if (userPlan !== "pro") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "AI inbox organization is only available for Pro plan users"
      );
    }

    try {
      // Get user settings to find default board
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      let defaultBoardId = userData?.defaultBoardId;

      // If no default board set, find most recently updated board
      if (!defaultBoardId) {
        const boardsSnapshot = await userRef
          .collection("boards")
          .orderBy("updatedAt", "desc")
          .limit(1)
          .get();

        if (boardsSnapshot.empty) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "No boards found. Please create a board first."
          );
        }

        defaultBoardId = boardsSnapshot.docs[0].id;
      }

      // Get the default board
      const boardRef = userRef.collection("boards").doc(defaultBoardId);
      const boardDoc = await boardRef.get();

      if (!boardDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Default board not found"
        );
      }

      const boardData = boardDoc.data();

      // Fetch INBOX tasks from Firestore
      const inboxTasksRef = db
        .collection("users")
        .doc(userId)
        .collection("inboxTasks");

      const snapshot = await inboxTasksRef
        .where("quadrant", "==", "INBOX")
        .get();

      if (snapshot.empty) {
        return {success: true, organized: 0, message: "No tasks to organize"};
      }

      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Analyze each task with OpenAI
      const organizedTasks = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tasks.map(async (task: any) => {
          try {
            const prompt = `あなたはタスク管理のエキスパートです。
以下のメールをアイゼンハワー・マトリクスに基づいて、4つの象限に分類してください。

メール情報:
件名: ${task.title}
内容: ${task.description || ""}

4つの象限:
- Q1: 重要かつ緊急 (今すぐやる)
- Q2: 重要だが緊急ではない (計画してやる)
- Q3: 緊急だが重要ではない (誰かに任せる)
- Q4: 重要でも緊急でもない (やらない)

以下のJSON形式で回答してください:
{
  "quadrant": "Q1" | "Q2" | "Q3" | "Q4",
  "reason": "判定理由の説明（簡潔に）"
}`;

            const completion = await getOpenAI().chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "あなたはタスク管理のエキスパートです。アイゼンハワー・マトリクスに基づいてメールを分類します。",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              response_format: {type: "json_object"},
              temperature: 0.7,
            });

            const result = JSON.parse(
              completion.choices[0].message.content || "{}"
            );

            return {
              taskId: task.id,
              task: task,
              quadrant: result.quadrant.toLowerCase(),
              reason: result.reason,
            };
          } catch (error) {
            console.error(`Error analyzing task ${task.id}:`, error);
            return {
              taskId: task.id,
              task: task,
              quadrant: "q4",
              reason: "AI分析エラー",
            };
          }
        })
      );

      // Move tasks to board and delete from inbox
      // Group tasks by quadrant to minimize Firestore updates
      const tasksByQuadrant: Record<string, any[]> = {
        q1: [...(boardData?.q1 || [])],
        q2: [...(boardData?.q2 || [])],
        q3: [...(boardData?.q3 || [])],
        q4: [...(boardData?.q4 || [])],
      };

      const tasksToDelete: string[] = [];

      organizedTasks.forEach(({taskId, task, quadrant, reason}) => {
        // Create task object for board
        const newTask = {
          id: crypto.randomUUID(),
          title: task.title,
          description: task.description || "",
          createdAt: new Date().toISOString(),
          aiMeta: {
            organizedAt: admin.firestore.Timestamp.now(),
            model: "gpt-4o-mini",
            reason,
          },
        };

        // Add task to appropriate quadrant
        tasksByQuadrant[quadrant].push(newTask);
        tasksToDelete.push(taskId);
      });

      // Single batch with board update + all inbox deletions
      const batch = db.batch();

      // Update board once with all new tasks
      batch.update(boardRef, {
        q1: tasksByQuadrant.q1,
        q2: tasksByQuadrant.q2,
        q3: tasksByQuadrant.q3,
        q4: tasksByQuadrant.q4,
        updatedAt: new Date().toISOString(),
      });

      // Delete all inbox tasks
      tasksToDelete.forEach((taskId) => {
        const inboxTaskRef = inboxTasksRef.doc(taskId);
        batch.delete(inboxTaskRef);
      });

      await batch.commit();

      return {
        success: true,
        organized: organizedTasks.length,
        boardId: defaultBoardId,
        results: organizedTasks.map(({taskId, quadrant, reason}) => ({
          taskId,
          quadrant,
          reason,
        })),
      };
    } catch (error) {
      console.error("Error organizing inbox tasks:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to organize tasks"
      );
    }
  });

/**
 * Gmail同期のスケジュールされた関数
 * 15分ごとに実行され、全ユーザーのGmailからタスク候補を取得
 */
export const syncGmailToInbox = functions
  .runWith({timeoutSeconds: 540, memory: "1GB"})
  .pubsub.schedule("every 15 minutes")
  .onRun(async () => {
    console.log("Starting Gmail sync...");

    try {
      // 全ユーザーを取得（gmailTokenが設定されているユーザーのみ）
      const usersSnapshot = await db.collection("users")
        .where("gmailToken", "!=", null)
        .get();

      console.log(`Found ${usersSnapshot.size} users with Gmail tokens`);

      // 各ユーザーのGmailを同期
      const syncPromises = usersSnapshot.docs.map((userDoc) =>
        syncUserGmail(userDoc.id, userDoc.data())
      );

      await Promise.all(syncPromises);

      console.log("Gmail sync completed successfully");
    } catch (error) {
      console.error("Error during Gmail sync:", error);
      throw error;
    }
  });

/**
 * 個別ユーザーのGmail同期
 * @param {string} userId ユーザーID
 * @param {any} userData ユーザーデータ
 * @return {Promise<void>}
 */
async function syncUserGmail(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any
): Promise<void> {
  try {
    console.log(`Syncing Gmail for user: ${userId}`);

    // OAuth2クライアント設定
    const oauth2Client = new google.auth.OAuth2(
      functions.config().gmail.client_id,
      functions.config().gmail.client_secret,
      functions.config().gmail.redirect_uri
    );

    oauth2Client.setCredentials({
      refresh_token: userData.gmailToken.refresh_token,
      access_token: userData.gmailToken.access_token,
    });

    const gmail = google.gmail({version: "v1", auth: oauth2Client});

    // 未読メールを取得（最大50件）
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread label:inbox",
      maxResults: 50,
    });

    const messages = response.data.messages || [];
    console.log(`Found ${messages.length} unread messages for user ${userId}`);

    // 各メッセージをinboxTasksに変換
    for (const message of messages) {
      if (!message.id) continue;

      // メッセージの詳細を取得
      const messageDetail = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      // ヘッダーから件名と送信者を抽出
      const headers = messageDetail.data.payload?.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value ||
        "（件名なし）";
      const from =
        headers.find((h) => h.name === "From")?.value ||
        "（送信者不明）";

      // 本文を抽出（簡易版）
      let body = "";
      if (messageDetail.data.payload?.body?.data) {
        body = Buffer.from(
          messageDetail.data.payload.body.data,
          "base64"
        ).toString("utf-8");
      } else if (messageDetail.data.payload?.parts) {
        // マルチパートメッセージの場合
        const textPart = messageDetail.data.payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        }
      }

      // 本文を最初の200文字に制限
      const description = body.substring(0, 200).trim() || from;

      // 既存のタスクチェック（重複防止）
      const existingTask = await db
        .collection("users")
        .doc(userId)
        .collection("inboxTasks")
        .where("gmail.messageId", "==", message.id)
        .limit(1)
        .get();

      if (existingTask.empty) {
        // 新規タスクとして追加
        await db
          .collection("users")
          .doc(userId)
          .collection("inboxTasks")
          .add({
            title: subject,
            description: description,
            source: "gmail",
            gmail: {
              messageId: message.id,
              threadId: message.threadId || "",
            },
            quadrant: "INBOX",
            aiStatus: "pending",
            createdAt: admin.firestore.Timestamp.now(),
          });

        console.log(`Added inbox task for message: ${message.id}`);
      }
    }

    console.log(`Completed sync for user: ${userId}`);
  } catch (error) {
    console.error(`Error syncing Gmail for user ${userId}:`, error);
    // 個別ユーザーのエラーは全体の同期を止めない
  }
}

/**
 * Gmail OAuth認証URLを生成
 * フロントエンドから呼び出される
 */
export const getGmailAuthUrl = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      functions.config().gmail.client_id,
      functions.config().gmail.client_secret,
      functions.config().gmail.redirect_uri
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      state: context.auth.uid, // ユーザーIDを state に含める
      prompt: "consent", // 常に同意画面を表示してrefresh tokenを取得
    });

    return {authUrl};
  } catch (error) {
    console.error("Error generating auth URL:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate auth URL"
    );
  }
});

/**
 * Gmail OAuth認証用のトークン保存エンドポイント
 * フロントエンドから呼び出される
 */
export const saveGmailToken = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;
  const {code} = data;

  if (!code) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing OAuth code"
    );
  }

  try {
    // OAuth2クライアント設定
    const oauth2Client = new google.auth.OAuth2(
      functions.config().gmail.client_id,
      functions.config().gmail.client_secret,
      functions.config().gmail.redirect_uri
    );

    // codeをトークンに交換
    const {tokens} = await oauth2Client.getToken(code);

    if (!tokens.refresh_token || !tokens.access_token) {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get tokens from OAuth code"
      );
    }

    // トークンをFirestoreに保存
    await db.collection("users").doc(userId).set(
      {
        gmailToken: {
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          updated_at: admin.firestore.Timestamp.now(),
        },
      },
      {merge: true}
    );

    console.log(`Saved Gmail token for user: ${userId}`);
    return {success: true};
  } catch (error) {
    console.error("Error saving Gmail token:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to save Gmail token"
    );
  }
});
