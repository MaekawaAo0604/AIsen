'use client'

import { useAuthStore } from '@/lib/store/useAuthStore'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import type { User } from '@/lib/types'

export function SubscriptionSettings() {
  const firebaseUser = useAuthStore((state) => state.user)
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser) {
        setIsLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        const data = userDoc.data() as User | undefined
        if (data) {
          setUserData(data)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [firebaseUser])

  const handleManageSubscription = async () => {
    if (!userData?.stripeCustomerId) {
      alert('サブスクリプション情報が見つかりません')
      return
    }

    setIsRedirecting(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userData.stripeCustomerId,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error)
      alert('エラーが発生しました。もう一度お試しください。')
      setIsRedirecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">サブスクリプション</h2>
        <p className="text-slate-600">読み込み中...</p>
      </div>
    )
  }

  const currentPlan = userData?.plan || 'free'
  const isPro = currentPlan === 'pro'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">サブスクリプション</h2>

      {/* 現在のプラン */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">現在のプラン</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isPro
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {isPro ? 'Pro プラン' : 'Free プラン'}
          </span>
        </div>

        {isPro && userData?.subscriptionCurrentPeriodEnd && (
          <p className="text-sm text-slate-600">
            次回更新日: {new Date(userData.subscriptionCurrentPeriodEnd.seconds * 1000).toLocaleDateString('ja-JP')}
          </p>
        )}
      </div>

      {/* プラン詳細 */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">
          {isPro ? 'Pro プランの特典' : 'Free プランの制限'}
        </h3>
        <ul className="space-y-1 text-sm text-slate-700">
          {isPro ? (
            <>
              <li>✅ Gmail連携（無制限）</li>
              <li>✅ AI一括分類（無制限）</li>
              <li>✅ ボード共有機能</li>
              <li>✅ 優先サポート</li>
            </>
          ) : (
            <>
              <li>❌ Gmail連携は利用不可</li>
              <li>❌ AI一括分類は利用不可</li>
              <li>✅ 基本的なタスク管理</li>
              <li>✅ 手動タスク追加</li>
            </>
          )}
        </ul>
      </div>

      {/* アクションボタン */}
      <div className="space-y-3">
        {isPro ? (
          <>
            <button
              onClick={handleManageSubscription}
              disabled={isRedirecting}
              className="w-full px-6 py-3 text-center font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? '移動中...' : 'サブスクリプションを管理'}
            </button>
            <p className="text-xs text-slate-600 text-center">
              支払い方法の変更、キャンセル、領収書の確認などができます
            </p>
          </>
        ) : (
          <>
            <a
              href="/pricing"
              className="block w-full px-6 py-3 text-center font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              Pro プランにアップグレード
            </a>
            <p className="text-xs text-slate-600 text-center">
              月額¥500で全機能をご利用いただけます
            </p>
          </>
        )}
      </div>
    </div>
  )
}
