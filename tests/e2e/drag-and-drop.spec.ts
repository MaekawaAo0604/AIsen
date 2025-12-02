import { test, expect } from '@playwright/test'

test.describe('ドラッグ&ドロップ', () => {
  test.beforeEach(async ({ page }) => {
    // LocalStorageをクリアして新しいボードを作成
    await page.goto('/b/new')
    await page.waitForLoadState('domcontentloaded')
    // ページの主要コンテンツが表示されるまで待つ
    await page.waitForSelector('text=アイゼンハワー・マトリクス', { timeout: 15000 })
  })

  test('8.1 象限間でタスクを移動', async ({ page }) => {
    // Q1にテストタスクを作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()

    // TaskPlacementModalが表示されることを確認
    await expect(page.getByText('新しいタスクを追加')).toBeVisible({ timeout: 10000 })

    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('移動テストタスク')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()

    // 「配置する」ボタンをクリック
    await page.getByRole('button', { name: '配置する' }).click()

    // モーダルが自動的に閉じる
    await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).not.toBeVisible()

    // タスクがQ1に表示されることを確認
    const q1Section = page.locator('[data-quadrant="Q1"]')
    const q2Section = page.locator('[data-quadrant="Q2"]')
    await expect(q1Section.getByText('移動テストタスク')).toBeVisible()

    // Q1象限内のタスクカウントを記録（サンプルタスク含む）
    const q1TasksBefore = await q1Section.locator('.group.relative.bg-white').count()
    const q2TasksBefore = await q2Section.locator('.group.relative.bg-white').count()

    // タスクをドラッグ&ドロップでQ1からQ2へ移動
    const taskCard = q1Section.locator('text=移動テストタスク').locator('..').locator('..')

    // Playwrightのdragクリックで実行
    try {
      await taskCard.dragTo(q2Section)
    } catch (error) {
      // dragToが失敗した場合は、手動でマウス操作
      const sourceBox = await taskCard.boundingBox()
      const targetBox = await q2Section.boundingBox()

      if (!sourceBox || !targetBox) {
        throw new Error('要素のバウンディングボックスを取得できませんでした')
      }

      await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(200)
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 })
      await page.waitForTimeout(200)
      await page.mouse.up()
    }

    // DOM更新を待機
    await page.waitForTimeout(500)

    // タスクがQ2に移動したことを確認
    await expect(q2Section.getByText('移動テストタスク')).toBeVisible()

    // タスクがQ1から削除されたことを確認（Q1の「移動テストタスク」は存在しない）
    await expect(q1Section.getByText('移動テストタスク')).not.toBeVisible()

    // Q1のタスク数が1減る
    const q1TasksAfter = await q1Section.locator('.group.relative.bg-white').count()
    expect(q1TasksAfter).toBe(q1TasksBefore - 1)

    // Q2のタスク数が1増える
    const q2TasksAfter = await q2Section.locator('.group.relative.bg-white').count()
    expect(q2TasksAfter).toBe(q2TasksBefore + 1)

    // LocalStorageに保存されることを確認
    const localStorage = await page.evaluate(() => {
      const keys = Object.keys(window.localStorage)
      const boardKey = keys.find(key => key.startsWith('board_'))
      if (!boardKey) return null
      return JSON.parse(window.localStorage.getItem(boardKey) || '{}')
    })

    expect(localStorage).toBeTruthy()
    const q2Tasks = localStorage?.quadrants?.q2 || []
    const movedTask = q2Tasks.find((task: any) => task.title === '移動テストタスク')
    expect(movedTask).toBeTruthy()
  })

  test('8.2 同一象限内でタスクを並び替え', async ({ page }) => {
    const q1Section = page.locator('[data-quadrant="Q1"]')

    // タスクAを作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await expect(page.getByText('新しいタスクを追加')).toBeVisible({ timeout: 10000 })
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('タスクA')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()
    await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).not.toBeVisible()

    // タスクAが表示されるまで待つ
    await expect(q1Section.getByText('タスクA')).toBeVisible()

    // タスクBを作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await expect(page.getByText('新しいタスクを追加')).toBeVisible({ timeout: 10000 })
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('タスクB')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()
    await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).not.toBeVisible()

    // タスクBが表示されるまで待つ
    await expect(q1Section.getByText('タスクB')).toBeVisible()

    // 全タスクを取得
    const taskCards = q1Section.locator('.group.relative.bg-white')
    const allTasksText = await taskCards.allTextContents()

    // タスクAとタスクBのインデックスを取得
    const indexABefore = allTasksText.findIndex(text => text.includes('タスクA'))
    const indexBBefore = allTasksText.findIndex(text => text.includes('タスクB'))

    // タスクAがタスクBより前にあることを確認
    expect(indexABefore).toBeLessThan(indexBBefore)

    // タスク数を記録
    const taskCountBefore = await taskCards.count()

    // タスクAをドラッグしてタスクBの下に移動
    const taskACard = q1Section.locator('text=タスクA').locator('..').locator('..')
    const taskBCard = q1Section.locator('text=タスクB').locator('..').locator('..')

    const sourceBox = await taskACard.boundingBox()
    const targetBox = await taskBCard.boundingBox()

    if (!sourceBox || !targetBox) {
      throw new Error('要素のバウンディングボックスを取得できませんでした')
    }

    // ドラッグ&ドロップを実行（タスクBの下側にドロップ）
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(100)
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height + 5, { steps: 10 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(300)

    // タスクの順序が入れ替わったことを確認（タスクBが先、タスクAが後）
    const taskCardsAfter = q1Section.locator('.group.relative.bg-white')
    const allTasksTextAfter = await taskCardsAfter.allTextContents()

    // タスクAとタスクBの位置を確認
    const indexAAfter = allTasksTextAfter.findIndex(text => text.includes('タスクA'))
    const indexBAfter = allTasksTextAfter.findIndex(text => text.includes('タスクB'))

    expect(indexAAfter).toBeGreaterThan(indexBAfter) // タスクAがタスクBより後にある

    // 象限のタスク数は変わらない
    const taskCountAfter = await taskCardsAfter.count()
    expect(taskCountAfter).toBe(taskCountBefore)
  })

  test('8.3 ドラッグキャンセル', async ({ page }) => {
    // Q1にテストタスクを作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await expect(page.getByText('新しいタスクを追加')).toBeVisible({ timeout: 10000 })
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('キャンセルテストタスク')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()
    await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).not.toBeVisible()

    const q1Section = page.locator('[data-quadrant="Q1"]')
    await expect(q1Section.getByText('キャンセルテストタスク')).toBeVisible()

    // 初期状態のタスク数を記録
    const q1TasksBefore = await q1Section.locator('.group.relative.bg-white').count()

    // タスクをドラッグ開始
    const taskCard = q1Section.locator('text=キャンセルテストタスク').locator('..').locator('..')
    const sourceBox = await taskCard.boundingBox()

    if (!sourceBox) {
      throw new Error('要素のバウンディングボックスを取得できませんでした')
    }

    // ドラッグ開始して元の位置に戻す（キャンセル）
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(100)
    // 少しだけ動かして、また元の位置に戻す
    await page.mouse.move(sourceBox.x + sourceBox.width / 2 + 20, sourceBox.y + sourceBox.height / 2 + 20, { steps: 5 })
    await page.waitForTimeout(100)
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2, { steps: 5 })
    await page.waitForTimeout(100)
    await page.mouse.up()
    await page.waitForTimeout(300)

    // タスクの位置が変わらないことを確認
    await expect(q1Section.getByText('キャンセルテストタスク')).toBeVisible()

    // ボードの状態は変更されない（タスク数が同じ）
    const q1TasksAfter = await q1Section.locator('.group.relative.bg-white').count()
    expect(q1TasksAfter).toBe(q1TasksBefore)

    // LocalStorageの状態も変わっていないことを確認
    const localStorage = await page.evaluate(() => {
      const keys = Object.keys(window.localStorage)
      const boardKey = keys.find(key => key.startsWith('board_'))
      if (!boardKey) return null
      return JSON.parse(window.localStorage.getItem(boardKey) || '{}')
    })

    expect(localStorage).toBeTruthy()
    const q1Tasks = localStorage?.quadrants?.q1 || []
    const testTask = q1Tasks.find((task: any) => task.title === 'キャンセルテストタスク')
    expect(testTask).toBeTruthy() // Q1に存在する
  })

  test('8.1 追加: ドラッグ中の視覚的フィードバック', async ({ page }) => {
    // Q1にテストタスクを作成
    await page.getByRole('button', { name: /新しいタスクを追加/i }).click()
    await expect(page.getByText('新しいタスクを追加')).toBeVisible({ timeout: 10000 })
    await page.getByPlaceholder(/例: プロジェクトの提案書を作成/i).fill('視覚フィードバックテスト')
    await page.getByRole('button', { name: /Q1.*今すぐやる/i }).click()
    await page.getByRole('button', { name: '配置する' }).click()
    await expect(page.getByPlaceholder(/例: プロジェクトの提案書を作成/i)).not.toBeVisible()

    const q1Section = page.locator('[data-quadrant="Q1"]')
    const q2Section = page.locator('[data-quadrant="Q2"]')
    await expect(q1Section.getByText('視覚フィードバックテスト')).toBeVisible()

    const taskCard = q1Section.locator('text=視覚フィードバックテスト').locator('..').locator('..')

    // ドラッグ開始
    const sourceBox = await taskCard.boundingBox()
    const targetBox = await q2Section.boundingBox()

    if (!sourceBox || !targetBox) {
      throw new Error('要素のバウンディングボックスを取得できませんでした')
    }

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(100)

    // ドラッグ中のタスクカードのスタイルを確認（opacity-50とscale-105がついているはず）
    const isDragging = await taskCard.evaluate((el) => {
      const classes = el.className
      return classes.includes('opacity-50')
    })
    expect(isDragging).toBe(true)

    // Q2象限上にマウスを移動
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 })
    await page.waitForTimeout(100)

    // Q2象限にドロップ領域のハイライト（ring-2 ring-blue-400）が表示されるか確認
    const isOverHighlight = await q2Section.evaluate((el) => {
      const classes = el.className
      return classes.includes('ring-2') && classes.includes('ring-blue-400')
    })
    expect(isOverHighlight).toBe(true)

    // ドロップして完了
    await page.mouse.up()
    await page.waitForTimeout(300)

    // 移動完了後は視覚的フィードバックが解除される
    const taskInQ2 = q2Section.locator('text=視覚フィードバックテスト').locator('..').locator('..')
    await expect(taskInQ2).toBeVisible()

    const isDraggingAfter = await taskInQ2.evaluate((el) => {
      const classes = el.className
      return classes.includes('opacity-50')
    })
    expect(isDraggingAfter).toBe(false)
  })
})
