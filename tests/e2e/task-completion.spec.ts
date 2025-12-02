import { test, expect } from '@playwright/test'

test.describe('タスク完了管理', () => {
  test.beforeEach(async ({ page }) => {
    // LocalStorageをクリアして新しいボードを作成
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })

    // テスト用のタスクを作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('完了テスト用タスク')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()
    // タスクが表示されるまで待つ
    await expect(page.locator('[data-quadrant="Q1"]').getByText('完了テスト用タスク')).toBeVisible()
  })

  test('7.1 タスク完了切り替え', async ({ page }) => {
    const q1Section = page.locator('[data-quadrant="Q1"]')

    // 未完了タスクのチェックボックスを探す
    const taskCard = q1Section.locator('text=完了テスト用タスク').locator('..')
    const checkboxButton = taskCard.locator('button').filter({ has: page.locator('span.w-4.h-4.rounded-\\[3px\\].border-2') }).first()

    // チェックボックスが未チェック状態であることを確認
    const checkboxSpan = checkboxButton.locator('span.w-4.h-4')
    await expect(checkboxSpan).not.toHaveCSS('background-color', 'rgb(35, 131, 226)') // 未チェック状態

    // チェックボックスをクリック
    await checkboxButton.click()

    // タスクが完了状態になる（チェックマークが表示される）
    await expect(checkboxButton.locator('svg')).toBeVisible()

    // タスクカードに打ち消し線が表示される
    const taskTitle = taskCard.locator('text=完了テスト用タスク')
    await expect(taskTitle).toHaveClass(/line-through/)
  })

  test('7.2 タスク未完了に戻す', async ({ page }) => {
    const q1Section = page.locator('[data-quadrant="Q1"]')

    // タスクのチェックボックスを探す
    const taskCard = q1Section.locator('text=完了テスト用タスク').locator('..')
    const checkboxButton = taskCard.locator('button').filter({ has: page.locator('span.w-4.h-4.rounded-\\[3px\\].border-2') }).first()

    // まず完了状態にする
    await checkboxButton.click()
    await expect(checkboxButton.locator('svg')).toBeVisible()

    // 完了済みタスクのチェックボックスをクリック
    await checkboxButton.click()

    // タスクが未完了状態に戻る（チェックマークが消える）
    await expect(checkboxButton.locator('svg')).not.toBeVisible()

    // 打ち消し線が解除される
    const taskTitle = taskCard.locator('text=完了テスト用タスク')
    await expect(taskTitle).not.toHaveClass(/line-through/)
  })

  test('7.3 完了タスクのアーカイブ表示', async ({ page }) => {
    // 複数のタスクを作成
    const tasks = ['タスク1', 'タスク2', 'タスク3']

    for (const taskName of tasks) {
      await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
      await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill(taskName)
      await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
      await page.getByRole('button', { name: '配置する' }).click()
      await expect(page.locator('[data-quadrant="Q1"]').getByText(taskName)).toBeVisible()
    }

    const q1Section = page.locator('[data-quadrant="Q1"]')

    // タスク1とタスク2を完了状態にする
    for (const taskName of ['タスク1', 'タスク2']) {
      const taskCard = q1Section.locator(`text=${taskName}`).locator('..')
      const checkboxButton = taskCard.locator('button').filter({ has: page.locator('span.w-4.h-4.rounded-\\[3px\\].border-2') }).first()
      await checkboxButton.click()
      await expect(checkboxButton.locator('svg')).toBeVisible()
    }

    // 完了タスクセクションが表示される
    await expect(q1Section.getByText(/完了済み.*2/i)).toBeVisible()

    // 完了タスクセクションを展開
    await q1Section.getByText(/完了済み.*2/i).click()

    // 完了タスクが表示される
    await expect(q1Section.getByText('タスク1')).toBeVisible()
    await expect(q1Section.getByText('タスク2')).toBeVisible()

    // 未完了タスクも表示される
    await expect(q1Section.getByText('タスク3')).toBeVisible()
  })

  test('7.1 タスク完了切り替え（モバイル）', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    const q1Section = page.locator('[data-quadrant="Q1"]')

    // 未完了タスクのチェックボックスを探す
    const taskCard = q1Section.locator('text=完了テスト用タスク').locator('..')
    const checkboxButton = taskCard.locator('button').filter({ has: page.locator('span.w-4.h-4.rounded-\\[3px\\].border-2') }).first()

    // チェックボックスをクリック
    await checkboxButton.click()

    // タスクが完了状態になる（チェックマークが表示される）
    await expect(checkboxButton.locator('svg')).toBeVisible()

    // タスクカードに打ち消し線が表示される
    const taskTitle = taskCard.locator('text=完了テスト用タスク')
    await expect(taskTitle).toHaveClass(/line-through/)
  })

  test('7.2 タスク未完了に戻す（モバイル）', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    const q1Section = page.locator('[data-quadrant="Q1"]')

    // タスクのチェックボックスを探す
    const taskCard = q1Section.locator('text=完了テスト用タスク').locator('..')
    const checkboxButton = taskCard.locator('button').filter({ has: page.locator('span.w-4.h-4.rounded-\\[3px\\].border-2') }).first()

    // まず完了状態にする
    await checkboxButton.click()
    await expect(checkboxButton.locator('svg')).toBeVisible()

    // 完了済みタスクのチェックボックスをクリック
    await checkboxButton.click()

    // タスクが未完了状態に戻る（チェックマークが消える）
    await expect(checkboxButton.locator('svg')).not.toBeVisible()

    // 打ち消し線が解除される
    const taskTitle = taskCard.locator('text=完了テスト用タスク')
    await expect(taskTitle).not.toHaveClass(/line-through/)
  })
})
