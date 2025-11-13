# PostHog設定ガイド

## 概要

PostHogは、プライバシー重視のオープンソース製品分析ツールです。
イベント計測、ファネル分析、セッションリプレイなどが利用できます。

---

## セットアップ手順

### 1. PostHogアカウント作成

1. https://posthog.com/ にアクセス
2. **「Get started - free」**をクリック
3. メールアドレスで登録（GitHubアカウントでもOK）
4. 無料プラン（月間100万イベントまで）を選択

### 2. プロジェクト作成

1. ログイン後、**「Create project」**
2. プロジェクト名: `AIsen`
3. データセンター: **US**または**EU**（お好みで）

### 3. APIキーを取得

1. プロジェクト作成後、**「Settings」** → **「Project」**
2. **「Project API Key」**をコピー
   - 例: `phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. 環境変数を設定

`.env.local`ファイルを作成（または編集）:

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**注意**: `.env.local`は`.gitignore`に含まれており、Gitにコミットされません。

### 5. 開発サーバーを再起動

```bash
# 既存のサーバーを停止（Ctrl+C）
npm run dev
```

---

## イベント確認方法

### PostHogダッシュボード

1. https://app.posthog.com にログイン
2. 左メニューの**「Events」**をクリック

### 計測されるイベント

| イベント名 | トリガー | データ |
|-----------|---------|--------|
| `task_add` | タスク追加時 | `source` (quick_add/manual/brainstorm), `quadrant`, `has_due` |
| `task_move` | タスク移動時 | `from` (移動元), `to` (移動先) |
| `task_delete` | タスク削除時 | `quadrant` |
| `$pageview` | ページ表示時 | URL |

### テスト方法

1. ブラウザで http://localhost:3000 を開く
2. `q`キーを押してQuick Addを起動
3. "明日17時 見積り送付 至急"と入力してEnter
4. PostHogダッシュボードで**「Events」**→**「task_add」**を確認
5. 数秒〜数十秒でイベントが表示される

---

## ファネル分析の例

### 7日リテンション計測

1. PostHogダッシュボードで**「Insights」**→**「New insight」**
2. **「Retention」**を選択
3. 設定:
   - **Cohort defining event**: `$pageview` (初回訪問)
   - **Return event**: `task_add` (タスク追加)
   - **Period**: `Day`
   - **Total periods**: `7`

### 使い方ファネル

1. **「Insights」**→**「New insight」**→**「Funnel」**
2. ステップを追加:
   - Step 1: `$pageview` (URL contains `/`)
   - Step 2: `task_add` (source = quick_add)
   - Step 3: `task_move`
3. コンバージョン率が表示される

---

## デバッグ

### ブラウザコンソールで確認

```javascript
// PostHogが読み込まれているか確認
console.log(window.posthog)

// イベントを手動送信（テスト用）
posthog.capture('test_event', { foo: 'bar' })
```

### 開発環境での動作確認

`lib/analytics.ts`は開発環境でも動作します。
APIキーが設定されていない場合は、コンソールに警告が表示されます:

```
[Analytics] PostHog API key not found. Analytics disabled.
```

---

## 本番環境での注意点

### Vercel環境変数設定

1. Vercelダッシュボード → プロジェクト選択
2. **「Settings」**→**「Environment Variables」**
3. 以下を追加:
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
4. 再デプロイ

### プライバシー対応

PostHogは以下の機能でプライバシーに配慮:
- **autocapture無効**: 明示的なイベントのみ計測
- **IPアドレス匿名化**: 設定可能
- **GDPR準拠**: EUデータセンター選択可能

---

## トラブルシューティング

### イベントが表示されない

1. ブラウザコンソールでエラー確認
2. `.env.local`のAPIキーが正しいか確認
3. 開発サーバーを再起動
4. PostHogダッシュボードで**「Live events」**を確認（リアルタイム）

### APIキーが無効

- PostHogダッシュボードで**「Project API Key」**を再確認
- `phc_`で始まっているか確認

---

## 代替案（PostHog不要の場合）

イベント計測を無効化したい場合:

1. `.env.local`から`NEXT_PUBLIC_POSTHOG_KEY`を削除
2. `lib/analytics.ts`の関数は何もしなくなる（エラーなし）
3. コンソールに警告のみ表示

---

## 参考リンク

- PostHog公式: https://posthog.com/
- ドキュメント: https://posthog.com/docs
- Next.js統合: https://posthog.com/docs/libraries/next-js
