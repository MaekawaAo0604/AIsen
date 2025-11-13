import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '設定 | AIsen',
  description: '通知設定を管理',
  openGraph: {
    title: '設定 | AIsen',
    description: '通知設定を管理',
    type: 'website',
  },
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
