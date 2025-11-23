'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import posthog from 'posthog-js'
import { trackPageView } from '@/lib/analytics'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { PublicHeader } from '@/components/Layout/PublicHeader'
import { Footer } from '@/components/Layout/Footer'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import type { User } from '@/lib/types'

type Plan = 'free' | 'pro' | 'team'

export function PricingPage() {
  const firebaseUser = useAuthStore((state) => state.user)
  const [userData, setUserData] = useState<User | null>(null)
  const [hasScrolledToCompare, setHasScrolledToCompare] = useState(false)
  const compareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    trackPageView('/pricing')
    posthog.capture('pricing_view', {})
  }, [])

  // Firestoreからユーザーデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser) {
        setUserData(null)
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
      }
    }

    fetchUserData()
  }, [firebaseUser])

  // スクロール監視
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasScrolledToCompare) {
            posthog.capture('pricing_scroll_compare', { reached: true })
            setHasScrolledToCompare(true)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (compareRef.current) {
      observer.observe(compareRef.current)
    }

    return () => observer.disconnect()
  }, [hasScrolledToCompare])

  const handleCTAClick = (plan: string, action: string) => {
    posthog.capture('pricing_click_cta', { plan, action })
  }

  // ユーザーの現在プラン
  const currentPlan = userData ? (userData.plan || 'free') : 'free'

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* ログインユーザー向け: 戻るボタン */}
      {firebaseUser && (
        <div className="px-6 pt-6 mx-auto max-w-7xl">
          <Link
            href="/boards"
            className="inline-flex items-center gap-1 text-[14px] text-[#666666] hover:text-[#1a1a1a] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            マイボードに戻る
          </Link>
        </div>
      )}

      {/* ヒーローセクション */}
      <section className="relative px-6 py-20 mx-auto max-w-7xl sm:py-32">
        <div className="relative text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#1a1a1a] sm:text-5xl lg:text-6xl leading-tight">
            個人は無料ではじめて、
            <br />
            仕事で効かせたい人だけProへ
          </h1>

          <p className="mt-8 text-lg leading-relaxed text-[#666666] max-w-3xl mx-auto">
            Gmail連携・AI整理まではPro。
            <br className="hidden sm:block" />
            まずはブラウザだけで4象限を試せます。
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/b/new"
              onClick={() => handleCTAClick('free', 'start')}
              className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              無料で始める
            </Link>
            <button
              onClick={() => {
                handleCTAClick('pro', 'view')
                document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-4 text-base font-semibold text-[#1a1a1a] bg-white border border-[#d0d0d0] rounded-xl hover:border-[#1a1a1a] transition-all duration-200"
            >
              Proの機能を見る
            </button>
          </div>
        </div>
      </section>

      {/* プランカードセクション */}
      <section id="plans" className="px-6 py-20 mx-auto max-w-7xl bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="relative p-8 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              {currentPlan === 'free' && firebaseUser && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                  現在のプラン
                </div>
              )}
              <h3 className="text-2xl font-bold text-[#1a1a1a]">Free</h3>
              <div className="mt-6">
                <span className="text-5xl font-bold text-[#1a1a1a]">¥0</span>
                <span className="text-[#666666]"> / 月</span>
              </div>
              <p className="mt-4 text-[#666666] leading-relaxed">
                個人のタスク整理を、まずは無料で
              </p>

              <ul className="mt-10 space-y-4">
                {[
                  'ボード：2枚まで',
                  '基本的な4象限タスク管理',
                  'Quick Add（ルールベース判定）',
                  '基本ショートカット',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#1a1a1a]">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Gmail連携・AI整理は使えません</strong>
                </p>
              </div>

              <Link
                href="/b/new"
                onClick={() => handleCTAClick('free', 'start')}
                className="block mt-8 w-full px-6 py-3 text-center font-semibold text-[#1a1a1a] bg-white border border-gray-300 rounded-xl hover:border-[#1a1a1a] transition-all duration-200"
              >
                無料で使ってみる
              </Link>

              <p className="mt-4 text-sm text-[#666666] text-center">
                クレジットカード不要
              </p>
            </div>

            {/* Pro */}
            <div className="relative p-8 bg-white rounded-xl shadow-sm border-2 border-blue-600 hover:shadow-md transition-all duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full">
                おすすめ
              </div>
              {currentPlan === 'pro' && firebaseUser && (
                <div className="absolute -top-3 right-4 px-4 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                  現在のプラン
                </div>
              )}
              <h3 className="text-2xl font-bold text-[#1a1a1a]">Pro</h3>
              <div className="mt-6">
                <span className="text-5xl font-bold text-[#1a1a1a]">ベータ版</span>
              </div>
              <p className="mt-2 text-sm text-[#666666]">
                価格は現在調整中
              </p>
              <p className="mt-4 text-[#666666] leading-relaxed">
                メール・予定から全部4象限にまとめたい人向け
              </p>

              <ul className="mt-10 space-y-4">
                {[
                  'ボード数：無制限',
                  'Gmail からのタスク自動取り込み',
                  'Inbox のタスクを AI で一括整理（Q1〜Q4 自動振り分け）',
                  'タスクエクスポート（CSV / Markdown）',
                  '週次サマリ機能（予定）',
                  'Googleカレンダー連携（予定）',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#1a1a1a]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTAClick('pro', 'waitlist')}
                className="block mt-8 w-full px-6 py-3 text-center font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                Proの提供開始を通知してほしい
              </button>

              <p className="mt-4 text-sm text-[#666666] text-center">
                ※個人利用向け。まずはFreeで試してから検討してください
              </p>
            </div>
          </div>

          {/* Team プラン案内（将来用） */}
          <div className="mt-12 p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Team プラン</h3>
            <p className="text-[#666666] mb-6 leading-relaxed">
              チームの「重要と緊急」を揃えたい人向け - 近日公開予定
            </p>
            <button
              onClick={() => handleCTAClick('team', 'interest')}
              className="px-6 py-2 text-sm font-semibold text-[#1a1a1a] bg-white border border-gray-300 rounded-lg hover:border-[#1a1a1a] transition-all duration-200"
            >
              興味がある
            </button>
          </div>
        </div>
      </section>

      {/* 機能比較表セクション */}
      <section ref={compareRef} className="px-6 py-20 mx-auto max-w-7xl bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#1a1a1a] sm:text-4xl">
            機能比較
          </h2>
          <p className="mt-4 text-lg text-[#666666]">
            何が無料で、何でお金取るのか
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1a1a1a]">機能</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#1a1a1a]">Free</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#1a1a1a]">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { feature: 'ボード数', free: '2枚まで', pro: '無制限' },
                { feature: 'Quick Add（ルールベース）', free: '✔', pro: '✔' },
                { feature: 'Gmail 同期', free: '—', pro: '✔' },
                { feature: 'Inbox AI 整理', free: '—', pro: '✔' },
                { feature: 'カレンダー連携', free: '—', pro: '予定' },
                { feature: '週次サマリ', free: '—', pro: '予定' },
                { feature: 'データエクスポート', free: '—', pro: '✔' },
              ].map((row) => (
                <tr key={row.feature} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-[#1a1a1a] font-medium">{row.feature}</td>
                  <td className="px-6 py-4 text-sm text-[#666666] text-center">{row.free}</td>
                  <td className="px-6 py-4 text-sm text-[#666666] text-center">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQセクション */}
      <section className="px-6 py-20 mx-auto max-w-4xl bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#1a1a1a] sm:text-4xl">
            よくある質問
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              q: '無料プランに利用期限はありますか？',
              a: 'ありません。ボード2枚までの機能制限内であれば、ずっと無料でご利用いただけます。',
            },
            {
              q: 'Proプランはいつから利用できますか？',
              a: '現在ベータ版として開発中です。提供開始時にお知らせを受け取りたい方は、Proカードの「Proの提供開始を通知してほしい」ボタンからご登録ください。',
            },
            {
              q: 'Gmail連携やAI整理機能は無料では使えませんか？',
              a: '申し訳ございません。Gmail同期とAI一括整理機能はProプラン専用です。まずは基本的なボード機能を無料でお試しいただき、必要性を感じられたらProをご検討ください。',
            },
            {
              q: '個人情報やタスクのデータはどこに保存されますか？',
              a: 'タスクデータはFirebase（Google Cloud Platform）の日本リージョンに保存されます。セキュリティとプライバシーを最優先に設計しています。',
            },
          ].map((faq) => (
            <div key={faq.q} className="p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3">
                {faq.q}
              </h3>
              <p className="text-[#666666] leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 最終CTAセクション */}
      <section className="relative px-6 py-20 mx-auto max-w-7xl bg-white">
        <div className="relative text-center">
          <h2 className="text-3xl font-bold text-[#1a1a1a] sm:text-4xl leading-tight">
            まずは、今日のタスクを
            <br />
            4象限に並べてみてください
          </h2>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/b/new"
              onClick={() => handleCTAClick('free', 'start')}
              className="px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              無料で始める
            </Link>
            <Link
              href="/s/DEMO"
              onClick={() => handleCTAClick('free', 'demo')}
              className="px-10 py-4 text-lg font-semibold text-[#1a1a1a] bg-white border border-gray-300 rounded-xl hover:border-[#1a1a1a] transition-all duration-200"
            >
              デモボードをもう一度見る
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
