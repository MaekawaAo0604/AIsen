import { Task, NotificationPayload } from './types'
import { showLocalNotification } from './notifications'
import {
  getAllScheduledNotifications,
  saveAllScheduledNotifications,
  getOverdueNotifications,
  deleteScheduledNotifications,
} from './indexeddb'

// 通知スケジュール管理
export interface ScheduledNotification {
  id: string
  taskId: string
  type: 'deadline-1day' | 'deadline-1hour' | 'daily-summary'
  scheduledTime: number // Unix timestamp (ms)
  payload: NotificationPayload
}

// スケジュール済み通知を取得（IndexedDBから）
export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  if (typeof indexedDB === 'undefined') return []
  try {
    return await getAllScheduledNotifications()
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error)
    return []
  }
}

// スケジュール済み通知を保存（IndexedDBへ）
export async function saveScheduledNotifications(
  notifications: ScheduledNotification[]
): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    await saveAllScheduledNotifications(notifications)
  } catch (error) {
    console.error('Failed to save scheduled notifications:', error)
  }
}

// 期限通知をスケジュール（1日前・1時間前）
export async function scheduleDeadlineNotifications(
  tasks: Task[],
  oneDayBefore: boolean,
  oneHourBefore: boolean
): Promise<void> {
  console.log('📅 Scheduling deadline notifications...')

  const now = Date.now()
  const scheduled: ScheduledNotification[] = []

  tasks.forEach((task) => {
    if (!task.due || task.completed) return

    const dueTime = new Date(task.due).getTime()

    // 1日前の通知（24時間前）
    if (oneDayBefore) {
      const oneDayBeforeTime = dueTime - 24 * 60 * 60 * 1000
      if (oneDayBeforeTime > now) {
        scheduled.push({
          id: `${task.id}-1day`,
          taskId: task.id,
          type: 'deadline-1day',
          scheduledTime: oneDayBeforeTime,
          payload: {
            title: '📅 期限まであと1日',
            body: task.title,
            tag: `deadline-1day-${task.id}`,
            data: { taskId: task.id },
          },
        })
      }
    }

    // 1時間前の通知
    if (oneHourBefore) {
      const oneHourBeforeTime = dueTime - 60 * 60 * 1000
      if (oneHourBeforeTime > now) {
        scheduled.push({
          id: `${task.id}-1hour`,
          taskId: task.id,
          type: 'deadline-1hour',
          scheduledTime: oneHourBeforeTime,
          payload: {
            title: '⏰ 期限まであと1時間',
            body: task.title,
            tag: `deadline-1hour-${task.id}`,
            data: { taskId: task.id },
          },
        })
      }
    }
  })

  // 既存のスケジュールをマージ（既存の daily-summary は保持）
  const existing = await getScheduledNotifications()
  const dailySummaries = existing.filter((n) => n.type === 'daily-summary')
  const newSchedule = [...dailySummaries, ...scheduled]

  await saveScheduledNotifications(newSchedule)
  console.log(`✅ Scheduled ${scheduled.length} deadline notifications`)
}

