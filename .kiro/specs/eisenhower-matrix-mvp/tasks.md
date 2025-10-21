# 実装タスク一覧 - AIsen (Eisenhower Matrix MVP) - AWS構成

## 概要

本ドキュメントは、[requirements.md](.kiro/specs/eisenhower-matrix-mvp/requirements.md) と [design.md](.kiro/specs/eisenhower-matrix-mvp/design.md) (AWS構成) に基づく実装タスクの完全なリストです。

### 実装アプローチ

- **AWS完全統合**: Amplify + DynamoDB + Cognito + Bedrock
- **テスト駆動開発(TDD)**: 各機能について「テスト作成 → 実装 → 統合」の順序で進める
- **段階的構築**: 各タスクは前のタスクの成果物を活用
- **要件トレーサビリティ**: 各タスクに対応要件を明記 ([REQ-X])
- **コード生成プロンプト**: Claude Codeに渡す具体的な実装指示を含む

### タスク番号規則

- **フェーズ.タスク** (例: 1.1, 1.2, 2.1)
- **見積もり**: 小(1-2h) / 中(半日-1日) / 大(2-3日)

### 主な変更点 (Firebase構成からの移行)

| 項目 | 変更前 | 変更後 |
|-----|-------|-------|
| **ホスティング** | Vercel | AWS Amplify Hosting |
| **データベース** | Firestore | DynamoDB (Single Table) |
| **認証** | Firebase Auth | Amazon Cognito |
| **LLM** | 未定 | Amazon Bedrock (Claude 3.5) |
| **SDK** | Firebase SDK | AWS SDK v3 |
| **デプロイ** | Vercel CLI | Amplify CLI |

---

# Phase 1: AWS環境セットアップ

## タスク 1.1: Next.js 15プロジェクト初期化 + TypeScript設定

**要件**: 基盤
**依存**: なし
**見積もり**: 小 (1-2h)

### 目的
Next.js 15 (App Router) プロジェクトを作成し、TypeScript、ESLint、Prettier の基本設定を完了する。

### 実装内容
1. `npx create-next-app@latest` で Next.js 15 プロジェクト作成
2. `tsconfig.json` の strict モード有効化
3. `next.config.js` でApp Router設定
4. ディレクトリ構造作成: `app/`, `components/`, `stores/`, `hooks/`, `lib/`

### 受け入れ基準
- [ ] `npm run dev` でローカルサーバー起動
- [ ] TypeScript strict モード有効
- [ ] ESLint エラーなし

### コード生成プロンプト
```
Next.js 15 (App Router) プロジェクトを初期化してください。

要件:
- TypeScript strict モード
- App Router 使用
- 以下のディレクトリ構造:
  app/
  components/
  stores/
  hooks/
  lib/

設定ファイル:
- tsconfig.json: strict: true, paths設定 (@/* → ./*)
- next.config.js: App Router設定
```

---

## タスク 1.2: AWS Amplify CLI セットアップ

**要件**: 基盤
**依存**: タスク 1.1
**見積もり**: 中 (半日)

### 目的
AWS Amplify CLI をインストールし、プロジェクトを初期化する。

### 実装内容
1. `npm install -g @aws-amplify/cli`
2. `amplify configure` でAWS認証情報設定
3. `amplify init` でプロジェクト初期化
4. `amplify.yml` でビルド設定作成

### 受け入れ基準
- [ ] Amplify CLI インストール完了
- [ ] `amplify status` で状態確認
- [ ] `amplify.yml` 作成済み

### コード生成プロンプト
```
AWS Amplify CLI をセットアップしてください。

1. Amplify CLI インストール:
   npm install -g @aws-amplify/cli

2. Amplify初期化:
   amplify init
   - Project name: aisen-mvp
   - Environment: dev
   - Region: ap-northeast-1

3. amplify.yml 作成:
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*

設計書参照: デプロイ & 環境管理 > Amplify CLI デプロイ
```

---

## タスク 1.3: Amazon Cognito User Pool 作成

