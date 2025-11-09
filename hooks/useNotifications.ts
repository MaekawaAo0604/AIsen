'use client'

import { useState, useEffect, useCallback } from 'react'
import type { NotificationSettings } from '@/lib/types'
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getNotificationSettings,
  saveNotificationSettings,
  showLocalNotification,
} from '@/lib/notifications'

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初期化
  useEffect(() => {
    const init = async () => {
      // 通知設定を読み込み
      const savedSettings = getNotificationSettings()
      setSettings(savedSettings)

      // 通知権限の確認
      if ('Notification' in window) {
        setPermission(Notification.permission)
      }

      // Service Worker登録
      const reg = await registerServiceWorker()
      if (reg) {
        setRegistration(reg)
      }

      setIsLoading(false)
    }

    init()
  }, [])

  // 通知を有効化
  const enableNotifications = useCallback(async () => {
    setIsLoading(true)

    // 権限リクエスト
    const perm = await requestNotificationPermission()
    setPermission(perm)

    if (perm !== 'granted') {
      setIsLoading(false)
      return false
    }

    // Service Worker登録
    let reg = registration
    if (!reg) {
      reg = await registerServiceWorker()
      if (reg) {
        setRegistration(reg)
      }
    }

    if (!reg) {
      setIsLoading(false)
      return false
    }

    // プッシュ通知サブスクリプション（VAPID鍵は環境変数から取得予定）
    // 現時点ではローカル通知のみ対応
    const newSettings: NotificationSettings = {
      ...settings,
      enabled: true,
    }

    setSettings(newSettings)
    saveNotificationSettings(newSettings)
    setIsLoading(false)

    return true
  }, [settings, registration])

  // 通知を無効化
  const disableNotifications = useCallback(async () => {
    setIsLoading(true)

    if (registration) {
      await unsubscribeFromPushNotifications(registration)
    }

    const newSettings: NotificationSettings = {
      ...settings,
      enabled: false,
    }

    setSettings(newSettings)
    saveNotificationSettings(newSettings)
    setIsLoading(false)

    return true
  }, [settings, registration])

  // 通知設定を更新
  const updateSettings = useCallback(
    (newSettings: Partial<NotificationSettings>) => {
      const updated: NotificationSettings = {
        ...settings,
        ...newSettings,
      }

      setSettings(updated)
      saveNotificationSettings(updated)
    },
    [settings]
  )

  // テスト通知を送信
  const sendTestNotification = useCallback(async () => {
    await showLocalNotification({
      title: 'AIsen 通知テスト',
      body: 'プッシュ通知が正常に動作しています！',
      tag: 'test-notification',
    })
  }, [])

  return {
    settings,
    permission,
    isLoading,
    isSupported: 'Notification' in window && 'serviceWorker' in navigator,
    enableNotifications,
    disableNotifications,
    updateSettings,
    sendTestNotification,
  }
}
