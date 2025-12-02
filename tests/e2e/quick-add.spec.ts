import { test, expect } from '@playwright/test'

test.describe('Quick Add機能（qキー）', () => {
  test.beforeEach(async ({ page }) => {
    // LocalStorageをクリアして新しいボードを作成
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })
  })

  test('9.1 qキーでQuick Add起動', async ({ page }) => {
    // qキーを押す
    await page.keyboard.press('q')

    // QuickAddModalが表示されることを確認
    await expect(page.getByText('Quick Add')).toBeVisible({ timeout: 10000 })

    // タイトル入力欄にフォーカスが当たっていることを確認
    const titleInput = page.getByPlaceholder(/タスクを入力/i)
    await expect(titleInput).toBeVisible()
    await expect(titleInput).toBeFocused()
  })

  test('9.2 Quick Addでタスク作成', async ({ page }) => {
    // qキーを押してQuick Addを起動
    await page.keyboard.press('q')

    // タイトル入力欄が表示されるまで待つ
    const titleInput = page.getByPlaceholder(/タスクを入力/i)
    await expect(titleInput).toBeVisible({ timeout: 10000 })

    // 「緊急の顧客対応」と入力
    await titleInput.fill('緊急の顧客対応')

    // Enterキーを押す
    await page.keyboard.press('Enter')

    // モーダルが閉じることを確認
    await expect(titleInput).not.toBeVisible({ timeout: 5000 })

    // タスクがいずれかの象限に追加されることを確認
    // （AIによる自動配置のため、具体的な象限は指定しない）
    await expect(page.getByText('緊急の顧客対応')).toBeVisible({ timeout: 10000 })

    // 追加日時が自動で付与されることを確認
    const taskCard = page.locator('[data-task-title*="緊急の顧客対応"]').first()
    await expect(taskCard.getByText(/🕒 追加:/)).toBeVisible()
  })

  test('9.3 Quick Addキャンセル', async ({ page }) => {
    // qキーを押してQuick Addを起動
    await page.keyboard.press('q')

    // タイトル入力欄が表示されるまで待つ
    const titleInput = page.getByPlaceholder(/タスクを入力/i)
    await expect(titleInput).toBeVisible({ timeout: 10000 })

    // 何か入力する（オプション）
    await titleInput.fill('キャンセルするタスク')

    // Escキーを押す
    await page.keyboard.press('Escape')

    // モーダルが閉じることを確認
    await expect(titleInput).not.toBeVisible({ timeout: 5000 })

    // タスクは作成されないことを確認
    await expect(page.getByText('キャンセルするタスク')).not.toBeVisible()
  })

  test('9.4 Quick Add - 空タイトルでEnter押下', async ({ page }) => {
    // qキーを押してQuick Addを起動
    await page.keyboard.press('q')

    // タイトル入力欄が表示されるまで待つ
    const titleInput = page.getByPlaceholder(/タスクを入力/i)
    await expect(titleInput).toBeVisible({ timeout: 10000 })

    // タイトルを空のままEnterキーを押す
    await page.keyboard.press('Enter')

    // モーダルが閉じないことを確認（空タイトルは作成できない想定）
    await expect(titleInput).toBeVisible()
  })

  test('9.5 Quick Add - 複数タスクを連続作成', async ({ page }) => {
    const tasks = [
      '重要な会議の準備',
      'メールの返信',
      'レポート作成'
    ]

    for (const taskTitle of tasks) {
      // qキーを押してQuick Addを起動
      await page.keyboard.press('q')

      // タイトル入力欄が表示されるまで待つ
      const titleInput = page.getByPlaceholder(/タスクを入力/i)
      await expect(titleInput).toBeVisible({ timeout: 10000 })

      // タスクタイトルを入力
      await titleInput.fill(taskTitle)

      // Enterキーを押す
      await page.keyboard.press('Enter')

      // モーダルが閉じることを確認
      await expect(titleInput).not.toBeVisible({ timeout: 5000 })

      // タスクが追加されることを確認
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })
    }

    // すべてのタスクが表示されることを確認
    for (const taskTitle of tasks) {
      await expect(page.getByText(taskTitle)).toBeVisible()
    }
  })
})
