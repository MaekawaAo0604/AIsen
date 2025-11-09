# AIsen - アイゼンハワー・マトリクス タスク管理

AIによるタスク優先度付けと4象限管理を行うタスク管理アプリケーション。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 19, TypeScript 5
- **状態管理**: Zustand, React Query
- **スタイリング**: Tailwind CSS 4
- **ドラッグ&ドロップ**: dnd-kit
- **バックエンド**: Firebase (Authentication, Firestore)
- **AI**: OpenAI API
- **テスト**: Playwright

## 開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check

# 本番サーバー起動
npm start
```

## テスト

```bash
# すべてのE2Eテストを実行
npm test

# UIモードでテスト実行
npm run test:ui

# デスクトップのみテスト
npm run test:desktop

# モバイルのみテスト
npm run test:mobile
```

### テスト構成

```
tests/
├── e2e/
│   ├── desktop/
│   │   └── task-crud.spec.ts    # タスクCRUD操作
│   └── mobile/
│       └── navigation.spec.ts   # モバイルナビゲーション・レスポンシブ
```

## 機能

### 実装済み

- ✅ 4象限タスク管理 (アイゼンハワー・マトリクス)
- ✅ タスクCRUD操作
- ✅ ドラッグ&ドロップ移動
- ✅ タスク完了管理
- ✅ AI自動分類・ブレインストーミング
- ✅ ボード保存・共有
- ✅ Firebase認証・Firestore連携
- ✅ レスポンシブデザイン（デスクトップ・タブレット・スマホ）

## 環境変数

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
```

## ドキュメント

- [要件定義](.kiro/specs/eisenhower-matrix-mvp/requirements.md)
- [技術設計](.kiro/specs/eisenhower-matrix-mvp/design.md)
- [実装タスク](.kiro/specs/eisenhower-matrix-mvp/tasks.md)

## ライセンス

MIT
