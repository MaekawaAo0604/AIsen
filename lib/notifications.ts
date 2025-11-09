import type { NotificationSettings, NotificationPayload } from './types'

// デフォルト通知設定
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  deadlineReminder: {
    enabled: true,
    oneDayBefore: true,
    oneHourBefore: true,
  },
  dailySummary: {
    enabled: true,
    time: '09:00',
  },
}

// Service Workerの登録
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service Worker registered:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

// プッシュ通知の権限リクエスト
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported')
    return 'denied'
  }

  return await Notification.requestPermission()
}

// プッシュ通知のサブスクリプション作成
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  try {
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    })
    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

// プッシュ通知のサブスクリプション解除
export async function unsubscribeFromPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
    return false
  }
}

// ローカル通知の表示（開発・テスト用）
export async function showLocalNotification(payload: NotificationPayload): Promise<void> {
  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    console.warn('Notification permission not granted')
    return
  }

  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(payload.title, {
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    tag: payload.tag || 'default',
    data: payload.data || {},
    requireInteraction: false,
  })
}

// VAPID公開鍵のBase64文字列をUint8Arrayに変換
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// 通知スケジューリングのヘルパー関数
export function calculateNotificationTime(dueDate: string, hoursBeforeOptions: { oneDayBefore?: boolean; oneHourBefore?: boolean }): Date[] {
  const due = new Date(dueDate)
  const times: Date[] = []

  if (hoursBeforeOptions.oneDayBefore) {
    const oneDayBefore = new Date(due)
    oneDayBefore.setHours(due.getHours() - 24)
    times.push(oneDayBefore)
  }

  if (hoursBeforeOptions.oneHourBefore) {
    const oneHourBefore = new Date(due)
    oneHourBefore.setHours(due.getHours() - 1)
    times.push(oneHourBefore)
  }

  return times
}

// LocalStorageから通知設定を取得
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS

  try {
    const stored = localStorage.getItem('notification-settings')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load notification settings:', error)
  }

  return DEFAULT_NOTIFICATION_SETTINGS
}

// LocalStorageに通知設定を保存
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('notification-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save notification settings:', error)
  }
}
