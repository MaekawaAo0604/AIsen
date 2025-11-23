'use client'

import { useState, useEffect } from 'react'

export function OnboardingGuide() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // localStorageで非表示設定をチェック
    const isDismissed = localStorage.getItem('onboarding_dismissed')
    if (!isDismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('onboarding_dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl relative">
      {/* 閉じるボタン */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="閉じる"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-lg font-bold text-[#37352f]">
            AIsenの使い方 - 3ステップ
          </h3>
        </div>
        <p className="text-sm text-[#666666]">
          最初の3分で、タスク管理の基本をマスターしましょう
        </p>
      </div>

      {/* ステップリスト */}
      <div className="space-y-4">
        {/* ステップ1 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#37352f] mb-1">
              Inboxに書き出す
            </h4>
            <p className="text-sm text-[#666666]">
              画面右のInboxに、思いついたタスクをどんどん書き出してください。
              まずは頭の中を空っぽにしましょう。
            </p>
          </div>
        </div>

        {/* ステップ2 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#37352f] mb-1">
              4象限にドラッグ
            </h4>
            <p className="text-sm text-[#666666]">
              Inboxのタスクをクリックして、「重要度」と「緊急度」で4つの象限に振り分けます。
              Q1（緊急×重要）から優先的に取り組みましょう。
            </p>
          </div>
        </div>

        {/* ステップ3 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#37352f] mb-1">
              AIとブレインストーミング
            </h4>
            <p className="text-sm text-[#666666]">
              タスクをクリックして「AIブレインストーミング」を選択すると、
              対話を通じて最適な象限を一緒に考えることができます。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
