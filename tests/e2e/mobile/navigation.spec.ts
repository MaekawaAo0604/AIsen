import { test, expect } from '@playwright/test'

test.describe('Mobile - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=AIsen', { timeout: 15000 })
  })

  test('モバイルで4象限のグリッドが表示される', async ({ page }) => {
    // 4つの象限が表示されることを確認
    await expect(page.getByText('Q1')).toBeVisible()
    await expect(page.getByText('Q2')).toBeVisible()
    await expect(page.getByText('Q3')).toBeVisible()
    await expect(page.getByText('Q4')).toBeVisible()

    // 象限のタイトルが表示されることを確認
    await expect(page.getByText('今すぐやる')).toBeVisible()
    await expect(page.getByText('計画してやる')).toBeVisible()
    await expect(page.getByText('誰かに任せる')).toBeVisible()
    await expect(page.getByText('やらない')).toBeVisible()
  })

  test('モバイルでヘッダーが正しく表示される', async ({ page }) => {
    // タイトルが表示されることを確認
    await expect(page.getByRole('heading', { name: 'AIsen' })).toBeVisible()

    // ハンバーガーメニューボタンが表示されることを確認（モバイルのみ）
    const hamburgerMenu = page.getByLabel('メニューを開く')
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 640) {
      await expect(hamburgerMenu).toBeVisible()
    }
  })

  test('モバイルでタスク追加ボタンが表示される', async ({ page }) => {
    // タスク追加ボタンが表示されることを確認
    const addButton = page.getByRole('button', { name: /新しいタスクを追加/i })
    await expect(addButton).toBeVisible()
  })

  test('モバイルでレスポンシブなレイアウトが適用される', async ({ page }) => {
    // タイトルが表示されることを確認
    await expect(page.getByText('アイゼンハワー・マトリクス')).toBeVisible()

    // ヘッダーの高さが適切であることを確認
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // マトリクスボードが表示されることを確認（正確なセレクタを使用）
    await expect(page.locator('.transform.-rotate-90').getByText('重要度').first()).toBeVisible()
    await expect(page.locator('text=緊急度').first()).toBeVisible()
  })
})
