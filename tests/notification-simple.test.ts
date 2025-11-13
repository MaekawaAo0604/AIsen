/**
 * 通知機能の簡易テスト
 *
 * 実行: npm run test:notifications:simple
 */

import 'fake-indexeddb/auto'
import type { Task } from '../lib/types'

// モックタスク作成
function createTask(title: string, dueInHours: number): Task {
  const due = new Date()
  due.setHours(due.getHours() + dueInHours)

  return {
    id: `task-${Math.random()}`,
    title,
    notes: '',
    completed: false,
    createdAt: new Date().toISOString(),
    due: due.toISOString(),
  }
}

describe('通知機能テスト', () => {
  test('基本的なIndexedDB操作', async () => {
    const { openNotificationDB, saveAllScheduledNotifications, getAllScheduledNotifications } =
      await import('../lib/indexeddb')

    // DB開く
    const db = await openNotificationDB()
    expect(db.name).toBe('aisen_db')
    db.close()

    // データ保存
    await saveAllScheduledNotifications([{
      id: 'test-1',
      taskId: 'task-1',
      type: 'deadline-1hour',
      scheduledTime: Date.now() + 3600000,
      payload: { title: 'テスト', body: 'テスト', tag: 'test' }
    }])

    // データ取得
    const notifications = await getAllScheduledNotifications()
    expect(notifications.length).toBe(1)
    expect(notifications[0].id).toBe('test-1')

    console.log('✅ IndexedDB基本操作: OK')
  }, 10000)

  test('期限通知のスケジューリング', async () => {
    const { scheduleDeadlineNotifications, getScheduledNotifications } =
      await import('../lib/notificationScheduler')

    const task = createTask('明日のタスク', 25) // 25時間後

    await scheduleDeadlineNotifications([task], true, true)

    const scheduled = await getScheduledNotifications()
    expect(scheduled.length).toBeGreaterThan(0)

    const types = scheduled.map(n => n.type)
    expect(types).toContain('deadline-1day')
    expect(types).toContain('deadline-1hour')

    console.log('✅ 期限通知スケジューリング: OK')
    console.log(`   - スケジュール済み通知数: ${scheduled.length}`)
  }, 10000)

  test('定時通知のスケジューリング', async () => {
    const { scheduleDailySummary, getScheduledNotifications, saveScheduledNotifications } =
      await import('../lib/notificationScheduler')

    // 既存データクリア
    await saveScheduledNotifications([])

    const task = createTask('テストタスク', 1)
    const futureTime = new Date(Date.now() + 3600000)
    const timeString = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`

    await scheduleDailySummary([task], timeString)

    const scheduled = await getScheduledNotifications()
    const dailySummary = scheduled.find(n => n.type === 'daily-summary')

    expect(dailySummary).toBeDefined()
    expect(dailySummary?.payload.title).toBe('☀️ 今日のタスク')

    console.log('✅ 定時通知スケジューリング: OK')
  }, 10000)

  test('完了済みタスクは除外される', async () => {
    const { scheduleDeadlineNotifications, getScheduledNotifications, saveScheduledNotifications } =
      await import('../lib/notificationScheduler')

    // クリア
    await saveScheduledNotifications([])

    const completedTask: Task = {
      id: 'completed-task',
      title: '完了済み',
      notes: '',
      completed: true,
      createdAt: new Date().toISOString(),
      due: new Date(Date.now() + 86400000).toISOString(),
    }

    await scheduleDeadlineNotifications([completedTask], true, true)

    const scheduled = await getScheduledNotifications()
    expect(scheduled.length).toBe(0)

    console.log('✅ 完了済みタスク除外: OK')
  }, 10000)

  test('過去の期限は除外される', async () => {
    const { scheduleDeadlineNotifications, getScheduledNotifications, saveScheduledNotifications } =
      await import('../lib/notificationScheduler')

    // クリア
    await saveScheduledNotifications([])

    const pastTask = createTask('過去のタスク', -25) // 25時間前

    await scheduleDeadlineNotifications([pastTask], true, true)

    const scheduled = await getScheduledNotifications()
    expect(scheduled.length).toBe(0)

    console.log('✅ 過去期限除外: OK')
  }, 10000)
})
