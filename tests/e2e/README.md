# E2E Testing Guide

## セットアップ

### 1. テストアカウントの作成

E2Eテストを実行する前に、Firebaseにテストアカウントを作成してください。

#### 方法1: Firebase Consoleで手動作成（推奨）

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. `asian-mvp` プロジェクトを選択
3. **Authentication** > **Users** タブに移動
4. **Add user** ボタンをクリック
5. 以下の情報で作成:
   - Email: `test@aisen.dev`
   - Password: `testpass123`

#### 方法2: スクリプトで自動作成

Firebase Admin SDK のサービスアカウントキーが必要です。

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. **Project Settings** > **Service Accounts** タブ
3. **Generate new private key** をクリックしてJSON をダウンロード
4. ダウンロードしたファイルを `service-account-key.json` として保存
5. 環境変数を設定:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
   ```
6. スクリプトを実行:
   ```bash
   npx tsx scripts/create-test-account.ts
   ```

### 2. 環境変数の設定

`.env.test` ファイルが既に作成されています:

```bash
TEST_EMAIL=test@aisen.dev
TEST_PASSWORD=testpass123
BASE_URL=http://localhost:3000
```

必要に応じて値を変更してください。

## テスト実行

### 開発サーバーの起動

テスト実行前に、開発サーバーを起動してください:

```bash
npm run dev
```

### すべてのE2Eテストを実行

```bash
npm run test:e2e
```

または

```bash
npx playwright test
```

### 特定のテストファイルを実行

```bash
# 認証テスト
npx playwright test tests/e2e/desktop/auth.spec.ts

# ブレインストーミングテスト
npx playwright test tests/e2e/desktop/brainstorm.spec.ts
```

### UIモードで実行（推奨）

```bash
npx playwright test --ui
```

### ヘッドフルモードで実行（ブラウザを表示）

```bash
npx playwright test --headed
```

### デバッグモード

```bash
npx playwright test --debug
```

## テストケース

### 認証テスト (`auth.spec.ts`)

- ✅ ログインモーダルが開く
- ✅ メールアドレスでログインできる
- ✅ 誤ったパスワードでエラーメッセージが表示される
- ✅ 新規登録リンクが表示される
- ✅ 新規登録画面に切り替えられる
- ✅ 無効なメールアドレスでエラーメッセージが表示される

### AIブレインストーミングテスト (`brainstorm.spec.ts`)

- ✅ AIブレインストーミングボタンが表示される
- ✅ AIブレインストーミングモーダルが開く
- ✅ Freeプランで残り回数が表示される
- ✅ AIブレインストーミングを実行できる
- ⚠️ 5回使用後に制限メッセージが表示される（要Firestore操作）
- ⚠️ 制限エラーモーダルにプランリンクが表示される（要Firestore操作）
- ✅ モーダルを閉じられる

## 注意事項

### 使用制限テストについて

ブレインストーミングの使用制限テスト（5回制限）を実行するには、以下のいずれかの方法が必要です:

1. **手動でFirestoreを操作**: Firebase Console で `users/{uid}/usage/brainstorm` の `count` を 4 または 5 に設定
2. **Admin SDKで事前設定**: `beforeEach` フックで使用回数を設定するヘルパー関数を作成
3. **モックを使用**: API呼び出しをモックして使用回数を制御

### テストデータのクリーンアップ

テスト実行後、必要に応じて以下のデータをクリーンアップしてください:

- Firestore の `users/{uid}/usage/brainstorm` ドキュメント
- テスト中に作成されたボードやタスク

### CI/CD環境での実行

CI/CD環境で実行する場合は、以下を確認してください:

- Firebase Emulator Suite の使用を検討
- テストアカウントの認証情報を環境変数で管理
- Playwright のブラウザインストール: `npx playwright install`

## トラブルシューティング

### テストがタイムアウトする

- 開発サーバーが起動しているか確認
- `BASE_URL` が正しいか確認
- ネットワーク接続を確認

### 認証エラーが発生する

- テストアカウントが Firebase に存在するか確認
- `.env.test` の認証情報が正しいか確認

### ブラウザが見つからない

```bash
npx playwright install
```

を実行してブラウザをインストールしてください。
