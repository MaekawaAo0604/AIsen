import { InboxPage } from '@/components/Inbox/InboxPage'

export const metadata = {
  title: 'Inbox - AIsen',
  description: 'Gmail から取り込んだタスクを AI で整理',
}

export default function InboxRoute() {
  return <InboxPage />
}