**要件**: [REQ-6]
**依存**: タスク 1.2
**見積もり**: 中 (半日)

### 目的
Amazon Cognito User Pool を作成し、Email/Password + Google認証を設定する。

### 実装内容
1. `amplify add auth` でCognito追加
2. Email/Password認証設定
3. Google Social Sign-In設定
4. パスワードポリシー設定

### 受け入れ基準
- [ ] Cognito User Pool作成完了
- [ ] Email認証有効
- [ ] Google認証設定済み

### コード生成プロンプト
```
Amazon Cognito User Pool を作成してください。

amplify add auth

設定:
- Sign-in: Email
- Password Policy:
  - 最小8文字
  - 大文字、小文字、数字、記号必須
- Email Verification: 必須
- MFA: Optional
- Social Sign-In: Google (後で設定)

Cognito設定 (Amplify Console で追加):
- Google OAuth:
  - Client ID: Google Cloud Consoleで取得
  - Client Secret: Google Cloud Consoleで取得
  - Callback URL: https://{amplify-domain}/oauth2/idpresponse

設計書参照: セキュリティ設計 > Amazon Cognito User Pool設定
```

---

## タスク 1.4: DynamoDB テーブル作成

**要件**: [REQ-7]
**依存**: タスク 1.2
**見積もり**: 中 (半日)

### 目的
DynamoDB テーブル (Single Table Design) を作成し、GSIを設定する。

### 実装内容
1. AWS Console で DynamoDB テーブル作成
2. プライマリキー: PK (String), SK (String)
3. GSI: GSI1-PK (editKey), GSI1-SK (METADATA)
4. Auto Scaling設定

### 受け入れ基準
- [ ] テーブル `aisen-mvp` 作成完了
- [ ] GSI作成済み
- [ ] Auto Scaling設定済み

### コード生成プロンプト
```
DynamoDB テーブルを作成してください。

AWS Console > DynamoDB > テーブル作成:

テーブル名: aisen-mvp
パーティションキー: PK (String)
ソートキー: SK (String)

GSI作成:
- GSI名: GSI1
- パーティションキー: GSI1PK (String)
- ソートキー: GSI1SK (String)

キャパシティ:
- Provisioned
- RCU: 5 (無料枠内)
- WCU: 5 (無料枠内)
- Auto Scaling有効 (Min: 5, Max: 100, Target: 70%)

設計書参照: データモデル > DynamoDB Single Table Design
```

---

## タスク 1.5: AWS SDK 統合 (DynamoDB + Cognito + Bedrock)

**要件**: [REQ-2, REQ-6, REQ-7]
**依存**: タスク 1.3, 1.4
**見積もり**: 中 (半日)

### 目的
AWS SDK v3 をインストールし、DynamoDB, Cognito, Bedrock のクライアントを初期化する。

### 実装内容
1. `npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-cognito-identity-provider @aws-sdk/client-bedrock-runtime aws-jwt-verify`
2. `lib/dynamodb.ts` でDynamoDB Client作成
3. `lib/cognito.ts` でCognito Client作成
4. `lib/bedrock.ts` でBedrock Client作成

### 受け入れ基準
- [ ] AWS SDK インストール完了
- [ ] 各クライアントエクスポート
- [ ] 環境変数で設定管理

### コード生成プロンプト
```
AWS SDK v3 を統合してください。

ファイル1: lib/dynamodb.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.DYNAMODB_REGION || 'ap-northeast-1' })
)

ファイル2: lib/cognito.ts
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'

export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || 'ap-northeast-1'
})

ファイル3: lib/bedrock.ts
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime'

export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'ap-northeast-1'
})

環境変数 (.env.local):
DYNAMODB_TABLE_NAME=aisen-mvp
DYNAMODB_REGION=ap-northeast-1

COGNITO_USER_POOL_ID=ap-northeast-1_xxxxx
COGNITO_CLIENT_ID=xxxxx
COGNITO_REGION=ap-northeast-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-northeast-1_xxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxx
NEXT_PUBLIC_COGNITO_REGION=ap-northeast-1

BEDROCK_REGION=ap-northeast-1

設計書参照: API仕様 > 実装詳細
```

