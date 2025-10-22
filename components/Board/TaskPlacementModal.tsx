'use client'

import { useState } from 'react'
import type { Quadrant } from '@/lib/types'

interface TaskPlacementModalProps {
  isOpen: boolean
  taskTitle: string
  onClose: () => void
  onPlace: (quadrant: Quadrant) => void
}

export function TaskPlacementModal({ isOpen, taskTitle, onClose, onPlace }: TaskPlacementModalProps) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | null>(null)

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

  const handlePlace = () => {
    if (selectedQuadrant) {
      onPlace(selectedQuadrant)
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
          <h2 className="text-[16px] font-semibold text-[#37352f]">タスクの配置場所を選択</h2>
          <p className="text-[14px] text-[#787774] mt-1">「{taskTitle}」をどの象限に配置しますか？</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
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

          {/* AI Suggestion Section (Future) */}
          <div className="mt-4 p-4 bg-[#fafafa] rounded-[3px] border border-[#e9e9e7]">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#9b9a97] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-[12px] text-[#787774]">
                  AI提案機能は今後実装予定です。タスクの内容から最適な象限を提案します。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e9e9e7] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[14px] font-medium text-[#37352f] bg-white border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handlePlace}
            disabled={!selectedQuadrant}
            className="h-9 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[3px] hover:bg-[#1a73d1] active:bg-[#155cb3] disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
          >
            配置する
          </button>
        </div>
      </div>
    </div>
  )
}
