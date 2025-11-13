import { Quadrant } from './types'

/**
 * Quick Add入力文字列を解析して、タスク情報を抽出
 */
export interface ParsedQuickTask {
  title: string
  due: Date | null
  quadrant: Quadrant
  isUrgent: boolean
  isImportant: boolean
}

// 日本語キーワード定義
const URGENT_KEYWORDS = /(至急|緊急|今すぐ|今日中|急ぎ|ASAP)/i
const IMPORTANT_KEYWORDS = /(重要|戦略|採用|品質|仕組み|本番|顧客|クリティカル|必須)/i

/**
 * 日付を加算するヘルパー関数
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 期限が指定時間以内かチェック
 */
function isWithinHours(due: Date, now: Date, hours: number): boolean {
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours >= 0 && diffHours <= hours
}

/**
 * Quick Add入力文字列を解析
 *
 * @param text - ユーザー入力文字列
 * @param now - 現在時刻（テスト用にオーバーライド可能）
 * @returns 解析結果
 *
 * @example
 * parseQuick("明日17時 見積り送付 至急")
 * // => { title: "明日17時 見積り送付 至急", due: Date(...), quadrant: "q1", ... }
 */
export function parseQuick(text: string, now = new Date()): ParsedQuickTask {
  const t = text.trim()
  let due: Date | null = null

  // 1. 相対日の解析
  if (/(今日|きょう)/i.test(t)) {
    due = new Date(now)
    due.setHours(23, 59, 59, 999) // デフォルトは今日の終わり
  } else if (/(明日|あした)/i.test(t)) {
    due = addDays(now, 1)
    due.setHours(23, 59, 59, 999)
  } else if (/(明後日|あさって)/i.test(t)) {
    due = addDays(now, 2)
    due.setHours(23, 59, 59, 999)
  }

  // 2. 絶対日の解析（mm/dd または mm/dd hh:mm）
  const absoluteDateMatch = t.match(/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}))?/)
  if (absoluteDateMatch) {
    const [, month, day, hour, minute] = absoluteDateMatch
    const year = now.getFullYear()
    due = new Date(year, parseInt(month) - 1, parseInt(day))

    if (hour && minute) {
      due.setHours(parseInt(hour), parseInt(minute), 0, 0)
    } else {
      due.setHours(23, 59, 59, 999)
    }

    // 過去の日付の場合は来年と判定
    if (due < now) {
      due.setFullYear(year + 1)
    }
  }

  // 3. 時刻の解析（相対日に時刻を追加）
  const timeMatch = t.match(/(\d{1,2})時(?:(\d{1,2})分?)?/)
  if (timeMatch && due) {
    const [, hour, minute] = timeMatch
    due.setHours(parseInt(hour), parseInt(minute || '0'), 0, 0)
  }

  // 4. 緊急性の判定
  const hasUrgentKeyword = URGENT_KEYWORDS.test(t)
  const hasNearDeadline = due ? isWithinHours(due, now, 48) : false
  const isUrgent = hasUrgentKeyword || hasNearDeadline

  // 5. 重要性の判定
  const isImportant = IMPORTANT_KEYWORDS.test(t)

  // 6. 4象限の自動判定
  let quadrant: Quadrant
  if (isImportant && isUrgent) {
    quadrant = 'q1' // 緊急×重要
  } else if (isImportant && !isUrgent) {
    quadrant = 'q2' // 重要×非緊急
  } else if (!isImportant && isUrgent) {
    quadrant = 'q3' // 緊急×非重要
  } else {
    quadrant = 'q4' // 非緊急×非重要
  }

  return {
    title: t,
    due,
    quadrant,
    isUrgent,
    isImportant,
  }
}

/**
 * 解析結果を人間が読める形式でフォーマット（デバッグ用）
 */
export function formatParsedTask(parsed: ParsedQuickTask): string {
  const dueStr = parsed.due
    ? parsed.due.toLocaleString('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'なし'

  return `
タイトル: ${parsed.title}
期限: ${dueStr}
象限: ${parsed.quadrant.toUpperCase()}
緊急: ${parsed.isUrgent ? 'はい' : 'いいえ'}
重要: ${parsed.isImportant ? 'はい' : 'いいえ'}
  `.trim()
}
