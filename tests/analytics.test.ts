/**
 * PostHog Analytics テスト
 *
 * 注意: PostHogのAPIキーが設定されていない場合、
 * イベントは送信されず警告のみが表示されます。
 */

// PostHogのモック
const mockPostHog = {
  init: jest.fn(),
  capture: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
}

// posthog-jsモジュールをモック
jest.mock('posthog-js', () => mockPostHog)

describe('Analytics - PostHog統合', () => {
  let initAnalytics: any
  let trackTaskAdd: any
  let trackTaskMove: any
  let trackTaskDelete: any
  let trackPageView: any

  beforeEach(() => {
    // モジュールキャッシュをクリア
    jest.resetModules()

    // グローバルのPostHogをモック
    ;(global as any).posthog = mockPostHog
    ;(global as any).window = {}

    // モックをリセット
    jest.clearAllMocks()

    // コンソール警告をモック（警告を表示しない）
    jest.spyOn(console, 'warn').mockImplementation()
    jest.spyOn(console, 'log').mockImplementation()

    // モジュールを再インポート
    const analytics = require('../lib/analytics')
    initAnalytics = analytics.initAnalytics
    trackTaskAdd = analytics.trackTaskAdd
    trackTaskMove = analytics.trackTaskMove
    trackTaskDelete = analytics.trackTaskDelete
    trackPageView = analytics.trackPageView
  })

  afterEach(() => {
    ;(global as any).posthog = undefined
    ;(global as any).window = undefined
    jest.restoreAllMocks()
  })

  describe('initAnalytics', () => {
    it('PostHog APIキーがない場合は警告を表示', () => {
      const originalEnv = process.env.NEXT_PUBLIC_POSTHOG_KEY
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY

      initAnalytics()

      expect(console.warn).toHaveBeenCalledWith(
        '[Analytics] PostHog API key not found. Analytics disabled.'
      )

      process.env.NEXT_PUBLIC_POSTHOG_KEY = originalEnv
    })

    it('PostHog APIキーがある場合は初期化', () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test_key'

      initAnalytics()

      // PostHog.initが呼ばれることを期待
      expect(mockPostHog.init).toHaveBeenCalledWith('phc_test_key', expect.any(Object))
      expect(console.warn).not.toHaveBeenCalled()
    })
  })

  describe('イベント計測', () => {
    beforeEach(() => {
      // PostHogを初期化
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test_key'
      initAnalytics()
    })

    it('trackTaskAdd: タスク追加イベントを送信', () => {
      trackTaskAdd({
        source: 'quick_add',
        quadrant: 'q1',
        has_due: true,
      })

      expect(mockPostHog.capture).toHaveBeenCalledWith('task_add', {
        source: 'quick_add',
        quadrant: 'q1',
        has_due: true,
      })
    })

    it('trackTaskMove: タスク移動イベントを送信', () => {
      trackTaskMove({
        from: 'q1',
        to: 'q2',
      })

      expect(mockPostHog.capture).toHaveBeenCalledWith('task_move', {
        from: 'q1',
        to: 'q2',
      })
    })

    it('trackTaskDelete: タスク削除イベントを送信', () => {
      trackTaskDelete({
        quadrant: 'q3',
      })

      expect(mockPostHog.capture).toHaveBeenCalledWith('task_delete', {
        quadrant: 'q3',
      })
    })

    it('trackPageView: ページビューイベントを送信', () => {
      trackPageView('/b/new')

      expect(mockPostHog.capture).toHaveBeenCalledWith('$pageview', {
        $current_url: '/b/new',
      })
    })
  })

  describe('イベント計測（PostHog未初期化）', () => {
    it('PostHog未初期化の場合はイベントを送信しない', () => {
      // PostHogが存在しない状態
      ;(global as any).posthog = undefined

      // エラーが発生しないことを確認
      expect(() => {
        trackTaskAdd({
          source: 'manual',
          quadrant: 'q2',
          has_due: false,
        })
      }).not.toThrow()
    })
  })

  describe('実際のイベント送信シナリオ', () => {
    beforeEach(() => {
      // PostHogを初期化
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test_key'
      initAnalytics()
    })

    it('Quick Addからタスク追加 → 移動 → 削除のフロー', () => {
      // 1. Quick Addでタスク追加
      trackTaskAdd({
        source: 'quick_add',
        quadrant: 'q3',
        has_due: true,
      })

      // 2. Q3 → Q1に移動
      trackTaskMove({
        from: 'q3',
        to: 'q1',
      })

      // 3. タスク削除
      trackTaskDelete({
        quadrant: 'q1',
      })

      // 3つのイベントが送信されたことを確認
      expect(mockPostHog.capture).toHaveBeenCalledTimes(3)
      expect(mockPostHog.capture).toHaveBeenNthCalledWith(1, 'task_add', {
        source: 'quick_add',
        quadrant: 'q3',
        has_due: true,
      })
      expect(mockPostHog.capture).toHaveBeenNthCalledWith(2, 'task_move', {
        from: 'q3',
        to: 'q1',
      })
      expect(mockPostHog.capture).toHaveBeenNthCalledWith(3, 'task_delete', {
        quadrant: 'q1',
      })
    })

    it('異なるソースからのタスク追加を区別', () => {
      // Quick Addから
      trackTaskAdd({
        source: 'quick_add',
        quadrant: 'q1',
        has_due: true,
      })

      // 手動入力から
      trackTaskAdd({
        source: 'manual',
        quadrant: 'q2',
        has_due: false,
      })

      // Brainstormから
      trackTaskAdd({
        source: 'brainstorm',
        quadrant: 'q2',
        has_due: true,
      })

      expect(mockPostHog.capture).toHaveBeenCalledTimes(3)

      // sourceが正しく記録されていることを確認
      const calls = mockPostHog.capture.mock.calls
      expect(calls[0][1].source).toBe('quick_add')
      expect(calls[1][1].source).toBe('manual')
      expect(calls[2][1].source).toBe('brainstorm')
    })
  })
})

describe('Analytics - データ構造の検証', () => {
  it('task_addイベントは正しい構造を持つ', () => {
    const event = {
      source: 'quick_add',
      quadrant: 'q1',
      has_due: true,
    }

    // 必須フィールドの存在確認
    expect(event).toHaveProperty('source')
    expect(event).toHaveProperty('quadrant')
    expect(event).toHaveProperty('has_due')

    // 型の確認
    expect(typeof event.source).toBe('string')
    expect(typeof event.quadrant).toBe('string')
    expect(typeof event.has_due).toBe('boolean')

    // 値の妥当性確認
    expect(['quick_add', 'manual', 'brainstorm']).toContain(event.source)
    expect(['q1', 'q2', 'q3', 'q4']).toContain(event.quadrant)
  })

  it('task_moveイベントは正しい構造を持つ', () => {
    const event = {
      from: 'q1',
      to: 'q2',
    }

    expect(event).toHaveProperty('from')
    expect(event).toHaveProperty('to')
    expect(['q1', 'q2', 'q3', 'q4']).toContain(event.from)
    expect(['q1', 'q2', 'q3', 'q4']).toContain(event.to)
  })

  it('task_deleteイベントは正しい構造を持つ', () => {
    const event = {
      quadrant: 'q3',
    }

    expect(event).toHaveProperty('quadrant')
    expect(['q1', 'q2', 'q3', 'q4']).toContain(event.quadrant)
  })
})
