# 実装タスク一覧 - AIsen (Eisenhower Matrix MVP) - Vercel + Firebase構成

## 概要

本ドキュメントは、Vercel + Firebase + Claude API（直接）構成での実装タスクリストです。

### 構成変更の理由

**変更前（AWS構成）:**
- AWS Amplify Hosting
- DynamoDB
- Amazon Cognito
- Amazon Bedrock
- 複雑なセットアップ、学習コスト高

**変更後（Vercel + Firebase構成）:**
- ✅ **Vercel**: Next.jsホスティング（無料枠で十分）
- ✅ **Firebase**: Firestore（データベース）+ Firebase Auth（認証）
- ✅ **Claude API**: 直接API呼び出し（自分のAPIキー）
- ✅ **Stripe**: 決済（変更なし）

### 技術スタック

| 項目 | 技術 |
|-----|------|
| **ホスティング** | Vercel |
| **データベース** | Firebase Firestore |
| **認証** | Firebase Auth (Email/Password + Google) |
| **AI** | Claude API (直接) |
| **決済** | Stripe |
| **フロントエンド** | Next.js 15 + React 19 + TypeScript |
| **状態管理** | Zustand + React Query |

---

# Phase 1: 環境セットアップ

## タスク 1.1: Next.js 15プロジェクト初期化 ✅

**状態**: 完了済み

---

## タスク 1.2: Firebase プロジェクト作成

**要件**: 基盤
**依存**: タスク 1.1
**見積もり**: 小 (1-2h)

### 目的
Firebase プロジェクトを作成し、Firestore と Firebase Auth を有効化する。

### 実装内容
1. Firebase Console でプロジェクト作成
2. Firestore Database 有効化（本番モード）
3. Firebase Auth 有効化（Email/Password + Google）
4. Firebase SDK 設定

### 受け入れ基準
- [ ] Firebase プロジェクト作成完了
- [ ] Firestore Database 有効化
- [ ] Firebase Auth 有効化
- [ ] Firebase config取得

### コード生成プロンプト
```
Firebase プロジェクトをセットアップしてください。

1. Firebase Console (https://console.firebase.google.com/)
   - 新規プロジェクト作成: aisen-mvp
   - Google Analytics: 有効

2. Firestore Database:
   - モード: 本番モード
   - ロケーション: asia-northeast1 (東京)

3. Firebase Auth:
   - Email/Password: 有効
   - Google: 有効

4. ウェブアプリ登録:
   - アプリ名: AIsen Web
   - Firebase config 取得
```

---

## タスク 1.3: Firebase SDK 統合

**要件**: 基盤
**依存**: タスク 1.2
**見積もり**: 中 (半日)

### 目的
Firebase SDK をインストールし、Next.js に統合する。

### 実装内容
1. `npm install firebase`
2. `lib/firebase.ts` で Firebase 初期化
3. `lib/firestore.ts` で Firestore クライアント作成
4. `lib/auth.ts` で Firebase Auth クライアント作成
5. 環境変数設定

### 受け入れ基準
- [ ] Firebase SDK インストール完了
- [ ] Firebase 初期化完了
- [ ] 環境変数で設定管理

### コード生成プロンプト
```
Firebase SDK を統合してください。

ファイル1: lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

ファイル2: lib/firestore.ts
import { getFirestore } from 'firebase/firestore'
import { app } from './firebase'

export const db = getFirestore(app)

ファイル3: lib/auth.ts
import { getAuth } from 'firebase/auth'
import { app } from './firebase'

export const auth = getAuth(app)

環境変数 (.env.local):
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

---

## タスク 1.4: Claude API SDK 統合

**要件**: [REQ-2]
**依存**: タスク 1.1
**見積もり**: 小 (1-2h)

### 目的
Claude API を直接呼び出すための設定を行う。

### 実装内容
1. `npm install @anthropic-ai/sdk`
2. `lib/claude.ts` で Anthropic クライアント作成
3. 環境変数設定

### 受け入れ基準
- [ ] Anthropic SDK インストール完了
- [ ] Claude API クライアント作成
- [ ] 環境変数で API キー管理

### コード生成プロンプト
```
Claude API SDK を統合してください。

ファイル: lib/claude.ts
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

環境変数 (.env.local):
ANTHROPIC_API_KEY=sk-ant-xxx
```

---

## タスク 1.5: Stripe SDK統合

**要件**: [REQ-8]
**依存**: タスク 1.1
**見積もり**: 小 (1-2h)

### 目的
Stripe SDK をセットアップする。

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
```

---

# Phase 2: データ層 (Firebase)

## タスク 2.1: TypeScript型定義 ✅

**状態**: 完了済み

---

## タスク 2.2: Zustand ストア実装 ✅

