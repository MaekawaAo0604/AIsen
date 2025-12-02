import { test, expect } from '@playwright/test'

test.describe('タスク表示と詳細', () => {
  test.beforeEach(async ({ page }) => {
    // LocalStorageをクリアして新しいボードを作成
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })

    // テスト用のタスクを1つ作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('表示テスト用タスク')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()
    // タスクが表示されるまで待つ
    await expect(page.locator('[data-quadrant="Q1"]').getByText('表示テスト用タスク')).toBeVisible()
  })

  test('4.1 タスク詳細モーダル表示', async ({ page }) => {
    // タスクカードをクリック
    const taskCard = page.locator('[data-quadrant="Q1"]').getByText('表示テスト用タスク')
    await taskCard.click()

    // TaskDetailModalが画面全体にオーバーレイ表示される
    const modal = page.locator('.fixed.inset-0.z-50')
    await expect(modal).toBeVisible({ timeout: 10000 })

    // モーダルヘッダーにタスクタイトルが表示される
    await expect(modal.getByText('表示テスト用タスク')).toBeVisible()

    // 作成日時が表示される（形式は実装に依存）
    await expect(modal.getByText(/作成日/i).or(modal.getByText(/🕒/))).toBeVisible()

    // 閉じるボタン（×アイコン）が表示される
    const closeButton = modal.locator('button').filter({ has: page.locator('svg') }).first()
    await expect(closeButton).toBeVisible()
  })

  test('4.2 タスク詳細モーダルを閉じる', async ({ page }) => {
    // タスクカードをクリックして詳細モーダルを開く
    const taskCard = page.locator('[data-quadrant="Q1"]').getByText('表示テスト用タスク')
    await taskCard.click()

    // モーダルが表示されることを確認
    const modal = page.locator('.fixed.inset-0.z-50')
    await expect(modal).toBeVisible({ timeout: 10000 })

    // 閉じるボタン（×アイコン）をクリック
    const closeButton = modal.locator('button').filter({ has: page.locator('svg') }).first()
    await closeButton.click()

    // モーダルが閉じる
    await expect(modal).not.toBeVisible()

    // ボード画面に戻る（タスクカードが表示されている）
    await expect(page.locator('[data-quadrant="Q1"]').getByText('表示テスト用タスク')).toBeVisible()
  })

  test('4.3 タスクカード基本情報表示', async ({ page }) => {
    // 期限付きタスクを追加で作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('期限付きタスク')
    const deadlineInput = page.locator('input[type="date"]')
    await deadlineInput.fill('2025-12-31')
    await page.getByRole('button', { name: /Q2.*計画してやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()

    // Q2象限のタスクカードを確認
    const q2Section = page.locator('[data-quadrant="Q2"]')

    // タスクタイトルが表示される
    await expect(q2Section.getByText('期限付きタスク')).toBeVisible()

    // 追加日時（🕒 追加: YYYY/MM/DD）が表示される
    await expect(q2Section.getByText(/🕒 追加:/)).toBeVisible()

    // 期限が設定されている場合は「📅 期限: YYYY/MM/DD」が表示される
    await expect(q2Section.getByText(/📅 期限:.*2025\/12\/31/)).toBeVisible()

    // チェックボックス（完了切り替え用）が表示される
    const checkbox = q2Section.locator('button').filter({ has: page.locator('span.w-4.h-4.rounded-\\[3px\\].border-2') }).first()
    await expect(checkbox).toBeVisible()

    // 削除ボタン（×）が表示される（ホバー時に表示）
    const deleteButton = q2Section.locator('button').filter({ has: page.locator('svg path[d*="M6 18L18 6M6 6l12 12"]') }).first()
    await expect(deleteButton).toBeVisible()
  })

  test('4.3 タスクカード基本情報表示（モバイル）', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    // 期限付きタスクを追加で作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('モバイル期限付きタスク')
    const deadlineInput = page.locator('input[type="date"]')
    await deadlineInput.fill('2025-12-31')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()

    // Q1象限のタスクカードを確認
    const q1Section = page.locator('[data-quadrant="Q1"]')

    // タスクタイトルが表示される
    await expect(q1Section.getByText('モバイル期限付きタスク')).toBeVisible()

    // 追加日時が表示される
    await expect(q1Section.getByText(/🕒 追加:/).first()).toBeVisible()

    // 期限が表示される
    await expect(q1Section.getByText(/📅 期限:.*2025\/12\/31/)).toBeVisible()

    // チェックボックスが表示される
    const checkbox = q1Section.locator('button').filter({ has: page.locator('span.w-4.h-4.rounded-\\[3px\\].border-2') }).first()
    await expect(checkbox).toBeVisible()
  })
})