---

## タスク 1.6: Stripe SDK統合

**要件**: [REQ-8]
**依存**: タスク 1.1
**見積もり**: 小 (1-2h)

### 目的
Stripe SDK をセットアップし、サーバーサイド/クライアントサイドの初期化を実装する。

### 実装内容
1. `npm install stripe @stripe/stripe-js`
2. `lib/stripe.ts` でサーバーサイド Stripe 初期化
3. `lib/stripeClient.ts` でクライアントサイド初期化
4. 環境変数設定

### 受け入れ基準
- [ ] Stripe SDK インストール完了
- [ ] サーバーサイド/クライアントサイド初期化完了
- [ ] 環境変数で API キー管理

### コード生成プロンプト
```
Stripe SDK を統合してください。

ファイル1: lib/stripe.ts (サーバーサイド)
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

ファイル2: lib/stripeClient.ts (クライアントサイド)
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

環境変数:
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_LIFETIME=price_xxx

設計書参照: API仕様 > POST /api/checkout-session
```

---

## タスク 1.7: 開発ツール設定

**要件**: 基盤
**依存**: タスク 1.1
**見積もり**: 中 (半日)

### 目的
ESLint, Prettier, Vitest, Playwright, DynamoDB Local の設定を完了する。

### 実装内容
1. `npm install -D eslint prettier vitest @vitejs/plugin-react playwright @playwright/test`
2. `.eslintrc.json`, `.prettierrc` 設定
3. `vitest.config.ts` でUnit Test設定
4. `playwright.config.ts` でE2E Test設定
5. DynamoDB Local セットアップ

### 受け入れ基準
- [ ] `npm run lint` でエラーなし
- [ ] `npm run test:unit` で空テスト実行成功
- [ ] `npm run test:e2e` で Playwright 起動
- [ ] DynamoDB Local 起動確認

### コード生成プロンプト
```
開発ツールを設定してください。

1. ESLint + Prettier: (タスク1.1と同様)

2. Vitest + DynamoDB Local:
   vitest.config.ts:
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./vitest.setup.ts']
     }
   })

   vitest.setup.ts:
   import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
   import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

   export const testDynamoDB = DynamoDBDocumentClient.from(
     new DynamoDBClient({
       endpoint: 'http://localhost:8000',
       region: 'ap-northeast-1',
       credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
     })
   )

3. DynamoDB Local:
   docker run -p 8000:8000 amazon/dynamodb-local

4. package.json スクリプト:
   "test:dynamodb": "docker run -d -p 8000:8000 amazon/dynamodb-local"
   "test:unit": "vitest"
   "test:e2e": "playwright test"

設計書参照: テスト戦略 > DynamoDB Local テスト
```

---

# Phase 2: データ層

## タスク 2.1: TypeScript型定義

**要件**: [REQ-1, REQ-2, REQ-5, REQ-6, REQ-8]
**依存**: タスク 1.1
**見積もり**: 中 (半日)

### 目的
全データモデルのTypeScript型定義を `lib/types.ts` に実装する。

### 実装内容
1. `lib/types.ts` 作成
2. 型定義: `Quadrant`, `Task`, `Board`, `User`, `Payment`, `BrainstormResult`
3. DynamoDB Item型定義
4. Zod スキーマ作成

### 受け入れ基準
- [ ] 全型定義完了 (設計書と一致)
- [ ] DynamoDB Item型定義完了
- [ ] Zod スキーマでバリデーション可能

