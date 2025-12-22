'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store/useAuthStore'

export function RootRedirect() {
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    // Auth状態が確定するまで待機
    if (isLoading) return

    // / (ルート) は常にLPを表示（リダイレクトしない）
    // ログイン中のユーザーがボードにアクセスしたい場合は /boards を直接開く
  }, [isLoading])

  return null
}
