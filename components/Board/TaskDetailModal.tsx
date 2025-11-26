'use client'

import { createPortal } from 'react-dom'
import type { Task } from '@/lib/types'

interface TaskDetailModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
}

export function TaskDetailModal({ isOpen, task, onClose }: TaskDetailModalProps) {
  if (!isOpen || !task) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-2xl mx-4 border border-[#e9e9e7]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-[16px] font-semibold text-[#37352f]">
                {task.title}
              </h2>
              {task.priority !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1 text-[11px] font-semibold rounded-md border ${
                      task.priority >= 80
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : task.priority >= 60
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : task.priority >= 40
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    優先度: {task.priority}
                  </span>
                  {task.completed && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-[#10b981] text-white rounded-[3px]">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      完了
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#9b9a97] hover:text-[#37352f] p-1 rounded-[3px] hover:bg-[#f7f6f3] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* AI判定理由 */}
          {task.aiReason && (
            <div className="p-4 bg-[#fafafa] rounded-[3px] border border-[#e9e9e7]">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#2383e2] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-[#37352f] mb-1">AI判定理由</p>
                  <p className="text-[13px] text-[#787774] leading-[1.5]">{task.aiReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* サブタスク・詳細 */}
          {task.notes && (
            <div>
              <h3 className="text-[13px] font-semibold text-[#37352f] mb-2">詳細・サブタスク</h3>
              <div className="p-4 bg-[#fafafa] rounded-[3px] border border-[#e9e9e7]">
                <p className="text-[14px] text-[#37352f] leading-[1.6] whitespace-pre-wrap">
                  {task.notes}
                </p>
              </div>
            </div>
          )}

          {/* タスク情報 */}
          <div className="pt-4 border-t border-[#e9e9e7] space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-[#787774]">
              <span className="font-medium text-[#37352f]">作成日:</span>
              <span>{new Date(task.createdAt).toLocaleString('ja-JP')}</span>
            </div>
            {task.due && (
              <div className="flex items-center gap-2 text-[13px] text-[#787774]">
                <span className="font-medium text-[#37352f]">期限:</span>
                <span>{new Date(task.due).toLocaleString('ja-JP')}</span>
              </div>
            )}
            {task.completed && task.completedAt && (
              <div className="flex items-center gap-2 text-[13px] text-[#787774]">
                <span className="font-medium text-[#37352f]">完了日:</span>
                <span>{new Date(task.completedAt).toLocaleString('ja-JP')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e9e9e7] flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[3px] hover:bg-[#1a73d1] active:bg-[#155cb3] transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
