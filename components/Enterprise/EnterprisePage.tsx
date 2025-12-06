'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'
import { PublicHeader } from '@/components/Layout/PublicHeader'
import { Footer } from '@/components/Layout/Footer'

export function EnterprisePage() {
  useEffect(() => {
    trackPageView('/enterprise')
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />

      {/* ヒーローセクション */}
      <section className="relative px-6 py-20 mx-auto max-w-7xl sm:py-32">
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-700 mb-6">
            企業向けプラン
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-tight">
            組織全体で
            <br />
            「重要と緊急」を揃える
          </h1>

          <p className="mt-8 text-lg leading-relaxed text-slate-600 max-w-3xl mx-auto">
            複数チームでの導入、カスタマイズ対応、専任サポートなど、
            <br className="hidden sm:block" />
            企業様のニーズに合わせた柔軟なプランをご用意しています。
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:contact@aisen.app?subject=企業用プランについて"
              className="px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              お問い合わせ
            </a>
            <Link
              href="/pricing"
              className="px-8 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-full hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] transition-all duration-150"
            >
              個人プランを見る
            </Link>
          </div>
        </div>
      </section>

      {/* 企業用プランの特徴 */}
      <section className="px-6 py-20 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">
            企業用プランで検討中の機能
          </h2>
          <p className="text-slate-600">
            御社のニーズに合わせてカスタマイズ可能です
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: '👥',
              title: 'チーム管理',
              description:
                'チーム単位でのボード共有や権限管理など、組織での利用を想定した機能をご相談ベースで開発します。',
            },
            {
              icon: '🛠️',
              title: 'カスタマイズ',
              description:
                '御社の業務フローやご要望に応じて、機能追加やカスタマイズの対応を検討します。',
            },
            {
              icon: '🎯',
              title: '導入支援',
              description:
                '初期セットアップや使い方のレクチャーなど、スムーズな導入をサポートします。',
            },
            {
              icon: '🔒',
              title: 'セキュリティ',
              description:
                '企業向けには専用のAWS環境を構築。IP制限やデータの保管場所など、御社のセキュリティポリシーに合わせた環境をご提案します。',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-150"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* こんな課題に */}
      <section className="px-6 py-20 mx-auto max-w-7xl bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">
            こんな課題をお持ちの企業様へ
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {[
            {
              title: '複数チームで優先順位の認識がバラバラ',
              description:
                'チームごとに「何が重要か」の基準が異なり、全社的なリソース配分が最適化できていない',
            },
            {
              title: 'メール対応に追われて戦略的な仕事ができない',
              description:
                '日々の問い合わせ対応に時間を取られ、中長期的に重要なプロジェクトが進まない',
            },
            {
              title: '既存ツールが複雑すぎて定着しない',
              description:
                '高機能なプロジェクト管理ツールを導入したものの、複雑で現場に浸透しない',
            },
          ].map((problem) => (
            <div
              key={problem.title}
              className="p-8 bg-slate-50 rounded-2xl border border-slate-200"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {problem.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 想定している利用シーン */}
      <section className="px-6 py-20 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">
            想定している利用シーン
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: 'スタートアップ・中小企業',
              description: '少人数でも効率的にタスク管理を回したい',
            },
            {
              title: '部署単位での導入',
              description: 'まずは特定部門で試験的に導入したい',
            },
            {
              title: 'リモートチーム',
              description: '場所を問わず優先順位を共有したい',
            },
            {
              title: 'プロジェクトベースの組織',
              description: '複数プロジェクトの優先度を可視化したい',
            },
          ].map((example, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-xl border border-slate-200"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {example.title}
              </h3>
              <p className="text-slate-600">{example.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 料金 */}
      <section className="px-6 py-20 mx-auto max-w-7xl bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">
            料金
          </h2>
          <p className="text-slate-600">
            まずはご要望をお聞かせください
          </p>
        </div>

        <div className="max-w-4xl mx-auto p-10 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              個別お見積もり
            </h3>
            <p className="text-slate-600 leading-relaxed">
              ユーザー数、必要な機能、カスタマイズ内容などを
              <br className="hidden sm:block" />
              ヒアリングさせていただいた上で、お見積もりいたします。
            </p>
          </div>

          <div className="text-center">
            <a
              href="mailto:contact@aisen.app?subject=企業用プランについて"
              className="inline-block px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              まずは相談する
            </a>
            <p className="mt-4 text-sm text-slate-500">
              お気軽にお問い合わせください
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            よくある質問
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              q: '個人向けProプランとの違いは？',
              a: '企業用プランでは、複数ユーザーでの利用を前提に、チーム管理機能やカスタマイズ対応などを検討します。まずはご要望をお聞かせください。',
            },
            {
              q: 'まだ正式リリース前ですが相談できますか？',
              a: 'はい、むしろ今の段階だからこそ、御社のニーズに合わせた機能開発を一緒に検討できます。お気軽にお問い合わせください。',
            },
            {
              q: '小規模でも相談できますか？',
              a: 'はい、人数や規模に関わらずご相談いただけます。御社に最適なプランをご提案させていただきます。',
            },
            {
              q: 'データのセキュリティは大丈夫ですか？',
              a: '企業向けには専用のAWS環境を構築します。IP制限、データの保管場所、バックアップ方針など、御社のセキュリティポリシーに合わせた環境を個別に設計いたします。',
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all duration-150"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {faq.q}
              </h3>
              <p className="text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 最終CTA */}
      <section className="relative px-6 py-20 mx-auto max-w-7xl bg-white">
        <div className="relative text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl leading-tight mb-8">
            まずはお気軽にご相談ください
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:contact@aisen.app?subject=企業用プランについて"
              className="px-10 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              お問い合わせ
            </a>
            <Link
              href="/s/DEMO"
              className="px-10 py-4 text-lg font-semibold text-slate-900 bg-white border border-gray-300 rounded-xl hover:border-[#1a1a1a] transition-all duration-200"
            >
              デモを見る
            </Link>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            ご不明な点がございましたら、いつでもお気軽にお問い合わせください
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
