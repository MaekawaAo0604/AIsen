/**
 * 通知スケジューラーの自動テスト
 *
 * 実行方法:
 * npm run test:notifications
 */

import type { Task } from '../lib/types'
import type { ScheduledNotification } from '../lib/notificationScheduler'

// IndexedDB モックセットアップ（ブラウザ環境外でも動作）
import 'fake-indexeddb/auto'

// テスト対象のインポート
import {
  scheduleDeadlineNotifications,
  scheduleDailySummary,
  getScheduledNotifications,
  saveScheduledNotifications,
} from '../lib/notificationScheduler'

import {
  openNotificationDB,
  getAllScheduledNotifications,
  saveAllScheduledNotifications,
  getOverdueNotifications,
  deleteScheduledNotifications,
} from '../lib/indexeddb'

// テストユーティリティ
function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: `task-${Date.now()}-${Math.random()}`,
    title: 'テストタスク',
    notes: '',
    completed: false,
    createdAt: new Date().toISOString(),
    due: null,
    ...overrides,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// テストスイート
describe('通知スケジューラー', () => {
  beforeEach(async () => {
    // 各テスト前にIndexedDBをクリア
    const db = await openNotificationDB()
    const transaction = db.transaction('scheduled_notifications', 'readwrite')
    const store = transaction.objectStore('scheduled_notifications')
    await store.clear()
    db.close()
  })

  describe('IndexedDB操作', () => {
    test('データベースを開ける', async () => {
      const db = await openNotificationDB()
      expect(db).toBeDefined()
      expect(db.name).toBe('aisen_db')
      expect(db.objectStoreNames.contains('scheduled_notifications')).toBe(true)
      db.close()
    })

    test('通知を保存・取得できる', async () => {
      const notification: ScheduledNotification = {
        id: 'test-1',
        taskId: 'task-1',
        type: 'deadline-1hour',
        scheduledTime: Date.now() + 60000,
        payload: {
          title: 'テスト通知',
          body: 'テスト本文',
          tag: 'test',
        },
      }

      await saveAllScheduledNotifications([notification])

      const retrieved = await getAllScheduledNotifications()
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].id).toBe('test-1')
      expect(retrieved[0].payload.title).toBe('テスト通知')
    })

    test('実行予定時刻が過ぎた通知を取得できる', async () => {
      const now = Date.now()
      const notifications: ScheduledNotification[] = [
        {
          id: 'past-1',
          taskId: 'task-1',
          type: 'deadline-1hour',
          scheduledTime: now - 60000, // 1分前（過去）
          payload: { title: '過去の通知1', body: '', tag: 'past1' },
        },
        {
          id: 'past-2',
          taskId: 'task-2',
          type: 'deadline-1day',
          scheduledTime: now - 120000, // 2分前（過去）
          payload: { title: '過去の通知2', body: '', tag: 'past2' },
        },
        {
          id: 'future-1',
          taskId: 'task-3',
          type: 'deadline-1hour',
          scheduledTime: now + 60000, // 1分後（未来）
          payload: { title: '未来の通知', body: '', tag: 'future1' },
        },
      ]

      await saveAllScheduledNotifications(notifications)

      const overdue = await getOverdueNotifications()
      expect(overdue).toHaveLength(2)
      expect(overdue.map((n) => n.id)).toContain('past-1')
      expect(overdue.map((n) => n.id)).toContain('past-2')
      expect(overdue.map((n) => n.id)).not.toContain('future-1')
    })

    test('通知を削除できる', async () => {
      const notifications: ScheduledNotification[] = [
        {
          id: 'delete-1',
          taskId: 'task-1',
          type: 'deadline-1hour',
          scheduledTime: Date.now(),
          payload: { title: '削除対象1', body: '', tag: 'del1' },
        },
        {
          id: 'keep-1',
          taskId: 'task-2',
          type: 'deadline-1hour',
          scheduledTime: Date.now(),
          payload: { title: '保持対象', body: '', tag: 'keep1' },
        },
      ]

      await saveAllScheduledNotifications(notifications)
      await deleteScheduledNotifications(['delete-1'])

      const remaining = await getAllScheduledNotifications()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('keep-1')
    })
  })

  describe('期限通知スケジューリング', () => {
    test('1日前の通知をスケジュールできる', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const task = createMockTask({
        title: '明日締切のタスク',
        due: tomorrow.toISOString(),
      })

      await scheduleDeadlineNotifications([task], true, false)

      const scheduled = await getScheduledNotifications()
      expect(scheduled).toHaveLength(1)
      expect(scheduled[0].type).toBe('deadline-1day')
      expect(scheduled[0].payload.title).toBe('📅 期限まであと1日')
      expect(scheduled[0].payload.body).toBe('明日締切のタスク')

      // scheduledTime が 現在時刻 < x < 明日 の範囲にあるか確認
      const now = Date.now()
      const tomorrowTime = tomorrow.getTime()
      expect(scheduled[0].scheduledTime).toBeGreaterThan(now)
      expect(scheduled[0].scheduledTime).toBeLessThan(tomorrowTime)
    })

    test('1時間前の通知をスケジュールできる', async () => {
      const inTwoHours = new Date()
      inTwoHours.setHours(inTwoHours.getHours() + 2)

      const task = createMockTask({
        title: '2時間後締切のタスク',
        due: inTwoHours.toISOString(),
      })

      await scheduleDeadlineNotifications([task], false, true)

      const scheduled = await getScheduledNotifications()
      expect(scheduled).toHaveLength(1)
      expect(scheduled[0].type).toBe('deadline-1hour')
      expect(scheduled[0].payload.title).toBe('⏰ 期限まであと1時間')
    })

    test('1日前と1時間前の両方をスケジュールできる', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const task = createMockTask({
        title: '明日締切のタスク',
        due: tomorrow.toISOString(),
      })

      await scheduleDeadlineNotifications([task], true, true)

      const scheduled = await getScheduledNotifications()
      expect(scheduled).toHaveLength(2)

      const types = scheduled.map((n) => n.type)
      expect(types).toContain('deadline-1day')
      expect(types).toContain('deadline-1hour')
    })

    test('過去の期限のタスクはスケジュールされない', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const task = createMockTask({
        title: '昨日締切のタスク',
        due: yesterday.toISOString(),
      })

      await scheduleDeadlineNotifications([task], true, true)

      const scheduled = await getScheduledNotifications()
      expect(scheduled).toHaveLength(0)
    })

    test('完了済みタスクはスケジュールされない', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const task = createMockTask({
        title: '完了済みタスク',
        due: tomorrow.toISOString(),
        completed: true,
      })

      await scheduleDeadlineNotifications([task], true, true)

      const scheduled = await getScheduledNotifications()
      expect(scheduled).toHaveLength(0)
    })

    test('複数タスクをスケジュールできる', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const tasks = [
        createMockTask({ title: 'タスク1', due: tomorrow.toISOString() }),
        createMockTask({ title: 'タスク2', due: tomorrow.toISOString() }),
        createMockTask({ title: 'タスク3', due: tomorrow.toISOString() }),
      ]

      await scheduleDeadlineNotifications(tasks, true, true)

      const scheduled = await getScheduledNotifications()
      // 3タスク × 2通知（1日前・1時間前） = 6通知
      expect(scheduled).toHaveLength(6)
    })
  })

  describe('定時通知スケジューリング', () => {
    test('指定時刻に定時通知をスケジュールできる', async () => {
      const now = new Date()
      const futureTime = new Date(now.getTime() + 60 * 60 * 1000) // 1時間後
      const timeString = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`

      const tasks = [
        createMockTask({ title: 'タスク1' }),
        createMockTask({ title: 'タスク2' }),
        createMockTask({ title: 'タスク3', completed: true }),
      ]

      await scheduleDailySummary(tasks, timeString)

      const scheduled = await getScheduledNotifications()
      expect(scheduled).toHaveLength(1)
      expect(scheduled[0].type).toBe('daily-summary')
      expect(scheduled[0].payload.title).toBe('☀️ 今日のタスク')
      expect(scheduled[0].payload.body).toBe('未完了タスク: 2件')
    })

    test('過去の時刻を指定すると明日にスケジュールされる', async () => {
      const now = new Date()
      const pastTime = new Date(now.getTime() - 60 * 60 * 1000) // 1時間前
      const timeString = `${pastTime.getHours().toString().padStart(2, '0')}:${pastTime.getMinutes().toString().padStart(2, '0')}`

      const tasks = [createMockTask({ title: 'タスク1' })]

      await scheduleDailySummary(tasks, timeString)

      const scheduled = await getScheduledNotifications()
      expect(scheduled).toHaveLength(1)

      // scheduledTime が現在時刻より未来（明日）になっているか確認
      expect(scheduled[0].scheduledTime).toBeGreaterThan(Date.now())
    })
  })

  describe('スケジュール統合', () => {
    test('期限通知と定時通知を同時にスケジュールできる', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const futureTime = new Date(Date.now() + 60 * 60 * 1000)
      const timeString = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`

      const task = createMockTask({
        title: '明日締切のタスク',
        due: tomorrow.toISOString(),
      })

      // 期限通知をスケジュール
      await scheduleDeadlineNotifications([task], true, true)

      // 定時通知をスケジュール
      await scheduleDailySummary([task], timeString)

      const scheduled = await getScheduledNotifications()
      // 2つの期限通知 + 1つの定時通知 = 3通知
      expect(scheduled).toHaveLength(3)

      const types = scheduled.map((n) => n.type)
      expect(types).toContain('deadline-1day')
      expect(types).toContain('deadline-1hour')
      expect(types).toContain('daily-summary')
    })
  })
})
