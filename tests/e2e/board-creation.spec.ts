import { test, expect } from '@playwright/test'

test.describe('新規ボード作成とサンプルタスク', () => {
  test('2.1 新規ボード作成', async ({ page }) => {
    // /b/new にアクセス
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')

    // ユニークなボードIDが生成され、/b/[boardId] へリダイレクト
    await page.waitForURL(/\/b\/[a-zA-Z0-9\-_]+/, { timeout: 10000 })
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/\/b\/[a-zA-Z0-9\-_]+/)

    // ページタイトルが「AIsen - アイゼンハワー・マトリクス タスク管理」と表示される
    await expect(page).toHaveTitle(/AIsen.*アイゼンハワー・マトリクス/)

    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })

    // 4つのサンプルタスクが自動的に配置される
    const sampleTasks = [
      { quadrant: 'Q1', title: '今日中に返信するメール' },
      { quadrant: 'Q2', title: '今週中に進めたい資料作成' },
      { quadrant: 'Q3', title: '出席だけしておけばいい定例会議' },
      { quadrant: 'Q4', title: 'やらないと決めたこと' },
    ]

    for (const { quadrant, title } of sampleTasks) {
      const quadrantSection = page.locator(`[data-quadrant="${quadrant}"]`)
      await expect(quadrantSection.getByText(title)).toBeVisible()
    }

    // 「自動保存されています」メッセージが表示される
    await expect(page.getByText(/自動保存/i)).toBeVisible()

    // 「この URL をブックマークすると いつでも続きから再開できます」メッセージが表示される
    await expect(page.getByText(/URL.*ブックマーク/i)).toBeVisible()
  })

  test('2.2 URL永続性', async ({ page }) => {
    // /b/new で新規ボード作成
    await page.goto('/b/new')
    await page.waitForURL(/\/b\/[a-zA-Z0-9\-_]+/, { timeout: 10000 })
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })

    // 表示されたURLをコピー
    const originalUrl = page.url()

    // サンプルタスクが存在することを確認
    const sampleTaskTitle = '今日中に返信するメール'
    await expect(page.getByText(sampleTaskTitle)).toBeVisible()

    // 新しいタスクを追加してボードを変更
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('永続性テストタスク')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()

    // 追加したタスクが表示されることを確認
    await expect(page.getByText('永続性テストタスク')).toBeVisible()

    // ブラウザをリロード
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })

    // リロード後も同じタスクが表示される
    await expect(page.getByText(sampleTaskTitle)).toBeVisible()
    await expect(page.getByText('永続性テストタスク')).toBeVisible()

    // 別タブで同じURLを開く
    const newPage = await page.context().newPage()
    await newPage.goto(originalUrl)
    await newPage.waitForLoadState('domcontentloaded')
    await newPage.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })

    // 別タブでも同じボード状態が表示される
    await expect(newPage.getByText(sampleTaskTitle)).toBeVisible()
    await expect(newPage.getByText('永続性テストタスク')).toBeVisible()

    // LocalStorageにボードデータが保存されている
    const localStorage = await page.evaluate(() => {
      return Object.keys(window.localStorage)
    })
    expect(localStorage.length).toBeGreaterThan(0)

    // クリーンアップ
    await newPage.close()
  })
})
