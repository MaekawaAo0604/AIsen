'use client'

import { useEffect, useState } from 'react'
import { MatrixBoard } from '@/components/Board/MatrixBoard'
import { trackPageView, trackShareView, trackShareClick } from '@/lib/analytics'
import type { TasksByQuadrant } from '@/lib/demo-data'
import Link from 'next/link'

interface SharePageClientProps {
  token: string
  initialTasks: TasksByQuadrant
  isDemo: boolean
  utmSource?: string
  utmMedium?: string
}

export function SharePageClient({
  token,
  initialTasks,
  isDemo,
  utmSource,
  utmMedium,
}: SharePageClientProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [hasTrackedView, setHasTrackedView] = useState(false)

  // 初回表示時のイベント計測（1回のみ）
  useEffect(() => {
    if (!hasTrackedView) {
      trackPageView(`/s/${token}`)
      trackShareView({ board_id: token })
      setHasTrackedView(true)
    }
  }, [hasTrackedView, token])

  // 共有リンクをコピー
  const handleCopyShareLink = async () => {
    const shareUrl = `${window.location.origin}/s/${token}?utm_source=share&utm_medium=copy`

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)

      // コピーイベント計測
      trackShareClick({ board_id: token })

      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const totalTasks = Object.values(initialTasks).flat().length

  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-6 lg:px-24 py-6 sm:py-12">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#37352f] leading-tight tracking-tight">
              {isDemo ? 'AIsen デモボード' : '共有ボード'}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#787774]">
              {isDemo
                ? `重要と緊急を自動判定。4象限マトリクスで時間を取り戻す。（${totalTasks}件のタスク）`
                : `${totalTasks}件のタスク - 読み取り専用`}
            </p>
          </div>

          {/* 共有ボタン */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyShareLink}
              className="px-4 py-2 text-[14px] font-medium text-[#37352f] bg-white border border-[#e3e2e0] rounded-lg hover:bg-[#f7f6f3] transition-colors"
            >
              {copySuccess ? '✓ コピーしました' : '🔗 共有リンクをコピー'}
            </button>

            {isDemo && (
              <Link
                href="/b/new"
                className="px-4 py-2 text-[14px] font-medium text-white bg-[#2383e2] rounded-lg hover:bg-[#1a6cc1] transition-colors"
              >
                自分のボードを作る
              </Link>
            )}
          </div>
        </div>

        {/* デモ注意書き */}
        {isDemo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-[14px] text-blue-900">
              <strong>💡 デモモード:</strong>{' '}
              このボードは読み取り専用です。タスクの追加や編集はできません。{' '}
              <Link href="/b/new" className="underline font-medium">
                自分のボードを作成
              </Link>
              して、実際にお試しください。
            </p>
          </div>
        )}

        {/* Matrix Board (read-only) */}
        <MatrixBoard readOnly initialTasks={initialTasks} />
      </div>
    </div>
  )
}