### コード生成プロンプト
```
TypeScript型定義を実装してください。

ファイル: lib/types.ts

型定義 (設計書 > データモデル 参照):
1. type Quadrant = 'q1' | 'q2' | 'q3' | 'q4'
2. interface Task
3. interface Board
4. interface User (sub: string // Cognito User ID)
5. interface Payment (sub: string)
6. interface BrainstormResult

DynamoDB Item型定義:
7. interface DynamoDBBoardMetadata
8. interface DynamoDBTask
9. interface DynamoDBUserMetadata
10. interface DynamoDBPayment

Zodスキーマ:
- TaskSchema (zod)
- BrainstormRequestSchema (zod)

設計書参照: データモデル > TypeScript 型定義 + DynamoDB Item 型定義
```

---

## タスク 2.2: Zustand ストア実装

**要件**: [REQ-1, REQ-6, REQ-7]
**依存**: タスク 2.1
**見積もり**: 中 (半日)

### 目的
Zustand で3つのストア (`useBoardStore`, `useAuthStore`, `useUIStore`) を実装する。

### 実装内容
1. `npm install zustand`
2. `stores/useBoardStore.ts`: Board状態、CRUD操作
3. `stores/useAuthStore.ts`: Auth状態、ログイン/ログアウト (Cognito)
4. `stores/useUIStore.ts`: モーダル状態

### 受け入れ基準
- [ ] 3つのストア実装完了
- [ ] `useBoardStore` でタスクCRUD操作可能
- [ ] `useAuthStore` でCognito認証状態管理
- [ ] `useUIStore` でモーダル表示制御

### コード生成プロンプト
```
Zustand ストアを実装してください。

ファイル1: stores/useBoardStore.ts
- 状態: tasks (Quadrant別Task配列), boardId, editKey, title
- アクション: addTask, updateTask, deleteTask, moveTask, setBoard

ファイル2: stores/useAuthStore.ts
- 状態: user (User | null), idToken (Cognito ID Token), loading
- アクション: setUser, setIdToken, logout

ファイル3: stores/useUIStore.ts
- 状態: modals (brainstorm, paywall, auth, share, taskEdit)
- アクション: openModal, closeModal

設計書参照: コンポーネント設計 > stores/
```

---

(続く...)

## タスク 2.3: DynamoDB ヘルパー関数実装

**要件**: [REQ-7]
**依存**: タスク 1.5, 2.1
**見積もり**: 中 (半日)

### 目的
DynamoDB CRUD操作のヘルパー関数を実装する。

### 実装内容
1. `lib/dynamodb-helpers.ts` 作成
2. Board操作: `createBoard`, `getBoard`, `updateBoard`
3. Task操作: `addTask`, `updateTask`, `deleteTask`, `queryTasks`
4. User操作: `createUser`, `getUser`, `updateUserEntitlements`

### 受け入れ基準
- [ ] 全ヘルパー関数実装完了
- [ ] Single Table Designに準拠
- [ ] TypeScript型安全性確保

### コード生成プロンプト
```
DynamoDB ヘルパー関数を実装してください。

ファイル: lib/dynamodb-helpers.ts

import { dynamoClient } from './dynamodb'
import { PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

Board操作:
- createBoard(board: Omit<Board, 'id'>): Promise<string>
  → PK: BOARD#{boardId}, SK: METADATA, GSI1PK: editKey
- getBoard(boardId: string): Promise<Board | null>
  → Query (PK=BOARD#{boardId}, SK begins_with TASK#)
- updateBoard(boardId: string, updates: Partial<Board>): Promise<void>

Task操作:
- addTask(boardId: string, quadrant: Quadrant, task: Task): Promise<void>
  → PK: BOARD#{boardId}, SK: TASK#{taskId}#{quadrant}
- updateTask(boardId: string, taskId: string, quadrant: Quadrant, updates: Partial<Task>): Promise<void>
- deleteTask(boardId: string, taskId: string, quadrant: Quadrant): Promise<void>

User操作:
- createUser(sub: string, email: string): Promise<void>
- getUser(sub: string): Promise<User | null>
- updateUserEntitlements(sub: string, entitlements: User['entitlements']): Promise<void>

設計書参照: データモデル > DynamoDB Single Table Design > アクセスパターン
```

---

## タスク 2.4: React Query + useBoardSync フック実装

