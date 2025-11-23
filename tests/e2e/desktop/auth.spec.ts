import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@aisen.dev'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpass123'

test.describe('Desktop - Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // ログアウト状態から開始
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('ログインモーダルが開く', async ({ page }) => {
    // ログインボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i })
    await loginButton.click()

    // モーダルが表示されることを確認
    await expect(page.getByText('ログイン').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByPlaceholder('example@mail.com')).toBeVisible()
  })

  test('メールアドレスでログインできる', async ({ page }) => {
    // ログインボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i }).first()
    await loginButton.click()

    // モーダルが表示されるまで待つ
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // メールアドレスとパスワードを入力
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)

    // ログインボタンをクリック
    await page.getByRole('button', { name: /^ログイン$/ }).click()

    // ログイン成功を確認（モーダルが閉じる）
    await expect(page.getByPlaceholder('example@mail.com')).not.toBeVisible({ timeout: 15000 })

    // ログイン後の画面が表示されることを確認
    await page.waitForTimeout(2000) // Firebase認証の完了を待つ

    // ログイン状態を確認（例: ユーザーメニューやログアウトボタンが表示される）
    // 実際のUIに合わせて調整してください
  })

  test('誤ったパスワードでエラーメッセージが表示される', async ({ page }) => {
    // ログインボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i }).first()
    await loginButton.click()

    // モーダルが表示されるまで待つ
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // メールアドレスと誤ったパスワードを入力
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', 'wrongpassword')

    // ログインボタンをクリック
    await page.getByRole('button', { name: /^ログイン$/ }).click()

    // エラーメッセージが表示されることを確認
    await expect(page.getByText(/メールアドレスまたはパスワードが正しくありません/i)).toBeVisible({ timeout: 10000 })

    // フォーム入力が保持されていることを確認
    await expect(page.locator('input[type="email"]')).toHaveValue(TEST_EMAIL)
  })

  test('新規登録リンクが表示される', async ({ page }) => {
    // ログインボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i }).first()
    await loginButton.click()

    // モーダルが表示されるまで待つ
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // 新規登録リンクが表示されることを確認
    await expect(page.getByText('まだアカウントをお持ちでない方')).toBeVisible()
    await expect(page.getByRole('button', { name: /新規登録はこちら/i })).toBeVisible()
  })

  test('新規登録画面に切り替えられる', async ({ page }) => {
    // ログインボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i }).first()
    await loginButton.click()

    // モーダルが表示されるまで待つ
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // 新規登録リンクをクリック
    await page.getByRole('button', { name: /新規登録はこちら/i }).click()

    // アカウント作成画面が表示されることを確認
    await expect(page.getByText('アカウント作成').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /^アカウント作成$/ })).toBeVisible()

    // ログインに戻るリンクが表示されることを確認
    await expect(page.getByText('すでにアカウントをお持ちの方')).toBeVisible()
    await expect(page.getByRole('button', { name: /ログインはこちら/i })).toBeVisible()
  })

  test('無効なメールアドレスでエラーメッセージが表示される', async ({ page }) => {
    // ログインボタンをクリック
    const loginButton = page.getByRole('button', { name: /ログイン/i }).first()
    await loginButton.click()

    // モーダルが表示されるまで待つ
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // 無効なメールアドレスとパスワードを入力
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')

    // ログインボタンをクリック
    await page.getByRole('button', { name: /^ログイン$/ }).click()

    // エラーメッセージが表示されることを確認
    await expect(page.getByText(/メールアドレスの形式が正しくありません/i)).toBeVisible({ timeout: 10000 })
  })
})
