# Firestore Security Rules 設定手順

## 概要

Firestoreのセキュリティルールを設定して、データアクセスを制御します。

## セキュリティポリシー

### Boards Collection
- **読み取り**: 誰でも可能
- **作成**: 誰でも可能
- **更新/削除**: `editKey`が一致する場合のみ

### Tasks Subcollection (boards/{boardId}/tasks/{taskId})
- **読み取り**: 親ボードが読み取り可能なら可能
- **作成/更新/削除**: 誰でも可能 (editKeyは親ボードで管理)

### Users Collection
- **読み取り**: 自分のユーザー情報のみ
- **作成**: 新規ユーザー作成時のみ
- **更新**: 自分のユーザー情報のみ
- **削除**: 不可

## 設定手順

### 1. Firebase Console にアクセス

https://console.firebase.google.com/

### 2. プロジェクトを選択

`aisen-mvp` プロジェクトを選択

### 3. Firestore Database に移動

左メニュー > **Firestore Database** > **ルール** タブ

### 4. ルールを更新

以下の内容を貼り付けます（または `firestore.rules` ファイルの内容をコピー）:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Boards Collection
    match /boards/{boardId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.resource.data.editKey == resource.data.editKey;
      allow delete: if request.resource.data.editKey == resource.data.editKey;

      match /tasks/{taskId} {
        allow read: if true;
        allow create: if true;
        allow update, delete: if true;
      }
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && !exists(/databases/$(database)/documents/users/$(userId));
      allow update: if isOwner(userId);
      allow delete: if false;
    }

    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. 公開ボタンをクリック

右上の **公開** ボタンをクリックして変更を適用します。

### 6. 動作確認

ブラウザで http://localhost:3000 にアクセスして、以下を確認:

1. ページが正常に表示される
2. タスクを作成できる
3. タスクを編集できる
4. タスクを削除できる
5. タスクをドラッグ&ドロップで移動できる
6. ページをリロードしてもデータが保持される

## トラブルシューティング

### エラー: "Missing or insufficient permissions"

- Security Rulesが正しく設定されているか確認
- Firebase Consoleで「公開」をクリックしたか確認

### データが保存されない

- `.env.local` の Firebase 設定が正しいか確認
- 開発サーバーを再起動: `npm run dev`
- ブラウザのコンソールでエラーを確認

### リアルタイム同期が動作しない

- `useBoardController` がマウントされているか確認
- ブラウザのネットワークタブで WebSocket 接続を確認
