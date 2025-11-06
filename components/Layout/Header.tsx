'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useBoardStore } from '@/stores/useBoardStore'
import { ShareLinkModal } from '@/components/Board/ShareLinkModal'
import { SaveBoardModal } from '@/components/Board/SaveBoardModal'
import { saveBoard, updateBoard, getBoard } from '@/lib/boardStorage'
import { saveBoardWithTasks } from '@/lib/firestore-helpers'
import type { Board } from '@/lib/types'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps = {}) {
  const user = useAuthStore((state) => state.user)
  const boardState = useBoardStore((state) => state)
  const params = useParams()
  const boardId = params?.boardId as string
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isBoardSaved, setIsBoardSaved] = useState(false)

  // 保存済みかどうかを確認
  useEffect(() => {
    async function checkIfBoardIsSaved() {
      if (!user || !boardId) {
        setIsBoardSaved(false)
        return
      }

      try {
        const existingBoard = await getBoard(user.uid, boardId)
        setIsBoardSaved(!!existingBoard)
      } catch (error) {
        console.error('Error checking board save status:', error)
        setIsBoardSaved(false)
      }
    }

    checkIfBoardIsSaved()
  }, [user, boardId])

  const handleSave = async (boardTitle: string) => {
    if (!user || !boardId) return

    setIsSaving(true)
    try {
      // BoardStateからBoard型に変換
      const board: Board = {
        id: boardState.boardId || boardId,
        title: boardTitle,
        editKey: boardState.editKey || crypto.randomUUID(),
        tasks: boardState.tasks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // ユーザー専用ボード (users/{userId}/boards/{boardId}) に保存
      const existingBoard = await getBoard(user.uid, boardId)

      if (existingBoard) {
        await updateBoard(user.uid, boardId, board)
      } else {
        await saveBoard(user.uid, boardId, board)
      }

      // 共有ボード (boards/{boardId}) にタスクも含めて保存
      await saveBoardWithTasks(board)

      // 保存状態を更新
      setIsBoardSaved(true)

      alert(existingBoard ? 'ボードを更新しました' : 'ボードを保存しました')
      setIsSaveModalOpen(false)
    } catch (error) {
      console.error('ボード保存エラー:', error)
      alert('ボードの保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-6 min-w-0 flex-1">
              {/* Mobile menu button */}
              <button
                onClick={onMenuClick}
                className="sm:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="メニューを開く"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">AIsen</h1>
              {isBoardSaved && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[15px] font-medium text-gray-700 truncate">
                    {boardState.title}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* 保存ボタン（未保存ボードのみ） */}
              {user && !isBoardSaved && (
                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  disabled={isSaving || !boardId}
                  className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-4 text-[13px] sm:text-[14px] font-medium text-white bg-[#10b981] rounded-[6px] hover:bg-[#059669] disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  <span className="hidden sm:inline">{isSaving ? '保存中...' : '保存'}</span>
                </button>
              )}

              {/* 共有ボタン */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-4 text-[13px] sm:text-[14px] font-medium text-white bg-[#2383e2] rounded-[6px] hover:bg-[#1a73d1] transition-colors"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="hidden sm:inline">共有</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <ShareLinkModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <SaveBoardModal
        isOpen={isSaveModalOpen}
        currentTitle={boardState.title}
        onSave={handleSave}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </>
  )
}
