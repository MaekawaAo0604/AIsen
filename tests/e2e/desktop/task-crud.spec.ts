import { test, expect } from '@playwright/test'

test.describe('Desktop - Task CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })
  })

  test('ページが正しく表示される', async ({ page }) => {
    // タイトルが表示されることを確認
    await expect(page.getByText('アイゼンハワー・マトリクス')).toBeVisible()

    // タスク追加ボタンが表示されることを確認
    await expect(page.getByRole('button', { name: /新しいタスクを追加/i })).toBeVisible()

    // 4つの象限が表示されることを確認
    await expect(page.getByText('Q1')).toBeVisible()
    await expect(page.getByText('Q2')).toBeVisible()
    await expect(page.getByText('Q3')).toBeVisible()
    await expect(page.getByText('Q4')).toBeVisible()
  })

  test('タスク追加モーダルが開く', async ({ page }) => {
    // タスク追加ボタンをクリック
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()

    // モーダルが表示されることを確認
    await expect(page.getByText('新しいタスクを追加')).toBeVisible({ timeout: 10000 })

    // タイトル入力フィールドが表示されることを確認
    await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).toBeVisible()
  })

  test('タスク追加モーダルを閉じられる', async ({ page }) => {
    // タスク追加ボタンをクリック
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()

    // モーダルが表示されることを確認
    await expect(page.getByText('新しいタスクを追加')).toBeVisible({ timeout: 10000 })

    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click()

    // モーダルが閉じることを確認
    await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).not.toBeVisible()
  })
})
