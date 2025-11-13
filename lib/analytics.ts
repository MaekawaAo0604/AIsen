import posthog from 'posthog-js'
import type { Quadrant } from './types'

// PostHog初期化フラグ
let isInitialized = false

/**
 * PostHogを初期化（クライアントサイドのみ）
 */
export function initAnalytics() {
  if (typeof window === 'undefined' || isInitialized) return

  // 環境変数からAPIキーを取得
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

  if (!apiKey) {
    console.warn('[Analytics] PostHog API key not found. Analytics disabled.')
    return
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] PostHog initialized')
      }
    },
    capture_pageview: false, // Next.jsのルーティングで手動管理
    autocapture: false, // 明示的なイベントのみ計測
  })

  isInitialized = true
}

/**
 * ページビューを記録
 */
export function trackPageView(path: string) {
  if (!isInitialized) return
  posthog.capture('$pageview', { $current_url: path })
}

/**
 * タスク追加イベント
 */
export function trackTaskAdd(data: {
  source: 'quick_add' | 'manual' | 'brainstorm'
  quadrant: Quadrant
  has_due: boolean
}) {
  if (!isInitialized) return
  posthog.capture('task_add', data)
}

/**
 * タスク移動イベント
 */
export function trackTaskMove(data: { from: Quadrant; to: Quadrant }) {
  if (!isInitialized) return
  posthog.capture('task_move', data)
}

/**
 * タスク完了イベント
 */
export function trackTaskComplete(data: { quadrant: Quadrant; had_due: boolean }) {
  if (!isInitialized) return
  posthog.capture('task_complete', data)
}

/**
 * タスク削除イベント
 */
export function trackTaskDelete(data: { quadrant: Quadrant }) {
  if (!isInitialized) return
  posthog.capture('task_delete', data)
}

/**
 * ボード作成イベント
 */
export function trackBoardCreate() {
  if (!isInitialized) return
  posthog.capture('board_create')
}

/**
 * ボード保存イベント
 */
export function trackBoardSave() {
  if (!isInitialized) return
  posthog.capture('board_save')
}

/**
 * 共有リンク作成イベント（Phase 4実装時）
 */
export function trackShareCreate(data: { board_id: string }) {
  if (!isInitialized) return
  posthog.capture('share_create', data)
}

/**
 * 共有リンククリックイベント（Phase 4実装時）
 */
export function trackShareClick(data: { board_id: string }) {
  if (!isInitialized) return
  posthog.capture('share_click', data)
}

/**
 * 共有ビューイベント（Phase 4実装時）
 */
export function trackShareView(data: { board_id: string }) {
  if (!isInitialized) return
  posthog.capture('share_view', data)
}

/**
 * ユーザー識別（ログイン時）
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (!isInitialized) return
  posthog.identify(userId, traits)
}

/**
 * ユーザーログアウト
 */
export function resetUser() {
  if (!isInitialized) return
  posthog.reset()
}
