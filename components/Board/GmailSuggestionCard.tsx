'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useBoardStore } from '@/stores/useBoardStore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User } from '@/lib/types'

export function GmailSuggestionCard() {
  const user = useAuthStore((state) => state.user)
  const tasks = useBoardStore((state) => state.tasks)
  const [isGmailConnected, setIsGmailConnected] = useState(false)
  const [isCheckingGmail, setIsCheckingGmail] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  // Gmail連携状態をチェック
  useEffect(() => {
    const checkGmailConnection = async () => {
      if (!user) {
        setIsCheckingGmail(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data() as User | undefined
        setIsGmailConnected(!!userData?.gmailToken)
      } catch (error) {
        console.error('Failed to check Gmail connection:', error)
      } finally {
        setIsCheckingGmail(false)
      }
    }

    checkGmailConnection()
  }, [user])

  // localStorageで非表示設定をチェック
  useEffect(() => {
    const dismissed = localStorage.getItem('gmail_suggestion_dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('gmail_suggestion_dismissed', 'true')
  }

  // タスク総数を計算
  const totalTasks = Object.values(tasks).flat().length

  // 表示条件: Gmail未連携 && タスク3件以上 && 非表示設定なし && ユーザーログイン中
  if (
    isCheckingGmail ||
    !user ||
    isGmailConnected ||
    totalTasks < 3 ||
    isDismissed
  ) {
    return null
  }

  return (
    <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative">
      {/* 閉じるボタン */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="閉じる"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-sky-600" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"
            />
          </svg>
        </div>

        {/* テキスト */}
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="font-semibold text-[#37352f] mb-1 text-sm">
            Gmail連携で、もっと便利に
          </h4>
          <p className="text-xs text-[#666666] mb-3 leading-relaxed">
            メールからタスクを自動収集できます。
            Proプランで利用可能です。
          </p>
          <Link
            href="/settings/integrations"
            className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
          >
            <span>連携設定を見る</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
