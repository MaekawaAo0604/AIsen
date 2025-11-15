import { Suspense } from 'react'
import { InboxPage } from '@/components/Inbox/InboxPage'

export const metadata = {
  title: 'Inbox - AIsen',
  description: 'Gmail から取り込んだタスクを AI で整理',
}

export default function InboxRoute() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">読み込み中...</div>}>
      <InboxPage />
    </Suspense>
  )
}