**状態**: 完了済み（一部機能追加必要）

### 追加実装内容
- `useAuthStore`: Firebase Auth 状態管理
- `useBoardStore`: Firestore 同期統合

---

## タスク 2.3: Firestore ヘルパー関数実装

**要件**: [REQ-7]
**依存**: タスク 1.3, 2.1
**見積もり**: 中 (半日)

### 目的
Firestore CRUD操作のヘルパー関数を実装する。

### 実装内容
1. `lib/firestore-helpers.ts` 作成
2. Board操作: `createBoard`, `getBoard`, `updateBoard`
3. Task操作: `addTask`, `updateTask`, `deleteTask`
4. User操作: `createUser`, `getUser`, `updateUserEntitlements`

### 受け入れ基準
- [ ] 全ヘルパー関数実装完了
- [ ] TypeScript型安全性確保
- [ ] エラーハンドリング実装

### コード生成プロンプト
```
Firestore ヘルパー関数を実装してください。

ファイル: lib/firestore-helpers.ts

import { db } from './firestore'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import type { Board, Task, User, Quadrant } from './types'

Board操作:
- createBoard(board: Omit<Board, 'id'>): Promise<string>
- getBoard(boardId: string): Promise<Board | null>
- updateBoard(boardId: string, updates: Partial<Board>): Promise<void>
- getBoardByEditKey(editKey: string): Promise<Board | null>

Task操作:
- addTask(boardId: string, quadrant: Quadrant, task: Task): Promise<void>
- updateTask(boardId: string, taskId: string, quadrant: Quadrant, updates: Partial<Task>): Promise<void>
- deleteTask(boardId: string, taskId: string, quadrant: Quadrant): Promise<void>

User操作:
- createUser(uid: string, email: string): Promise<void>
- getUser(uid: string): Promise<User | null>
- updateUserEntitlements(uid: string, entitlements: User['entitlements']): Promise<void>

Firestoreコレクション構造:
boards/{boardId}
  - metadata (Board情報)
  - tasks/{taskId} (Task情報 + quadrant)

users/{uid}
  - metadata (User情報)
  - entitlements (Pro/Lifetime)
```

---

## タスク 2.4: React Query + useBoardSync フック実装

**要件**: [REQ-7]
**依存**: タスク 2.2, 2.3
**見積もり**: 中 (半日)

### 目的
React Query でFirestore同期を管理し、`useBoardSync` フックでリアルタイム更新を実現する。

### 実装内容
1. `app/providers.tsx` で QueryClient セットアップ
2. `hooks/useBoardSync.ts` で Firestore リアルタイム同期
3. localStorage フォールバック実装

### 受け入れ基準
- [ ] React Query セットアップ完了
- [ ] `useBoardSync` でFirestore同期
- [ ] オフライン時 localStorage 使用

### コード生成プロンプト
```
React Query と useBoardSync フックを実装してください。

ファイル1: app/providers.tsx
- QueryClient 作成 (staleTime: 5分, cacheTime: 30分)
- QueryClientProvider でラップ

ファイル2: hooks/useBoardSync.ts
- useQuery で Firestore getBoard() 呼び出し
- onSnapshot でリアルタイム更新
- オンライン: Firestore同期
- オフライン: localStorage読み込み
- useBoardStore と統合

返り値:
- board: Board | null
- isLoading: boolean
- error: Error | null
```

---

# Phase 3: コアUI ✅

**状態**: ほぼ完了済み

---

# Phase 4: タスク管理機能 ✅

**状態**: ほぼ完了済み（Firestore同期が必要）

---

# Phase 5: LLMブレスト機能 (Claude API)

## タスク 5.1: /api/ai/brainstorm API Route実装 (Claude API)

**要件**: [REQ-2]
**依存**: タスク 1.4
**見積もり**: 中 (半日)

### 目的
Claude API を直接呼び出してタスク分解を行う `/api/ai/brainstorm` エンドポイントを実装する。

### 実装内容
1. `app/api/ai/brainstorm/route.ts` 更新
2. Anthropic SDK で Claude API 呼び出し
3. ストリーミングレスポンス実装
4. レート制限実装

### 受け入れ基準
- [ ] POST /api/ai/brainstorm 動作
- [ ] Claude API呼び出し成功
- [ ] ストリーミング動作
- [ ] レート制限動作 (10req/分)

