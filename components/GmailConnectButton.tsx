'use client'

import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { doc, getDoc } from 'firebase/firestore'
import { functions, db } from '@/lib/firebase'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { isPro } from '@/lib/utils'
import type { User } from '@/lib/types'
import Link from 'next/link'

export function GmailConnectButton() {
  const firebaseUser = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [checking, setChecking] = useState(true)
  const [userData, setUserData] = useState<User | null>(null)

  // Gmail連携状態とユーザーデータをチェック
  useEffect(() => {
    const checkConnection = async () => {
      if (!firebaseUser) {
        setChecking(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        const data = userDoc.data() as User | undefined
        if (data) {
          setUserData(data)
        }
        setIsConnected(!!data?.gmailToken?.refresh_token)
      } catch (err) {
        console.error('Connection check error:', err)
      } finally {
        setChecking(false)
      }
    }

    checkConnection()
  }, [firebaseUser])

  const handleConnect = async () => {
    if (!firebaseUser) {
      setError('ログインが必要です')
      return
    }

    // Proプランチェック
    if (!isPro(userData)) {
      setError('Gmail連携はProプラン専用です')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Cloud FunctionでOAuth URLを取得
      const getAuthUrl = httpsCallable<{}, { authUrl: string }>(
        functions,
        'getGmailAuthUrl'
      )
      const result = await getAuthUrl()

      // OAuth同意画面へリダイレクト
      window.location.href = result.data.authUrl
    } catch (err: any) {
      console.error('Gmail連携エラー:', err)
      setError(err.message || 'Gmail連携に失敗しました')
      setLoading(false)
    }
  }

  if (!firebaseUser) {
    return null
  }

  if (checking) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        確認中...
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Gmail連携済み
        </div>
        <p className="text-xs text-gray-500">
          15分ごとに自動的にメールが同期されます
        </p>
      </div>
    )
  }

  // Freeプランの場合は案内を表示
  if (!isPro(userData)) {
    return (
      <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900">Gmail連携はProプラン専用です</h3>
        <p className="text-sm text-blue-700">
          メールからタスクを自動で収集して、AIで一括整理する機能はProプランで利用できます。
        </p>
        <Link
          href="/pricing"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          料金プランを見る
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"
          />
        </svg>
        {loading ? '接続中...' : 'Gmailと連携'}
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
