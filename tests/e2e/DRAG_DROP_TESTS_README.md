# ドラッグ&ドロップテスト (drag-and-drop.spec.ts)

## 概要

AIsenアプリケーションのドラッグ&ドロップ機能をテストするE2Eテストスイートです。
dnd-kitライブラリを使用したタスクの象限間・象限内での移動をテストします。

## テストシナリオ

### 8.1 象限間でタスクを移動
- **目的**: Q1からQ2へタスクをドラッグ&ドロップで移動
- **確認事項**:
  - タスクがQ2に表示される
  - タスクがQ1から削除される
  - Q1のタスク数が1減る
  - Q2のタスク数が1増える
  - LocalStorageに保存される

### 8.2 同一象限内でタスクを並び替え
- **目的**: Q1象限内でタスクAとタスクBの順序を入れ替える
- **確認事項**:
  - タスクの順序が変更される
  - 象限のタスク数は変わらない

### 8.3 ドラッグキャンセル
- **目的**: ドラッグを開始して元の位置に戻す
- **確認事項**:
  - タスクの位置が変わらない
  - ボードの状態は変更されない
  - LocalStorageの状態も変わらない

### 8.1 追加: ドラッグ中の視覚的フィードバック
- **目的**: ドラッグ中のUI変化を確認
- **確認事項**:
  - ドラッグ中のタスクカードに`opacity-50`が付与される
  - ドロップ領域に`ring-2 ring-blue-400`のハイライトが表示される
  - ドロップ後は視覚的フィードバックが解除される

## 実装詳細

### コンポーネント修正

#### 1. Quadrantコンポーネントに`data-quadrant`属性を追加

**ファイル**: `/Users/ao-maekawa/AIsen/components/Board/Quadrant.tsx`

```typescript
<div
  ref={setNodeRef}
  data-quadrant={quadrant.toUpperCase()}  // 追加
  className={...}
>
```

この属性により、Playwrightテストで各象限を安定的に識別できます。

### テストアプローチ

#### タスク作成パターン
```typescript
// モーダル表示を待つ
await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
await expect(page.getByText('新しいタスクを追加')).toBeVisible({ timeout: 10000 })

// タスク情報を入力
await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('タスク名')
await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()

// 配置
await page.getByRole('button', { name: '配置する' }).click()

// モーダルが閉じることを確認
await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).not.toBeVisible()
```

#### ドラッグ&ドロップパターン

**方法1: `dragTo()` メソッド（推奨・シンプル）**
```typescript
const taskCard = page.locator('[data-quadrant="Q1"]').locator('text=タスク名')
const targetSection = page.locator('[data-quadrant="Q2"]')
await taskCard.dragTo(targetSection)
```

**方法2: マウスイベントの手動操作（フォールバック）**
```typescript
const sourceBox = await taskCard.boundingBox()
const targetBox = await targetSection.boundingBox()

await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
await page.mouse.down()
await page.waitForTimeout(200)
await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 })
await page.waitForTimeout(200)
await page.mouse.up()
```

## 既知の課題

### ❌ ドラッグ&ドロップが動作しない

**現状**: すべてのドラッグ&ドロップテストが失敗します。

**原因**:
dnd-kitライブラリはPointerEventsとSensorシステムを使用しており、Playwrightの標準的なマウスイベント（`mouse.down`、`mouse.move`、`mouse.up`）や`dragTo()`メソッドでは正しくトリガーされません。

**詳細**:
- dnd-kitは`PointerSensor`や`MouseSensor`を使用してドラッグイベントを検出
- Playwrightのマウスイベントは低レベルのDOM APIを呼び出すが、dnd-kitが期待するイベントシーケンスと一致しない
- `dragTo()`メソッドも内部的にマウスイベントを使用するため同様の問題が発生

### 解決策の候補

#### 1. PointerEventsを使用したカスタム実装

```typescript
// PointerEventsを手動で dispatch する
await page.evaluate(({ sourceSelector, targetSelector }) => {
  const source = document.querySelector(sourceSelector)
  const target = document.querySelector(targetSelector)

  // PointerDown
  source.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'mouse',
    clientX: ...,
    clientY: ...
  }))

  // PointerMove
  target.dispatchEvent(new PointerEvent('pointermove', { ... }))

  // PointerUp
  target.dispatchEvent(new PointerEvent('pointerup', { ... }))
}, { sourceSelector, targetSelector })
```

#### 2. dnd-kit Test Utilitiesの使用

dnd-kitには公式のテストユーティリティが存在する可能性があります。
```bash
npm install @dnd-kit/testing
```

#### 3. 代替手段: プログラマティックな移動

テストのためにプログラマティックにタスクを移動する関数を用意:
```typescript
// テスト用ヘルパー関数を追加
await page.evaluate(({ taskId, fromQuadrant, toQuadrant }) => {
  window.__testHelpers__.moveTask(taskId, fromQuadrant, toQuadrant)
}, { taskId, fromQuadrant: 'q1', toQuadrant: 'q2' })
```

#### 4. Cypressへの移行検討

Cypressはdnd-kitとの互換性が高いプラグインが存在:
- `@4tw/cypress-drag-drop`
- より詳細なイベント制御が可能

## 実行方法

```bash
# すべてのドラッグ&ドロップテストを実行
npx playwright test tests/e2e/drag-and-drop.spec.ts

# デスクトップのみ
npx playwright test tests/e2e/drag-and-drop.spec.ts --project="Desktop Chrome"

# 特定のテストのみ
npx playwright test tests/e2e/drag-and-drop.spec.ts:12  # 8.1のみ

# UIモード（デバッグ用）
npx playwright test tests/e2e/drag-and-drop.spec.ts --ui
```

## Next Steps

1. **PointerEventsの実装を試す** - 最も確実な方法
2. **dnd-kit公式ドキュメントを確認** - テストベストプラクティスの確認
3. **代替アプローチの評価** - プログラマティック移動 vs E2Eテスト
4. **Cypressの検討** - dnd-kit専用プラグインの活用

## 参考資料

- [dnd-kit公式ドキュメント](https://docs.dndkit.com/)
- [Playwright公式ドキュメント - Mouse](https://playwright.dev/docs/api/class-mouse)
- [Playwright公式ドキュメント - Locator.dragTo()](https://playwright.dev/docs/api/class-locator#locator-drag-to)
- [dnd-kit GitHub Issues](https://github.com/clauderic/dnd-kit/issues) - テスト関連の議論