### コード生成プロンプト
```
/api/ai/brainstorm API Route (Claude API) を実装してください。

ファイル: app/api/ai/brainstorm/route.ts

import { anthropic } from '@/lib/claude'

実装内容:
1. リクエストボディ取得 ({ taskTitle, messages })
2. Claude API 呼び出し:
   - model: 'claude-3-5-sonnet-20241022'
   - max_tokens: 2000
   - temperature: 0.7
   - stream: true
3. ストリーミングレスポンス返却
4. レート制限 (10req/分, IP単位)

プロンプト:
あなたはタスク管理の専門家です。ユーザーとの対話を通じて、タスクの重要度と緊急度を判断してください。

タスク: {taskTitle}

対話履歴:
{messages}

最終判定が完了したら、以下の形式で返答してください:
CONCLUSION: {"quadrant": "q1|q2|q3|q4", "priority": 0-100, "reason": "判定理由"}

エラーハンドリング:
- 400: バリデーションエラー
- 429: レート制限超過
- 500: Claude APIエラー
```

---

## タスク 5.2: BrainstormChat コンポーネント実装 ✅

**状態**: 完了済み

---

# Phase 6: 課金制限

## タスク 6.1: useTaskLimit フック実装

**要件**: [REQ-5]
**依存**: タスク 2.2
**見積もり**: 小 (1-2h)

### 目的
無料ユーザーのタスク制限（4件）を管理する `useTaskLimit` フックを実装する。

### 実装内容
1. `hooks/useTaskLimit.ts` 作成
2. `useAuthStore` と `useBoardStore` から状態取得
3. タスク数カウント + Pro判定

### 受け入れ基準
- [ ] タスク数カウント正確
- [ ] Pro判定動作
- [ ] 制限超過検知

### コード生成プロンプト
```
useTaskLimit フックを実装してください。

ファイル: hooks/useTaskLimit.ts

import { useBoardStore } from '@/stores/useBoardStore'
import { useAuthStore } from '@/stores/useAuthStore'

実装:
1. useBoardStore から全タスク取得
2. useAuthStore から user.entitlements 取得
3. isPro = entitlements?.pro ?? false
4. taskCount = 全象限のタスク数合計
5. canAddTask = isPro || taskCount < 4
6. remainingTasks = isPro ? Infinity : Math.max(0, 4 - taskCount)

返り値:
{
  canAddTask: boolean
  taskCount: number
  remainingTasks: number
  isPro: boolean
  showPaywall: boolean
}
```

---

## タスク 6.2-6.4: PaywallModal, PricingCard 実装

**要件**: [REQ-5]
**依存**: タスク 6.1
**見積もり**: 中 (半日)

（AWS版と同様の実装）

---

# Phase 7: 認証 (Firebase Auth)

## タスク 7.1: AuthModal コンポーネント実装 (Firebase Auth)

**要件**: [REQ-6]
**依存**: タスク 1.3
**見積もり**: 中 (半日)

### 目的
Firebase Auth のログインモーダル `AuthModal` を実装する。

### 実装内容
1. `components/Auth/AuthModal.tsx` 作成
2. Email/Password ログイン
3. Google Sign-In
4. ログイン状態管理

### 受け入れ基準
- [ ] Email/Password ログイン動作
- [ ] Google Sign-In 動作
- [ ] `useAuthStore` と統合

### コード生成プロンプト
```
AuthModal コンポーネント (Firebase Auth) を実装してください。

ファイル: components/Auth/AuthModal.tsx

import { auth } from '@/lib/auth'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'

Props:
interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

実装内容:
1. Email/Password ログイン:
   - email/password 入力
   - signInWithEmailAndPassword()
   - ID Token取得 → useAuthStore.setUser()

2. Google Sign-In:
   - GoogleAuthProvider 使用
   - signInWithPopup()
   - ID Token取得

エラーハンドリング:
- auth/user-not-found: "ユーザーが見つかりません"
- auth/wrong-password: "パスワードが正しくありません"
- auth/invalid-email: "メールアドレスの形式が正しくありません"
```

---

## タスク 7.2-7.3: useEntitlements, 認証フロー統合

**要件**: [REQ-6]
**依存**: タスク 7.1
**見積もり**: 中 (半日)

（AWS版と同様、Firebase版に変更）

---

# Phase 8: 決済システム (Firebase + Stripe)

## タスク 8.1: /api/checkout-session API Route実装 (Firebase Auth)

**要件**: [REQ-8]
**依存**: タスク 1.5, 7.1
**見積もり**: 中 (1日)

### コード生成プロンプト
```
/api/checkout-session API Route (Firebase Auth) を実装してください。

ファイル: app/api/checkout-session/route.ts

import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

実装内容:
1. Authorization ヘッダーから Firebase ID Token 取得
2. auth.verifyIdToken() で検証
3. uid (Firebase User ID) 取得
4. Stripe checkout.sessions.create():
   - metadata: { uid, plan }
5. { url } 返却

エラーハンドリング:
- 401: 認証エラー
- 500: Stripeエラー
```

---

## タスク 8.2: /api/stripe/webhook API Route実装 (Firestore)

