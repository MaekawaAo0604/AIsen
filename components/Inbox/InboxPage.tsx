'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { getInboxTasks, deleteInboxTask, convertInboxTaskToTask } from '@/lib/inboxStorage'
import { getOrCreateDefaultBoard, updateBoard, getUserBoards, setDefaultBoardId, getUserSettings, type SavedBoard } from '@/lib/boardStorage'
import { GmailConnectButton } from '@/components/GmailConnectButton'
import { AlertModal } from '@/components/Modal/AlertModal'
import type { InboxTask, InboxQuadrant, Quadrant } from '@/lib/types'

export function InboxPage() {
  const user = useAuthStore((state) => state.user)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tasks, setTasks] = useState<InboxTask[]>([])
  const [loading, setLoading] = useState(true)
  const [organizing, setOrganizing] = useState(false)
  const [gmailConnectKey, setGmailConnectKey] = useState(0)
  const [boards, setBoards] = useState<SavedBoard[]>([])
  const [defaultBoardId, setDefaultBoardIdState] = useState<string | undefined>()
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })

  // OAuth callbackを処理
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (code && user) {
      // codeを使う前にURLから削除（1回しか使えないため）
      window.history.replaceState({}, '', '/inbox')

      const saveToken = async () => {
        try {
          const saveGmailToken = httpsCallable(functions, 'saveGmailToken')
          await saveGmailToken({ code })

          alert('Gmail連携が完了しました！15分ごとに自動的にメールが同期されます。')
          // GmailConnectButtonを再レンダリングして状態を更新
          setGmailConnectKey(prev => prev + 1)
        } catch (error) {
          console.error('Token save error:', error)
          alert('Gmail連携に失敗しました。もう一度お試しください。')
        }
      }

      saveToken()
    }
  }, [searchParams, user])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const [inboxTasks, userBoards, settings] = await Promise.all([
          getInboxTasks(user.uid, 'INBOX'),
          getUserBoards(user.uid),
          getUserSettings(user.uid),
        ])
        setTasks(inboxTasks)
        setBoards(userBoards)
        setDefaultBoardIdState(settings.defaultBoardId)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleSetDefaultBoard = async (boardId: string) => {
    if (!user) return

    try {
      await setDefaultBoardId(user.uid, boardId)
      setDefaultBoardIdState(boardId)
    } catch (error) {
      console.error('Error setting default board:', error)
      setAlertModal({
        isOpen: true,
        title: 'エラー',
        message: 'デフォルトボードの設定に失敗しました',
        type: 'error',
      })
    }
  }

  const handleOrganize = async () => {
    if (!user) return

    setOrganizing(true)
    try {
      const organizeInboxTasks = httpsCallable(functions, 'organizeInboxTasks')
      const result = await organizeInboxTasks()
      const data = result.data as any

      console.log('AI整理完了:', data)

      // 象限ごとの件数を集計
      const counts = { q1: 0, q2: 0, q3: 0, q4: 0 }
      data.results?.forEach((r: any) => {
        const q = r.quadrant.toLowerCase()
        if (q in counts) counts[q as keyof typeof counts]++
      })

      // 結果を反映（Inboxリロード）
      const inboxTasks = await getInboxTasks(user.uid, 'INBOX')
      setTasks(inboxTasks)

      // 結果サマリを表示してボードに遷移
      setAlertModal({
        isOpen: true,
        title: 'AI整理完了',
        message: `AIが ${data.organized} 件のタスクを整理しました

Q1（緊急・重要）: ${counts.q1}件
Q2（重要）: ${counts.q2}件
Q3（緊急）: ${counts.q3}件
Q4（後回し）: ${counts.q4}件

ボードページに移動します。`,
        type: 'success',
      })

      // モーダルを閉じた後にボードに遷移
      setTimeout(() => {
        router.push(`/boards/${data.boardId}`)
      }, 2000)
    } catch (error) {
      console.error('Error organizing inbox:', error)
      setAlertModal({
        isOpen: true,
        title: 'エラー',
        message: 'タスクの整理に失敗しました',
        type: 'error',
      })
    } finally {
      setOrganizing(false)
    }
  }

  const handleMoveToQuadrant = async (task: InboxTask, inboxQuadrant: InboxQuadrant) => {
    if (!user) return

    try {
      // InboxQuadrant (Q1,Q2,Q3,Q4) を Quadrant (q1,q2,q3,q4) に変換
      const quadrantMap: Record<string, Quadrant> = {
        Q1: 'q1',
        Q2: 'q2',
        Q3: 'q3',
        Q4: 'q4',
      }
      const quadrant = quadrantMap[inboxQuadrant]
      if (!quadrant) return

      // デフォルトボードを取得または作成
      const { boardId, board } = await getOrCreateDefaultBoard(user.uid)

      // InboxTask を Task に変換
      const newTask = convertInboxTaskToTask(task)

      // ボードの該当象限に追加
      const updatedBoard = {
        ...board,
        tasks: {
          ...board.tasks,
          [quadrant]: [...board.tasks[quadrant], newTask],
        },
      }

      // ボード更新
      await updateBoard(user.uid, boardId, updatedBoard)

      // InboxTask を削除
      await deleteInboxTask(user.uid, task.id)

      // ローカル状態から削除
      setTasks(tasks.filter((t) => t.id !== task.id))
    } catch (error) {
      console.error('Error moving task:', error)
      setAlertModal({
        isOpen: true,
        title: 'エラー',
        message: 'タスクの移動に失敗しました',
        type: 'error',
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#37352f] mb-4">ログインが必要です</h1>
          <p className="text-[#787774]">Inbox 機能を使うにはログインしてください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="space-y-4 mb-8">
          {/* 機能説明カード */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-[12px] p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#37352f] mb-2 flex items-center gap-2">
                <span>📬</span>
                <span>AIでInboxを一括整理</span>
              </h2>
              <p className="text-sm text-[#787774] leading-relaxed">
                Gmailから集めたタスク候補を、AIが4象限（Q1〜Q4）にまとめて分類します。<br />
                整理後も、各タスクの象限はいつでも変更できます。
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#9b9a97] bg-white/50 rounded-[6px] px-3 py-2">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Gmail同期 → AI分類 → ボードに自動配置</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#37352f]">Inbox</h1>
              <p className="text-[#787774] mt-2">タスク候補を確認・整理</p>
            </div>
            <div className="flex items-center gap-3">
              <GmailConnectButton key={gmailConnectKey} />
              <button
                disabled={organizing || tasks.length === 0 || loading}
                onClick={handleOrganize}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[10px] hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {organizing ? '整理中...' : 'AIで整理する'}
              </button>
            </div>
          </div>

          {/* デフォルトボード選択 */}
          {boards.length > 0 && (
            <div className="bg-white border-2 border-[#e9e9e7] rounded-[12px] p-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-[#37352f]">
                  タスクの移動先ボード:
                </label>
                <select
                  value={defaultBoardId || ''}
                  onChange={(e) => handleSetDefaultBoard(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border-2 border-[#e9e9e7] rounded-[8px] focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {!defaultBoardId && <option value="">最新のボードを使用</option>}
                  {boards.map((board) => (
                    <option key={board.boardId} value={board.boardId}>
                      {board.title} {board.boardId === defaultBoardId && '(デフォルト)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* タスク一覧 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border-2 border-[#e9e9e7] rounded-[12px] p-12 text-center">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h2 className="text-xl font-semibold text-[#37352f] mb-2">Inbox は空です</h2>
            <p className="text-[#787774]">
              Gmail 同期が有効になると、ここにタスク候補が表示されます
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border-2 border-[#e9e9e7] rounded-[12px] p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-[8px] flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[#37352f] mb-2">{task.title}</h3>
                    <p className="text-sm text-[#787774] mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[#9b9a97] mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {new Date(task.createdAt).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="px-2 py-1 bg-[#f7f6f3] rounded-[4px]">{task.source}</span>
                    </div>

                    {/* 象限選択ボタン */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#9b9a97]">移動先:</span>
                      <button
                        onClick={() => handleMoveToQuadrant(task, 'Q1')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#ef4444] rounded-[6px] hover:bg-[#dc2626] transition-colors"
                      >
                        Q1 緊急重要
                      </button>
                      <button
                        onClick={() => handleMoveToQuadrant(task, 'Q2')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#3b82f6] rounded-[6px] hover:bg-[#2563eb] transition-colors"
                      >
                        Q2 重要
                      </button>
                      <button
                        onClick={() => handleMoveToQuadrant(task, 'Q3')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#f59e0b] rounded-[6px] hover:bg-[#d97706] transition-colors"
                      >
                        Q3 緊急
                      </button>
                      <button
                        onClick={() => handleMoveToQuadrant(task, 'Q4')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#10b981] rounded-[6px] hover:bg-[#059669] transition-colors"
                      >
                        Q4 その他
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
