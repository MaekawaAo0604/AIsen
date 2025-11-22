import { IntegrationsPageClient } from './IntegrationsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '連携設定 | AIsen',
  description: 'Gmail などの外部サービス連携設定',
}

export default function IntegrationsPage() {
  return <IntegrationsPageClient />
}
