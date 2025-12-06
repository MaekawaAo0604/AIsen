'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBoardHistory, formatRelativeTime, type BoardHistory } from '@/lib/boardHistory'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useBoardStore } from '@/stores/useBoardStore'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { LoginModal } from '@/components/Auth/LoginModal'
import { getUserBoards, updateBoard, type SavedBoard } from '@/lib/boardStorage'
import { SidebarMenuItem } from './SidebarMenuItem'
import { SidebarUserButton } from './SidebarUserButton'
import {
  MenuIcon,
  BoardIcon,
  SettingsIcon,
  InboxIcon,
  PricingIcon,
  UserIcon,
  LoginIcon,
  LogoutIcon,
  PlusIcon,
  CloseIcon,
  CheckIcon,
  EditIcon,
} from './SidebarIcons'

interface SidebarProps {
  isExpanded?: boolean
  onToggle?: () => void
}

export function Sidebar({ isExpanded: externalIsExpanded, onToggle }: SidebarProps = {}) {
  const router = useRouter()
  const [history, setHistory] = useState<BoardHistory[]>([])
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([])
  const [internalIsExpanded, setInternalIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isBoardListExpanded, setIsBoardListExpanded] = useState(false)

  // 外部からの制御がある場合はそちらを優先、なければ内部状態を使用
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded
  const setIsExpanded = onToggle || setInternalIsExpanded
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const { user } = useAuthStore()
  const clearBoard = useBoardStore((state) => state.clearBoard)

  useEffect(() => {
    if (isBoardListExpanded) {
      setHistory(getBoardHistory())

      // ログイン済みの場合は保存済みボードを読み込む
      if (user) {
        getUserBoards(user.uid).then(setSavedBoards).catch(console.error)
      }
    }
  }, [isBoardListExpanded, user])

  const handleBoardClick = (boardId: string) => {
    router.push(`/b/${boardId}`)
    setIsBoardListExpanded(false)
    setIsExpanded(false)
    setIsHovered(false)
  }

  const handleToggle = () => {
    setIsBoardListExpanded(!isBoardListExpanded)
    if (!isBoardListExpanded) {
      setIsHovered(false)
    }
  }

  const handleOpenBoardList = () => {
    setIsBoardListExpanded(true)
    setIsExpanded(false)
  }

  const handleEditStart = (board: SavedBoard, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingBoardId(board.boardId)
    setEditingTitle(board.title)
  }

  const handleEditSave = async (boardId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation()
    if (!user || !editingTitle.trim()) return

    try {
      const board = savedBoards.find((b) => b.boardId === boardId)
      if (!board) return

      const updatedBoard = {
        ...board.board,
        title: editingTitle.trim(),
      }

      await updateBoard(user.uid, boardId, updatedBoard)

      // ローカル状態を更新
      setSavedBoards(
        savedBoards.map((b) =>
          b.boardId === boardId ? { ...b, title: editingTitle.trim() } : b
        )
      )

      setEditingBoardId(null)
      setEditingTitle('')
    } catch (error) {
      console.error('ボード名更新エラー:', error)
      alert('ボード名の更新に失敗しました')
    }
  }

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingBoardId(null)
    setEditingTitle('')
  }

  // ローカル履歴のボード（後方互換性のため維持）
  const myBoards = history.filter((board) => board.isOwner)
  const sharedBoards = history.filter((board) => !board.isOwner)

  return (
    <>
      {/* Backdrop */}
      {(isExpanded || isBoardListExpanded) && (
        <div
          className="fixed inset-0 bg-black/20 z-[90] transition-opacity duration-300"
          onClick={() => {
            setIsExpanded(false)
            setIsBoardListExpanded(false)
          }}
        />
      )}

      {/* Collapsed Sidebar - Always visible on desktop, hidden on mobile */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-[#e9e9e7] z-[100] flex-col py-4 gap-4 transition-all duration-300 hidden sm:flex ${
          isHovered || isBoardListExpanded ? 'w-48' : 'w-16'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarMenuItem icon={<MenuIcon />} label="メニュー" isExpanded={isHovered || isBoardListExpanded} />
        <SidebarMenuItem
          icon={<BoardIcon />}
          label="ボード"
          onClick={handleToggle}
          isExpanded={isHovered || isBoardListExpanded}
          isActive={isBoardListExpanded}
        />
        <SidebarMenuItem
          icon={<SettingsIcon />}
          label="設定"
          onClick={() => router.push('/settings')}
          isExpanded={isHovered || isBoardListExpanded}
        />
        <SidebarMenuItem
          icon={<InboxIcon />}
          label="Inbox"
          onClick={() => router.push('/inbox')}
          isExpanded={isHovered || isBoardListExpanded}
        />
        <SidebarMenuItem
          icon={<PricingIcon />}
          label="料金プラン"
          onClick={() => router.push('/pricing')}
          isExpanded={isHovered || isBoardListExpanded}
        />

        <SidebarUserButton
          user={user}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onUserClick={() => setIsLogoutModalOpen(true)}
          isExpanded={isHovered || isBoardListExpanded}
        />
      </div>

      {/* Mobile Sidebar - Shown when hamburger is clicked */}
      {isExpanded && (
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl border-r border-[#e9e9e7] z-[95] sm:hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#37352f]">メニュー</h2>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#9b9a97] hover:text-[#37352f] p-1 rounded-[3px] hover:bg-[#f7f6f3] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Board Button */}
            <button
              onClick={handleOpenBoardList}
              className="w-full flex items-center gap-3 px-6 py-3 hover:bg-[#f7f6f3] transition-colors text-[#37352f]"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-[14px] font-medium">ボード一覧</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                router.push('/settings')
                setIsExpanded(false)
              }}
              className="w-full flex items-center gap-3 px-6 py-3 hover:bg-[#f7f6f3] transition-colors text-[#37352f]"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-[14px] font-medium">設定</span>
            </button>

            {/* Inbox Button */}
            <button
              onClick={() => {
                router.push('/inbox')
                setIsExpanded(false)
              }}
              className="w-full flex items-center gap-3 px-6 py-3 hover:bg-[#f7f6f3] transition-colors text-[#37352f]"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <span className="text-[14px] font-medium">Inbox</span>
            </button>

            {/* Pricing Button */}
            <button
              onClick={() => {
                router.push('/pricing')
                setIsExpanded(false)
              }}
              className="w-full flex items-center gap-3 px-6 py-3 hover:bg-[#f7f6f3] transition-colors text-[#37352f]"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[14px] font-medium">料金プラン</span>
            </button>

            {/* Login/User Button */}
            {user ? (
              <button
                onClick={() => {
                  setIsLogoutModalOpen(true)
                  setIsExpanded(false)
                }}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-[#f7f6f3] transition-colors text-[#37352f]"
              >
                <div className="w-5 h-5 flex-shrink-0 rounded-full bg-[#2383e2] flex items-center justify-center text-white text-[11px] font-medium">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-[14px] font-medium truncate">
                  {user.displayName || user.email}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true)
                  setIsExpanded(false)
                }}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-[#f7f6f3] transition-colors text-[#37352f]"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-[14px] font-medium">ログイン</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" onClick={() => setIsLogoutModalOpen(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-sm mx-4 border border-[#e9e9e7]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e9e9e7]">
              <h2 className="text-[16px] font-semibold text-[#37352f]">ログアウト確認</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[14px] text-[#37352f]">本当にログアウトしますか？</p>
              {user && (
                <p className="text-[13px] text-[#787774] mt-2">
                  ログアウトすると、{user.email} からサインアウトされます。
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#e9e9e7] flex justify-end gap-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="h-9 px-4 text-[14px] font-medium text-[#37352f] bg-white border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={async () => {
                  await signOut(auth)
                  setIsLogoutModalOpen(false)
                }}
                className="h-9 px-4 text-[14px] font-medium text-white bg-[#dc2626] rounded-[3px] hover:bg-[#b91c1c] active:bg-[#991b1b] transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Sidebar - Board List */}
      <div
        className={`fixed top-0 h-full w-full sm:w-80 bg-white shadow-2xl border-r border-[#e9e9e7] z-[95] transform transition-all duration-300 ease-in-out ${
          isBoardListExpanded ? 'translate-x-0' : '-translate-x-full'
        } ${isHovered || isBoardListExpanded ? 'sm:left-48' : 'sm:left-16'} left-0`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#37352f]">ボード一覧</h2>
          <button
            onClick={() => setIsBoardListExpanded(false)}
            className="text-[#9b9a97] hover:text-[#37352f] p-1 rounded-[3px] hover:bg-[#f7f6f3] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-144px)] overflow-y-auto">
          {user && savedBoards.length === 0 && history.length === 0 ? (
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
              <p className="text-[12px] text-[#9b9a97] mt-1">新しいボードを作成して「保存」ボタンで保存してください</p>
            </div>
          ) : !user && history.length === 0 ? (
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
              <p className="text-[12px] text-[#9b9a97] mt-1">ログインしてボードを保存しましょう</p>
            </div>
          ) : (
            <>
              {/* 保存済みボード（ログイン時） */}
              {user && savedBoards.length > 0 && (
                <div className="px-6 py-4">
                  <h3 className="text-[12px] font-semibold text-[#9b9a97] uppercase mb-3">保存済みボード</h3>
                  <div className="space-y-2">
                    {savedBoards.map((board) => (
                      <div
                        key={board.boardId}
                        className="w-full p-3 rounded-[6px] border border-[#e9e9e7] hover:bg-[#f7f6f3] transition-colors group"
                      >
                        {editingBoardId === board.boardId ? (
                          // 編集モード
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              handleEditSave(board.boardId, e)
                            }}
                            className="flex flex-col gap-2"
                          >
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="w-full px-2 py-1 text-[14px] border border-[#2383e2] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#2383e2]"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  handleEditCancel(e as any)
                                }
                              }}
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="flex-1 px-3 py-1 text-[12px] text-white bg-[#2383e2] rounded-[3px] hover:bg-[#1a73d1] transition-colors"
                              >
                                保存
                              </button>
                              <button
                                type="button"
                                onClick={handleEditCancel}
                                className="flex-1 px-3 py-1 text-[12px] text-[#37352f] bg-[#e9e9e7] rounded-[3px] hover:bg-[#d3d3d1] transition-colors"
                              >
                                キャンセル
                              </button>
                            </div>
                          </form>
                        ) : (
                          // 通常モード
                          <div className="w-full">
                            <div className="flex items-start justify-between gap-3">
                              <button
                                onClick={() => handleBoardClick(board.boardId)}
                                className="flex-1 min-w-0 text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-[#10b981] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <p className="text-[14px] font-medium text-[#37352f] truncate">{board.title}</p>
                                </div>
                                <p className="text-[11px] text-[#9b9a97] mt-1">
                                  🕒 {formatRelativeTime(board.updatedAt.toISOString())}
                                </p>
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handleEditStart(board, e)}
                                  className="p-1 rounded-[3px] hover:bg-[#e9e9e7] transition-colors opacity-0 group-hover:opacity-100"
                                  title="ボード名を編集"
                                >
                                  <svg className="w-4 h-4 text-[#9b9a97]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <svg
                                  className="w-5 h-5 text-[#9b9a97] group-hover:text-[#37352f] transition-colors flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ローカル履歴のボード */}
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
              clearBoard()
              router.push(`/b/${newBoardId}`)
              setIsBoardListExpanded(false)
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
