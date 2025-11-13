'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'

export function LandingPage() {
  useEffect(() => {
    trackPageView('/')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ヒーローセクション */}
      <section className="relative px-6 py-24 mx-auto max-w-7xl sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            重要と緊急を、
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              迷わず仕分ける
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl max-w-2xl mx-auto">
            タスクを入れた瞬間、自動で正しい場所へ。
            <br />
            <strong className="text-gray-900">AIsen</strong>で、あなたの時間を取り戻す。
          </p>

          {/* CTA */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/b/new"
              className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            >
              無料で始める
            </Link>
            <button
              onClick={() => {
                // デモボードへスクロール
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              デモを見る
            </button>
          </div>
        </div>
      </section>

      {/* 4象限ボード説明 */}
      <section id="demo" className="px-6 py-16 mx-auto max-w-7xl lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            アイゼンハワー・マトリクス
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            緊急度×重要度で、優先順位を可視化
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Q1 */}
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900">緊急×重要</h3>
            </div>
            <p className="text-gray-700">
              今すぐ対応すべきタスク。危機管理や締切直前の作業。
            </p>
          </div>

          {/* Q2 */}
          <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900">重要×非緊急</h3>
            </div>
            <p className="text-gray-700">
              計画的に取り組むべきタスク。戦略立案や自己投資。
            </p>
          </div>

          {/* Q3 */}
          <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900">緊急×非重要</h3>
            </div>
            <p className="text-gray-700">
              他者に委任できるタスク。中断対応や急ぎの雑務。
            </p>
          </div>

          {/* Q4 */}
          <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900">非緊急×非重要</h3>
            </div>
            <p className="text-gray-700">
              後回しでよいタスク。暇つぶしや無駄な会議。
            </p>
          </div>
        </div>
      </section>

      {/* Quick Add機能紹介 */}
      <section className="px-6 py-16 mx-auto max-w-7xl lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            <kbd className="px-3 py-1 text-2xl font-mono bg-gray-200 rounded">q</kbd> キーで即座に追加
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            日本語で入力するだけ。自動で適切な象限に配置されます。
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <code className="text-lg text-gray-800">明日17時 見積り送付 至急</code>
                <p className="text-sm text-gray-600 mt-1">→ Q3（緊急×非重要）に自動配置</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <code className="text-lg text-gray-800">今日中 顧客対応 緊急</code>
                <p className="text-sm text-gray-600 mt-1">→ Q1（緊急×重要）に自動配置</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <code className="text-lg text-gray-800">採用戦略の見直し</code>
                <p className="text-sm text-gray-600 mt-1">→ Q2（重要×非緊急）に自動配置</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 mx-auto max-w-7xl lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            今すぐ始めて、時間を取り戻そう
          </h2>
          <p className="mt-4 text-lg opacity-90">
            登録不要・無料で使えます
          </p>
          <Link
            href="/b/new"
            className="inline-block mt-8 px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-lg hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all"
          >
            無料で始める
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="px-6 py-8 mx-auto max-w-7xl lg:px-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div>© 2025 AIsen. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">
              利用規約
            </Link>
            <a
              href="https://github.com/MaekawaAo0604/AIsen"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
