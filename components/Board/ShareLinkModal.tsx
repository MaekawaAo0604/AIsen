'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useBoardStore } from '@/stores/useBoardStore'

interface ShareLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShareLinkModal({ isOpen, onClose }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false)
  const boardId = useBoardStore((state) => state.boardId)
  const pathname = usePathname()

  if (!isOpen) return null

  // 現在のボードIDを取得（URLから or stateから）
  const currentBoardId = pathname?.startsWith('/b/')
    ? pathname.split('/')[2]
    : boardId || crypto.randomUUID()

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/b/${currentBoardId}`
    : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-lg mx-4 border border-[#e9e9e7]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#37352f]">🔗 ボードを共有する</h2>
          <button
            onClick={onClose}
            className="text-[#9b9a97] hover:text-[#37352f] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          <p className="text-[14px] text-[#787774] leading-relaxed">
            このリンクを共有すると、誰でもこのボードを<strong className="text-[#37352f]">閲覧できます</strong>
            <br />
            （編集はできません）
          </p>

          {/* Link Display */}
          <div className="space-y-2">
            <label className="block text-[12px] font-semibold text-[#9b9a97] uppercase">
              共有リンク
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 h-10 px-3 text-[14px] text-[#37352f] bg-[#fafafa] border border-[#e9e9e7] rounded-[6px] focus:outline-none focus:border-[#2383e2]"
              />
              <button
                onClick={handleCopy}
                className={`h-10 px-4 text-[14px] font-medium rounded-[6px] transition-all ${
                  copied
                    ? 'bg-[#10b981] text-white'
                    : 'bg-[#2383e2] text-white hover:bg-[#1a73d1]'
                }`}
              >
                {copied ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    コピー済み
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    コピー
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Use Cases */}
          <div className="p-4 bg-[#f7f6f3] rounded-[6px] border border-[#e9e9e7]">
            <p className="text-[12px] font-semibold text-[#37352f] mb-2">💡 活用例</p>
            <ul className="space-y-1.5 text-[12px] text-[#787774]">
              <li className="flex items-start gap-2">
                <span className="text-[#2383e2] mt-0.5">•</span>
                <span>チームで進捗を共有</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2383e2] mt-0.5">•</span>
                <span>上司に状況報告</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2383e2] mt-0.5">•</span>
                <span>ポートフォリオとして公開</span>
              </li>
            </ul>
          </div>

          {/* Warning */}
          <div className="p-4 bg-[#fef2f2] rounded-[6px] border border-[#fecaca]">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#dc2626] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-[12px] font-semibold text-[#dc2626] mb-1">注意事項</p>
                <p className="text-[12px] text-[#991b1b]">
                  リンクを知っている人は誰でもボードを閲覧できます。機密情報を含むタスクには注意してください。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e9e9e7] flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 text-[14px] font-medium text-[#37352f] bg-white border border-[#e9e9e7] rounded-[6px] hover:bg-[#f7f6f3] transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
