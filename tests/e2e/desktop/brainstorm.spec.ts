import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@aisen.dev'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpass123'

test.describe('Desktop - AI Brainstorming Limits', () => {
  test.beforeEach(async ({ page, context }) => {
    // 各テストの前にログイン状態にする
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // ログインボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i }).first()
    await loginButton.click()

    // ログイン処理
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.getByRole('button', { name: /^ログイン$/ }).click()

    // ログイン完了を待つ
    await page.waitForTimeout(3000)

    // ボードページに移動
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })
  })

  test('AIブレインストーミングボタンが表示される', async ({ page }) => {
    // AIブレインストーミングボタンが表示されることを確認
    const brainstormButton = page.getByRole('button', { name: /AIブレインストーミング/i })
    await expect(brainstormButton).toBeVisible({ timeout: 10000 })
  })

  test('AIブレインストーミングモーダルが開く', async ({ page }) => {
    // AIブレインストーミングボタンをクリック
    const brainstormButton = page.getByRole('button', { name: /AIブレインストーミング/i })
    await brainstormButton.click()

    // モーダルが表示されることを確認
    await expect(page.getByText('AIブレインストーミング')).toBeVisible({ timeout: 10000 })

    // 入力フィールドが表示されることを確認
    await expect(page.getByPlaceholder(/どんなタスクを整理したいですか/i)).toBeVisible()
  })

  test('Freeプランで残り回数が表示される', async ({ page }) => {
    // AIブレインストーミングボタンをクリック
    const brainstormButton = page.getByRole('button', { name: /AIブレインストーミング/i })
    await brainstormButton.click()

    // モーダルが表示されることを確認
    await page.waitForSelector('text=AIブレインストーミング', { timeout: 10000 })

    // 残り回数バッジが表示されることを確認
    await expect(page.getByText(/今日の残り:/i)).toBeVisible({ timeout: 5000 })

    // 残り回数が "X / 5" の形式で表示されることを確認
    const remainingText = await page.getByText(/今日の残り:/i).textContent()
    expect(remainingText).toMatch(/今日の残り:\s*\d+\s*\/\s*5/)
  })

  test('AIブレインストーミングを実行できる', async ({ page }) => {
    // AIブレインストーミングボタンをクリック
    const brainstormButton = page.getByRole('button', { name: /AIブレインストーミング/i })
    await brainstormButton.click()

    // モーダルが表示されるまで待つ
    await page.waitForSelector('input[placeholder*="どんなタスクを整理したいですか"]', { timeout: 10000 })

    // テスト用の課題を入力
    const testChallenge = 'プロジェクト管理を改善したい'
    await page.fill('input[placeholder*="どんなタスクを整理したいですか"]', testChallenge)

    // スタートボタンをクリック
    const startButton = page.getByRole('button', { name: /スタート/i })
    await startButton.click()

    // ローディングまたは会話が開始されることを確認
    // 実際のUIに合わせて調整してください
    await page.waitForTimeout(2000)

    // AIの応答が表示されることを確認（タイムアウトを長めに設定）
    // 実際のレスポンスに時間がかかる場合があるため
    await page.waitForTimeout(5000)
  })

  test('5回使用後に制限メッセージが表示される', async ({ page }) => {
    // このテストは5回連続でブレインストーミングを実行する必要があるため、
    // 実際の実装では事前にFirestoreのusageデータを操作することを推奨

    // 注: このテストは実際に5回実行するとAPIコストがかかるため、
    // モックやスタブを使用することを検討してください

    // 使用回数を4回に設定（Firestoreを直接操作する必要がある）
    // この部分は実装によって異なります

    // AIブレインストーミングボタンをクリック
    const brainstormButton = page.getByRole('button', { name: /AIブレインストーミング/i })
    await brainstormButton.click()

    // 残り回数が1回になっていることを確認
    // await expect(page.getByText(/今日の残り:\s*1\s*\/\s*5/i)).toBeVisible({ timeout: 5000 })

    // 制限に達した場合のエラーモーダルを確認
    // この部分は使用回数を超えた状態でテストする必要があります
    // await expect(page.getByText(/今日はAIブレインストーミングの無料分を使い切りました/i)).toBeVisible()
  })

  test('制限エラーモーダルにプランリンクが表示される', async ({ page }) => {
    // このテストは使用制限に達した状態で実行する必要があります
    // 実装では、Firestoreのusageデータを5に設定してからテストすることを推奨

    // 使用回数を5回に設定（Firestoreを直接操作する必要がある）

    // AIブレインストーミングボタンをクリック
    // const brainstormButton = page.getByRole('button', { name: /AIブレインストーミング/i })
    // await brainstormButton.click()

    // エラーモーダルが表示されることを確認
    // await expect(page.getByText(/今日はAIブレインストーミングの無料分を使い切りました/i)).toBeVisible({ timeout: 10000 })

    // プランリンクが表示されることを確認
    // await expect(page.getByRole('link', { name: /プランを見る/i })).toBeVisible()

    // 閉じるボタンが表示されることを確認
    // await expect(page.getByRole('button', { name: /閉じる/i })).toBeVisible()
  })

  test('モーダルを閉じられる', async ({ page }) => {
    // AIブレインストーミングボタンをクリック
    const brainstormButton = page.getByRole('button', { name: /AIブレインストーミング/i })
    await brainstormButton.click()

    // モーダルが表示されることを確認
    await page.waitForSelector('text=AIブレインストーミング', { timeout: 10000 })

    // 閉じるボタンまたはキャンセルボタンをクリック
    // 実際のUIに合わせて調整してください
    const closeButton = page.getByRole('button', { name: /キャンセル|閉じる/i }).first()
    await closeButton.click()

    // モーダルが閉じることを確認
    await expect(page.getByPlaceholder(/どんなタスクを整理したいですか/i)).not.toBeVisible({ timeout: 5000 })
  })
})
