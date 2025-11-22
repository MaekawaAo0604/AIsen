'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'
import { PublicHeader } from '@/components/Layout/PublicHeader'
import { Footer } from '@/components/Layout/Footer'

export function LandingPage() {
  useEffect(() => {
    trackPageView('/')
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* 背景のぼかし */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      </div>

      {/* ヘッダー */}
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
            AIsen
          </span>
          <span className="text-sm text-slate-400">Gmail × AI で自動整理</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            機能
          </a>
          <a href="/pricing" className="hover:text-white transition-colors">
            料金
          </a>
          <a
            href="/b/new"
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white transition-all shadow-lg hover:shadow-xl"
          >
            無料で始める
          </a>
        </nav>
      </header>

      {/* ヒーローセクション */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-16 md:flex-row md:items-center md:gap-16">
        {/* 左カラム：コピー */}
        <div className="flex-1">
          {/* タグライン */}
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300 border border-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gmail と AI で「今日やること」が5分で決まる
          </div>

          {/* H1 */}
          <h1 className="mt-4 text-balance text-4xl md:text-5xl font-semibold leading-tight text-slate-50">
            メールとタスクを、
            <span className="block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              朝5分で AI が仕分ける。
            </span>
          </h1>

          {/* 説明文 */}
          <p className="mt-6 max-w-xl text-sm md:text-base text-slate-300 leading-relaxed">
            AIsen は、Gmail からタスク候補を集めて、<br />
            アイゼンハワー・マトリクスに AI が一括で整理するタスク管理ツールです。<br />
            朝いちの「今日なにからやるか」を決める時間を短くします。
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href="/b/new"
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all hover:from-cyan-400 hover:to-blue-500"
            >
              無料で始める
            </a>
            <a
              href="/s/DEMO"
              className="rounded-lg border-2 border-slate-600 px-8 py-4 text-base font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-900/50 transition-all"
            >
              デモを見る
            </a>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            登録不要・クレジットカード不要・ブラウザだけで使えます
          </p>
        </div>

        {/* 右カラム：ボード風モック */}
        <div className="flex-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                今日の AIsen ボード
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                8 タスク整理済み
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                {
                  title: 'Q1 緊急×重要',
                  bg: 'bg-red-900/30',
                  border: 'border-red-800',
                  titleColor: 'text-red-200',
                  tasks: ['顧客A 見積り送付', 'バグ修正 PR レビュー']
                },
                {
                  title: 'Q2 重要',
                  bg: 'bg-blue-900/30',
                  border: 'border-blue-800',
                  titleColor: 'text-blue-200',
                  tasks: ['週次レビュー準備', '新機能設計書']
                },
                {
                  title: 'Q3 緊急だけ',
                  bg: 'bg-yellow-900/30',
                  border: 'border-yellow-800',
                  titleColor: 'text-yellow-200',
                  tasks: ['定例MTG資料']
                },
                {
                  title: 'Q4 その他',
                  bg: 'bg-slate-800/30',
                  border: 'border-slate-700',
                  titleColor: 'text-slate-300',
                  tasks: ['技術記事を読む']
                },
              ].map((q) => (
                <div
                  key={q.title}
                  className={`space-y-2 rounded-xl border ${q.border} ${q.bg} p-3 backdrop-blur`}
                >
                  <div className={`text-xs font-semibold ${q.titleColor} flex items-center justify-between`}>
                    <span>{q.title}</span>
                    <span className="text-slate-400">{q.tasks.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {q.tasks.slice(0, 2).map((task, i) => (
                      <div key={i} className="rounded-md bg-slate-800/80 px-2 py-2 text-[11px] text-slate-100">
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-4">
              <div className="flex-1">
                <p className="text-[11px] text-slate-400">
                  <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700">Q</kbd> キーでタスクを追加 → AI が自動判定
                </p>
              </div>
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-[10px] text-cyan-300 border border-cyan-800">
                AI 提案
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* こんな人のためのAIsen */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-50 md:text-4xl mb-4">
            こんな人のための AIsen
          </h2>
          <p className="text-slate-400">あなたのタスク管理、こんな悩みありませんか？</p>
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
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur hover:border-slate-700 hover:bg-slate-900/70 transition-all"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ビフォー/アフター */}
      <section id="features" className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-50 md:text-4xl mb-4">
            Before / After
          </h2>
          <p className="text-slate-400">メール地獄から、朝5分で今日のタスクが決まる世界へ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="rounded-xl border-2 border-red-900/50 bg-red-950/20 p-8 backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-900/50 px-3 py-1 text-xs text-red-300 mb-6">
              😰 Before
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-red-400">❌</span>
                <div>
                  <strong className="text-slate-200">朝：メールボックスを開く</strong>
                  <p className="text-xs text-slate-400 mt-1">未読が100件…どこから手をつければ…</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-400">❌</span>
                <div>
                  <strong className="text-slate-200">30分：読みながら ToDoリスト作成</strong>
                  <p className="text-xs text-slate-400 mt-1">重要なのか緊急なのか判断が難しい</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-400">❌</span>
                <div>
                  <strong className="text-slate-200">結局、重要な Q2 は後回し</strong>
                  <p className="text-xs text-slate-400 mt-1">緊急対応に追われて1日が終わる…</p>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="rounded-xl border-2 border-cyan-900/50 bg-cyan-950/20 p-8 backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-900/50 px-3 py-1 text-xs text-cyan-300 mb-6">
              ✨ After（AIsen）
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                <div>
                  <strong className="text-slate-200">朝：/inbox を開く</strong>
                  <p className="text-xs text-slate-400 mt-1">Gmail からのタスク候補が自動で並んでいる</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                <div>
                  <strong className="text-slate-200">「AI で整理する」ボタン → 一括振り分け</strong>
                  <p className="text-xs text-slate-400 mt-1">Q1〜Q4 に自動分類。最終判断はあなたのまま</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                <div>
                  <strong className="text-slate-200">今日やることが 5 分で決まる</strong>
                  <p className="text-xs text-slate-400 mt-1">Q2 の時間をちゃんと確保できる</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* コア機能3つ */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-50 md:text-4xl mb-4">
            AIsen のコア機能
          </h2>
          <p className="text-slate-400">メール × AI で、タスク管理を自動化</p>
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
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur hover:border-slate-700 hover:bg-slate-900/70 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{feature.icon}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  feature.badge === 'Pro'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 料金への導線 */}
      <section className="relative mx-auto w-full max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-10 backdrop-blur text-center">
          <h3 className="text-2xl font-bold text-slate-50 mb-4">
            個人利用は無料で始められます
          </h3>
          <p className="text-slate-400 mb-8">
            メール連携と AI 整理を使いたい人だけ、Pro へ。
          </p>
          <a
            href="/pricing"
            className="inline-block rounded-lg border-2 border-slate-600 px-8 py-3 text-base font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-800/50 transition-all"
          >
            料金プランを見る →
          </a>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-violet-700 p-16 text-center shadow-2xl">
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
                className="px-10 py-5 text-lg font-bold text-blue-600 bg-white rounded-lg hover:bg-gray-50 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
              >
                無料で始める →
              </a>
              <a
                href="/s/DEMO"
                className="px-10 py-5 text-lg font-bold text-white border-2 border-white/40 rounded-lg hover:bg-white/10 transition-all"
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
