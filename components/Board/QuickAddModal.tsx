'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useBoardStore } from '@/stores/useBoardStore'
import { parseQuick } from '@/lib/parseQuick'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const addTask = useBoardStore((state) => state.addTask)

  // モーダルが開いたら自動フォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    const startTime = performance.now()

    try {
      // parseQuick関数で自動解析
      const parsed = parseQuick(input)

      // タスク追加
      addTask(parsed.quadrant, {
        title: parsed.title,
        notes: `緊急度: ${parsed.isUrgent ? '高' : '低'} / 重要度: ${parsed.isImportant ? '高' : '低'}`,
        due: parsed.due ? parsed.due.toISOString() : null,
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      // パフォーマンス計測（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Quick Add] 処理時間: ${duration.toFixed(2)}ms`)
        console.log('[Quick Add] 解析結果:', {
          quadrant: parsed.quadrant,
          isUrgent: parsed.isUrgent,
          isImportant: parsed.isImportant,
          due: parsed.due?.toLocaleString('ja-JP'),
        })
      }

      // リセットして閉じる
      setInput('')
      onClose()
    } catch (error) {
      console.error('[Quick Add] エラー:', error)
      alert('タスクの追加に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <label
                htmlFor="quick-add-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                タスクを素早く追加
              </label>
              <input
                ref={inputRef}
                id="quick-add-input"
                type="text"
                data-testid="quick-add-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='例: 明日17時 見積り送付 至急'
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
            </div>

            <div className="text-xs text-gray-500 space-y-1 mb-4">
              <p>💡 入力のヒント:</p>
              <ul className="ml-4 space-y-0.5">
                <li>• 日付: 今日、明日、明後日、12/25</li>
                <li>• 時刻: 17時、17時30分、17:30</li>
                <li>• 緊急: 至急、緊急、今すぐ、今日中</li>
                <li>• 重要: 重要、戦略、採用、品質、本番、顧客</li>
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                Enter で追加 / Esc でキャンセル
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isProcessing}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '追加中...' : '追加'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
