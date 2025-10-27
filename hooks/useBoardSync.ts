'use client'

import { useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useBoardStore } from '@/stores/useBoardStore'
import type { Board } from '@/lib/types'

/**
 * Firestoreとボードを自動同期するフック
 * boardIdが変更されるたびにリアルタイムリスナーをセットアップ
 */
export function useBoardSync(boardId: string | null) {
  const setBoard = useBoardStore((state) => state.setBoard)

  useEffect(() => {
    if (!boardId) return

    // Firestoreのリアルタイムリスナー設定
    const unsubscribe = onSnapshot(
      doc(db, 'boards', boardId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          const board: Board = {
            id: docSnap.id,
            title: data.title,
            editKey: data.editKey,
            tasks: data.tasks || { q1: [], q2: [], q3: [], q4: [] },
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          }
          setBoard(board)
        }
      },
      (error) => {
        console.error('Error syncing board from Firestore:', error)
      }
    )

    // クリーンアップ
    return () => unsubscribe()
  }, [boardId, setBoard])
}
