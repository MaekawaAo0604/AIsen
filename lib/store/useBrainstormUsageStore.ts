import { create } from 'zustand'
import { canUseBrainstorm } from '@/lib/brainstormUsage'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User } from '@/lib/types'

interface BrainstormUsageState {
  // 使用状況
  canUse: boolean
  remaining: number
  limit: number
  usedCount: number
  userIsPro: boolean

  // ローディング状態
  isLoading: boolean

  // アクション
  fetchUsage: (uid: string) => Promise<void>
  decrementRemaining: () => void
  reset: () => void
}

export const useBrainstormUsageStore = create<BrainstormUsageState>((set, get) => ({
  // 初期状態
  canUse: true,
  remaining: -1, // -1 = 未取得
  limit: 5,
  usedCount: 0,
  userIsPro: false,
  isLoading: false,

  // 使用状況を取得
  fetchUsage: async (uid: string) => {
    set({ isLoading: true })

    try {
      // ユーザーデータ取得
      const userDoc = await getDoc(doc(db, 'users', uid))
      const userData = userDoc.exists() ? (userDoc.data() as User) : null

      // 使用状況チェック
      const result = await canUseBrainstorm(uid, userData)

      set({
        canUse: result.canUse,
        remaining: result.remaining,
        limit: result.limit,
        usedCount: result.usedCount,
        userIsPro: result.remaining === -1, // -1 = Pro or unlimited
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to fetch brainstorm usage:', error)
      set({ isLoading: false })
    }
  },

  // 残り回数を減らす（ブレインストーミング実行後）
  decrementRemaining: () => {
    const { remaining, limit, userIsPro } = get()
    if (userIsPro) return // Proは無制限なので何もしない

    set({
      remaining: Math.max(0, remaining - 1),
      usedCount: Math.min(limit, get().usedCount + 1),
      canUse: remaining - 1 > 0,
    })
  },

  // リセット（ログアウト時など）
  reset: () => {
    set({
      canUse: true,
      remaining: -1,
      limit: 5,
      usedCount: 0,
      userIsPro: false,
      isLoading: false,
    })
  },
}))