**要件**: [REQ-7]
**依存**: タスク 2.2, 2.3
**見積もり**: 中 (半日)

### 目的
React Query でDynamoDB同期を管理し、`useBoardSync` フックでリアルタイム更新を実現する。

### 実装内容
1. `npm install @tanstack/react-query`
2. `app/providers.tsx` で QueryClient セットアップ
3. `hooks/useBoardSync.ts` で DynamoDB Query 統合
4. localStorage フォールバック実装

### 受け入れ基準
- [ ] React Query セットアップ完了
- [ ] `useBoardSync` でDynamoDB同期
- [ ] オフライン時 localStorage 使用

### コード生成プロンプト
```
React Query と useBoardSync フックを実装してください。

ファイル1: app/providers.tsx
- QueryClient 作成 (staleTime: 5分, cacheTime: 30分)
- QueryClientProvider でラップ

ファイル2: hooks/useBoardSync.ts
- useQuery で DynamoDB getBoard() 呼び出し
- オンライン: DynamoDB同期
- オフライン: localStorage読み込み
- useBoardStore と統合

返り値:
- board: Board | null
- isLoading: boolean
- error: Error | null

設計書参照: データフロー > フロー1: タスク作成→DynamoDB同期
```

---

# Phase 3: コアUI

## タスク 3.1: レイアウトコンポーネント実装

**要件**: [REQ-10, REQ-11]
**依存**: タスク 1.1, 2.2
**見積もり**: 小 (1-2h)

### 目的
`Layout`, `Header`, `Toast` コンポーネントを実装する。

### コード生成プロンプト
```
レイアウトコンポーネントを実装してください。

ファイル1: components/Layout/Header.tsx
- ロゴ (左上)
- Pro表示 (useAuthStore から entitlements 取得)
- メニューボタン (モバイル)

ファイル2: components/Layout/Toast.tsx
- 成功/エラー/警告通知
- 自動消去 (3秒)

ファイル3: app/layout.tsx
- Metadata設定
- Header統合
- providers.tsx でラップ
```

---

## タスク 3.2-3.7: (Firebase版と同様)

**注**: タスク3.2から3.7は、Firebase版とほぼ同じ内容です。DnDContext、TaskCard、Quadrant、TaskFormなどのUIコンポーネントは変更なし。

---

# Phase 4: タスク管理機能

## タスク 4.1: タスク作成機能 + DynamoDB同期

**要件**: [REQ-1]
**依存**: タスク 2.2, 3.5
**見積もり**: 中 (半日)

### 目的
`useBoardStore` の `addTask` アクションを実装し、DynamoDB同期を完成させる。

### コード生成プロンプト
```
タスク作成機能を実装してください。

ファイル: stores/useBoardStore.ts (更新)

addTask アクション:
1. Zodバリデーション (TaskSchema)
2. Optimistic UI更新 (即座にstateに追加)
3. DynamoDB addTask() 呼び出し
4. エラー時ロールバック (state復元)

エラーハンドリング:
- バリデーションエラー: Toast表示
- DynamoDBエラー: ロールバック + Toast表示

設計書参照: データフロー > フロー1
```

---

## タスク 4.2-4.6: (Firebase版と同様、DynamoDB版に変更)

**注**: タスク4.2から4.6は、Firestore → DynamoDB に変更するだけで、ロジックは同じです。

---

# Phase 5: LLMブレスト機能 (Amazon Bedrock)

## タスク 5.1: /api/brainstorm API Route実装 (Bedrock)

**要件**: [REQ-2]
**依存**: タスク 1.5, 2.1
**見積もり**: 中 (1日)

### 目的
Amazon Bedrock (Claude 3.5 Sonnet) を呼び出してタスク分解を行う `/api/brainstorm` エンドポイントを実装する。

### 実装内容
1. `app/api/brainstorm/route.ts` 作成
2. Bedrock InvokeModel 呼び出し
3. レート制限実装
4. レスポンス形式: `{ items: BrainstormResult[] }`

