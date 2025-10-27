'use client'

import { useEffect, useState } from 'react'
import { useBoardStore } from '@/stores/useBoardStore'
import { useBoardSync } from './useBoardSync'
import { createBoard, getBoard } from '@/lib/firestore-helpers'

const BOARD_ID_STORAGE_KEY = 'aisen:boardId'

/**
 * ボードの初期化と同期を管理するコントローラーフック
 * - localStorage からボードIDを読み込み
 * - ボードが存在しない場合は新規作成
 * - Firestoreとリアルタイム同期
 */
export function useBoardController() {
  const [isLoading, setIsLoading] = useState(true)
  const boardId = useBoardStore((state) => state.boardId)
  const setBoard = useBoardStore((state) => state.setBoard)

  // Firestoreとリアルタイム同期
  useBoardSync(boardId)

  useEffect(() => {
    async function initializeBoard() {
      try {
        // localStorage からボードIDを取得
        const storedBoardId = localStorage.getItem(BOARD_ID_STORAGE_KEY)

        if (storedBoardId) {
          // 既存ボードを取得
          const board = await getBoard(storedBoardId)
          if (board) {
            setBoard(board)
            setIsLoading(false)
            return
          }
        }

        // ボードが存在しない場合は新規作成
        const newBoardId = await createBoard({
          title: 'マイボード',
          editKey: crypto.randomUUID(),
          tasks: { q1: [], q2: [], q3: [], q4: [] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        // localStorageに保存
        localStorage.setItem(BOARD_ID_STORAGE_KEY, newBoardId)

        // 新しいボードを取得してストアにセット
        const board = await getBoard(newBoardId)
        if (board) {
          setBoard(board)
        }
      } catch (error) {
        console.error('Error initializing board:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeBoard()
  }, [setBoard])

  return { isLoading, boardId }
}
