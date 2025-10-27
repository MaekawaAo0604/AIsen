// localStorage で最近見たボードを管理

export interface BoardHistory {
  boardId: string
  title: string
  lastViewed: string
  isOwner: boolean
}

const STORAGE_KEY = 'aisen_board_history'
const MAX_HISTORY = 10

/**
 * ボード閲覧履歴を取得
 */
export function getBoardHistory(): BoardHistory[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * ボード閲覧履歴に追加
 */
export function addBoardToHistory(board: Omit<BoardHistory, 'lastViewed'>) {
  if (typeof window === 'undefined') return

  const history = getBoardHistory()

  // 既存のボードを削除
  const filtered = history.filter((item) => item.boardId !== board.boardId)

  // 新しいボードを先頭に追加
  const newHistory: BoardHistory[] = [
    {
      ...board,
      lastViewed: new Date().toISOString(),
    },
    ...filtered,
  ].slice(0, MAX_HISTORY)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
}

/**
 * ボード閲覧履歴から削除
 */
export function removeBoardFromHistory(boardId: string) {
  if (typeof window === 'undefined') return

  const history = getBoardHistory()
  const filtered = history.filter((item) => item.boardId !== boardId)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * 閲覧履歴を全削除
 */
export function clearBoardHistory() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 相対時間表示（例: "2分前", "1時間前"）
 */
export function formatRelativeTime(isoString: string): string {
  const now = new Date()
  const date = new Date(isoString)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'たった今'
  if (diffMinutes < 60) return `${diffMinutes}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  return date.toLocaleDateString('ja-JP')
}
