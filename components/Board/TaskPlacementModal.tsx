'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useBrainstormUsageStore } from '@/lib/store/useBrainstormUsageStore'
import type { Quadrant } from '@/lib/types'
import { BrainstormChat } from './BrainstormChat'

interface TaskPlacementModalProps {
  isOpen: boolean
  taskTitle?: string
  onClose: () => void
  onPlace: (quadrant: Quadrant, title: string, subtasks: string, dueDate: string | null, priority?: number, aiReason?: string) => void
}

export function TaskPlacementModal({ isOpen, taskTitle: initialTaskTitle, onClose, onPlace }: TaskPlacementModalProps) {
  const user = useAuthStore((state) => state.user)
  const { remaining, limit, userIsPro, isLoading, fetchUsage } = useBrainstormUsageStore()
  const [taskTitle, setTaskTitle] = useState(initialTaskTitle || '')
  const [subtasks, setSubtasks] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | null>(null)
  const [isBrainstorming, setIsBrainstorming] = useState(false)

  // モーダルが開いたときにusageを取得
  useEffect(() => {
    if (isOpen && user) {
      fetchUsage(user.uid)
    }
  }, [isOpen, user, fetchUsage])

  if (!isOpen) return null

  const quadrants: Array<{ id: Quadrant; title: string; description: string; color: string }> = [
    {
      id: 'q1',
      title: 'Q1: 今すぐやる',
      description: '重要かつ緊急',
      color: 'bg-[#fef2f2] border-[#dc2626] hover:bg-[#fee2e2]',
    },
    {
      id: 'q2',
      title: 'Q2: 計画してやる',
      description: '重要だが緊急ではない',
      color: 'bg-[#eff6ff] border-[#2563eb] hover:bg-[#dbeafe]',
    },
    {
      id: 'q3',
      title: 'Q3: 誰かに任せる',
      description: '緊急だが重要ではない',
      color: 'bg-[#fefce8] border-[#ca8a04] hover:bg-[#fef9c3]',
    },
    {
      id: 'q4',
      title: 'Q4: やらない',
      description: '重要でも緊急でもない',
      color: 'bg-[#fafafa] border-[#6b7280] hover:bg-[#f3f4f6]',
    },
  ]

  const handleBrainstormComplete = (result: {
    quadrant: Quadrant
    priority: number
    reason: string
  }) => {
    // ブレインストーミング完了後、自動的にタスクを配置してモーダルを閉じる
    onPlace(
      result.quadrant,
      taskTitle.trim(),
      subtasks.trim(),
      dueDate ? new Date(dueDate).toISOString() : null,
      result.priority,
      result.reason
    )
    // 状態をリセット
    setTaskTitle('')
    setSubtasks('')
    setDueDate('')
    setSelectedQuadrant(null)
    setIsBrainstorming(false)
  }

  const handlePlace = () => {
    if (selectedQuadrant && taskTitle.trim()) {
      onPlace(
        selectedQuadrant,
        taskTitle.trim(),
        subtasks.trim(),
        dueDate ? new Date(dueDate).toISOString() : null
      )
      setTaskTitle('')
      setSubtasks('')
      setDueDate('')
      setSelectedQuadrant(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-2xl mx-4 border border-[#e9e9e7]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7]">
          <h2 className="text-[16px] font-semibold text-[#37352f]">
            {isBrainstorming ? 'AIとブレインストーミング中' : 'タスクの配置場所を選択'}
          </h2>
          <p className="text-[14px] text-[#787774] mt-1">
            {isBrainstorming
              ? 'AIとの対話を通じて、最適な配置を見つけましょう'
              : `「${taskTitle}」をどの象限に配置しますか？`}
          </p>
        </div>

        {/* Content */}
        <div className={isBrainstorming ? '' : 'p-6'}>
          {isBrainstorming ? (
            <BrainstormChat
              taskTitle={taskTitle}
              onComplete={handleBrainstormComplete}
              onCancel={() => setIsBrainstorming(false)}
            />
          ) : (
            <>
              {/* タイトル入力フィールド */}
              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[#37352f] mb-2">
                  タスクのタイトル
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="例: プロジェクトの提案書を作成"
                  className="w-full h-9 px-3 text-[14px] text-[#37352f] placeholder:text-[#9b9a97] bg-[#ffffff] border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] focus:outline-none focus:bg-[#ffffff] focus:border-[#2383e2] transition-colors"
                  autoFocus
                />
              </div>

              {/* サブタスク入力フィールド */}
              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[#37352f] mb-2">
                  詳細・サブタスク（任意）
                </label>
                <textarea
                  value={subtasks}
                  onChange={(e) => setSubtasks(e.target.value)}
                  placeholder="例: 目次作成、予算見積もり、スケジュール調整"
                  className="w-full h-20 px-3 py-2 text-[14px] text-[#37352f] placeholder:text-[#9b9a97] bg-[#ffffff] border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] focus:outline-none focus:bg-[#ffffff] focus:border-[#2383e2] transition-colors resize-none"
                />
              </div>

              {/* 期限入力フィールド */}
              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[#37352f] mb-2">
                  期限（任意）
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-9 px-3 text-[14px] text-[#37352f] bg-[#ffffff] border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] focus:outline-none focus:bg-[#ffffff] focus:border-[#2383e2] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {quadrants.map((quadrant) => (
                  <button
                    key={quadrant.id}
                    onClick={() => setSelectedQuadrant(quadrant.id)}
                    className={`${quadrant.color} p-4 rounded-[3px] border-2 transition-all text-left ${
                      selectedQuadrant === quadrant.id
                        ? 'border-[#2383e2] ring-2 ring-[#2383e2]/20'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="text-[14px] font-semibold text-[#37352f] mb-1">{quadrant.title}</div>
                    <div className="text-[12px] text-[#787774]">{quadrant.description}</div>
                  </button>
                ))}
              </div>

              {/* AI Brainstorm Section */}
              <div className="p-4 bg-[#fafafa] rounded-[3px] border border-[#e9e9e7] space-y-3">
                {/* 残り回数表示（Freeユーザーのみ） */}
                {!userIsPro && (
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[12px] font-medium">
                        {isLoading ? '読み込み中...' : `今日の残り: ${remaining === -1 ? 'ー' : remaining} / ${limit}`}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsBrainstorming(true)}
                  disabled={!taskTitle.trim()}
                  className="w-full flex items-center justify-center gap-2 h-9 px-4 text-[14px] font-medium text-[#37352f] bg-white border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] disabled:bg-[#fafafa] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  AIとブレインストーミングする
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isBrainstorming && (
          <div className="px-6 py-4 border-t border-[#e9e9e7] flex justify-end gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 text-[14px] font-medium text-[#37352f] bg-white border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handlePlace}
              disabled={!selectedQuadrant || !taskTitle.trim()}
              className="h-9 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[3px] hover:bg-[#1a73d1] active:bg-[#155cb3] disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
            >
              配置する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
