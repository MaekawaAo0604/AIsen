'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBoardHistory, formatRelativeTime, type BoardHistory } from '@/lib/boardHistory'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const [history, setHistory] = useState<BoardHistory[]>([])

  useEffect(() => {
    if (isOpen) {
      setHistory(getBoardHistory())
    }
  }, [isOpen])

  const handleBoardClick = (boardId: string) => {
    router.push(`/b/${boardId}`)
    onClose()
  }

  const myBoards = history.filter((board) => board.isOwner)
  const sharedBoards = history.filter((board) => !board.isOwner)

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl border-r border-[#e9e9e7] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#37352f]">ボード一覧</h2>
          <button
            onClick={onClose}
            className="text-[#9b9a97] hover:text-[#37352f] p-1 rounded-[3px] hover:bg-[#f7f6f3] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-144px)] overflow-y-auto">
          {history.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-[#e9e9e7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-[14px] text-[#9b9a97]">まだボードがありません</p>
              <p className="text-[12px] text-[#9b9a97] mt-1">新しいボードを作成するか、共有リンクからアクセスしてください</p>
            </div>
          ) : (
            <>
              {/* 自分のボード */}
              {myBoards.length > 0 && (
                <div className="px-6 py-4">
                  <h3 className="text-[12px] font-semibold text-[#9b9a97] uppercase mb-3">自分のボード</h3>
                  <div className="space-y-2">
                    {myBoards.map((board) => (
                      <button
                        key={board.boardId}
                        onClick={() => handleBoardClick(board.boardId)}
                        className="w-full text-left p-3 rounded-[6px] border border-[#e9e9e7] hover:bg-[#f7f6f3] transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-[#2383e2] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p className="text-[14px] font-medium text-[#37352f] truncate">{board.title}</p>
                            </div>
                            <p className="text-[11px] text-[#9b9a97] mt-1">
                              🕒 {formatRelativeTime(board.lastViewed)}
                            </p>
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
                </div>
              )}

              {/* 共有されたボード */}
              {sharedBoards.length > 0 && (
                <div className="px-6 py-4 border-t border-[#e9e9e7]">
                  <h3 className="text-[12px] font-semibold text-[#9b9a97] uppercase mb-3">最近見たボード</h3>
                  <div className="space-y-2">
                    {sharedBoards.map((board) => (
                      <button
                        key={board.boardId}
                        onClick={() => handleBoardClick(board.boardId)}
                        className="w-full text-left p-3 rounded-[6px] border border-[#e9e9e7] hover:bg-[#f7f6f3] transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-[#9b9a97] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <p className="text-[14px] font-medium text-[#37352f] truncate">{board.title}</p>
                            </div>
                            <p className="text-[11px] text-[#9b9a97] mt-1">
                              🕒 {formatRelativeTime(board.lastViewed)}
                            </p>
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
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-[#e9e9e7] bg-white">
          <button
            onClick={() => {
              const newBoardId = crypto.randomUUID()
              router.push(`/b/${newBoardId}`)
              onClose()
            }}
            className="w-full h-10 flex items-center justify-center gap-2 text-[14px] font-medium text-[#2383e2] bg-[#eff6ff] rounded-[6px] hover:bg-[#dbeafe] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新しいボードを作成
          </button>
        </div>
      </div>
    </>
  )
}
