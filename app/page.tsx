import { LandingPage } from '@/components/Landing/LandingPage'

export const metadata = {
  title: 'AIsen - 自動仕分けタスク管理',
  description: '重要と緊急を自動判定。4象限マトリクスで時間を取り戻す。',
  openGraph: {
    title: 'AIsen - 自動仕分けタスク管理',
    description: '重要と緊急を自動判定。4象限マトリクスで時間を取り戻す。',
    type: 'website',
  },
}

export default function Home() {
  return <LandingPage />
}
