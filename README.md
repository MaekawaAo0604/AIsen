# AIsen - アイゼンハワー・マトリクス タスク管理

AIによるタスク優先度付けと4象限管理を行うタスク管理アプリケーション。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 19, TypeScript 5
- **状態管理**: Zustand, React Query
- **スタイリング**: Tailwind CSS 4
- **ドラッグ&ドロップ**: dnd-kit

### AWS構成 (予定)

- **ホスティング**: AWS Amplify Hosting
- **データベース**: Amazon DynamoDB
- **認証**: Amazon Cognito
- **LLM**: Amazon Bedrock (Claude 3.5 Sonnet)
- **決済**: Stripe

## 開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start
```

## 機能

### MVP フェーズ

- ✅ 4象限タスク管理 (アイゼンハワー・マトリクス)
- ✅ タスクCRUD操作
- 🚧 ドラッグ&ドロップ移動
- 🚧 LLMタスク自動分類
- 🚧 URL共有 (編集/閲覧専用)
- 🚧 課金制限 (無料4件、Pro無制限)

## ドキュメント

- [要件定義](.kiro/specs/eisenhower-matrix-mvp/requirements.md)
- [技術設計](.kiro/specs/eisenhower-matrix-mvp/design.md)
- [実装タスク](.kiro/specs/eisenhower-matrix-mvp/tasks.md)

## ライセンス

MIT
