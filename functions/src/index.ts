import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {google} from "googleapis";

admin.initializeApp();

const db = admin.firestore();

/**
 * Gmail同期のスケジュールされた関数
 * 15分ごとに実行され、全ユーザーのGmailからタスク候補を取得
 */
export const syncGmailToInbox = functions
  .runWith({timeoutSeconds: 540, memory: "1GB"})
  .pubsub.schedule("every 15 minutes")
  .onRun(async (context) => {
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
 */
async function syncUserGmail(userId: string, userData: any) {
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
      const subject = headers.find((h) => h.name === "Subject")?.value || "（件名なし）";
      const from = headers.find((h) => h.name === "From")?.value || "（送信者不明）";

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
  const {refreshToken, accessToken} = data;

  if (!refreshToken || !accessToken) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required tokens"
    );
  }

  try {
    // トークンをFirestoreに保存
    await db.collection("users").doc(userId).set(
      {
        gmailToken: {
          refresh_token: refreshToken,
          access_token: accessToken,
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
