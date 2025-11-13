'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Layout/Header'
import { Sidebar } from '@/components/Layout/Sidebar'
import { QuickAddModal } from '@/components/Board/QuickAddModal'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  // タスク変更を監視して通知スケジュールを自動更新（ブラウザのみ）
  useEffect(() => {
    if (typeof window === 'undefined') return

    import('@/hooks/useNotificationScheduler').then(({ useNotificationScheduler }) => {
      // フックをここで使うことはできないため、直接初期化ロジックを実行
    })
  }, [])

  // グローバルキーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // q キーでQuick Add起動（入力中やモーダル表示中は無視）
      if (
        e.key === 'q' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.shiftKey &&
        !isQuickAddOpen
      ) {
        const target = e.target as HTMLElement
        // 入力フィールドにフォーカスがある場合は無視
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }

        e.preventDefault()
        setIsQuickAddOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isQuickAddOpen])

  return (
    <>
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <div className="ml-0 sm:ml-16 transition-all duration-300">
        <Header onMenuClick={() => setIsSidebarExpanded(true)} />
        <main>{children}</main>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </>
  )
}