**要件**: [REQ-8]
**依存**: タスク 1.5, 2.3
**見積もり**: 大 (2-3日)

### コード生成プロンプト
```
/api/stripe/webhook API Route (Firestore) を実装してください。

ファイル: app/api/stripe/webhook/route.ts

実装内容:
1. Webhook 署名検証
2. checkout.session.completed:
   - metadata から uid, plan 取得
   - Firestore updateUserEntitlements(uid, entitlements)
   - Firestore setDoc() (PAYMENT記録)

コレクション構造:
users/{uid}/payments/{paymentId}
- stripeSessionId
- plan (monthly | lifetime)
- amount
- createdAt
```

---

## タスク 8.3-8.4: Stripe統合 + テスト

（AWS版と同様）

---

# Phase 9: URL共有 (Firestore)

## タスク 9.1-9.3: ShareModal, editKey検証

**要件**: [REQ-4]
**依存**: タスク 2.3
**見積もり**: 中 (1日)

（AWS版と同様、Firestore版に変更）

`getBoardByEditKey()` を使用して editKey 検証

---

# Phase 10: 最適化 ✅

**状態**: 基本完了済み

---

# Phase 11: テスト

## タスク 11.1: Unit Test カバレッジ 80%達成

**要件**: 全機能
**依存**: 全実装完了
**見積もり**: 大 (2-3日)

Firebase Emulator を使用したテスト

---

## タスク 11.2-11.6: Integration Test, E2E Test, デプロイ

**要件**: 全機能
**依存**: 全実装完了
**見積もり**: 大 (3-4日)

---

# Vercel デプロイ

## タスク 12.1: Vercel プロジェクト作成

**要件**: 全機能
**依存**: 全実装完了
**見積もり**: 小 (1h)

### 実装内容
1. Vercel CLI インストール
2. Vercel プロジェクト作成
3. 環境変数設定
4. デプロイ

### コード生成プロンプト
```
Vercel プロジェクトを作成してください。

1. Vercel CLI インストール:
   npm i -g vercel

2. Vercel ログイン:
   vercel login

3. プロジェクト初期化:
   vercel

4. 環境変数設定 (Vercel Dashboard):
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID

   ANTHROPIC_API_KEY

   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_PRICE_ID_MONTHLY
   STRIPE_PRICE_ID_LIFETIME

5. デプロイ:
   vercel --prod
```

---

# まとめ

## タスク統計 (Vercel + Firebase構成)

- **Phase 1 (環境セットアップ)**: 5タスク
- **Phase 2 (データ層 - Firebase)**: 4タスク
- **Phase 3 (コアUI)**: 完了済み
- **Phase 4 (タスク管理)**: 完了済み（Firestore同期必要）
- **Phase 5 (LLMブレスト - Claude API)**: 2タスク
- **Phase 6 (課金制限)**: 4タスク
- **Phase 7 (認証 - Firebase Auth)**: 3タスク
- **Phase 8 (決済 - Firestore)**: 4タスク
- **Phase 9 (URL共有 - Firestore)**: 3タスク
- **Phase 10 (最適化)**: 完了済み
- **Phase 11 (テスト)**: 6タスク
- **Phase 12 (Vercel デプロイ)**: 1タスク

**合計**: 約32タスク（フロントエンド完了分除く）

## 主な変更点

| 項目 | AWS構成 | Vercel + Firebase構成 |
|-----|---------|---------------------|
| **ホスティング** | AWS Amplify | Vercel |
| **データベース** | DynamoDB | Firestore |
| **認証** | Amazon Cognito | Firebase Auth |
| **LLM** | Amazon Bedrock | Claude API (直接) |
| **デプロイ** | Amplify CLI | Vercel CLI |
| **学習コスト** | 高 | 低 |
| **セットアップ時間** | 3-4時間 | 1-2時間 |
| **月額コスト** | $3-8 | $0-3 |

## 実装順序

1. **Phase 1-2**: Firebase + Claude API セットアップ
2. **Phase 4**: Firestore同期統合
3. **Phase 5**: Claude API ブレインストーミング
4. **Phase 6-7**: 課金制限 + Firebase Auth
5. **Phase 8**: Stripe決済 + Firestore Webhook
6. **Phase 9**: URL共有 (Firestore)
7. **Phase 11-12**: テスト + Vercel デプロイ

## 次のステップ

1. **Firebase プロジェクト作成** (タスク 1.2)
2. **Firebase SDK 統合** (タスク 1.3)
3. **Claude API SDK 統合** (タスク 1.4)
4. **Firestore ヘルパー関数実装** (タスク 2.3)

各タスクの「コード生成プロンプト」をClaude Codeに渡すことで、効率的な実装が可能です。
