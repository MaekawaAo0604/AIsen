# AIsen プロジェクト - Claude 指示書

## プロジェクト概要
AIsenは、タスクを重要度と緊急度で自動分類する4象限マトリクスタスク管理アプリケーションです。

## 技術スタック
- **フロントエンド**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS 4
- **状態管理**: Zustand
- **バックエンド**: Firebase (Firestore, Authentication, Cloud Functions)
- **UI操作**: dnd-kit (ドラッグ&ドロップ)
- **テスト**: Playwright (E2Eテスト)

## コード変更時の必須ルール

### ⚠️ コミット前のテスト実行 (REQUIRED)

コンポーネントやロジックに変更を加えた際は、**必ずコミット前に全テストを実行**してください：

```bash
# すべてのテストを実行（必須）
npx playwright test --reporter=list

# または簡潔な出力で
npx playwright test
```

**理由**:
- コンポーネント間の依存関係が複雑なため、一部の変更が予期しない箇所に影響する可能性がある
- 全テスト実行でも数秒〜10秒程度で完了する（現在30テスト）
- 部分的なテストだけでは見逃しが発生するリスクがある

### テストが失敗した場合

1. **エラーメッセージを確認**: Playwrightは詳細なエラー情報とスクリーンショットを提供します
2. **レポートを確認**: `http://localhost:9323` でHTMLレポートが自動起動します
3. **修正してから再テスト**: テストが通るまで修正とテストを繰り返します
4. **コミット**: すべてのテストが成功してから `git commit`

```bash
# テスト失敗時の典型的なワークフロー
npx playwright test tests/e2e/landing-page.spec.ts --reporter=list
# → 失敗を確認
# → コードを修正
npx playwright test tests/e2e/landing-page.spec.ts --reporter=list
# → 成功を確認
git add .
git commit -m "fix: ランディングページの表示修正"
```

### コミットメッセージの規則

```bash
# 良い例
git commit -m "fix: TaskCardにdata-testid属性を追加してE2Eテスト対応"
git commit -m "feat: Quick Add機能にキーボードショートカット(q)を実装"
git commit -m "test: デモボードのread-only制約テストを修正"

# 悪い例
git commit -m "修正"
git commit -m "update"
git commit -m "いろいろ直した"
```

## 開発ワークフロー

### 1. 機能追加時

1. **仕様確認**: 何を実装するか明確にする
2. **実装**: コンポーネント・ロジックを実装
3. **テスト作成** (必要に応じて): `tests/e2e/` に新規テストを追加
4. **テスト実行**: 既存テスト + 新規テストを実行
5. **コミット**: すべて成功してからコミット

### 2. バグ修正時

1. **再現**: バグを再現できるテストケースを特定
2. **修正**: コードを修正
3. **テスト実行**: 関連テストを実行して修正を確認
4. **コミット**: テスト成功後にコミット

### 3. リファクタリング時

1. **テスト実行**: 変更前にテストを実行して現状を確認
2. **リファクタリング**: コードを整理
3. **テスト再実行**: 同じテストが通ることを確認（機能は変わらない）
4. **コミット**: テスト成功後にコミット

## E2Eテストの実行方法

### 基本コマンド

```bash
# すべてのテストを実行（ヘッドレスモード）
npx playwright test

# すべてのテストを実行（ブラウザ表示）
npx playwright test --headed

# 特定のテストファイルを実行
npx playwright test tests/e2e/landing-page.spec.ts

# 特定のテストケースを実行
npx playwright test -g "LP基本表示"

# デバッグモード
npx playwright test --debug
```

### レポート確認

```bash
# HTMLレポートを表示（自動的に開かない場合）
npx playwright show-report
```

## プロジェクト固有の注意事項

### dnd-kit (ドラッグ&ドロップ)

- **PointerEvents必須**: dnd-kitは通常のマウスイベントではなくPointerEventsを使用
- **テストの制約**: Playwrightの標準 `dragTo()` では動作しない可能性あり
- **詳細**: `tests/e2e/DRAG_DROP_TESTS_README.md` 参照

### Firebase設定

- **ローカル開発**: Firebase Emulatorは使用せず、開発環境のFirebaseを使用
- **環境変数**: `.env.local` に認証情報を設定（gitignore済み）

### Tailwind CSS 4

- **PostCSS設定**: `@tailwindcss/postcss` を使用（v4対応）
- **キャッシュ削除**: スタイルが反映されない場合は `rm -rf .next && npm run dev`

### read-onlyボード (`/s/DEMO`)

- **デモボード**: `/s/DEMO` は9件の固定タスクを持つread-onlyボード
- **制約**: タスクの追加・削除・編集は不可、詳細表示は可能

## テストカバレッジ

現在のE2Eテスト実装状況（2025-12-02時点）:

- ✅ ランディングページ: 24テスト（100%成功）
- ✅ デモボード: 6テスト（100%成功）
- ✅ ボード作成: 2テスト
- ✅ タスク作成: 5テスト
- ✅ タスク表示: 3テスト
- ✅ タスク削除: 2テスト
- ✅ タスク完了: 3テスト
- ⚠️ ドラッグ&ドロップ: 4テスト（dnd-kit互換性問題あり）
- ✅ Quick Add: 5テスト
- ✅ ボード共有: 5テスト
- ✅ ナビゲーション: 6テスト
- ✅ レスポンシブ: 3テスト

詳細: `tests/e2e/TEST_SUMMARY.md`

## よくあるエラーと解決方法

### strict mode violation

**エラー**: `strict mode violation: getByRole(...) resolved to 3 elements`

**原因**: セレクタが複数の要素にマッチしている

**解決**: `.first()` または `.nth(index)` で特定の要素を選択
```typescript
// Before
await page.getByRole('link', { name: /無料で始める/i })

// After
await page.getByRole('link', { name: /無料で始める/i }).first()
```

### Timeout on networkidle

**エラー**: `page.waitForLoadState: Test timeout exceeded`

**原因**: ページがネットワークアイドル状態にならない

**解決**: `'networkidle'` を `'domcontentloaded'` に変更
```typescript
// Before
await page.waitForLoadState('networkidle')

// After
await page.waitForLoadState('domcontentloaded')
```

### data-testid not found

**エラー**: `locator('[data-testid="task-card"]') resolved to 0 elements`

**原因**: コンポーネントに `data-testid` 属性がない

**解決**: コンポーネントに属性を追加
```tsx
<div data-testid="task-card" className="...">
```

## 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Next.js 15ドキュメント](https://nextjs.org/docs)
- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [dnd-kit公式ドキュメント](https://docs.dndkit.com/)
