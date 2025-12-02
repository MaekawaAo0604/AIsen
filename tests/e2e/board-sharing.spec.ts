import { test, expect } from '@playwright/test'

test.describe('ボード共有機能', () => {
  let boardId: string
  let shareUrl: string

  test.beforeEach(async ({ page }) => {
    // LocalStorageをクリアして新しいボードを作成
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })

    // 現在のURLからboardIdを取得
    const url = page.url()
    const match = url.match(/\/b\/([^/]+)/)
    if (match) {
      boardId = match[1]
    }

    // テスト用のタスクを1つ作成しておく
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('共有テストタスク')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()
    await expect(page.getByText('共有テストタスク')).toBeVisible()
  })

  test('10.1 共有リンクコピー', async ({ page, context }) => {
    // ブラウザのクリップボード権限を付与
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // 「共有」ボタンをクリック
    const shareButton = page.getByRole('button', { name: /共有/i })
    await expect(shareButton).toBeVisible({ timeout: 10000 })
    await shareButton.click()

    // ShareLinkModalが表示されることを確認
    await expect(page.getByText(/共有リンク/i)).toBeVisible({ timeout: 10000 })

    // 「共有リンクをコピー」ボタンをクリック
    const copyButton = page.getByRole('button', { name: /コピー/i })
    await expect(copyButton).toBeVisible()
    await copyButton.click()

    // 成功メッセージが表示されることを確認
    await expect(page.getByText(/コピーしました/i).or(page.getByText(/クリップボードにコピー/i))).toBeVisible({ timeout: 5000 })

    // クリップボードから共有URLを取得
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('/s/')

    // 共有URLを保存
    shareUrl = clipboardText
  })

  test('10.2 共有ボード表示', async ({ page, context }) => {
    // まず共有リンクを取得
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const shareButton = page.getByRole('button', { name: /共有/i })
    await shareButton.click()
    await page.getByRole('button', { name: /コピー/i }).click()
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

    // 共有リンクを新しいタブで開く
    await page.goto(clipboardText)
    await page.waitForLoadState('domcontentloaded')

    // read-onlyモードでボードが表示されることを確認
    await expect(page.getByText(/読み取り専用/i).or(page.getByText(/デモモード/i))).toBeVisible({ timeout: 10000 })

    // 作成したタスクが表示されることを確認
    await expect(page.getByText('共有テストタスク')).toBeVisible()

    // 「新しいタスクを追加」ボタンが表示されないことを確認
    await expect(page.getByRole('button', { name: /新しいタスクを追加/i })).not.toBeVisible()

    // タスクがdisabled状態であることを確認（クリックできない）
    const taskCard = page.getByText('共有テストタスク').locator('..')
    const isDisabled = await taskCard.evaluate((el) => {
      return el.hasAttribute('disabled') ||
             el.classList.contains('pointer-events-none') ||
             window.getComputedStyle(el).pointerEvents === 'none'
    })
    expect(isDisabled).toBeTruthy()
  })

  test('10.3 共有ボードから自分のボードを作成', async ({ page, context }) => {
    // まず共有リンクを取得
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const shareButton = page.getByRole('button', { name: /共有/i })
    await shareButton.click()
    await page.getByRole('button', { name: /コピー/i }).click()
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

    // 共有ボードへ移動
    await page.goto(clipboardText)
    await page.waitForLoadState('domcontentloaded')

    // 「自分のボードを作成」リンクをクリック
    const createBoardLink = page.getByRole('link', { name: /自分のボードを作成/i })
      .or(page.getByRole('button', { name: /自分のボードを作成/i }))

    await expect(createBoardLink).toBeVisible({ timeout: 10000 })
    await createBoardLink.click()

    // /b/newページへ遷移することを確認
    await page.waitForURL(/\/b\/.+/, { timeout: 10000 })

    // 新しいボードが作成されることを確認
    await expect(page.getByText('アイゼンハワー・マトリクス')).toBeVisible({ timeout: 10000 })

    // URLが変わっていることを確認（新しいボードID）
    const newUrl = page.url()
    expect(newUrl).toMatch(/\/b\/[^/]+/)
    expect(newUrl).not.toContain('/s/')
  })

  test('10.4 複数タスクの共有ボード', async ({ page, context }) => {
    // 追加のタスクを作成
    const additionalTasks = ['Q2タスク', 'Q3タスク', 'Q4タスク']
    const quadrants = ['Q2.*計画してやる', 'Q3.*やらないといけない雑務', 'Q4.*やらないこと']

    for (let i = 0; i < additionalTasks.length; i++) {
      await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
      await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill(additionalTasks[i])
      await page.getByRole('button', { name: new RegExp(quadrants[i]) }).click()
      await page.getByRole('button', { name: '配置する' }).click()
      await expect(page.getByText(additionalTasks[i])).toBeVisible()
    }

    // 共有リンクを取得して新しいタブで開く
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const shareButton = page.getByRole('button', { name: /共有/i })
    await shareButton.click()
    await page.getByRole('button', { name: /コピー/i }).click()
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

    await page.goto(clipboardText)
    await page.waitForLoadState('domcontentloaded')

    // すべてのタスクが表示されることを確認
    await expect(page.getByText('共有テストタスク')).toBeVisible()
    for (const task of additionalTasks) {
      await expect(page.getByText(task)).toBeVisible()
    }
  })

  test('10.5 無効なトークンでの共有ボードアクセス', async ({ page }) => {
    // 無効なトークンで共有ボードへアクセス
    await page.goto('/s/invalid-token-xyz')
    await page.waitForLoadState('domcontentloaded')

    // エラーメッセージまたは空のボードが表示されることを確認
    const hasError = await page.getByText(/エラー/i).or(page.getByText(/見つかりません/i)).isVisible().catch(() => false)
    const hasEmptyBoard = await page.getByText('アイゼンハワー・マトリクス').isVisible().catch(() => false)

    expect(hasError || hasEmptyBoard).toBeTruthy()
  })
})
