# Firebase Functions - Gmail Inbox 同期

Gmail から未読メールを取得し、Firestore の `inboxTasks` コレクションに保存する Cloud Functions です。

## セットアップ

### 1. Gmail API 有効化

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクト `aisen-psi` を選択
3. **APIs & Services** → **Enable APIs and Services**
4. 「Gmail API」を検索して有効化

### 2. OAuth 2.0 認証情報作成

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Authorized redirect URIs に以下を追加：
   - `https://aisen-psi.web.app/__/auth/handler` (本番)
   - `http://localhost:3000/__/auth/handler` (開発)
5. Client ID と Client Secret をメモ

### 3. Firebase Functions Config 設定

```bash
firebase functions:config:set \
  gmail.client_id="YOUR_CLIENT_ID" \
  gmail.client_secret="YOUR_CLIENT_SECRET" \
  gmail.redirect_uri="https://aisen-psi.web.app/__/auth/handler"
```

### 4. デプロイ

```bash
# 依存パッケージインストール
cd functions
npm install

# ビルド
npm run build

# デプロイ
firebase deploy --only functions
```

## 実装済み関数

### `syncGmailToInbox`
- **トリガー**: Pub/Sub スケジュール（15分ごと）
- **処理内容**:
  1. Firestore から `gmailToken` を持つ全ユーザーを取得
  2. 各ユーザーの Gmail 未読メール（最大50件）を取得
  3. `users/{uid}/inboxTasks` コレクションに保存
  4. 重複チェック（`gmail.messageId` で判定）

### `saveGmailToken`
- **トリガー**: HTTPS Callable Function
- **処理内容**: フロントエンドから Gmail OAuth トークンを受け取り、Firestore に保存

## Firestore スキーマ

### `users/{uid}/inboxTasks/{taskId}`
```typescript
{
  title: string              // メール件名
  description: string        // メール本文（最初の200文字）
  source: 'gmail'
  gmail: {
    messageId: string        // Gmail Message ID
    threadId: string         // Gmail Thread ID
  }
  quadrant: 'INBOX'          // 初期状態は INBOX
  aiStatus: 'pending'        // AI整理待ち
  createdAt: Timestamp
}
```

### `users/{uid}` (追加フィールド)
```typescript
{
  gmailToken: {
    refresh_token: string
    access_token: string
    updated_at: Timestamp
  }
}
```

## フロントエンド連携

### Gmail OAuth 認証フロー

1. ユーザーが「Gmail連携」ボタンをクリック
2. Google OAuth 2.0 認証画面へリダイレクト
3. 認証完了後、アクセストークンとリフレッシュトークンを取得
4. `saveGmailToken` Cloud Function を呼び出してトークンを保存

### 実装例（フロントエンド）

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const saveGmailToken = httpsCallable(functions, 'saveGmailToken');

async function handleGmailAuth(tokens: { refreshToken: string; accessToken: string }) {
  try {
    await saveGmailToken({
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
    });
    console.log('Gmail token saved successfully');
  } catch (error) {
    console.error('Failed to save Gmail token:', error);
  }
}
```

## 同期確認方法

### ログ確認
```bash
firebase functions:log --only syncGmailToInbox
```

### Firestore 確認
Firebase Console → Firestore Database → `users/{uid}/inboxTasks` を確認

### テスト実行（手動）
```bash
firebase functions:shell
> syncGmailToInbox()
```

## トラブルシューティング

### Gmail API Quota エラー
- Gmail API には 1日あたり10億リクエストの制限あり
- 15分ごと × 1日 = 96回の同期実行
- 1ユーザー50メール取得で計算すると、約2万ユーザーまで対応可能

### トークンエラー
- リフレッシュトークンの有効期限切れの場合、再認証が必要
- エラーログを確認し、該当ユーザーに再認証を促す

### 同期されない
1. `firebase functions:log` でエラー確認
2. Firestore の `users/{uid}` に `gmailToken` が保存されているか確認
3. Gmail API が有効化されているか確認
