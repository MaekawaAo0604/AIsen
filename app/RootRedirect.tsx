'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/useAuthStore'

const BOARD_ID_STORAGE_KEY = 'aisen:lastBoardId'

export function RootRedirect() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    // Auth状態が確定するまで待機
    if (isLoading) return

    // / (ルート) は常にLPを表示（リダイレクトしない）
    // ログイン中のユーザーがボードにアクセスしたい場合は /boards を直接開く

    // 非ログイン + lastBoardIdがある場合のみ → /b/[id] に遷移
    if (!user) {
      const lastBoardId = localStorage.getItem(BOARD_ID_STORAGE_KEY)
      if (lastBoardId) {
        router.replace(`/b/${lastBoardId}`)
        return
      }
    }

    // その他の場合（ログイン中、または非ログイン+lastBoardIdなし）はLPを表示（何もしない）
  }, [user, isLoading, router])

  return null
}
