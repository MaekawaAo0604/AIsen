import { BoardPage } from '@/components/Board/BoardPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新しいボード | AIsen',
  description: '4象限マトリクスでタスクを管理',
  openGraph: {
    title: '新しいボード | AIsen',
    description: '4象限マトリクスでタスクを管理',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '新しいボード | AIsen',
    description: '4象限マトリクスでタスクを管理',
  },
}

export default function NewBoardPage() {
  return <BoardPage />
}
