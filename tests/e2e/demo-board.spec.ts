import { test, expect } from '@playwright/test'

test.describe('デモボード', () => {
  test('11.1 デモボード基本表示', async ({ page }) => {
    // /s/DEMO にアクセス
    await page.goto('/s/DEMO')
    await page.waitForLoadState('domcontentloaded')

    // ページタイトルが「AIsen デモボード - 9件のタスク」
    await expect(page).toHaveTitle(/AIsen デモボード.*9件/)

    // H1が「AIsen デモボード」
    await expect(page.locator('h1').filter({ hasText: 'AIsen デモボード' })).toBeVisible()

    // 説明文が「重要と緊急を自動判定。4象限マトリクスで時間を取り戻す。（9件のタスク）」
    await expect(page.getByText(/重要と緊急を自動判定.*4象限マトリクス.*9件/)).toBeVisible()

    // 4象限に合計9件のタスクが配置されている
    const allTasks = page.locator('[data-testid="task-card"]')
    await expect(allTasks).toHaveCount(9, { timeout: 10000 })
  })

  test('11.2 デモボードのタスク内容確認', async ({ page }) => {
    await page.goto('/s/DEMO')
    await page.waitForLoadState('domcontentloaded')

    // Q1（2件）のタスク
    const q1Section = page.locator('[data-quadrant="Q1"]')
    await expect(q1Section.getByText('クライアント提案書を完成させる')).toBeVisible()
    await expect(q1Section.getByText('サーバー障害の対応')).toBeVisible()

    // Q2（3件）のタスク
    const q2Section = page.locator('[data-quadrant="Q2"]')
    await expect(q2Section.getByText('チーム研修の企画')).toBeVisible()
    await expect(q2Section.getByText('新規プロジェクトの要件定義')).toBeVisible()
    await expect(q2Section.getByText('四半期レポート作成')).toBeVisible()

    // Q3（2件）のタスク
    const q3Section = page.locator('[data-quadrant="Q3"]')
    await expect(q3Section.getByText('出席だけしておけばいい定例会議')).toBeVisible()
    await expect(q3Section.getByText('フォーマットに数字を転記するだけの作業')).toBeVisible()

    // Q4（2件）のタスク
    const q4Section = page.locator('[data-quadrant="Q4"]')
    await expect(q4Section.getByText('デスク周りの整理')).toBeVisible()
    await expect(q4Section.getByText('古いメールの整理')).toBeVisible()
  })

  test('11.3 デモボードのread-only制約', async ({ page }) => {
    await page.goto('/s/DEMO')
    await page.waitForLoadState('domcontentloaded')

    // デモモードメッセージが表示される
    await expect(page.getByText(/デモモード.*読み取り専用/i)).toBeVisible()

    // 「新しいタスクを追加」ボタンが表示されない、または無効化されている
    const addTaskButton = page.getByRole('button', { name: /新しいタスクを追加/i })
    const isVisible = await addTaskButton.isVisible().catch(() => false)

    if (isVisible) {
      // ボタンが表示されている場合は、disabled状態であることを確認
      await expect(addTaskButton).toBeDisabled()
    } else {
      // ボタンが表示されていないことを確認
      await expect(addTaskButton).not.toBeVisible()
    }

    // read-onlyモードでもタスク詳細は閲覧可能（編集はできない）
    const firstTask = page.locator('[data-testid="task-card"]').first()
    await firstTask.click({ force: true })

    // タスク詳細モーダルは開く（read-onlyでも詳細は見られる）
    const modalTitle = page.getByText(/作成日:/)
    await expect(modalTitle).toBeVisible({ timeout: 2000 })

    // モーダルを閉じる
    const closeButton = page.getByRole('button', { name: /閉じる|close/i })
    await closeButton.click()

    // read-onlyモードでは削除ボタンが表示されない
    const deleteButtons = page.locator('button').filter({ hasText: /削除|delete/i })
    await expect(deleteButtons).toHaveCount(0, { timeout: 2000 })
  })
})