### 受け入れ基準
- [ ] POST /api/brainstorm 動作
- [ ] Bedrock API呼び出し成功
- [ ] レート制限動作 (10req/分)

### コード生成プロンプト
```
/api/brainstorm API Route (Bedrock) を実装してください。

ファイル: app/api/brainstorm/route.ts

import { bedrockClient } from '@/lib/bedrock'
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

実装内容:
1. Zodバリデーション (BrainstormRequestSchema)
2. レート制限 (10req/分, IP単位)
3. Bedrock API呼び出し:
   - modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
   - プロンプト: 設計書 > API仕様 > POST /api/brainstorm 参照
   - temperature: 0.7
   - max_tokens: 2000
4. レスポンス返却 (items配列)

エラーハンドリング:
- 400: バリデーションエラー
- 429: レート制限超過
- 500: Bedrockエラー

設計書参照: API仕様 > POST /api/brainstorm
```

---

## タスク 5.2-5.4: (Firebase版と同様)

**注**: BrainstormModal、BrainstormResultコンポーネントはLLM呼び出し先が変わるだけで、UIは同じです。

---

# Phase 6: 課金制限 (変更なし)

## タスク 6.1-6.4: (Firebase版と同様)

**注**: useTaskLimit、PaywallModal、PricingCardは変更なし。

---

# Phase 7: 認証 (Amazon Cognito)

## タスク 7.1: AuthModal コンポーネント実装 (Cognito)

**要件**: [REQ-6]
**依存**: タスク 1.3, 2.2
**見積もり**: 中 (半日)

### 目的
Amazon Cognito のログインモーダル `AuthModal` を実装する。

### 実装内容
1. `components/Auth/AuthModal.tsx` 作成
2. Email/Password ログイン (Cognito)
3. Google Sign-In (Cognito Federated Identity)
4. ログイン状態管理

### 受け入れ基準
- [ ] Email/Password ログイン動作
- [ ] Google Sign-In 動作
- [ ] `useAuthStore` と統合

### コード生成プロンプト
```
AuthModal コンポーネント (Cognito) を実装してください。

ファイル: components/Auth/AuthModal.tsx

Props:
interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

実装内容:
1. Email/Password ログイン:
   - email/password 入力
   - InitiateAuthCommand (USER_PASSWORD_AUTH)
   - ID Token取得 → useAuthStore.setIdToken()

2. Google Sign-In:
   - Cognito Hosted UI リダイレクト
   - またはAmplify UI Authenticator使用

エラーハンドリング:
- NotAuthorizedException: "メールアドレスまたはパスワードが正しくありません"
- UserNotFoundException: "ユーザーが見つかりません"

設計書参照: セキュリティ設計 > Amazon Cognito User Pool設定
```

---

## タスク 7.2: useEntitlements フック実装 (DynamoDB)

**要件**: [REQ-6]
**依存**: タスク 2.2, 7.1
**見積もり**: 小 (1-2h)

### 目的
Pro権限をリアルタイムで購読する `useEntitlements` フックを実装する。

### コード生成プロンプト
```
useEntitlements フック (DynamoDB) を実装してください。

ファイル: hooks/useEntitlements.ts

実装:
1. useAuthStore から user (sub) 取得
2. user が null → null 返却
3. useQuery で DynamoDB getUser(sub) 呼び出し
4. isPro = entitlements?.pro ?? false
5. isLifetime = entitlements?.lifetime ?? false

設計書参照: データモデル > User
```

---

## タスク 7.3: 認証フロー統合

**要件**: [REQ-6]
**依存**: タスク 7.1, 7.2
**見積もり**: 中 (半日)

**注**: Firebase版と同様、Cognito認証を統合。

---

# Phase 8: 決済システム (Cognito + DynamoDB)

## タスク 8.1: /api/checkout-session API Route実装 (Cognito)

**要件**: [REQ-8]
**依存**: タスク 1.6, 7.1
**見積もり**: 中 (1日)

