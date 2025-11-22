'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const BOARD_ID_STORAGE_KEY = 'aisen:lastBoardId'

export function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    // localStorage から最後に開いたボードIDを取得
    const lastBoardId = localStorage.getItem(BOARD_ID_STORAGE_KEY)

    if (lastBoardId) {
      // 最後のボードにリダイレクト
      router.replace(`/b/${lastBoardId}`)
    }
    // lastBoardIdがない場合は何もしない（LPを表示）
  }, [router])

  return null
}
