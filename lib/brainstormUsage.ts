import { db } from './firestore'
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { BRAINSTORM_LIMITS } from './constants'
import { isPro } from './utils'
import type { User } from './types'

/**
 * 使用回数データ
 */
export interface BrainstormUsage {
  count: number        // 当月の使用回数
  lastResetAt: string  // 最後にリセットした日時（YYYY-MM形式）
  updatedAt: Date
}

/**
 * 今月の年月を YYYY-MM 形式で取得
 */
function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * ユーザーのブレインストーミング使用回数を取得
 */
export async function getBrainstormUsage(uid: string): Promise<BrainstormUsage> {
  const usageRef = doc(db, 'users', uid, 'usage', 'brainstorm')
  const usageSnap = await getDoc(usageRef)

  const currentMonth = getCurrentMonth()

  if (!usageSnap.exists()) {
    // 初回アクセス時はドキュメント作成
    const newUsage: BrainstormUsage = {
      count: 0,
      lastResetAt: currentMonth,
      updatedAt: new Date(),
    }
    await setDoc(usageRef, {
      count: 0,
      lastResetAt: currentMonth,
      updatedAt: Timestamp.now(),
    })
    return newUsage
  }

  const data = usageSnap.data()
  const usage: BrainstormUsage = {
    count: data.count || 0,
    lastResetAt: data.lastResetAt || currentMonth,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  }

  // 月が変わっていればリセット
  if (usage.lastResetAt !== currentMonth) {
    const resetUsage: BrainstormUsage = {
      count: 0,
      lastResetAt: currentMonth,
      updatedAt: new Date(),
    }
    await updateDoc(usageRef, {
      count: 0,
      lastResetAt: currentMonth,
      updatedAt: Timestamp.now(),
    })
    return resetUsage
  }

  return usage
}

/**
 * ブレインストーミング使用回数をインクリメント
 */
export async function incrementBrainstormUsage(uid: string): Promise<void> {
  const usage = await getBrainstormUsage(uid)
  const usageRef = doc(db, 'users', uid, 'usage', 'brainstorm')

  await updateDoc(usageRef, {
    count: usage.count + 1,
    updatedAt: Timestamp.now(),
  })
}

/**
 * ブレインストーミングを使用可能か確認
 * @returns { canUse: boolean, remaining: number, limit: number }
 */
export async function canUseBrainstorm(
  uid: string,
  userData: User | null
): Promise<{ canUse: boolean; remaining: number; limit: number }> {
  const userIsPro = isPro(userData)

  // Proプランは無制限
  if (userIsPro) {
    return { canUse: true, remaining: -1, limit: -1 }
  }

  // Freeプランは回数制限チェック
  const usage = await getBrainstormUsage(uid)
  const limit = BRAINSTORM_LIMITS.FREE
  const remaining = Math.max(0, limit - usage.count)

  return {
    canUse: usage.count < limit,
    remaining,
    limit,
  }
}