### コード生成プロンプト
```
/api/checkout-session API Route (Cognito) を実装してください。

ファイル: app/api/checkout-session/route.ts

実装内容 (設計書 > API仕様 > POST /api/checkout-session 参照):
1. Authorization ヘッダーから Cognito ID Token 取得
2. aws-jwt-verify で検証
3. sub (Cognito User ID) 取得
4. Stripe checkout.sessions.create():
   - metadata: { sub, plan }  // Cognito User ID
5. { url } 返却

設計書参照: API仕様 > POST /api/checkout-session
```

---

## タスク 8.2: /api/stripe/webhook API Route実装 (DynamoDB)

**要件**: [REQ-8]
**依存**: タスク 1.6, 2.3
**見積もり**: 大 (2-3日)

### コード生成プロンプト
```
/api/stripe/webhook API Route (DynamoDB) を実装してください。

ファイル: app/api/stripe/webhook/route.ts

実装内容:
1. Webhook 署名検証
2. checkout.session.completed:
   - metadata から sub, plan 取得
   - DynamoDB updateUserEntitlements(sub, entitlements)
   - DynamoDB PutCommand (PAYMENT記録)

設計書参照: API仕様 > POST /api/stripe/webhook
```

---

## タスク 8.3-8.4: (Firebase版と同様、DynamoDB版)

---

# Phase 9: URL共有 (DynamoDB GSI)

## タスク 9.1-9.3: (Firebase版と同様、DynamoDB GSI使用)

**注**: editKey検証はDynamoDB GSI (GSI1-PK=editKey) で行う。

---

# Phase 10: 最適化

## タスク 10.1-10.4: (Firebase版と同様)

**注**: Code Splitting、キャッシュ、パフォーマンス測定、A11y監査は変更なし。

---

# Phase 11: テスト

## タスク 11.1: Unit Test カバレッジ 80%達成 (DynamoDB版)

**要件**: 全機能
**依存**: 全実装完了
**見積もり**: 大 (2-3日)

### コード生成プロンプト
```
Unit Test カバレッジ 80%を達成してください。

テスト対象:
1. stores/ (useBoardStore, useAuthStore, useUIStore)
2. hooks/ (useBoardSync, useEntitlements, useTaskLimit, useEditKey)
3. lib/ (dynamodb-helpers, cognito, bedrock, types)

DynamoDB Localテスト:
- Docker: docker run -p 8000:8000 amazon/dynamodb-local
- テーブル作成: CreateTableCommand
- テストデータ投入

設計書参照: テスト戦略 > DynamoDB Local テスト
```

---

## タスク 11.2: Integration Test (API Routes - DynamoDB版)

**要件**: [REQ-2, REQ-8]
**依存**: タスク 5.1, 8.1, 8.2
**見積もり**: 中 (1日)

### コード生成プロンプト
```
API Routes Integration Test (DynamoDB版) を実装してください。

テストファイル:
1. app/api/brainstorm/__tests__/route.test.ts (Bedrockモック)
2. app/api/checkout-session/__tests__/route.test.ts (Cognitoモック)
3. app/api/stripe/webhook/__tests__/route.test.ts (DynamoDBモック)

モック:
- Bedrock API モック
- Cognito JWT検証モック
- Stripe API モック
- DynamoDB モック
```

---

## タスク 11.3: E2E Test (主要フロー - Amplify版)

**要件**: 全機能
**依存**: 全実装完了
**見積もり**: 大 (2-3日)

**注**: Firebase版と同様、Cognito認証フローに対応。

---

## タスク 11.4: DynamoDB IAMポリシーテスト

**要件**: [REQ-13]
**依存**: タスク 1.4
**見積もり**: 中 (半日)

### コード生成プロンプト
```
DynamoDB IAMポリシーテストを実装してください。

テストケース:
1. Boards:
   - 読み取り: 誰でも可 (GetItem, Query)
   - 書き込み: editKey一致時のみ (GSI検証)

2. Users:
   - 読み取り: 本人のみ (sub一致)
   - 書き込み: 本人のみ

3. Payments:
   - 読み取り: 本人のみ
   - 書き込み: Lambda実行ロールのみ

設計書参照: セキュリティ設計 > DynamoDB IAMポリシー
```

