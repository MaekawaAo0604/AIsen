// Service Worker for Push Notifications

const CACHE_NAME = 'aisen-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

// Push event - show notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'AIsen'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || 'default',
    data: data.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click event - open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 既に開いているウィンドウがあればフォーカス
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // なければ新しいウィンドウを開く
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Periodic Background Sync - 定期的に通知をチェック
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkScheduledNotifications())
  }
})

// Message event - クライアントからのメッセージを処理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
    event.waitUntil(checkScheduledNotifications())
  }
})

// IndexedDBを開く（Service Worker用）
function openNotificationDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('aisen_db', 1)

    request.onerror = () => {
      console.error('[SW] Failed to open IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('scheduled_notifications')) {
        const store = db.createObjectStore('scheduled_notifications', { keyPath: 'id' })
        store.createIndex('scheduledTime', 'scheduledTime', { unique: false })
        console.log('[SW] IndexedDB object store created')
      }
    }
  })
}

// 実行予定時刻が過ぎた通知を取得
async function getOverdueNotifications(db) {
  return new Promise((resolve, reject) => {
    const now = Date.now()
    const transaction = db.transaction('scheduled_notifications', 'readonly')
    const store = transaction.objectStore('scheduled_notifications')
    const index = store.index('scheduledTime')
    const range = IDBKeyRange.upperBound(now)
    const request = index.getAll(range)

    request.onsuccess = () => {
      resolve(request.result || [])
    }

    request.onerror = () => {
      console.error('[SW] Failed to get overdue notifications:', request.error)
      reject(request.error)
    }
  })
}

// 実行済み通知を削除
async function deleteExecutedNotifications(db, ids) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('scheduled_notifications', 'readwrite')
    const store = transaction.objectStore('scheduled_notifications')

    ids.forEach((id) => {
      store.delete(id)
    })

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = () => {
      console.error('[SW] Failed to delete notifications:', transaction.error)
      reject(transaction.error)
    }
  })
}

// スケジュール済み通知をチェックして実行
async function checkScheduledNotifications() {
  console.log('[SW] Checking scheduled notifications...')

  try {
    // IndexedDBから通知スケジュールを取得
    const db = await openNotificationDB()
    const overdueNotifications = await getOverdueNotifications(db)

    console.log(`[SW] Found ${overdueNotifications.length} overdue notifications`)

    if (overdueNotifications.length === 0) {
      db.close()
      return
    }

    // 実行する通知を送信
    const executedIds = []
    for (const notification of overdueNotifications) {
      try {
        console.log(`[SW] 🔔 Executing notification: ${notification.type}`)
        await self.registration.showNotification(
          notification.payload.title,
          {
            body: notification.payload.body,
            icon: notification.payload.icon || '/icon-192.png',
            badge: notification.payload.badge || '/icon-192.png',
            tag: notification.payload.tag || 'default',
            data: notification.payload.data || {},
            requireInteraction: false,
          }
        )
        executedIds.push(notification.id)
      } catch (error) {
        console.error('[SW] Failed to show notification:', error)
      }
    }

    // 実行済み通知を削除
    if (executedIds.length > 0) {
      await deleteExecutedNotifications(db, executedIds)
      console.log(`[SW] ✅ Executed ${executedIds.length} notifications`)
    }

    db.close()
  } catch (error) {
    console.error('[SW] Error checking notifications:', error)
  }
}
