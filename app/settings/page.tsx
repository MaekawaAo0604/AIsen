'use client'

import dynamic from 'next/dynamic'

// SSRを無効化してクライアントサイドのみでレンダリング
const DynamicNotificationSettings = dynamic(
  () => import('@/components/Settings/NotificationSettings').then((mod) => mod.NotificationSettings),
  { ssr: false }
)

const DynamicSubscriptionSettings = dynamic(
  () => import('@/components/Settings/SubscriptionSettings').then((mod) => mod.SubscriptionSettings),
  { ssr: false }
)

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-[800px] mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-slate-900">設定</h1>

        {/* サブスクリプション設定 */}
        <DynamicSubscriptionSettings />

        {/* 通知設定 */}
        <DynamicNotificationSettings />
      </div>
    </div>
  )
}
