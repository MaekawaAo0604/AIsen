'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { getInboxTasks, deleteInboxTask, convertInboxTaskToTask } from '@/lib/inboxStorage'
import { getOrCreateDefaultBoard, updateBoard } from '@/lib/boardStorage'
import type { InboxTask, InboxQuadrant, Quadrant } from '@/lib/types'

export function InboxPage() {
  const user = useAuthStore((state) => state.user)
  const [tasks, setTasks] = useState<InboxTask[]>([])
  const [loading, setLoading] = useState(true)
  const [organizing, setOrganizing] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchTasks = async () => {
      try {
        const inboxTasks = await getInboxTasks(user.uid, 'INBOX')
        setTasks(inboxTasks)
      } catch (error) {
        console.error('Error fetching inbox tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [user])

  const handleOrganize = async () => {
    if (!user) return

    setOrganizing(true)
    try {
      const res = await fetch('/api/inbox/organize', {
        method: 'POST',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to organize tasks')
      }

      // 結果を反映（リロード）
      const inboxTasks = await getInboxTasks(user.uid, 'INBOX')
      setTasks(inboxTasks)
    } catch (error) {
      console.error('Error organizing inbox:', error)
      alert('タスクの整理に失敗しました')
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
      alert('タスクの移動に失敗しました')
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#37352f]">Inbox</h1>
            <p className="text-[#787774] mt-2">Gmail から取り込んだタスクを AI で整理</p>
          </div>
          <button
            disabled={organizing || tasks.length === 0 || loading}
            onClick={handleOrganize}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[10px] hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {organizing ? '整理中...' : 'AIで整理する'}
          </button>
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
    </div>
  )
}
