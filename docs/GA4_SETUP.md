# Google Analytics 4 (GA4) セットアップ手順

## ✅ 完了した作業

### 1. ローカル環境への実装
- `.env.local` に `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-BKL8467K5K` を追加
- `app/layout.tsx` に Next.js Script コンポーネントでGA4タグを実装
- ビルド確認完了

### 2. 実装内容

```typescript
// app/layout.tsx
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 🚀 Vercel へのデプロイ設定（要対応）

### Vercel 環境変数の設定手順

1. **Vercel ダッシュボードにアクセス**
   - https://vercel.com/dashboard にログイン
   - AIsen プロジェクトを選択

2. **環境変数を追加**
   - `Settings` → `Environment Variables` に移動
   - 以下を追加:
     - **Key**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
     - **Value**: `G-BKL8467K5K`
     - **Environments**: `Production`, `Preview`, `Development` すべてチェック

3. **再デプロイ**
   - `Deployments` タブから最新デプロイの `...` メニュー → `Redeploy` を実行
   - または、新しいコミットをプッシュして自動デプロイ

## 📊 動作確認

### ローカル環境
```bash
npm run dev
```
- ブラウザで http://localhost:3000 を開く
- DevTools → Network タブで `gtag/js` と `collect` リクエストを確認

### 本番環境（Vercel設定後）
- https://aisen.virex-ai.jp/ にアクセス
- GA4 リアルタイムレポートで確認:
  - https://analytics.google.com/ → AIsen プロパティ → レポート → リアルタイム

## 🔍 測定ID情報

- **測定ID**: `G-BKL8467K5K`
- **プロパティ名**: AIsen（Google Analytics側で確認）
- **データストリーム**: ウェブ

## 📝 注意事項

- 環境変数は `NEXT_PUBLIC_` プレフィックスが必須（クライアントサイドで使用するため）
- Vercel 環境変数設定後は必ず再デプロイが必要
- GA4 でデータが表示されるまで最大24時間かかる場合があります（リアルタイムレポートは即座）
