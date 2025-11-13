# AIsen MVP 実装ロードマップ

**最終更新**: 2025-11-13
**ステータス**: Phase 1 準備中

---

## 📋 実装方針の概要

ChatGPTから提示された10項目を実現可能性・影響度・リスクで評価し、段階的に実装する戦略。
**原則**: 既存システムへの影響を最小化しながら、ユーザー体験の即座の改善を優先。

---

## 🎯 Phase 1：即座に着手可能（目標：1日完了）

### 1️⃣ Quick Add機能（最優先）
**実装時間**: 3-4時間
**優先度**: 🔴 CRITICAL

#### 目的
- "入れやすさ"という差別化要素の実現
- 手入力→追加まで平均1.5秒以内

#### 実装内容
```typescript
// 必要ファイル
- components/QuickAdd/QuickAdd.tsx (新規)
- lib/parseQuick.ts (新規)
- app/ClientLayout.tsx (修正: ショートカット統合)
```

#### 仕様
- **ショートカット**: `q` でモーダル起動、Enter で確定
- **解析機能**:
  - 日本語相対日: "今日", "明日", "明後日"
  - 時刻: "17時", "17時30分", "17:30"
  - 絶対日: "12/25", "12/25 14:00"
  - 急ぎ語: 至急, 緊急, 今すぐ, 今日中
  - 重要語: 重要, 戦略, 採用, 品質, 仕組み, 本番, 顧客

#### 自動仕分けロジック
```
緊急判定 = 急ぎ語 OR 期限48時間以内
重要判定 = 重要語マッチ

Q1（緊急×重要）: 両方true
Q2（重要×非緊急）: 重要のみtrue
Q3（緊急×非重要）: 緊急のみtrue
Q4（非緊急×非重要）: 両方false
```

#### 合格基準
- [ ] `q` ショートカットでモーダル起動
- [ ] 入力→追加まで1.5秒以内
- [ ] "明日17時 見積り送付 至急" → Q1に自動配置
- [ ] "今日中 資料作成" → Q3に配置
- [ ] "採用戦略" → Q2に配置

---

### 2️⃣ イベント計測基盤
**実装時間**: 2-3時間
**優先度**: 🟡 IMPORTANT

#### 目的
- データ駆動改善の基盤構築
- 初期ユーザー行動の定量把握

#### 実装内容
```typescript
// 必要ファイル
- lib/analytics.ts (新規)
- 各コンポーネントにtracking追加
```

#### 計測対象イベント
```typescript
// タスク追加
task_add({
  source: 'quick_add' | 'manual' | 'drag',
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  has_due: boolean
})

// タスク移動
task_move({
  from: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  to: 'Q1' | 'Q2' | 'Q3' | 'Q4'
})

// 共有閲覧（Phase 4実装時）
share_view({ board_id: string })
share_click({ board_id: string })
```

#### ファネル設計
```
初回訪問 → 1件追加 → 2日後再訪問

目標KPI（7日後）:
- リテンション: 30%
- 共有クリック→新規流入: 20%
```

#### 合格基準
- [ ] PostHog/Umamiアカウント設定完了
- [ ] タスク追加・移動イベントが記録される
- [ ] ダッシュボードでリアルタイム確認可能

---

### 3️⃣ ランディングページ最小構成
**実装時間**: 2-3時間
**優先度**: 🟡 IMPORTANT

#### 目的
- 価値訴求の入口確保
- 共有・拡散の起点構築

#### 実装内容
```typescript
// 必要ファイル
- app/(landing)/page.tsx (新規または既存修正)
- public/og-landing.png (OG画像)
```

#### 構成要素
1. **ヒーローセクション**
   - 実スクショ1枚（4象限ボード）
   - 3行の価値訴求:
     ```
     重要と緊急を、迷わず仕分ける。
     タスクを入れた瞬間、自動で正しい場所へ。
     AIsenで、あなたの時間を取り戻す。
     ```

