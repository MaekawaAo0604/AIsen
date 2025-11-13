'use client'

import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { getScheduledNotifications } from '@/lib/notificationScheduler'

export function NotificationSettings() {
  const {
    settings,
    permission,
    isLoading,
    isSupported,
    enableNotifications,
    disableNotifications,
    updateSettings,
    sendTestNotification,
  } = useNotifications()

  const [scheduledCount, setScheduledCount] = useState<number | null>(null)

  const checkScheduledNotifications = async () => {
    const scheduled = await getScheduledNotifications()
    setScheduledCount(scheduled.length)
    console.log('📅 Scheduled notifications:', scheduled)
  }

  if (!isSupported) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          お使いのブラウザは通知機能に対応していません。
          <br />
          Chrome、Firefox、Safariの最新版をご利用ください。
        </p>
      </div>
    )
  }

  const handleToggleNotifications = async () => {
    if (settings.enabled) {
      await disableNotifications()
    } else {
      await enableNotifications()
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-[20px] sm:text-[24px] font-bold text-[#1a1816]">通知設定</h2>
        <p className="mt-2 text-[13px] sm:text-[14px] text-[#787774]">
          タスクの期限が近づいたときや、毎朝のタスク一覧をプッシュ通知で受け取れます。
        </p>
      </div>

      {/* 通知権限の状態 */}
      {permission === 'denied' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            通知がブロックされています。ブラウザの設定から通知を許可してください。
          </p>
        </div>
      )}

      {/* 通知ON/OFF */}
      <div className="flex items-center justify-between p-4 bg-white border border-[#e9e9e7] rounded-lg">
        <div>
          <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#1a1816]">プッシュ通知</h3>
          <p className="mt-1 text-[12px] sm:text-[13px] text-[#787774]">
            ブラウザを閉じていても通知を受け取ります
          </p>
        </div>
        <button
          onClick={handleToggleNotifications}
          disabled={isLoading || permission === 'denied'}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${settings.enabled ? 'bg-blue-600' : 'bg-gray-200'}
            ${isLoading || permission === 'denied' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* 期限通知設定 */}
      {settings.enabled && (
        <div className="space-y-4 p-4 bg-[#fafaf9] border border-[#e9e9e7] rounded-lg">
          <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#1a1816]">期限リマインダー</h3>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.deadlineReminder.oneDayBefore}
              onChange={(e) =>
                updateSettings({
                  deadlineReminder: {
                    ...settings.deadlineReminder,
                    oneDayBefore: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-[13px] sm:text-[14px] text-[#1a1816]">1日前に通知</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.deadlineReminder.oneHourBefore}
              onChange={(e) =>
                updateSettings({
                  deadlineReminder: {
                    ...settings.deadlineReminder,
                    oneHourBefore: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-[13px] sm:text-[14px] text-[#1a1816]">1時間前に通知</span>
          </label>
        </div>
      )}

      {/* 定時通知設定 */}
      {settings.enabled && (
        <div className="space-y-4 p-4 bg-[#fafaf9] border border-[#e9e9e7] rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#1a1816]">毎日のタスク一覧</h3>
            <button
              onClick={() =>
                updateSettings({
                  dailySummary: {
                    ...settings.dailySummary,
                    enabled: !settings.dailySummary.enabled,
                  },
                })
              }
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.dailySummary.enabled ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${settings.dailySummary.enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {settings.dailySummary.enabled && (
            <div>
              <label className="block text-[12px] sm:text-[13px] text-[#787774] mb-2">
                通知時刻
              </label>
              <input
                type="time"
                value={settings.dailySummary.time}
                onChange={(e) =>
                  updateSettings({
                    dailySummary: {
                      ...settings.dailySummary,
                      time: e.target.value,
                    },
                  })
                }
                className="px-3 py-2 border border-[#e9e9e7] rounded-lg text-[13px] sm:text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )}

      {/* テスト通知 */}
      {settings.enabled && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={async () => {
                console.log('🔘 テスト通知ボタンがクリックされました')
                try {
                  await sendTestNotification()
                  alert('✅ テスト通知を送信しました！デスクトップに表示されているか確認してください。')
                } catch (error) {
                  console.error('❌ テスト通知エラー:', error)
                  alert(`❌ エラーが発生しました: ${error}`)
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 text-[13px] sm:text-[14px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              テスト通知を送信
            </button>

            <button
              onClick={checkScheduledNotifications}
              className="px-4 py-2 text-[13px] sm:text-[14px] font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              スケジュール確認 {scheduledCount !== null && `(${scheduledCount}件)`}
            </button>
          </div>

          {/* デバッグ情報 */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] sm:text-[12px] text-gray-600 space-y-1">
            <p>🔍 デバッグ情報:</p>
            <p>• 通知権限: {permission}</p>
            <p>• Service Worker: {'serviceWorker' in navigator ? '対応' : '非対応'}</p>
            <p>• 通知API: {'Notification' in window ? '対応' : '非対応'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
