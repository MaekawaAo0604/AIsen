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

    // ログイン済みの場合 → /boards に遷移
    if (user) {
      router.replace('/boards')
      return
    }

    // 非ログイン + lastBoardIdがある場合 → /b/[id] に遷移
    const lastBoardId = localStorage.getItem(BOARD_ID_STORAGE_KEY)
    if (lastBoardId) {
      router.replace(`/b/${lastBoardId}`)
      return
    }

    // 非ログイン + lastBoardIdなし → LPを表示（何もしない）
  }, [user, isLoading, router])

  return null
}