2. **CTA**
   - "デモを見る" → 共有URL（Phase 4実装時に有効化）
   - "無料で始める" → 新規登録

3. **フッター**
   - プライバシーポリシー
   - 利用規約
   - 問い合わせ（Notionリンク可）

#### SEO/OG設定
```typescript
export const metadata = {
  title: 'AIsen - 自動仕分けタスク管理',
  description: '重要と緊急を自動判定。4象限マトリクスで時間を取り戻す。',
  openGraph: {
    images: ['/og-landing.png'],
  },
  robots: 'index, follow',
}
```

#### 合格基準
- [ ] `/` でランディングページ表示
- [ ] スクショ+3行訴求が視認可能
- [ ] OGタグが正しく設定（TwitterカードPreview確認）
- [ ] モバイルでレスポンシブ表示

---

## 🔄 Phase 2：基盤が固まってから（目標：2-3日）

### 4️⃣ モバイル最適化
**優先度**: 🟢 RECOMMENDED

#### 実装内容
- **レスポンシブUI**
  - 幅 < 768px: 4タブ（Q1〜Q4）の1列リスト
  - 幅 ≥ 768px: 2×2グリッド
- **タッチ操作改善**
  - 誤タップ防止（タップ=編集、長押し=移動）
  - スワイプジェスチャー

#### 合格基準
- [ ] iPhone縦で誤ドラッグなし
- [ ] タブ切替が1タップで可能

---

### 5️⃣ D&D改善（@dnd-kit移行）
**優先度**: 🟢 RECOMMENDED

#### 実装内容
- 既存のreact-beautiful-dndから@dnd-kit/coreへ移行
- TouchSensor有効化（長押し移動）
- ドラッグ中のシャドウ表示

#### 合格基準
- [ ] デスクトップで既存と同等の操作感
- [ ] モバイルで長押し→移動が安定

---

## ⚡ Phase 3：パフォーマンス改善（目標：3-4日）

### 6️⃣ SSR/LCP最適化
**優先度**: 🟢 RECOMMENDED

#### 実装内容
- **next/font導入**
  ```typescript
  import { Inter } from 'next/font/google'
  const inter = Inter({ subsets: ['latin'], display: 'swap' })
  ```
- **generateMetadata完備**
  - 全ページでOG/Twitter Card設定
- **画像最適化**
  - next/image導入
  - WebP/AVIF変換

#### 目標指標
- LCP < 2.5秒（Lighthouse Desktop/4G）
- 初回SSRで文字・カード視認可能（Skeleton禁止）

#### 合格基準
- [ ] Lighthouseスコア90+
- [ ] 初回ロードでSkeletonなし

---

## 🔐 Phase 4：大規模機能（目標：1週間以上）

### 7️⃣ 読み取り専用共有URL
**優先度**: 🟡 IMPORTANT（ただし後回し）

#### ⚠️ 後回し理由
- DB設計の全面改修（board_sharesテーブル）
- RLS（Row Level Security）実装
- 認証フロー変更
- **リスクが高く、Phase 1-3の価値検証後に着手すべき**

#### DB設計（実装時の参考）
```sql
create table board_shares(
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  token text not null unique,
  access_level text not null check (access_level in ('read')),
  expires_at timestamptz,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table board_shares enable row level security;

create policy "share_read"
on boards for select
using (exists(
  select 1 from board_shares s
  where s.board_id = boards.id
    and s.token = current_setting('app.read_token', true)
    and s.is_enabled = true
    and (s.expires_at is null or s.expires_at > now())
));
```

#### 実装内容
- `/s/[token]/page.tsx`: SSRで共有ボード表示
- `/s/[token]/opengraph-image.tsx`: OG画像生成
- APIの書込系は401/403返却（RLSで二重防御）

#### 合格基準
- [ ] シークレットウィンドウで閲覧可能
- [ ] 書込APIは403返却（E2E検証）
- [ ] OG画像でSNS共有時にプレビュー表示

---

