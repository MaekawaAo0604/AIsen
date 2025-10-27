'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBoardStore } from '@/stores/useBoardStore'
import { useBoardSync } from './useBoardSync'
import { createBoard, getBoard } from '@/lib/firestore-helpers'

const BOARD_ID_STORAGE_KEY = 'aisen:boardId'

/**
 * ボードの初期化と同期を管理するコントローラーフック
 * - URLまたはlocalStorageからボードIDを読み込み
 * - ボードが存在しない場合は新規作成してリダイレクト
 * - Firestoreとリアルタイム同期
 */
export function useBoardController(urlBoardId?: string) {
  const [isLoading, setIsLoading] = useState(true)
  const boardId = useBoardStore((state) => state.boardId)
  const setBoard = useBoardStore((state) => state.setBoard)
  const router = useRouter()

  // Firestoreとリアルタイム同期
  useBoardSync(boardId)

  useEffect(() => {
    async function initializeBoard() {
      try {
        // URLにboardIdが指定されている場合
        if (urlBoardId) {
          const board = await getBoard(urlBoardId)
          if (board) {
            setBoard(board)
            localStorage.setItem(BOARD_ID_STORAGE_KEY, urlBoardId)
            setIsLoading(false)
            return
          }
        }

        // localStorage からボードIDを取得
        const storedBoardId = localStorage.getItem(BOARD_ID_STORAGE_KEY)

        if (storedBoardId) {
          // 既存ボードを取得
          const board = await getBoard(storedBoardId)
          if (board) {
            setBoard(board)
            // URLが / の場合は /b/[boardId] にリダイレクト
            if (!urlBoardId) {
              router.push(`/b/${storedBoardId}`)
            }
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
          // /b/[boardId] にリダイレクト
          router.push(`/b/${newBoardId}`)
        }
      } catch (error) {
        console.error('Error initializing board:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeBoard()
  }, [urlBoardId, setBoard, router])

  return { isLoading, boardId }
}
