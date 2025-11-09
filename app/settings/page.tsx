'use client'

import { NotificationSettings } from '@/components/Settings/NotificationSettings'
import dynamic from 'next/dynamic'

// SSRを無効化してクライアントサイドのみでレンダリング
const DynamicNotificationSettings = dynamic(
  () => import('@/components/Settings/NotificationSettings').then((mod) => mod.NotificationSettings),
  { ssr: false }
)

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-[800px] mx-auto">
        <DynamicNotificationSettings />
      </div>
    </div>
  )
}
