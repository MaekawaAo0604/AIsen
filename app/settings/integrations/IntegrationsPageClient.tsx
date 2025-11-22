'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { GmailConnectButton } from '@/components/GmailConnectButton'
import { isPro } from '@/lib/utils'
import type { User } from '@/lib/types'
import Link from 'next/link'

export function IntegrationsPageClient() {
  const router = useRouter()
  const firebaseUser = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [userData, setUserData] = useState<User | null>(null)
  const [fetchingUser, setFetchingUser] = useState(true)

  // ログインチェック
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/')
    }
  }, [firebaseUser, isLoading, router])

  // ユーザーデータ取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser) {
        setFetchingUser(false)
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
        setFetchingUser(false)
      }
    }

    fetchUserData()
  }, [firebaseUser])

  if (isLoading || !firebaseUser || fetchingUser) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="text-[14px] text-[#787774]">読み込み中...</div>
      </div>
    )
  }

  const userIsPro = isPro(userData)

  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-[28px] sm:text-[36px] font-bold text-[#37352f] mb-2">
            連携設定
          </h1>
          <p className="text-[14px] text-[#787774]">
            外部サービスとの連携を管理します
          </p>
        </div>

        {/* プラン表示 */}
        <div className="mb-8 p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-semibold text-[#37352f]">
                  現在のプラン:
                </span>
                <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                  userIsPro
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {userIsPro ? 'Pro' : 'Free'}
                </span>
              </div>
              {!userIsPro && (
                <p className="text-[12px] text-[#787774]">
                  Gmail連携などの高度な機能は Pro プランで利用できます
                </p>
              )}
            </div>
            {!userIsPro && (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[14px] font-medium rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Pro にアップグレード
              </Link>
            )}
          </div>
        </div>

        {/* Gmail連携セクション */}
        <div className="space-y-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* ヘッダー */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"
                  />
                </svg>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#37352f]">
                    Gmail 連携
                  </h2>
                  <p className="text-[12px] text-[#787774]">
                    メールからタスクを自動収集
                  </p>
                </div>
                {userIsPro && (
                  <span className="ml-auto px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-bold rounded-full">
                    Pro
                  </span>
                )}
              </div>
            </div>

            {/* コンテンツ */}
            <div className="px-6 py-6">
              {/* 機能説明 */}
              <div className="mb-6 space-y-3">
                <h3 className="text-[14px] font-semibold text-[#37352f]">できること</h3>
                <ul className="space-y-2 text-[13px] text-[#787774]">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>15分ごとに Gmail の受信トレイを自動チェック</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>メールから TODO を自動抽出して Inbox に保存</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>AI が自動的にタスクを 4 象限に振り分け</span>
                  </li>
                </ul>
              </div>

              {/* 制限事項（Freeプランの場合） */}
              {!userIsPro && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-amber-900 mb-1">Free プランの制限</p>
                      <p className="text-[12px] text-amber-700">
                        Gmail 連携機能は Pro プラン専用です。アップグレードすると、メールからのタスク自動収集と AI 整理が利用できるようになります。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Gmail接続ボタン */}
              <div>
                <GmailConnectButton />
              </div>
            </div>
          </div>

          {/* 将来の連携プレビュー */}
          <div className="border border-slate-200 rounded-xl overflow-hidden opacity-50">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h2 className="text-[18px] font-semibold text-slate-400">
                    その他の連携
                  </h2>
                  <p className="text-[12px] text-slate-400">
                    近日公開予定
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-6">
              <p className="text-[13px] text-slate-400">
                Google カレンダー、Slack などの連携を準備中です
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
