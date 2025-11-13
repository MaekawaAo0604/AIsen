import { notFound } from 'next/navigation'
import { getDemoTasksByQuadrant, isDemoToken } from '@/lib/demo-data'
import { SharePageClient } from './SharePageClient'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ token: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// OG画像をタスク数付きで動的生成
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { token } = await params
  const utm = await searchParams

  if (!isDemoToken(token)) {
    return {
      title: '共有ボード - AIsen',
      description: 'タスクボードを共有しています',
    }
  }

  const tasks = getDemoTasksByQuadrant()
  const totalTasks = Object.values(tasks).flat().length

  return {
    title: `AIsen デモボード - ${totalTasks}件のタスク`,
    description: '自動仕分けタスク管理 AIsen のデモボード。重要と緊急を自動判定、4象限マトリクスで優先順位を可視化。',
    keywords: ['タスク管理', 'アイゼンハワーマトリクス', '優先順位', '時間管理', '生産性', 'デモ'],
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    openGraph: {
      title: `AIsen デモボード - ${totalTasks}件のタスク`,
      description: '自動仕分けタスク管理 AIsen のデモ。重要と緊急を自動判定、4象限マトリクスで優先順位を可視化。',
      type: 'website',
      locale: 'ja_JP',
      siteName: 'AIsen',
      images: [
        {
          url: `/api/og?title=AIsen デモボード&tasks=${totalTasks}`,
          width: 1200,
          height: 630,
          alt: `AIsen デモボード - ${totalTasks}件のタスク`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `AIsen デモボード - ${totalTasks}件のタスク`,
      description: '自動仕分けタスク管理 AIsen のデモ。重要と緊急を自動判定。',
      images: [`/api/og?title=AIsen デモボード&tasks=${totalTasks}`],
    },
  }
}

// SSR: デモデータを即座に返す（読み込み中なし）
export default async function SharePage({ params, searchParams }: Props) {
  const { token } = await params
  const utm = await searchParams

  // デモトークン以外は404（将来の実装用）
  if (!isDemoToken(token)) {
    notFound()
  }

  // SSRでタスクを取得（デモなので即座に返す）
  const tasks = getDemoTasksByQuadrant()

  // UTMパラメータを抽出
  const utmSource = typeof utm.utm_source === 'string' ? utm.utm_source : undefined
  const utmMedium = typeof utm.utm_medium === 'string' ? utm.utm_medium : undefined

  return (
    <SharePageClient
      token={token}
      initialTasks={tasks}
      isDemo={true}
      utmSource={utmSource}
      utmMedium={utmMedium}
    />
  )
}
