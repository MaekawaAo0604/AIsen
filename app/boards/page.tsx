import { BoardsPageClient } from './BoardsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'マイボード | AIsen',
  description: '保存されたボードの一覧',
}

export default function BoardsPage() {
  return <BoardsPageClient />
}
