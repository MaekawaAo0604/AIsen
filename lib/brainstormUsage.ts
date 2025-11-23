import { db } from './firestore'
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { BRAINSTORM_LIMITS } from './constants'
import { isPro } from './utils'
import type { User } from './types'

/**
 * 使用回数データ
 */
export interface BrainstormUsage {
  dateKey: string  // YYYY-MM-DD 形式（JST基準）
  count: number    // 今日の使用回数
  updatedAt: Date
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得（JST基準）
 */
function getTodayJST(): string {
  // サーバーがUTCでも、JST基準で日付を取得
  const now = new Date()
  const jstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))

  const year = jstDate.getFullYear()
  const month = String(jstDate.getMonth() + 1).padStart(2, '0')
  const day = String(jstDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * ユーザーのブレインストーミング使用回数を取得（カウント増加なし）
 */
export async function getBrainstormUsage(uid: string): Promise<BrainstormUsage> {
  const usageRef = doc(db, 'users', uid, 'usage', 'brainstorm')
  const usageSnap = await getDoc(usageRef)

  const todayKey = getTodayJST()

  if (!usageSnap.exists()) {
    // 初回アクセス時：count = 0 で返す（まだ保存しない）
    return {
      dateKey: todayKey,
      count: 0,
      updatedAt: new Date(),
    }
  }

  const data = usageSnap.data()
  const savedDateKey = data.dateKey || ''
  const savedCount = data.count || 0

  // 日が変わっていればリセット
  if (savedDateKey !== todayKey) {
    return {
      dateKey: todayKey,
      count: 0,
      updatedAt: new Date(),
    }
  }

  // 当日データをそのまま返す
  return {
    dateKey: savedDateKey,
    count: savedCount,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  }
}

/**
 * ブレインストーミング使用回数をインクリメント
 */
export async function incrementBrainstormUsage(uid: string): Promise<void> {
  const usage = await getBrainstormUsage(uid)
  const usageRef = doc(db, 'users', uid, 'usage', 'brainstorm')
  const todayKey = getTodayJST()

  // 今日のキーでカウントを +1 して保存
  await setDoc(usageRef, {
    dateKey: todayKey,
    count: usage.count + 1,
    updatedAt: Timestamp.now(),
  })
}

/**
 * ブレインストーミングを使用可能か確認
 * @returns { canUse: boolean, remaining: number, limit: number, usedCount: number }
 */
export async function canUseBrainstorm(
  uid: string,
  userData: User | null
): Promise<{ canUse: boolean; remaining: number; limit: number; usedCount: number }> {
  const userIsPro = isPro(userData)

  // Proプランは無制限
  if (userIsPro) {
    return { canUse: true, remaining: -1, limit: -1, usedCount: 0 }
  }

  // Freeプランは回数制限チェック
  const usage = await getBrainstormUsage(uid)
  const limit = BRAINSTORM_LIMITS.FREE

  // limit が 0 以下の場合は無制限扱い
  if (limit <= 0) {
    return { canUse: true, remaining: -1, limit: -1, usedCount: usage.count }
  }

  const remaining = Math.max(0, limit - usage.count)
  const canUse = usage.count < limit

  return {
    canUse,
    remaining,
    limit,
    usedCount: usage.count,
  }
}
