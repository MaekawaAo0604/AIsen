'use client'

import { useState } from 'react'

interface SaveBoardModalProps {
  isOpen: boolean
  currentTitle: string
  onSave: (title: string) => void
  onClose: () => void
}

export function SaveBoardModal({ isOpen, currentTitle, onSave, onClose }: SaveBoardModalProps) {
  const [title, setTitle] = useState(currentTitle || '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSave(title.trim())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-md mx-4 border border-[#e9e9e7]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7]">
          <h2 className="text-[16px] font-semibold text-[#37352f]">ボードを保存</h2>
          <p className="text-[13px] text-[#787774] mt-1">ボードに名前をつけて保存します</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label className="block text-[13px] font-medium text-[#37352f] mb-2">
              ボード名
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: プロジェクトタスク管理"
              className="w-full h-10 px-3 text-[14px] text-[#37352f] placeholder:text-[#9b9a97] bg-white border border-[#e9e9e7] rounded-[3px] focus:outline-none focus:border-[#2383e2] transition-colors"
              autoFocus
              required
            />
            <p className="text-[12px] text-[#9b9a97] mt-2">
              後から変更することもできます
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#e9e9e7] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-[14px] font-medium text-[#37352f] bg-white border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="h-9 px-4 text-[14px] font-medium text-white bg-[#10b981] rounded-[3px] hover:bg-[#059669] active:bg-[#047857] disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
