'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBoardStore } from '@/stores/useBoardStore'
import { useBoardSync } from './useBoardSync'
import { createBoard, getBoard } from '@/lib/firestore-helpers'
import { getBoard as getUserBoard } from '@/lib/boardStorage'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { attachBoardToUser, isGuestBoard } from '@/lib/board-ownership'

const BOARD_ID_STORAGE_KEY = 'aisen:lastBoardId'

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
  const clearBoard = useBoardStore((state) => state.clearBoard)
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

  // Firestoreとリアルタイム同期
  useBoardSync(boardId)

  useEffect(() => {
    async function initializeBoard() {
      try {
        // URLにboardIdが指定されている場合
        if (urlBoardId) {
          // ログイン済みならユーザーボードから取得を試みる
          if (user) {
            const userBoardData = await getUserBoard(user.uid, urlBoardId)
            if (userBoardData) {
              setBoard(userBoardData.board)
              localStorage.setItem(BOARD_ID_STORAGE_KEY, urlBoardId)
              setIsLoading(false)
              return
            }
          }

          // 匿名ボードまたはユーザーボードがない場合
          const board = await getBoard(urlBoardId)
          if (board) {
            // 既存ボードが見つかった場合
            setBoard(board)
            localStorage.setItem(BOARD_ID_STORAGE_KEY, urlBoardId)

            // ログイン済み + ゲストボードの場合、ユーザーに自動紐付け
            if (user) {
              try {
                const isGuest = await isGuestBoard(urlBoardId)
                if (isGuest) {
                  await attachBoardToUser(urlBoardId, user.uid)
                  console.log('✅ Guest board auto-attached to user:', urlBoardId)
                }
              } catch (error) {
                console.error('Failed to auto-attach board:', error)
                // エラーが発生してもボード表示は継続
              }
            }

            setIsLoading(false)
            return
          } else {
            // URLのboardIdが存在しない場合は新規作成
            clearBoard()
            const newBoardId = await createBoard({
              title: 'マイボード',
              editKey: crypto.randomUUID(),
              ownerUid: user?.uid || null, // ログイン済みなら即座に紐付け
              tasks: { q1: [], q2: [], q3: [], q4: [] },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })

            // ユーザーが居る場合、users/{uid}/boards/{boardId} サブコレクションも作成
            if (user) {
              try {
                await attachBoardToUser(newBoardId, user.uid)
              } catch (error) {
                console.error('Failed to attach new board to user:', error)
              }
            }

            // Firestoreに新しいボードIDで保存
            localStorage.setItem(BOARD_ID_STORAGE_KEY, newBoardId)

            // 新しいボードを取得してストアにセット
            const board = await getBoard(newBoardId)
            if (board) {
              setBoard(board)
              // 作成したboardIdにリダイレクト
              if (urlBoardId !== newBoardId) {
                router.replace(`/b/${newBoardId}`)
              }
            }
            setIsLoading(false)
            return
          }
        }

        // URLにboardIdがない場合は、localStorageから取得
        const storedBoardId = localStorage.getItem(BOARD_ID_STORAGE_KEY)

        if (storedBoardId) {
          // 既存ボードを取得
          const board = await getBoard(storedBoardId)
          if (board) {
            setBoard(board)
            // URLが / の場合は /b/[boardId] にリダイレクト
            router.push(`/b/${storedBoardId}`)
            setIsLoading(false)
            return
          }
        }

        // どこにもボードがない場合は新規作成
        clearBoard()
        const newBoardId = await createBoard({
          title: 'マイボード',
          editKey: crypto.randomUUID(),
          ownerUid: user?.uid || null, // ログイン済みなら即座に紐付け
          tasks: { q1: [], q2: [], q3: [], q4: [] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        // ユーザーが居る場合、users/{uid}/boards/{boardId} サブコレクションも作成
        if (user) {
          try {
            await attachBoardToUser(newBoardId, user.uid)
          } catch (error) {
            console.error('Failed to attach new board to user:', error)
          }
        }

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
  }, [urlBoardId, setBoard, clearBoard, router, user])

  return { isLoading, boardId }
}
