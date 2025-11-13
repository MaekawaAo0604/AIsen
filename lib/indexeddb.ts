// IndexedDB utility for storing scheduled notifications
// Service Workerからもアクセス可能

import type { ScheduledNotification } from './notificationScheduler'

const DB_NAME = 'aisen_db'
const DB_VERSION = 1
const STORE_NAME = 'scheduled_notifications'

/**
 * IndexedDBを開く
 */
export function openNotificationDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('❌ Failed to open IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // scheduled_notificationsストアを作成
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })

        // インデックスを作成（scheduledTimeでソート可能に）
        store.createIndex('scheduledTime', 'scheduledTime', { unique: false })

        console.log('✅ IndexedDB object store created')
      }
    }
  })
}

/**
 * 全ての通知スケジュールを取得
 */
export async function getAllScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const db = await openNotificationDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('❌ Failed to get notifications from IndexedDB:', request.error)
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  } catch (error) {
    console.error('❌ Error in getAllScheduledNotifications:', error)
    return []
  }
}

/**
 * 通知スケジュールを保存（全件置き換え）
 */
export async function saveAllScheduledNotifications(
  notifications: ScheduledNotification[]
): Promise<void> {
  try {
    const db = await openNotificationDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      // 既存データを全削除
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => {
        // 新しいデータを全件追加
        notifications.forEach((notification) => {
          store.add(notification)
        })
      }

      clearRequest.onerror = () => {
        console.error('❌ Failed to clear IndexedDB:', clearRequest.error)
        reject(clearRequest.error)
      }

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }

      transaction.onerror = () => {
        console.error('❌ Transaction failed:', transaction.error)
        reject(transaction.error)
      }
    })
  } catch (error) {
    console.error('❌ Error in saveAllScheduledNotifications:', error)
    throw error
  }
}

/**
 * 単一の通知を追加
 */
export async function addScheduledNotification(
  notification: ScheduledNotification
): Promise<void> {
  try {
    const db = await openNotificationDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(notification)

      request.onerror = () => {
        console.error('❌ Failed to add notification to IndexedDB:', request.error)
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }
    })
  } catch (error) {
    console.error('❌ Error in addScheduledNotification:', error)
    throw error
  }
}

/**
 * IDで通知を削除
 */
export async function deleteScheduledNotification(id: string): Promise<void> {
  try {
    const db = await openNotificationDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onerror = () => {
        console.error('❌ Failed to delete notification from IndexedDB:', request.error)
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }
    })
  } catch (error) {
    console.error('❌ Error in deleteScheduledNotification:', error)
    throw error
  }
}

/**
 * 複数の通知をIDで削除
 */
export async function deleteScheduledNotifications(ids: string[]): Promise<void> {
  try {
    const db = await openNotificationDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      ids.forEach((id) => {
        store.delete(id)
      })

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }

      transaction.onerror = () => {
        console.error('❌ Transaction failed:', transaction.error)
        reject(transaction.error)
      }
    })
  } catch (error) {
    console.error('❌ Error in deleteScheduledNotifications:', error)
    throw error
  }
}

/**
 * 実行予定時刻が過ぎた通知を取得
 */
export async function getOverdueNotifications(): Promise<ScheduledNotification[]> {
  try {
    const db = await openNotificationDB()
    const now = Date.now()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('scheduledTime')

      // scheduledTime <= now の範囲で取得
      const range = IDBKeyRange.upperBound(now)
      const request = index.getAll(range)

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('❌ Failed to get overdue notifications:', request.error)
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  } catch (error) {
    console.error('❌ Error in getOverdueNotifications:', error)
    return []
  }
}
