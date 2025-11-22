'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import posthog from 'posthog-js'
import { trackPageView } from '@/lib/analytics'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { PublicHeader } from '@/components/Layout/PublicHeader'
import { Footer } from '@/components/Layout/Footer'

type Plan = 'free' | 'pro' | 'team'

export function PricingPage() {
  const user = useAuthStore((state) => state.user)
  const [hasScrolledToCompare, setHasScrolledToCompare] = useState(false)
  const compareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    trackPageView('/pricing')
    posthog.capture('pricing_view', {})
  }, [])

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
  const currentPlan = user ? (user.plan || 'free') : 'free'

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <PublicHeader />
      {/* ヒーローセクション */}
      <section className="relative px-6 py-20 mx-auto max-w-7xl sm:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#37352f] sm:text-5xl lg:text-6xl">
            個人は無料ではじめて、
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
              仕事で効かせたい人だけProへ
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-[#787774] max-w-3xl mx-auto">
            Gmail連携・AI整理まではPro。
            <br className="hidden sm:block" />
            まずはブラウザだけで4象限を試せます。
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/b/new"
              onClick={() => handleCTAClick('free', 'start')}
              className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[12px] hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              無料で始める
            </Link>
            <button
              onClick={() => {
                handleCTAClick('pro', 'view')
                document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-4 text-base font-semibold text-[#37352f] bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-[#37352f] transition-all duration-200"
            >
              Proの機能を見る
            </button>
          </div>
        </div>
      </section>

      {/* プランカードセクション */}
      <section id="plans" className="px-6 py-20 mx-auto max-w-7xl">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="relative p-8 bg-white border-2 border-[#e9e9e7] rounded-[16px] hover:shadow-lg transition-all duration-300">
              {currentPlan === 'free' && user && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                  現在のプラン
                </div>
              )}
              <h3 className="text-2xl font-bold text-[#37352f]">Free</h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-[#37352f]">¥0</span>
                <span className="text-[#787774]"> / 月</span>
              </div>
              <p className="mt-4 text-[#787774]">
                個人のタスク整理を、まずは無料で
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  'ボード：2枚まで',
                  '基本的な4象限タスク管理',
                  'Quick Add（ルールベース判定）',
                  '基本ショートカット',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#37352f]">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Gmail連携・AI整理は使えません</strong>
                </p>
              </div>

              <Link
                href="/b/new"
                onClick={() => handleCTAClick('free', 'start')}
                className="block mt-8 w-full px-6 py-3 text-center font-semibold text-[#37352f] bg-white border-2 border-[#e9e9e7] rounded-[10px] hover:border-[#37352f] transition-all duration-200"
              >
                無料で使ってみる
              </Link>

              <p className="mt-4 text-sm text-[#787774] text-center">
                クレジットカード不要
              </p>
            </div>

            {/* Pro */}
            <div className="relative p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-[16px] shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full">
                おすすめ
              </div>
              {currentPlan === 'pro' && user && (
                <div className="absolute -top-3 right-4 px-4 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                  現在のプラン
                </div>
              )}
              <h3 className="text-2xl font-bold text-[#37352f]">Pro</h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-[#37352f]">ベータ版</span>
              </div>
              <p className="mt-2 text-sm text-[#787774]">
                価格は現在調整中
              </p>
              <p className="mt-4 text-[#787774]">
                メール・予定から全部4象限にまとめたい人向け
              </p>

              <ul className="mt-8 space-y-4">
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
                    <span className="text-[#37352f]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTAClick('pro', 'waitlist')}
                className="block mt-8 w-full px-6 py-3 text-center font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[10px] hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Proの提供開始を通知してほしい
              </button>

              <p className="mt-4 text-sm text-[#787774] text-center">
                ※個人利用向け。まずはFreeで試してから検討してください
              </p>
            </div>
          </div>

          {/* Team プラン案内（将来用） */}
          <div className="mt-12 p-6 bg-gray-50 border-2 border-gray-200 rounded-[16px] text-center">
            <h3 className="text-xl font-bold text-[#37352f] mb-2">Team プラン</h3>
            <p className="text-[#787774] mb-4">
              チームの「重要と緊急」を揃えたい人向け - 近日公開予定
            </p>
            <button
              onClick={() => handleCTAClick('team', 'interest')}
              className="px-6 py-2 text-sm font-semibold text-[#37352f] bg-white border-2 border-[#e9e9e7] rounded-[8px] hover:border-[#37352f] transition-all duration-200"
            >
              興味がある
            </button>
          </div>
        </div>
      </section>

      {/* 機能比較表セクション */}
      <section ref={compareRef} className="px-6 py-20 mx-auto max-w-7xl bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#37352f] sm:text-4xl">
            機能比較
          </h2>
          <p className="mt-4 text-lg text-[#787774]">
            何が無料で、何でお金取るのか
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white border-2 border-[#e9e9e7] rounded-[16px] overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-[#e9e9e7]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#37352f]">機能</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#37352f]">Free</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#37352f]">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9e9e7]">
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
                  <td className="px-6 py-4 text-sm text-[#37352f] font-medium">{row.feature}</td>
                  <td className="px-6 py-4 text-sm text-[#787774] text-center">{row.free}</td>
                  <td className="px-6 py-4 text-sm text-[#787774] text-center">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQセクション */}
      <section className="px-6 py-20 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#37352f] sm:text-4xl">
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
            <div key={faq.q} className="p-6 bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-blue-200 transition-all duration-200">
              <h3 className="text-lg font-semibold text-[#37352f] mb-3">
                {faq.q}
              </h3>
              <p className="text-[#787774] leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 最終CTAセクション */}
      <section className="relative px-6 py-20 mx-auto max-w-7xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <div className="relative text-center">
          <h2 className="text-3xl font-bold text-[#37352f] sm:text-4xl">
            まずは、今日のタスクを
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              4象限に並べてみてください
            </span>
          </h2>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/b/new"
              onClick={() => handleCTAClick('free', 'start')}
              className="px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[12px] hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              無料で始める
            </Link>
            <Link
              href="/s/DEMO"
              onClick={() => handleCTAClick('free', 'demo')}
              className="px-10 py-4 text-lg font-semibold text-[#37352f] bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-[#37352f] transition-all duration-200"
            >
              デモボードをもう一度見る
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
              className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[12px] hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              無料で始める
            </Link>
            <button
              onClick={() => {
                handleCTAClick('pro', 'view')
                document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-4 text-base font-semibold text-[#37352f] bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-[#37352f] transition-all duration-200"
            >
              Proの機能を見る
            </button>
          </div>
        </div>
      </section>

      {/* プランカードセクション */}
      <section id="plans" className="px-6 py-20 mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Free */}
          <div className="relative p-8 bg-white border-2 border-[#e9e9e7] rounded-[16px] hover:shadow-lg transition-all duration-300">
            {currentPlan === 'free' && user && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                現在のプラン
              </div>
            )}
            <h3 className="text-2xl font-bold text-[#37352f]">Free</h3>
            <div className="mt-4">
              <span className="text-5xl font-bold text-[#37352f]">¥0</span>
              <span className="text-[#787774]"> / 月</span>
            </div>
            <p className="mt-4 text-[#787774]">
              個人のタスク整理を、まずは無料で
            </p>

            <ul className="mt-8 space-y-4">
              {[
                '4象限ボード：1ボード',
                'Quick Add（ルールベース判定）',
                '基本ショートカット',
                'ローカル保存（ブラウザ単位）',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#37352f]">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/b/new"
              onClick={() => handleCTAClick('free', 'start')}
              className="block mt-8 w-full px-6 py-3 text-center font-semibold text-[#37352f] bg-white border-2 border-[#e9e9e7] rounded-[10px] hover:border-[#37352f] transition-all duration-200"
            >
              無料で使ってみる
            </Link>

            <p className="mt-4 text-sm text-[#787774] text-center">
              クレジットカード不要
            </p>
          </div>

          {/* Personal Pro */}
          <div className="relative p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-[16px] shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full">
              おすすめ
            </div>
            <h3 className="text-2xl font-bold text-[#37352f]">Personal Pro</h3>
            <div className="mt-4">
              <span className="text-5xl font-bold text-[#37352f]">Coming soon</span>
            </div>
            <p className="mt-4 text-[#787774]">
              メール・予定・レビューまで、全部4象限にまとめる人向け
            </p>

            <ul className="mt-8 space-y-4">
              {[
                'ボード数：無制限',
                'Gmailからのタスク取り込み（手動）',
                'メール本文から自動で4象限に仮置き',
                'Googleカレンダー連携（Q1/Q2のみ予定化）',
                '週次サマリ（放置Q2の通知など）',
                'データエクスポート（CSV / Markdown）',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#37352f]">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCTAClick('pro', 'waitlist')}
              className="block mt-8 w-full px-6 py-3 text-center font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[10px] hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Proの提供開始を通知してほしい
            </button>

            <p className="mt-4 text-sm text-[#787774] text-center">
              ※個人利用向け。チームで使いたい場合はお問い合わせください
            </p>
          </div>

          {/* Team */}
          <div className="relative p-8 bg-white border-2 border-[#e9e9e7] rounded-[16px] hover:shadow-lg transition-all duration-300">
            <h3 className="text-2xl font-bold text-[#37352f]">Team</h3>
            <div className="mt-4">
              <span className="text-3xl font-bold text-[#787774]">近日公開</span>
            </div>
            <p className="mt-4 text-[#787774]">
              チームの「重要と緊急」を揃えたい人向け
            </p>

            <ul className="mt-8 space-y-4">
              {[
                '共有ボード',
                'チームテンプレ（開発／営業など）',
                'チームダッシュボード（Q1/Q3のバランス可視化）',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#787774]">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCTAClick('team', 'contact')}
              className="block mt-8 w-full px-6 py-3 text-center font-semibold text-[#37352f] bg-white border-2 border-[#e9e9e7] rounded-[10px] hover:border-[#37352f] transition-all duration-200"
            >
              興味がある
            </button>
          </div>
        </div>
      </section>

      {/* 機能比較表セクション */}
      <section ref={compareRef} className="px-6 py-20 mx-auto max-w-7xl bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#37352f] sm:text-4xl">
            機能比較
          </h2>
          <p className="mt-4 text-lg text-[#787774]">
            何が無料で、何でお金取るのか
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white border-2 border-[#e9e9e7] rounded-[16px] overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-[#e9e9e7]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#37352f]">機能</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#37352f]">Free</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#37352f]">Personal Pro</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#37352f]">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9e9e7]">
              {[
                { feature: 'ボード数', free: '1ボード', pro: '無制限', team: '無制限' },
                { feature: 'Quick Add（ルールベース）', free: '✔', pro: '✔', team: '✔' },
                { feature: 'AI判定（LLM使用）', free: '—', pro: '✔', team: '✔' },
                { feature: 'Gmail取り込み', free: '—', pro: '✔', team: '✔' },
                { feature: 'カレンダー連携', free: '—', pro: '✔', team: '✔' },
                { feature: '日次/週次サマリ', free: '—', pro: '✔', team: '✔' },
                { feature: 'データエクスポート', free: '—', pro: '✔', team: '✔' },
                { feature: 'チーム共有', free: '—', pro: '—', team: '準備中' },
              ].map((row) => (
                <tr key={row.feature} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-[#37352f] font-medium">{row.feature}</td>
                  <td className="px-6 py-4 text-sm text-[#787774] text-center">{row.free}</td>
                  <td className="px-6 py-4 text-sm text-[#787774] text-center">{row.pro}</td>
                  <td className="px-6 py-4 text-sm text-[#787774] text-center">{row.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQセクション */}
      <section className="px-6 py-20 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#37352f] sm:text-4xl">
            よくある質問
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              q: '無料プランに利用期限はありますか？',
              a: 'ありません。機能制限内であれば、ずっと無料でご利用いただけます。',
            },
            {
              q: '個人情報やタスクのデータはどこに保存されますか？',
              a: 'タスクデータはFirebase（Google Cloud Platform）の日本リージョンに保存されます。無料プランではブラウザのローカルストレージにも保存されます。',
            },
            {
              q: 'Proプランはいつから利用できますか？',
              a: '現在開発中です。提供開始時にお知らせを受け取りたい方は、Proカードの「Proの提供開始を通知してほしい」ボタンからご登録ください。',
            },
            {
              q: 'チームプランはどんなチーム向けですか？',
              a: '5〜50人規模の開発チーム・営業チーム・プロジェクトチームなどを想定しています。共有ボードやチームダッシュボードで、チーム全体の優先順位を可視化します。',
            },
          ].map((faq) => (
            <div key={faq.q} className="p-6 bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-blue-200 transition-all duration-200">
              <h3 className="text-lg font-semibold text-[#37352f] mb-3">
                {faq.q}
              </h3>
              <p className="text-[#787774] leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 最終CTAセクション */}
      <section className="relative px-6 py-20 mx-auto max-w-7xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <div className="relative text-center">
          <h2 className="text-3xl font-bold text-[#37352f] sm:text-4xl">
            まずは、今日のタスクを
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              4象限に並べてみてください
            </span>
          </h2>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/b/new"
              onClick={() => handleCTAClick('free', 'start')}
              className="px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[12px] hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              無料で始める
            </Link>
            <Link
              href="/s/DEMO"
              onClick={() => handleCTAClick('free', 'demo')}
              className="px-10 py-4 text-lg font-semibold text-[#37352f] bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-[#37352f] transition-all duration-200"
            >
              デモボードをもう一度見る
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