// 定時通知をスケジュール（毎日指定時刻）
export async function scheduleDailySummary(
  tasks: Task[],
  time: string // "HH:mm" format (例: "09:00")
): Promise<void> {
  console.log(`📅 Scheduling daily summary at ${time}...`)

  const [hours, minutes] = time.split(':').map(Number)
  const now = new Date()
  const scheduledTime = new Date()
  scheduledTime.setHours(hours, minutes, 0, 0)

  // 今日の指定時刻が過ぎていたら明日にスケジュール
  if (scheduledTime.getTime() <= now.getTime()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  const incompleteTasks = tasks.filter((t) => !t.completed)
  const notification: ScheduledNotification = {
    id: `daily-summary-${scheduledTime.toISOString()}`,
    taskId: 'daily-summary',
    type: 'daily-summary',
    scheduledTime: scheduledTime.getTime(),
    payload: {
      title: '☀️ 今日のタスク',
      body: `未完了タスク: ${incompleteTasks.length}件`,
      tag: 'daily-summary',
      data: { url: '/' },
    },
  }

  // 既存のスケジュールから deadline 通知を保持
  const existing = await getScheduledNotifications()
  const deadlineNotifications = existing.filter((n) => n.type !== 'daily-summary')
  const newSchedule = [...deadlineNotifications, notification]

  await saveScheduledNotifications(newSchedule)
  console.log(`✅ Scheduled daily summary at ${scheduledTime.toLocaleString('ja-JP')}`)
}

// スケジュール済み通知をチェックして実行
export async function checkAndExecuteScheduledNotifications(): Promise<void> {
  const now = Date.now()
  const scheduled = await getScheduledNotifications()
  const toExecute = scheduled.filter((n) => n.scheduledTime <= now)
  const remaining = scheduled.filter((n) => n.scheduledTime > now)

  // 実行する通知を送信
  for (const notification of toExecute) {
    try {
      console.log(`🔔 Executing scheduled notification: ${notification.type}`)
      await showLocalNotification(notification.payload)
    } catch (error) {
      console.error('Failed to execute notification:', error)
    }
  }

  // 実行済み通知を削除（daily-summaryは次回分を再スケジュール）
  await saveScheduledNotifications(remaining)

  if (toExecute.length > 0) {
    console.log(`✅ Executed ${toExecute.length} notifications, ${remaining.length} remaining`)
  }
}

// 定期的にチェックを開始（1分ごと）
let checkInterval: NodeJS.Timeout | null = null

export function startNotificationScheduler(): void {
  if (checkInterval) return // 既に起動している

  console.log('🚀 Starting notification scheduler (check every 1 minute)')

  // 初回実行
  checkAndExecuteScheduledNotifications()

  // 1分ごとにチェック
  checkInterval = setInterval(() => {
    checkAndExecuteScheduledNotifications()
  }, 60 * 1000) // 60秒

  // Service Workerメッセージリスナーを設定
  setupServiceWorkerMessageListener()

  // Periodic Background Syncを登録（対応ブラウザのみ）
  registerPeriodicBackgroundSync()
}

export function stopNotificationScheduler(): void {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
    console.log('⏸️ Notification scheduler stopped')
  }
}

// Service Workerからのメッセージリスナーを設定
function setupServiceWorkerMessageListener(): void {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[Client] Message from SW:', event.data)

    if (event.data && event.data.type === 'CHECK_NOTIFICATIONS_REQUESTED') {
      console.log('[Client] SW requested notification check, executing...')
      checkAndExecuteScheduledNotifications()
    }
  })

  console.log('✅ Service Worker message listener registered')
}

// Periodic Background Syncを登録
async function registerPeriodicBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  if (!('periodicSync' in ServiceWorkerRegistration.prototype)) {
    console.warn('⚠️ Periodic Background Sync not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName,
    })

    if (status.state === 'granted') {
      // 1時間ごとにバックグラウンドで通知をチェック
      await (registration as any).periodicSync.register('check-notifications', {
        minInterval: 60 * 60 * 1000, // 1時間 (ミリ秒)
      })
      console.log('✅ Periodic Background Sync registered (every 1 hour)')
    } else {
      console.warn('⚠️ Periodic Background Sync permission not granted')
    }
  } catch (error) {
    console.error('❌ Failed to register Periodic Background Sync:', error)
  }
}

// タスクが更新されたときにスケジュールを再計算
export async function updateNotificationSchedules(
  tasks: Task[],
  settings: {
    deadlineReminder: {
      enabled: boolean
      oneDayBefore: boolean
      oneHourBefore: boolean
    }
    dailySummary: {
      enabled: boolean
      time: string
    }
  }
): Promise<void> {
  console.log('🔄 Updating notification schedules...')

  // 期限通知
  if (settings.deadlineReminder.enabled) {
    await scheduleDeadlineNotifications(
      tasks,
      settings.deadlineReminder.oneDayBefore,
      settings.deadlineReminder.oneHourBefore
    )
  }

  // 定時通知
  if (settings.dailySummary.enabled) {
    await scheduleDailySummary(tasks, settings.dailySummary.time)
  }
}
