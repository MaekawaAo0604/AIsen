'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { ShareLinkModal } from '@/components/Board/ShareLinkModal'

export function Header() {
  const user = useAuthStore((state) => state.user)
  const isPro = user?.entitlements?.pro ?? false
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AIsen</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* 共有ボタン */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 h-9 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[6px] hover:bg-[#1a73d1] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                共有
              </button>

              {isPro && (
                <span className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 text-sm font-semibold text-white">
                  Pro
                </span>
              )}
              {user && (
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <ShareLinkModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </>
  )
}
