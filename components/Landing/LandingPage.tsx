'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'
import { PublicHeader } from '@/components/Layout/PublicHeader'
import { Footer } from '@/components/Layout/Footer'
import { useAuthStore } from '@/lib/store/useAuthStore'

export function LandingPage() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    trackPageView('/')
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ヘッダー */}
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-bold text-white">
            AIsen
          </span>
          <span className="text-sm text-slate-600">Gmail × AI で自動整理</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <a href="#features" className="hover:text-slate-900 transition-colors">
            機能
          </a>
          <a href="/pricing" className="hover:text-slate-900 transition-colors">
            料金
          </a>
          {user ? (
            <a
              href="/boards"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              マイボード
            </a>
          ) : (
            <a
              href="/b/new"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              無料で始める
            </a>
          )}
        </nav>
      </header>

      {/* ヒーローセクション */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-16 md:flex-row md:items-center md:gap-16">
        {/* 左カラム：コピー */}
        <div className="flex-1">
          {/* タグライン */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-[11px] text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-500 animate-pulse" />
            Gmail と AI で「今日やること」が5分で決まる
          </div>

          {/* H1 */}
          <h1 className="mt-4 text-balance text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
            メールとタスクを、
            <span className="block text-blue-600">
              朝5分で AI が仕分ける。
            </span>
          </h1>

          {/* 説明文 */}
          <p className="mt-6 max-w-xl text-sm md:text-base text-slate-700 leading-relaxed">
            AIsen は、Gmail からタスク候補を集めて、<br />
            アイゼンハワー・マトリクスに AI が一括で整理するタスク管理ツールです。<br />
            朝いちの「今日なにからやるか」を決める時間を短くします。
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href="/b/new"
              className="rounded-full bg-blue-600 px-8 py-4 text-base font-bold text-white hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              無料で始める
            </a>
            <a
              href="/s/DEMO"
              className="rounded-full border border-slate-300 px-8 py-4 text-base font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] transition-all duration-150"
            >
              デモを見る
            </a>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            登録不要・クレジットカード不要・ブラウザだけで使えます
          </p>
        </div>

        {/* 右カラム：ボード風モック */}
        <div className="flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-2 w-2 rounded-full bg-lime-500" />
                今日の AIsen ボード
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 border border-slate-200">
                8 タスク整理済み
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                {
                  num: '1',
                  label: 'Q1',
                  title: '緊急×重要',
                  bg: 'bg-red-50',
                  border: 'border-red-200',
                  badgeBg: 'bg-red-600',
                  titleColor: 'text-red-700',
                  taskBg: 'bg-white',
                  taskBorder: 'border-red-100',
                  tasks: ['顧客A 見積り送付', 'バグ修正 PR レビュー']
                },
                {
                  num: '2',
                  label: 'Q2',
                  title: '重要',
                  bg: 'bg-blue-50',
                  border: 'border-blue-200',
                  badgeBg: 'bg-blue-600',
                  titleColor: 'text-blue-700',
                  taskBg: 'bg-white',
                  taskBorder: 'border-blue-100',
                  tasks: ['週次レビュー準備', '新機能設計書']
                },
                {
                  num: '3',
                  label: 'Q3',
                  title: '緊急だけ',
                  bg: 'bg-yellow-50',
                  border: 'border-yellow-200',
                  badgeBg: 'bg-yellow-600',
                  titleColor: 'text-yellow-700',
                  taskBg: 'bg-white',
                  taskBorder: 'border-yellow-100',
                  tasks: ['定例MTG資料']
                },
                {
                  num: '4',
                  label: 'Q4',
                  title: 'その他',
                  bg: 'bg-slate-50',
                  border: 'border-slate-200',
                  badgeBg: 'bg-slate-600',
                  titleColor: 'text-slate-600',
                  taskBg: 'bg-white',
                  taskBorder: 'border-slate-100',
                  tasks: ['技術記事を読む']
                },
              ].map((q) => (
                <div
                  key={q.label}
                  className={`space-y-2 rounded-xl border ${q.border} ${q.bg} p-3`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${q.titleColor}`}>
                      {q.title}
                    </span>
                    <span className="text-slate-400 text-[10px]">{q.tasks.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {q.tasks.slice(0, 2).map((task, i) => (
                      <div key={i} className={`rounded-md border ${q.taskBorder} ${q.taskBg} px-2 py-2 text-[11px] text-slate-700`}>
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4">
              <div className="flex-1">
                <p className="text-[11px] text-slate-500">
                  <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 border border-slate-200">Q</kbd> キーでタスクを追加 → AI が自動判定
                </p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-[10px] text-sky-600 border border-sky-200">
                AI 提案
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* こんな人のためのAIsen */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl mb-4">
            こんな人のための AIsen
          </h2>
          <p className="text-slate-600">あなたのタスク管理、こんな悩みありませんか？</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'フリーランス / 副業ワーカー',
              desc: 'クライアントごとのメール・タスク管理がごちゃつく人向け。',
              icon: '💼',
            },
            {
              title: 'リモート勤務の PM / リーダー',
              desc: 'Slack とメールから飛んでくる「お願いごと」を整理したい人向け。',
              icon: '👨‍💼',
            },
            {
              title: '自己投資をちゃんと回したい会社員',
              desc: '日々の雑務に押し流されず、Q2 の時間を確保したい人向け。',
              icon: '📚',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all duration-150"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ビフォー/アフター */}
      <section id="features" className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl mb-4">
            Before / After
          </h2>
          <p className="text-slate-600">メール地獄から、朝5分で今日のタスクが決まる世界へ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs text-red-700 mb-6">
              😰 Before
            </div>
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <span className="text-red-500">❌</span>
                <div>
                  <strong className="text-slate-900">朝：メールボックスを開く</strong>
                  <p className="text-xs text-slate-600 mt-1">未読が100件…どこから手をつければ…</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500">❌</span>
                <div>
                  <strong className="text-slate-900">30分：読みながら ToDoリスト作成</strong>
                  <p className="text-xs text-slate-600 mt-1">重要なのか緊急なのか判断が難しい</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500">❌</span>
                <div>
                  <strong className="text-slate-900">結局、重要な Q2 は後回し</strong>
                  <p className="text-xs text-slate-600 mt-1">緊急対応に追われて1日が終わる…</p>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs text-blue-700 mb-6">
              ✨ After（AIsen）
            </div>
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <span className="text-lime-500">✓</span>
                <div>
                  <strong className="text-slate-900">朝：/inbox を開く</strong>
                  <p className="text-xs text-slate-600 mt-1">Gmail からのタスク候補が自動で並んでいる</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lime-500">✓</span>
                <div>
                  <strong className="text-slate-900">「AI で整理する」ボタン → 一括振り分け</strong>
                  <p className="text-xs text-slate-600 mt-1">Q1〜Q4 に自動分類。最終判断はあなたのまま</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lime-500">✓</span>
                <div>
                  <strong className="text-slate-900">今日やることが 5 分で決まる</strong>
                  <p className="text-xs text-slate-600 mt-1">Q2 の時間をちゃんと確保できる</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* コア機能3つ */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl mb-4">
            AIsen のコア機能
          </h2>
          <p className="text-slate-600">メール × AI で、タスク管理を自動化</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              badge: 'Pro',
              title: 'Gmail インボックス連携',
              desc: '指定ラベルやスター付きメールだけを拾って、Inbox に自動でタスク候補として集めます。',
              icon: '📬',
            },
            {
              badge: 'Pro',
              title: 'AI による一括整理',
              desc: 'Inbox のタスクを AI が Q1〜Q4 に候補分類。結果はワンクリックで修正できるので、最終判断はあなたのまま。',
              icon: '🤖',
            },
            {
              badge: 'Free でも',
              title: 'q キーで即追加',
              desc: 'ブラウザ上で q キーを押して、日本語で打つだけ。「今日中」「顧客」「緊急」などから自動で象限を判定。',
              icon: '⌨️',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all duration-150"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{feature.icon}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  feature.badge === 'Pro'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 料金への導線 */}
      <section className="relative mx-auto w-full max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            個人利用は無料で始められます
          </h3>
          <p className="text-slate-600 mb-8">
            メール連携と AI 整理を使いたい人だけ、Pro へ。
          </p>
          <a
            href="/pricing"
            className="inline-block rounded-full border border-slate-300 px-8 py-3 text-base font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] transition-all duration-150"
          >
            料金プランを見る →
          </a>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-16 text-center shadow-lg">
          <div className="absolute inset-0 bg-grid-white opacity-10"></div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white md:text-5xl mb-6">
              まずは、今日のタスクを
              <br />
              5分で整理してみませんか？
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              登録不要・完全無料で使えます
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/b/new"
                className="px-10 py-5 text-lg font-bold text-blue-600 bg-white rounded-full hover:bg-slate-50 hover:shadow-md active:scale-[0.98] transition-all duration-150"
              >
                無料で始める →
              </a>
              <a
                href="/s/DEMO"
                className="px-10 py-5 text-lg font-bold text-white border border-white/30 rounded-full hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
              >
                デモを見る
              </a>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              ✓ クレジットカード不要　✓ すぐに使える　✓ データはブラウザに保存
            </p>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .bg-grid-white {
          background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  )
}
