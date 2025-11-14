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
    <div className="min-h-screen bg-[#ffffff]">
      <PublicHeader />
      {/* ヒーローセクション */}
      <section className="relative px-6 py-32 mx-auto max-w-7xl sm:py-40">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative text-center">
          {/* ロゴ・バッジ */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-blue-50 border border-blue-100 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">AI自動判定タスク管理</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-[#37352f] sm:text-6xl lg:text-7xl">
            重要と緊急を、
            <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x">
                迷わず仕分ける
              </span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 -z-0 opacity-40"></span>
            </span>
          </h1>

          <p className="mt-8 text-xl leading-relaxed text-[#787774] max-w-3xl mx-auto">
            タスクを入力した瞬間、AIが最適な象限に自動配置。
            <br className="hidden sm:block" />
            <span className="font-semibold text-[#37352f]">アイゼンハワー・マトリクス</span>で、あなたの時間を取り戻す。
          </p>

          {/* CTA */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/b/new"
              className="group relative px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[6px] hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10">無料で始める →</span>
              <div className="absolute inset-0 rounded-[6px] bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/s/DEMO?utm_source=lp&utm_medium=cta"
              className="px-8 py-4 text-lg font-semibold text-[#37352f] bg-white border-2 border-[#e9e9e7] rounded-[6px] hover:border-[#d3d3d1] hover:bg-[#f7f6f3] transition-all duration-200"
            >
              デモを見る
            </Link>
          </div>

          {/* スクリーンショット風プレビュー */}
          <div className="mt-20 relative">
            <div className="relative mx-auto max-w-5xl rounded-[12px] border-2 border-[#e9e9e7] shadow-2xl overflow-hidden bg-white">
              {/* ブラウザ風ヘッダー */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#f7f6f3] border-b border-[#e9e9e7]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                </div>
                <div className="flex-1 mx-4 px-3 py-1 bg-white border border-[#e9e9e7] rounded-[4px] text-xs text-[#9b9a97]">
                  aisen.app/b/new
                </div>
              </div>
              {/* 4象限ミニプレビュー */}
              <div className="grid grid-cols-2 gap-[1px] bg-[#e9e9e7] p-8">
                <div className="bg-[#fef2f2] p-6 rounded-[6px] border border-[#fecaca]">
                  <div className="text-sm font-bold text-[#991b1b] mb-2">Q1 今すぐやる</div>
                  <div className="space-y-2">
                    <div className="h-8 bg-white/80 rounded-[3px] border border-[#fca5a5]"></div>
                    <div className="h-8 bg-white/80 rounded-[3px] border border-[#fca5a5]"></div>
                  </div>
                </div>
                <div className="bg-[#eff6ff] p-6 rounded-[6px] border border-[#bfdbfe]">
                  <div className="text-sm font-bold text-[#1e40af] mb-2">Q2 計画してやる</div>
                  <div className="space-y-2">
                    <div className="h-8 bg-white/80 rounded-[3px] border border-[#93c5fd]"></div>
                  </div>
                </div>
                <div className="bg-[#fefce8] p-6 rounded-[6px] border border-[#fde047]">
                  <div className="text-sm font-bold text-[#854d0e] mb-2">Q3 誰かに任せる</div>
                  <div className="space-y-2">
                    <div className="h-8 bg-white/80 rounded-[3px] border border-[#fde047]"></div>
                  </div>
                </div>
                <div className="bg-[#f7f6f3] p-6 rounded-[6px] border border-[#e9e9e7]">
                  <div className="text-sm font-bold text-[#787774] mb-2">Q4 やらない</div>
                  <div className="h-8 bg-white/50 rounded-[3px] border border-[#d3d3d1]"></div>
                </div>
              </div>
            </div>
            {/* 装飾的な影 */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-b from-blue-400 to-purple-400"></div>
          </div>
        </div>
      </section>

      {/* 4象限詳細説明 - モダンカードスタイル */}
      <section id="features" className="px-6 py-24 mx-auto max-w-7xl bg-[#fafafa]">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#37352f] sm:text-5xl">
            4つの象限で、優先順位が明確に
          </h2>
          <p className="mt-4 text-lg text-[#787774]">
            アイゼンハワー・マトリクスによる科学的なタスク管理
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Q1 */}
          <div className="group p-8 bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-[#fca5a5] hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-[8px] flex items-center justify-center font-bold text-xl shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#37352f] mb-2">緊急×重要</h3>
                <p className="text-sm font-semibold text-[#991b1b]">今すぐやる</p>
              </div>
            </div>
            <p className="text-[#787774] leading-relaxed">
              今すぐ対応すべき最優先タスク。危機管理、締切直前の重要な作業、緊急の顧客対応など。
            </p>
            <div className="mt-4 pt-4 border-t border-[#e9e9e7]">
              <div className="text-sm text-[#9b9a97]">例：</div>
              <div className="mt-2 text-sm text-[#37352f]">• システム障害対応<br />• 重要会議の準備</div>
            </div>
          </div>

          {/* Q2 */}
          <div className="group p-8 bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-[#93c5fd] hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-[8px] flex items-center justify-center font-bold text-xl shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#37352f] mb-2">重要×非緊急</h3>
                <p className="text-sm font-semibold text-[#1e40af]">計画してやる</p>
              </div>
            </div>
            <p className="text-[#787774] leading-relaxed">
              長期的な成功の鍵。戦略立案、スキル向上、人間関係構築など、計画的に取り組むべきタスク。
            </p>
            <div className="mt-4 pt-4 border-t border-[#e9e9e7]">
              <div className="text-sm text-[#9b9a97]">例：</div>
              <div className="mt-2 text-sm text-[#37352f]">• 採用戦略の見直し<br />• 技術スタック改善</div>
            </div>
          </div>

          {/* Q3 */}
          <div className="group p-8 bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-[#fde047] hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-[8px] flex items-center justify-center font-bold text-xl shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#37352f] mb-2">緊急×非重要</h3>
                <p className="text-sm font-semibold text-[#854d0e]">誰かに任せる</p>
              </div>
            </div>
            <p className="text-[#787774] leading-relaxed">
              緊急だが重要度は低いタスク。可能な限り委任するか、効率的に処理すべき作業。
            </p>
            <div className="mt-4 pt-4 border-t border-[#e9e9e7]">
              <div className="text-sm text-[#9b9a97]">例：</div>
              <div className="mt-2 text-sm text-[#37352f]">• 社内アンケート回答<br />• 会議室予約</div>
            </div>
          </div>

          {/* Q4 */}
          <div className="group p-8 bg-white border-2 border-[#e9e9e7] rounded-[12px] hover:border-[#d3d3d1] hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-[8px] flex items-center justify-center font-bold text-xl shadow-lg">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#37352f] mb-2">非緊急×非重要</h3>
                <p className="text-sm font-semibold text-[#787774]">やらない</p>
              </div>
            </div>
            <p className="text-[#787774] leading-relaxed">
              後回しでよいタスク。時間の無駄になりがちな作業は、思い切って削減または排除する。
            </p>
            <div className="mt-4 pt-4 border-t border-[#e9e9e7]">
              <div className="text-sm text-[#9b9a97]">例：</div>
              <div className="mt-2 text-sm text-[#37352f]">• 過度なSNSチェック<br />• 無駄な会議</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Add機能 - インタラクティブデモ風 */}
      <section className="px-6 py-24 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-blue-50 border border-blue-100 rounded-full">
            <kbd className="px-2 py-1 text-sm font-mono font-bold bg-white border border-blue-200 rounded shadow-sm">Q</kbd>
            <span className="text-sm font-medium text-blue-700">キーボードショートカット</span>
          </div>
          <h2 className="text-4xl font-bold text-[#37352f] sm:text-5xl">
            入力するだけで、自動判定
          </h2>
          <p className="mt-4 text-lg text-[#787774]">
            AIが重要度・緊急度を分析し、最適な象限に配置します
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* モックアップフォーム */}
          <div className="bg-white border-2 border-[#e9e9e7] rounded-[12px] shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-[#e9e9e7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[8px] flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#37352f]">Quick Add</div>
                  <div className="text-xs text-[#787774]">タスクを自然言語で入力</div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* 例1 */}
              <div className="group">
                <div className="flex items-start gap-4 p-4 bg-[#fafafa] border-2 border-[#e9e9e7] rounded-[8px] hover:border-[#2383e2] transition-all">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-[#37352f] mb-2">今日中 社内アンケート回答</div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="px-3 py-1 bg-yellow-100 text-[#854d0e] rounded-full font-medium">
                        Q3: 緊急×非重要
                      </div>
                      <span className="text-[#9b9a97]">→ 誰かに任せる</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 例2 */}
              <div className="group">
                <div className="flex items-start gap-4 p-4 bg-[#fafafa] border-2 border-[#e9e9e7] rounded-[8px] hover:border-[#2383e2] transition-all">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-[#37352f] mb-2">今日中 顧客対応 緊急</div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="px-3 py-1 bg-red-100 text-[#991b1b] rounded-full font-medium">
                        Q1: 緊急×重要
                      </div>
                      <span className="text-[#9b9a97]">→ 今すぐやる</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 例3 */}
              <div className="group">
                <div className="flex items-start gap-4 p-4 bg-[#fafafa] border-2 border-[#e9e9e7] rounded-[8px] hover:border-[#2383e2] transition-all">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-[#37352f] mb-2">採用戦略の見直し</div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="px-3 py-1 bg-blue-100 text-[#1e40af] rounded-full font-medium">
                        Q2: 重要×非緊急
                      </div>
                      <span className="text-[#9b9a97]">→ 計画してやる</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 機能説明 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-[8px] mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-[#37352f]">即座に判定</div>
              <div className="text-xs text-[#9b9a97] mt-1">入力した瞬間に分析</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-[8px] mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-[#37352f]">自然言語対応</div>
              <div className="text-xs text-[#9b9a97] mt-1">日本語で自由に入力</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-[8px] mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-[#37352f]">自動整理</div>
              <div className="text-xs text-[#9b9a97] mt-1">最適な象限に配置</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - 強調セクション */}
      <section className="px-6 py-24 mx-auto max-w-7xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-[24px] p-12 sm:p-16 text-center">
          {/* 背景装飾 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              今すぐ始めて、時間を取り戻そう
            </h2>
            <p className="mt-6 text-xl text-blue-100">
              登録不要・完全無料で使えます
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                href="/b/new"
                className="px-10 py-5 text-lg font-bold text-blue-600 bg-white rounded-[8px] hover:bg-gray-50 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                無料で始める →
              </Link>
              <Link
                href="/s/DEMO?utm_source=lp&utm_medium=cta"
                className="px-10 py-5 text-lg font-bold text-white border-2 border-white/30 rounded-[8px] hover:bg-white/10 transition-all duration-200"
              >
                デモを見る
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              ✓ クレジットカード不要　✓ すぐに使える　✓ データはブラウザに保存
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* カスタムアニメーション用スタイル */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
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

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .bg-grid-white {
          background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  )
}
