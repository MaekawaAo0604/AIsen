'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { getUserBoards, type SavedBoard } from '@/lib/boardStorage'
import { createBoard } from '@/lib/firestore-helpers'
import { formatDateTimeJP } from '@/lib/utils'
import Link from 'next/link'

export function BoardsPageClient() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [boards, setBoards] = useState<SavedBoard[]>([])
  const [isFetching, setIsFetching] = useState(true)

  // 未ログインの場合はログインページにリダイレクト
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  // ユーザーのボード一覧を取得
  useEffect(() => {
    async function fetchBoards() {
      if (!user) return

      setIsFetching(true)
      try {
        const userBoards = await getUserBoards(user.uid)
        setBoards(userBoards)
      } catch (error) {
        console.error('Failed to fetch boards:', error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchBoards()
  }, [user])

  // 新規ボード作成
  const handleCreateBoard = async () => {
    if (!user) return

    try {
      const newBoardId = await createBoard({
        title: '新しいボード',
        editKey: crypto.randomUUID(),
        ownerUid: user.uid, // 新規作成時は即座にユーザーに紐付け
        tasks: { q1: [], q2: [], q3: [], q4: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      router.push(`/b/${newBoardId}`)
    } catch (error) {
      console.error('Failed to create board:', error)
      alert('ボードの作成に失敗しました')
    }
  }

  // ボードを開く
  const handleOpenBoard = (boardId: string) => {
    router.push(`/b/${boardId}`)
  }

  // ローディング中
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="text-[14px] text-[#787774]">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="text-[28px] sm:text-[36px] font-bold text-[#37352f]">
                マイボード
              </h1>
              <p className="text-[14px] text-[#787774] mt-2">
                保存されたボードの一覧です
              </p>
            </div>
            <Link
              href="/settings/integrations"
              className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              連携設定
            </Link>
          </div>
        </div>

        {/* 新規作成ボタン */}
        <div className="mb-6">
          <button
            onClick={handleCreateBoard}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新しいボードを作成
          </button>
        </div>

        {/* ボード一覧 */}
        {isFetching ? (
          <div className="text-center py-12">
            <div className="text-[14px] text-[#787774]">ボードを読み込んでいます...</div>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-[#e9e9e7]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-[16px] font-medium text-[#37352f] mb-2">
              まだボードがありません
            </p>
            <p className="text-[14px] text-[#787774]">
              「新しいボードを作成」ボタンから始めましょう
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {boards.map((board) => (
              <button
                key={board.boardId}
                onClick={() => handleOpenBoard(board.boardId)}
                className="w-full text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <svg
                        className="w-5 h-5 text-sky-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="text-[16px] font-semibold text-[#37352f] truncate">
                        {board.title || '無題のボード'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] text-[#787774]">
                      <span>更新: {formatDateTimeJP(board.updatedAt)}</span>
                      <span>•</span>
                      <span>作成: {formatDateTimeJP(board.createdAt)}</span>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-[#9b9a97] group-hover:text-[#37352f] transition-colors flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
