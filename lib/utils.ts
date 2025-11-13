/**
 * ユーティリティ関数
 */

/**
 * 日付を日本語フォーマットで表示
 */
export function formatDateJP(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ja-JP')
}

/**
 * 日時を日本語フォーマットで表示
 */
export function formatDateTimeJP(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ja-JP')
}

/**
 * クラス名を結合
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * 期限までの残り時間を人間が読める形式で返す
 */
export function getTimeUntilDue(dueDate: Date | string): string {
  const now = new Date()
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const diff = due.getTime() - now.getTime()

  if (diff < 0) {
    return '期限切れ'
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `あと${days}日`
  }
  if (hours > 0) {
    return `あと${hours}時間`
  }
  const minutes = Math.floor(diff / (1000 * 60))
  return `あと${minutes}分`
}

/**
 * タスクが緊急かどうか判定（48時間以内）
 */
export function isUrgent(dueDate?: Date | string | null): boolean {
  if (!dueDate) return false
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const now = new Date()
  const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntilDue > 0 && hoursUntilDue <= 48
}
