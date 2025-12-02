import { test, expect } from '@playwright/test';

/**
 * ランディングページ (LP) テストスイート
 *
 * テスト対象:
 * - 1.1 LP基本表示
 * - 1.2 ナビゲーションリンク
 * - 1.3 デモボタン
 */

test.describe('ランディングページ (LP)', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にランディングページへアクセス
    await page.goto('http://localhost:3000');
    // DOM読み込み完了まで待機
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('1.1 LP基本表示', () => {
    test('ページタイトルが正しく表示される', async ({ page }) => {
      // ページタイトルの確認
      await expect(page).toHaveTitle(/AIsen - 自動仕分けタスク管理/);
    });

    test('ヘッダー要素が正しく表示される', async ({ page }) => {
      // ヘッダーに「AIsen」ロゴが表示される
      const header = page.locator('header');
      await expect(header.getByText('AIsen')).toBeVisible();

      // 「Gmail × AI で自動整理」が表示される
      await expect(header.getByText(/Gmail.*AI.*自動整理/i)).toBeVisible();
    });

    test('ナビゲーションリンクが正しく表示される', async ({ page }) => {
      // ナビゲーションに「機能」「料金」「無料で始める」リンクが表示される
      const nav = page.locator('nav');
      await expect(nav.getByRole('link', { name: /機能/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /料金/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /無料で始める/i })).toBeVisible();
    });

    test('ヒーローセクションのH1が正しく表示される', async ({ page }) => {
      // H1テキストの確認
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toContainText(/朝イチの「今日なにからやるか」を、AI に丸投げできるタスクボード/i);
    });

    test('CTAボタンが正しく表示される', async ({ page }) => {
      // 「無料で始める」ボタンが表示される
      await expect(page.getByRole('button', { name: /無料で始める/i }).or(page.getByRole('link', { name: /無料で始める/i })).first()).toBeVisible();

      // 「デモを見る」ボタンが表示される
      await expect(page.getByRole('button', { name: /デモを見る/i }).or(page.getByRole('link', { name: /デモを見る/i })).first()).toBeVisible();
    });

    test('4象限ボードのモックアップが表示される', async ({ page }) => {
      // 4象限ボードの視覚的要素が存在することを確認
      // Q1, Q2, Q3, Q4の象限を探す
      const quadrants = [
        /Q1|今すぐやる|緊急.*重要/i,
        /Q2|計画してやる|重要/i,
        /Q3|誰かに任せる|緊急/i,
        /Q4|やらない|その他/i
      ];

      for (const quadrantPattern of quadrants) {
        const quadrant = page.getByText(quadrantPattern).first();
        await expect(quadrant).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('1.2 ナビゲーションリンク', () => {
    test('「機能」リンクをクリックすると#featuresセクションへスクロールする', async ({ page }) => {
      // 「機能」リンクをクリック
      const featuresLink = page.getByRole('link', { name: /機能/i });
      await featuresLink.click();

      // #featuresセクションへスクロールすることを確認
      // URLハッシュの確認
      await expect(page).toHaveURL(/#features/);

      // featuresセクションが表示領域内にあることを確認
      const featuresSection = page.locator('#features');
      await expect(featuresSection).toBeInViewport({ timeout: 3000 });
    });

    test('「料金」リンクをクリックすると/pricingページへ遷移する', async ({ page }) => {
      // 「料金」リンクをクリック
      const pricingLink = page.getByRole('link', { name: /料金/i }).first();
      await pricingLink.click();

      // /pricingページへ遷移することを確認
      await expect(page).toHaveURL(/\/pricing/);
    });

    test('「無料で始める」ボタンをクリックすると/b/newページへ遷移する', async ({ page }) => {
      // 「無料で始める」ボタン/リンクをクリック（ヒーローセクション内）
      const startButton = page.getByRole('button', { name: /無料で始める/i }).or(page.getByRole('link', { name: /無料で始める/i })).first();
      await startButton.click();

      // /b/newページへ遷移することを確認
      await expect(page).toHaveURL(/\/b\/new/);
    });
  });

  test.describe('1.3 デモボタン', () => {
    test('「デモを見る」ボタンをクリックすると/s/DEMOページへ遷移する', async ({ page }) => {
      // 「デモを見る」ボタンをクリック
      const demoButton = page.getByRole('button', { name: /デモを見る/i }).or(page.getByRole('link', { name: /デモを見る/i })).first();
      await demoButton.click();

      // /s/DEMOページへ遷移することを確認
      await expect(page).toHaveURL(/\/s\/DEMO/);
    });

    test('デモボードが表示され、9件のサンプルタスクが配置されている', async ({ page }) => {
      // デモボタンをクリック
      const demoButton = page.getByRole('button', { name: /デモを見る/i }).or(page.getByRole('link', { name: /デモを見る/i })).first();
      await demoButton.click();

      // デモボードのタイトル確認
      await expect(page).toHaveTitle(/AIsen デモボード/);

      // 9件のタスクが存在することを確認
      const taskCards = page.locator('[data-testid="task-card"]');

      // タスク数の確認（少なくとも9件）
      await expect(taskCards).toHaveCount(9, { timeout: 10000 });
    });

    test('デモボードのすべてのタスクがread-only状態である', async ({ page }) => {
      // デモボタンをクリック
      const demoButton = page.getByRole('button', { name: /デモを見る/i }).or(page.getByRole('link', { name: /デモを見る/i })).first();
      await demoButton.click();

      // read-onlyメッセージの確認
      await expect(page.getByText(/デモモード|読み取り専用/i)).toBeVisible();

      // 削除ボタンが表示されないことを確認（read-onlyの証明）
      const taskCards = page.locator('[data-testid="task-card"]').first();
      await expect(taskCards).toBeVisible();

      // read-onlyモードでは削除ボタンやチェックボックスが操作できない
      const deleteButtons = page.locator('button:has-text("×")');
      await expect(deleteButtons).toHaveCount(0, { timeout: 5000 });
    });
  });
});
