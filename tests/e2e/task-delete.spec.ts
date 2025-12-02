import { test, expect } from '@playwright/test'

test.describe('タスク削除', () => {
  test.beforeEach(async ({ page }) => {
    // LocalStorageをクリアして新しいボードを作成
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })

    // テスト用のタスクを作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('削除テスト用タスク')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()
    // タスクが表示されるまで待つ
    await expect(page.locator('[data-quadrant="Q1"]').getByText('削除テスト用タスク')).toBeVisible()
  })

  test('6.1 タスク削除', async ({ page }) => {
    const q1Section = page.locator('[data-quadrant="Q1"]')

    // タスクカードの削除ボタン（×）をクリック
    const taskCard = q1Section.locator('text=削除テスト用タスク').locator('..')
    const deleteButton = taskCard.locator('button').filter({ has: page.locator('svg path[d*="M6 18L18 6M6 6l12 12"]') }).first()
    await deleteButton.click()

    // 確認ダイアログが表示される
    await expect(page.getByText(/削除してもよろしいですか/i)).toBeVisible({ timeout: 10000 })

    // 確認ダイアログで「削除」を選択
    await page.getByRole('button', { name: /削除/i }).click()

    // タスクがボードから削除される
    await expect(q1Section.getByText('削除テスト用タスク')).not.toBeVisible()
  })

  test('6.2 タスク削除キャンセル', async ({ page }) => {
    const q1Section = page.locator('[data-quadrant="Q1"]')

    // タスクカードの削除ボタン（×）をクリック
    const taskCard = q1Section.locator('text=削除テスト用タスク').locator('..')
    const deleteButton = taskCard.locator('button').filter({ has: page.locator('svg path[d*="M6 18L18 6M6 6l12 12"]') }).first()
    await deleteButton.click()

    // 確認ダイアログが表示される
    await expect(page.getByText(/削除してもよろしいですか/i)).toBeVisible({ timeout: 10000 })

    // 確認ダイアログで「キャンセル」を選択
    await page.getByRole('button', { name: /キャンセル/i }).click()

    // ダイアログが閉じる
    await expect(page.getByText(/削除してもよろしいですか/i)).not.toBeVisible()

    // タスクは削除されない
    await expect(q1Section.getByText('削除テスト用タスク')).toBeVisible()
  })

  test('6.1 タスク削除（モバイル）', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    const q1Section = page.locator('[data-quadrant="Q1"]')

    // タスクカードの削除ボタン（×）をクリック
    const taskCard = q1Section.locator('text=削除テスト用タスク').locator('..')
    const deleteButton = taskCard.locator('button').filter({ has: page.locator('svg path[d*="M6 18L18 6M6 6l12 12"]') }).first()
    await deleteButton.click()

    // 確認ダイアログが表示される
    await expect(page.getByText(/削除してもよろしいですか/i)).toBeVisible({ timeout: 10000 })

    // 確認ダイアログで「削除」を選択
    await page.getByRole('button', { name: /削除/i }).click()

    // タスクがボードから削除される
    await expect(q1Section.getByText('削除テスト用タスク')).not.toBeVisible()
  })

  test('6.2 タスク削除キャンセル（モバイル）', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    const q1Section = page.locator('[data-quadrant="Q1"]')

    // タスクカードの削除ボタン（×）をクリック
    const taskCard = q1Section.locator('text=削除テスト用タスク').locator('..')
    const deleteButton = taskCard.locator('button').filter({ has: page.locator('svg path[d*="M6 18L18 6M6 6l12 12"]') }).first()
    await deleteButton.click()

    // 確認ダイアログが表示される
    await expect(page.getByText(/削除してもよろしいですか/i)).toBeVisible({ timeout: 10000 })

    // 確認ダイアログで「キャンセル」を選択
    await page.getByRole('button', { name: /キャンセル/i }).click()

    // ダイアログが閉じる
    await expect(page.getByText(/削除してもよろしいですか/i)).not.toBeVisible()

    // タスクは削除されない
    await expect(q1Section.getByText('削除テスト用タスク')).toBeVisible()
  })
})
