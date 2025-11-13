import { LandingPage } from '@/components/Landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AIsen - 自動仕分けタスク管理',
  description: '重要と緊急を自動判定。4象限マトリクスで時間を取り戻す。',
  keywords: ['タスク管理', 'アイゼンハワーマトリクス', '優先順位', '時間管理', '生産性'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AIsen - 自動仕分けタスク管理',
    description: '重要と緊急を自動判定。4象限マトリクスで時間を取り戻す。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'AIsen',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'AIsen - 自動仕分けタスク管理',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIsen - 自動仕分けタスク管理',
    description: '重要と緊急を自動判定。4象限マトリクスで時間を取り戻す。',
    images: ['/api/og'],
  },
}

export default function Home() {
  return <LandingPage />
}
