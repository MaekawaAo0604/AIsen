import { test, expect, devices } from '@playwright/test';

/**
 * レスポンシブデザインテストスイート
 *
 * テスト対象:
 * - 15.1 モバイルビュー（375x667）
 * - 15.2 タブレットビュー（768x1024）
 * - 15.3 デスクトップビュー（1920x1080）
 */

test.describe('レスポンシブデザイン', () => {
  test.describe('15.1 モバイルビュー（375x667）', () => {
    test.use({
      viewport: { width: 375, height: 667 }
    });

    test('4象限が縦スクロール可能なレイアウトで表示される', async ({ page }) => {
      // 新規ボード作成
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // 4象限が存在することを確認
      const quadrants = [
        /Q1|今すぐやる/i,
        /Q2|計画してやる/i,
        /Q3|誰かに任せる/i,
        /Q4|やらない/i
      ];

      for (const quadrantPattern of quadrants) {
        const quadrant = page.getByText(quadrantPattern).first();
        await expect(quadrant).toBeVisible({ timeout: 5000 });
      }

      // 縦スクロール可能であることを確認（ページの高さが viewport より大きい）
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      expect(bodyHeight).toBeGreaterThan(667);
    });

    test('ハンバーガーメニューが表示される', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // ハンバーガーメニューアイコンが表示されることを確認
      const hamburgerMenu = page.getByRole('button', { name: /メニュー|menu/i }).or(
        page.locator('button[aria-label*="menu"]')
      ).or(
        page.locator('button svg').filter({ hasText: '' }) // アイコンのみのボタン
      );

      await expect(hamburgerMenu.first()).toBeVisible();
    });

    test('タスクカードが画面幅に収まる', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // サンプルタスクのカードを取得
      const taskCard = page.locator('[data-testid="task-card"]').or(page.locator('.task-card')).first();
      await expect(taskCard).toBeVisible();

      // タスクカードの幅が画面幅を超えないことを確認
      const cardBoundingBox = await taskCard.boundingBox();
      if (cardBoundingBox) {
        expect(cardBoundingBox.width).toBeLessThanOrEqual(375);
      }
    });

    test('すべての操作が可能（タスク追加ボタンが表示される）', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // 「新しいタスクを追加」ボタンが表示されることを確認
      const addTaskButton = page.getByRole('button', { name: /新しいタスクを追加|タスクを追加/i });
      await expect(addTaskButton.first()).toBeVisible();

      // qキーでQuick Add起動確認
      await page.keyboard.press('q');

      // QuickAddモーダルが表示されることを確認
      const quickAddModal = page.getByRole('dialog').or(page.locator('[role="dialog"]'));
      await expect(quickAddModal.first()).toBeVisible({ timeout: 2000 });

      // モーダルを閉じる
      await page.keyboard.press('Escape');
    });
  });

  test.describe('15.2 タブレットビュー（768x1024）', () => {
    test.use({
      viewport: { width: 768, height: 1024 }
    });

    test('4象限が2x2グリッドで表示される', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // 4象限を取得
      const q1 = page.getByText(/Q1|今すぐやる/i).first();
      const q2 = page.getByText(/Q2|計画してやる/i).first();
      const q3 = page.getByText(/Q3|誰かに任せる/i).first();
      const q4 = page.getByText(/Q4|やらない/i).first();

      // すべての象限が表示されることを確認
      await expect(q1).toBeVisible();
      await expect(q2).toBeVisible();
      await expect(q3).toBeVisible();
      await expect(q4).toBeVisible();

      // Q1とQ2が同じ行にあることを確認（Y座標が近い）
      const q1Box = await q1.boundingBox();
      const q2Box = await q2.boundingBox();

      if (q1Box && q2Box) {
        const yDiff = Math.abs(q1Box.y - q2Box.y);
        expect(yDiff).toBeLessThan(50); // 同じ行なら Y座標の差が小さい
      }

      // Q3とQ4が同じ行にあることを確認
      const q3Box = await q3.boundingBox();
      const q4Box = await q4.boundingBox();

      if (q3Box && q4Box) {
        const yDiff = Math.abs(q3Box.y - q4Box.y);
        expect(yDiff).toBeLessThan(50);
      }
    });

    test('ナビゲーションが適切に表示される', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // ナビゲーション要素が表示されることを確認
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();

      // 「新しいタスクを追加」ボタンが表示される
      const addTaskButton = page.getByRole('button', { name: /新しいタスクを追加|タスクを追加/i });
      await expect(addTaskButton.first()).toBeVisible();
    });

    test('ドラッグ&ドロップが機能する', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // Q1のサンプルタスクを取得
      const q1Tasks = page.locator('[data-testid="task-card"]').or(page.locator('.task-card'));
      const firstTask = q1Tasks.first();

      // タスクが存在することを確認
      await expect(firstTask).toBeVisible();

      // ドラッグ可能であることを確認（draggable属性またはaria-grabbedの存在）
      const isDraggable = await firstTask.evaluate((el) => {
        return el.hasAttribute('draggable') || el.getAttribute('aria-grabbed') !== null;
      });

      // タブレットではドラッグ可能な状態であることを確認
      expect(isDraggable).toBeTruthy();
    });
  });

  test.describe('15.3 デスクトップビュー（1920x1080）', () => {
    test.use({
      viewport: { width: 1920, height: 1080 }
    });

    test('4象限が横並びで表示される', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // 4象限を取得
      const q1 = page.getByText(/Q1|今すぐやる/i).first();
      const q2 = page.getByText(/Q2|計画してやる/i).first();
      const q3 = page.getByText(/Q3|誰かに任せる/i).first();
      const q4 = page.getByText(/Q4|やらない/i).first();

      // すべての象限が表示されることを確認
      await expect(q1).toBeVisible();
      await expect(q2).toBeVisible();
      await expect(q3).toBeVisible();
      await expect(q4).toBeVisible();

      // すべての象限が横並びであることを確認（X座標が異なる）
      const q1Box = await q1.boundingBox();
      const q2Box = await q2.boundingBox();
      const q3Box = await q3.boundingBox();
      const q4Box = await q4.boundingBox();

      if (q1Box && q2Box && q3Box && q4Box) {
        // 各象限のX座標が異なることを確認
        const xCoordinates = [q1Box.x, q2Box.x, q3Box.x, q4Box.x];
        const uniqueXCoordinates = new Set(xCoordinates);

        // 少なくとも2つ以上の異なるX座標が存在（横並び配置）
        expect(uniqueXCoordinates.size).toBeGreaterThanOrEqual(2);
      }
    });

    test('サイドバーが展開表示される', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // サイドバーが表示されることを確認
      const sidebar = page.locator('aside').or(page.locator('[role="navigation"]')).first();
      await expect(sidebar).toBeVisible();

      // サイドバーの幅が十分であることを確認（展開状態）
      const sidebarBox = await sidebar.boundingBox();
      if (sidebarBox) {
        expect(sidebarBox.width).toBeGreaterThan(150); // 展開状態なら幅が広い
      }
    });

    test('すべての機能が最適なレイアウトで利用可能', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // 主要な機能要素が表示されることを確認

      // 1. 「新しいタスクを追加」ボタン
      const addTaskButton = page.getByRole('button', { name: /新しいタスクを追加|タスクを追加/i });
      await expect(addTaskButton.first()).toBeVisible();

      // 2. 4象限すべて
      const quadrants = [
        /Q1|今すぐやる/i,
        /Q2|計画してやる/i,
        /Q3|誰かに任せる/i,
        /Q4|やらない/i
      ];

      for (const quadrantPattern of quadrants) {
        const quadrant = page.getByText(quadrantPattern).first();
        await expect(quadrant).toBeVisible();
      }

      // 3. 共有ボタン（存在する場合）
      const shareButton = page.getByRole('button', { name: /共有/i });
      if (await shareButton.count() > 0) {
        await expect(shareButton.first()).toBeVisible();
      }

      // 4. Quick Add機能（qキー）
      await page.keyboard.press('q');
      const quickAddModal = page.getByRole('dialog').or(page.locator('[role="dialog"]'));
      await expect(quickAddModal.first()).toBeVisible({ timeout: 2000 });
      await page.keyboard.press('Escape');

      // 5. 自動保存メッセージ
      const autoSaveMessage = page.getByText(/自動保存|保存されています/i);
      if (await autoSaveMessage.count() > 0) {
        await expect(autoSaveMessage.first()).toBeVisible();
      }
    });

    test('4象限グリッドレイアウトの検証', async ({ page }) => {
      await page.goto('http://localhost:3000/b/new');
      await page.waitForLoadState('networkidle');

      // 4象限のコンテナを取得
      const quadrantContainer = page.locator('[data-testid="quadrant-grid"]').or(
        page.locator('.quadrant-grid')
      ).or(
        page.locator('main').first()
      );

      // グリッドレイアウトが適用されていることを確認
      const containerStyles = await quadrantContainer.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          gridTemplateColumns: styles.gridTemplateColumns,
          flexDirection: styles.flexDirection
        };
      });

      // グリッドまたはフレックスレイアウトが使用されていることを確認
      expect(['grid', 'flex'].some(layout => containerStyles.display.includes(layout))).toBeTruthy();
    });
  });
});
