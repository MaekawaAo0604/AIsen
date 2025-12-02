import { test, expect } from '@playwright/test'

test.describe('タスク作成', () => {
  test.beforeEach(async ({ page }) => {
    // LocalStorageをクリアして新しいボードを作成
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })
  })

  test('3.1 新規タスク作成（最小構成）', async ({ page }) => {
    // 新しいタスクを追加ボタンをクリック
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()

    // TaskPlacementModalが表示されることを確認
    await expect(page.getByText('新しいタスクを追加')).toBeVisible({ timeout: 10000 })

    // タイトル未入力時は「配置する」ボタンがdisabled
    const placeButton = page.getByRole('button', { name: '配置する' })
    await expect(placeButton).toBeDisabled()

    // タイトル入力欄に「テスト用タスク」と入力
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('テスト用タスク')

    // タイトル入力後は「配置する」ボタンが有効化
    await expect(placeButton).toBeEnabled()

    // 「Q1: 今すぐやる」ボタンをクリック
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()

    // Q1選択時は「Q1: 今すぐやる」ボタンがactiveスタイル（ring-2クラスなどで判定）
    const q1Button = page.getByRole('button', { name: /Q1.*今すぐやる/i })
    await expect(q1Button).toHaveClass(/ring-2/)

    // 「配置する」ボタンをクリック
    await placeButton.click()

    // モーダルが自動的に閉じる
    await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).not.toBeVisible()

    // タスクがQ1象限に追加される
    const q1Section = page.locator('[data-quadrant="Q1"]')
    await expect(q1Section.getByText('テスト用タスク')).toBeVisible()

    // 追加日時が自動で付与される（例: 🕒 追加: 2025/12/2）
    await expect(q1Section.getByText(/🕒 追加:/)).toBeVisible()
  })

  test('3.2 新規タスク作成（詳細付き）', async ({ page }) => {
    // 新しいタスクを追加ボタンをクリック
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()

    // タイトルを入力
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('詳細付きタスク')

    // 詳細・サブタスクを入力
    const detailInput = page.getByPlaceholder(/例: 市場調査、競合分析/i)
    await detailInput.fill('サブタスク1、サブタスク2')

    // 期限を設定
    const deadlineInput = page.locator('input[type="date"]')
    await deadlineInput.fill('2025-12-31')

    // 「Q2: 計画してやる」を選択
    await page.getByRole('button', { name: /Q2.*計画してやる/i }).click()

    // 「配置する」ボタンをクリック
    await page.getByRole('button', { name: '配置する' }).click()

    // タスクがQ2象限に追加される
    const q2Section = page.locator('[data-quadrant="Q2"]')
    await expect(q2Section.getByText('詳細付きタスク')).toBeVisible()

    // タスクカードに詳細とサブタスクが表示される
    await expect(q2Section.getByText(/サブタスク1、サブタスク2/)).toBeVisible()

    // 期限が「📅 期限: 2025/12/31」として表示される
    await expect(q2Section.getByText(/📅 期限: 2025\/12\/31/)).toBeVisible()
  })

  test('3.3 各象限へのタスク作成', async ({ page }) => {
    const quadrants = [
      { name: 'Q1: 今すぐやる', quadrant: 'Q1', taskTitle: 'Q1テストタスク' },
      { name: 'Q2: 計画してやる', quadrant: 'Q2', taskTitle: 'Q2テストタスク' },
      { name: 'Q3: やらないといけない雑務', quadrant: 'Q3', taskTitle: 'Q3テストタスク' },
      { name: 'Q4: やらないこと', quadrant: 'Q4', taskTitle: 'Q4テストタスク' },
    ]

    for (const { name, quadrant, taskTitle } of quadrants) {
      // 新しいタスクを追加ボタンをクリック
      await page.getByRole('button', { name: /新しいタスクを追加/i }).click()

      // タイトルを入力
      await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill(taskTitle)

      // 象限を選択
      await page.getByRole('button', { name: new RegExp(name) }).click()

      // 配置する
      await page.getByRole('button', { name: '配置する' }).click()

      // タスクが正しく配置されることを確認
      const quadrantSection = page.locator(`[data-quadrant="${quadrant}"]`)
      await expect(quadrantSection.getByText(taskTitle)).toBeVisible()
    }

    // すべての象限にタスクが正しく配置される
    await expect(page.locator('[data-quadrant="Q1"]').getByText('Q1テストタスク')).toBeVisible()
    await expect(page.locator('[data-quadrant="Q2"]').getByText('Q2テストタスク')).toBeVisible()
    await expect(page.locator('[data-quadrant="Q3"]').getByText('Q3テストタスク')).toBeVisible()
    await expect(page.locator('[data-quadrant="Q4"]').getByText('Q4テストタスク')).toBeVisible()
  })

  test('3.4 タスク作成キャンセル', async ({ page }) => {
    // 新しいタスクを追加ボタンをクリック
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()

    // タイトルに「キャンセルするタスク」と入力
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('キャンセルするタスク')

    // 「キャンセル」ボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click()

    // モーダルが閉じる
    await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).not.toBeVisible()

    // タスクは作成されない（「キャンセルするタスク」がページに存在しない）
    await expect(page.getByText('キャンセルするタスク')).not.toBeVisible()
  })

  test('3.5 空タイトルでの作成防止', async ({ page }) => {
    // 新しいタスクを追加ボタンをクリック
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()

    // タイトルを空のまま「Q1: 今すぐやる」を選択
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()

    // 「配置する」ボタンがdisabled状態のまま
    const placeButton = page.getByRole('button', { name: '配置する' })
    await expect(placeButton).toBeDisabled()

    // クリックしても何も起こらない（試しにクリックしてみる）
    await placeButton.click({ force: true }) // disabledでも強制クリック

    // モーダルが閉じていないことを確認
    await expect(page.getByText('新しいタスクを追加')).toBeVisible()
  })
})