### 8️⃣ Playwrightテスト
**優先度**: 🟢 RECOMMENDED

#### テストケース
```typescript
// tests/e2e/quick-add.spec.ts
test('Quick Add: 明日17時 見積り 至急 → Q1配置', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('q')
  await page.fill('[data-testid="quick-add-input"]', '明日17時 見積り 至急')
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-quadrant="Q1"]')).toContainText('見積り')
})

// tests/e2e/shared-view.spec.ts (Phase 4)
test('共有URLは書込不可', async ({ page }) => {
  await page.goto('/s/test-token')
  const response = await page.request.post('/api/cards', { data: { title: 'test' } })
  expect(response.status()).toBe(403)
})
```

#### CI/CD
- GitHub Actions
- Vercel Preview URLに対して実行

---

## 🚀 Phase 5以降：差別化機能（設計のみ）

### 9️⃣ メール取り込み（Gmail統合）
**優先度**: 🔵 FUTURE

#### 設計方針
- Gmail API + Pub/Sub + Webhook
- 初手は手動インポート（.emlドラッグ→解析→仮置き）
- 自動取り込みはユーザー検証後

---

### 🔟 組織配布チャネル
**優先度**: 🔵 FUTURE

#### 設計方針
- MS Teams/Google Workspaceアドオン
- チーム内回覧→増殖モデル
- 売上拡張用（Phase 4完了後）

---

## 📊 各Phaseの完了条件

### Phase 1完了条件
- [ ] Quick Add機能が動作（1.5秒以内）
- [ ] イベント計測が記録される
- [ ] ランディングページが公開される
- [ ] **実ユーザー10人に共有URLを配布し、7日リテンション計測開始**

### Phase 2完了条件
- [ ] iPhoneで誤操作なくタスク移動可能
- [ ] D&Dがデスクトップ/モバイルで安定

### Phase 3完了条件
- [ ] Lighthouseスコア90+
- [ ] LCP < 2.5秒

### Phase 4完了条件
- [ ] 共有URL経由の新規流入20%達成
- [ ] E2Eテストが全てパス

---

## 🛠️ 技術スタック（Phase 1基準）

| 用途 | 技術 | 理由 |
|------|------|------|
| フロントエンド | Next.js 15 (App Router) | SSR・RSC対応 |
| 状態管理 | Zustand | 軽量・シンプル |
| UI | Tailwind CSS | 迅速なスタイリング |
| 計測 | PostHog Cloud | セットアップ高速 |
| テスト | Playwright | E2E・ブラウザ自動化 |
| DB（Phase 4） | Supabase/Postgres | RLS対応 |

---

## 📈 KPI定義（Phase 1基準）

| 指標 | 目標値 | 計測期間 |
|------|--------|----------|
| 7日リテンション | 30% | Phase 1完了後7日 |
| タスク追加速度 | ≤1.5秒 | 常時 |
| Quick Add使用率 | 60%+ | 全タスク追加に対する割合 |
| ランディングCTR | 20%+ | 訪問→CTA クリック |

---

## ⚠️ リスク管理

### Phase 1のリスク
| リスク | 対策 |
|--------|------|
| Quick Addの自動仕分け精度不足 | ルールベースから開始→ユーザーフィードバックで改善 |
| 計測データが取れない | PostHogアカウント事前確認、テスト環境で動作検証 |

### Phase 4のリスク
| リスク | 対策 |
|--------|------|
| RLS実装の複雑性 | 段階的移行（まず読取のみ→後で書込制御） |
| トークン管理の脆弱性 | 32文字以上のランダム文字列、有効期限必須 |

---

## 📅 次のアクション

1. **Phase 1の開始承認を得る**
2. **Quick Add実装開始**（parseQuick関数→モーダル→統合）
3. **実装完了後、実ユーザー10人にテスト依頼**
4. **7日後のリテンションデータで次フェーズ判断**

---

**最終更新履歴**
- 2025-11-13: 初版作成（Phase 1-5の全体設計）
