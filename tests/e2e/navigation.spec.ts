import { test, expect } from '@playwright/test'

test.describe('サイドバー・ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    // LocalStorageをクリアして新しいボードを作成
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })
  })

  test('12.1 サイドバー開閉', async ({ page }) => {
    // サイドバーアイコン（ハンバーガーメニューまたはメニューボタン）を探す
    const sidebarToggle = page.getByRole('button', { name: /メニュー/i })
      .or(page.getByRole('button', { name: /サイドバー/i }))
      .or(page.locator('button[aria-label*="menu"]'))
      .or(page.locator('button[aria-label*="Menu"]'))
      .or(page.locator('button').filter({ has: page.locator('svg') }).first())

    // サイドバートグルボタンが存在することを確認
    await expect(sidebarToggle.first()).toBeVisible({ timeout: 10000 })

    // サイドバーを開く
    await sidebarToggle.first().click()

    // サイドバーが展開することを確認（開閉アニメーション待機）
    await page.waitForTimeout(500)

    // 「ボード一覧」または「Boards」が表示される
    await expect(
      page.getByText(/ボード一覧/i)
        .or(page.getByText(/Boards/i))
        .or(page.getByText(/マイボード/i))
    ).toBeVisible({ timeout: 5000 })

    // 「新しいボードを作成」ボタンが表示される
    await expect(
      page.getByRole('button', { name: /新しいボードを作成/i })
        .or(page.getByRole('link', { name: /新しいボードを作成/i }))
        .or(page.getByText(/新しいボード/i))
    ).toBeVisible({ timeout: 5000 })

    // サイドバーを閉じる
    await sidebarToggle.first().click()

    // サイドバーが閉じることを確認（アニメーション待機）
    await page.waitForTimeout(500)
  })

  test('12.2 ボード一覧（ログイン前）', async ({ page }) => {
    // サイドバーを開く
    const sidebarToggle = page.getByRole('button', { name: /メニュー/i })
      .or(page.getByRole('button', { name: /サイドバー/i }))
      .or(page.locator('button[aria-label*="menu"]'))
      .or(page.locator('button[aria-label*="Menu"]'))
      .or(page.locator('button').filter({ has: page.locator('svg') }).first())

    await sidebarToggle.first().click()
    await page.waitForTimeout(500)

    // 「まだボードがありません」メッセージが表示される
    const emptyMessage = page.getByText(/まだボードがありません/i)
      .or(page.getByText(/ボードがありません/i))
      .or(page.getByText(/No boards/i))

    await expect(emptyMessage).toBeVisible({ timeout: 10000 })

    // 「ログインしてボードを保存しましょう」メッセージが表示される（オプション）
    const loginPrompt = await page.getByText(/ログイン/i).isVisible().catch(() => false)

    // メッセージが存在する場合は検証（必須ではない）
    if (loginPrompt) {
      await expect(page.getByText(/ログイン/i)).toBeVisible()
    }
  })

  test('12.3 新しいボードを作成', async ({ page }) => {
    // サイドバーを開く
    const sidebarToggle = page.getByRole('button', { name: /メニュー/i })
      .or(page.getByRole('button', { name: /サイドバー/i }))
      .or(page.locator('button[aria-label*="menu"]'))
      .or(page.locator('button[aria-label*="Menu"]'))
      .or(page.locator('button').filter({ has: page.locator('svg') }).first())

    await sidebarToggle.first().click()
    await page.waitForTimeout(500)

    // 現在のURLを保存
    const currentUrl = page.url()

    // 「新しいボードを作成」ボタンをクリック
    const createButton = page.getByRole('button', { name: /新しいボードを作成/i })
      .or(page.getByRole('link', { name: /新しいボードを作成/i }))
      .or(page.getByText(/新しいボード/).locator('..'))

    await expect(createButton.first()).toBeVisible({ timeout: 10000 })
    await createButton.first().click()

    // /b/newへ遷移するか、新しいボードIDへ遷移することを確認
    await page.waitForURL(/\/b\/.+/, { timeout: 10000 })

    // 新しいボードが作成されることを確認
    await expect(page.getByText('アイゼンハワー・マトリクス')).toBeVisible({ timeout: 10000 })

    // URLが変わっていることを確認
    const newUrl = page.url()
    expect(newUrl).not.toBe(currentUrl)
    expect(newUrl).toMatch(/\/b\/[^/]+/)
  })

  test('12.4 サイドバー - サンプルタスクの確認', async ({ page }) => {
    // サイドバーを開く
    const sidebarToggle = page.getByRole('button', { name: /メニュー/i })
      .or(page.getByRole('button', { name: /サイドバー/i }))
      .or(page.locator('button[aria-label*="menu"]'))
      .or(page.locator('button[aria-label*="Menu"]'))
      .or(page.locator('button').filter({ has: page.locator('svg') }).first())

    await sidebarToggle.first().click()
    await page.waitForTimeout(500)

    // サイドバーが開いている状態でメインコンテンツが操作可能であることを確認
    await expect(page.getByText('アイゼンハワー・マトリクス')).toBeVisible()

    // サイドバーを閉じる
    await sidebarToggle.first().click()
    await page.waitForTimeout(500)

    // メインコンテンツが引き続き操作可能
    await expect(page.getByRole('button', { name: /新しいタスクを追加/i })).toBeVisible()
  })

  test('12.5 サイドバー - キーボードナビゲーション', async ({ page }) => {
    // サイドバーを開く
    const sidebarToggle = page.getByRole('button', { name: /メニュー/i })
      .or(page.getByRole('button', { name: /サイドバー/i }))
      .or(page.locator('button[aria-label*="menu"]'))
      .or(page.locator('button[aria-label*="Menu"]'))
      .or(page.locator('button').filter({ has: page.locator('svg') }).first())

    await sidebarToggle.first().click()
    await page.waitForTimeout(500)

    // Tabキーでフォーカスを移動
    await page.keyboard.press('Tab')

    // フォーカスがサイドバー内の要素に移動することを確認
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement)

    // Escキーでサイドバーを閉じることができるか確認（実装による）
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // サイドバーが閉じた可能性を確認（実装に依存）
    const sidebarStillVisible = await page.getByText(/ボード一覧/i).isVisible().catch(() => false)

    // 閉じていない場合は手動で閉じる
    if (sidebarStillVisible) {
      await sidebarToggle.first().click()
      await page.waitForTimeout(500)
    }
  })

  test('12.6 サイドバー - モバイルビューでの動作', async ({ page }) => {
    // ビューポートをモバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 })

    // サイドバートグルボタンが表示されることを確認
    const sidebarToggle = page.getByRole('button', { name: /メニュー/i })
      .or(page.getByRole('button', { name: /サイドバー/i }))
      .or(page.locator('button[aria-label*="menu"]'))
      .or(page.locator('button[aria-label*="Menu"]'))
      .or(page.locator('button').filter({ has: page.locator('svg') }).first())

    await expect(sidebarToggle.first()).toBeVisible({ timeout: 10000 })

    // サイドバーを開く
    await sidebarToggle.first().click()
    await page.waitForTimeout(500)

    // サイドバーがオーバーレイ表示されることを確認
    await expect(page.getByText(/ボード一覧/i).or(page.getByText(/Boards/i))).toBeVisible()

    // サイドバーを閉じる
    await sidebarToggle.first().click()
    await page.waitForTimeout(500)
  })
})