---

## タスク 11.5: CI/CD パイプライン構築 (Amplify版)

**要件**: 全機能
**依存**: タスク 11.1, 11.2, 11.3
**見積もり**: 中 (1日)

### コード生成プロンプト
```
Amplify CI/CD パイプラインを構築してください。

1. amplify.yml (既存) を使用
2. Amplify Console で環境変数設定
3. GitHub連携:
   - main ブランチ → 本番デプロイ
   - develop ブランチ → staging デプロイ
4. ビルド時テスト実行:
   - Lint
   - Type Check
   - Unit Tests

設計書参照: デプロイ & 環境管理 > Amplify CLI デプロイ
```

---

## タスク 11.6: 最終統合テスト + Amplifyデプロイ

**要件**: 全機能
**依存**: 全タスク完了
**見積もり**: 大 (2-3日)

### コード生成プロンプト
```
最終統合テストとAmplifyデプロイを実施してください。

1. 手動テストチェックリスト: (Firebase版と同様)

2. Amplifyデプロイ:
   amplify publish
   - 本番環境にデプロイ
   - CloudWatch Logsで監視
   - DynamoDB メトリクス確認

3. ドキュメント:
   - README.md: AWS構成の説明追加
   - CHANGELOG.md: MVP v1.0.0 (AWS版)

設計書参照: デプロイ & 環境管理
```

---

# まとめ

## タスク統計 (AWS版)

- **Phase 1 (AWS環境セットアップ)**: 7タスク
- **Phase 2 (データ層 - DynamoDB)**: 4タスク
- **Phase 3 (コアUI)**: 7タスク (変更なし)
- **Phase 4 (タスク管理 - DynamoDB)**: 6タスク
- **Phase 5 (LLMブレスト - Bedrock)**: 4タスク
- **Phase 6 (課金制限)**: 4タスク (変更なし)
- **Phase 7 (認証 - Cognito)**: 3タスク
- **Phase 8 (決済 - DynamoDB)**: 4タスク
- **Phase 9 (URL共有 - DynamoDB GSI)**: 3タスク
- **Phase 10 (最適化)**: 4タスク (変更なし)
- **Phase 11 (テスト - DynamoDB/Amplify)**: 6タスク

**合計**: 52タスク

## 主な変更点

| Phase | Firebase版 | AWS版 |
|-------|-----------|-------|
| **Phase 1** | Firebase SDK, Vercel | Amplify CLI, Cognito, DynamoDB, Bedrock |
| **Phase 2** | Firestore, Firebase Auth | DynamoDB, Cognito, aws-jwt-verify |
| **Phase 5** | LLM API (未定) | Amazon Bedrock (Claude 3.5) |
| **Phase 7** | Firebase Auth | Amazon Cognito |
| **Phase 8** | Firestore Webhook | DynamoDB UpdateCommand |
| **Phase 11** | Firebase Emulator | DynamoDB Local, Amplify CI/CD |

## 実装順序

1. Phase 1 → Phase 2 (AWS基盤構築)
2. Phase 3 → Phase 4 (コアUI + タスク管理)
3. Phase 5 (Bedrockブレスト)
4. Phase 6 → Phase 7 → Phase 8 (マネタイゼーション)
5. Phase 9 (URL共有)
6. Phase 10 (最適化)
7. Phase 11 (テスト)

## 次のステップ

タスクリストの承認後、**Phase 1 (AWS環境セットアップ)** から順次実装を開始してください。

**AWS学習ポイント**:
- Amplify CLI の使い方
- DynamoDB Single Table Design
- Cognito認証フロー
- Bedrock LLM統合
- IAMポリシー設計

各タスクの「コード生成プロンプト」をClaude Codeに渡すことで、効率的な実装が可能です。
