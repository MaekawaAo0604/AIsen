/**
 * 通知機能の手動テストスクリプト
 *
 * 実行方法:
 * npx tsx scripts/test-notifications.ts
 */

import 'fake-indexeddb/auto'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL'
  message: string
  duration: number
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now()
  try {
    await testFn()
    results.push({
      name,
      status: 'PASS',
      message: '成功',
      duration: Date.now() - start,
    })
  } catch (error) {
    results.push({
      name,
      status: 'FAIL',
      message: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    })
  }
}

async function main() {
  console.log('🧪 通知機能テスト開始\n')

  // Test 1: IndexedDB基本操作
  await runTest('IndexedDB基本操作', async () => {
    const { openNotificationDB, saveAllScheduledNotifications, getAllScheduledNotifications } =
      await import('../lib/indexeddb')

    const db = await openNotificationDB()
    if (db.name !== 'aisen_db') throw new Error('DB名が不正')
    db.close()

    await saveAllScheduledNotifications([
      {
        id: 'test-1',
        taskId: 'task-1',
        type: 'deadline-1hour',
        scheduledTime: Date.now() + 3600000,
        payload: { title: 'テスト通知', body: 'テスト本文', tag: 'test' },
      },
    ])

    const notifications = await getAllScheduledNotifications()
    if (notifications.length !== 1) throw new Error(`通知数が不正: ${notifications.length}`)
    if (notifications[0].id !== 'test-1') throw new Error('通知IDが不正')
  })

  // Test 2: 期限通知スケジューリング
  await runTest('期限通知スケジューリング', async () => {
    const { scheduleDeadlineNotifications, getScheduledNotifications, saveScheduledNotifications } =
      await import('../lib/notificationScheduler')

    // クリア
    await saveScheduledNotifications([])

    // 2日後のタスク（1日前と1時間前の両方が未来になる）
    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const task = {
      id: 'task-deadline',
      title: '2日後締切のタスク',
      notes: '',
      quadrant: 'q1' as const,
      completed: false,
      createdAt: new Date().toISOString(),
      due: dayAfterTomorrow.toISOString(),
    }

    await scheduleDeadlineNotifications([task], true, true)

    const scheduled = await getScheduledNotifications()
    if (scheduled.length === 0) throw new Error('通知がスケジュールされていない')

    const types = scheduled.map((n) => n.type)
    if (!types.includes('deadline-1day')) throw new Error('1日前通知がない')
    if (!types.includes('deadline-1hour')) throw new Error('1時間前通知がない')
  })

  // Test 3: 定時通知スケジューリング
  await runTest('定時通知スケジューリング', async () => {
    const { scheduleDailySummary, getScheduledNotifications, saveScheduledNotifications } =
      await import('../lib/notificationScheduler')

    // クリア
    await saveScheduledNotifications([])

    const futureTime = new Date(Date.now() + 3600000)
    const timeString = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`

    const task = {
      id: 'task-daily',
      title: 'テストタスク',
      notes: '',
      quadrant: 'q1' as const,
      completed: false,
      createdAt: new Date().toISOString(),
      due: null,
    }

    await scheduleDailySummary([task], timeString)

    const scheduled = await getScheduledNotifications()
    const dailySummary = scheduled.find((n) => n.type === 'daily-summary')

    if (!dailySummary) throw new Error('定時通知がスケジュールされていない')
    if (dailySummary.payload.title !== '☀️ 今日のタスク') throw new Error('タイトルが不正')
  })

  // Test 4: 完了済みタスクの除外
  await runTest('完了済みタスク除外', async () => {
    const { scheduleDeadlineNotifications, getScheduledNotifications, saveScheduledNotifications } =
      await import('../lib/notificationScheduler')

    // クリア
    await saveScheduledNotifications([])

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const completedTask = {
      id: 'task-completed',
      title: '完了済みタスク',
      notes: '',
      quadrant: 'q1' as const,
      completed: true,
      createdAt: new Date().toISOString(),
      due: tomorrow.toISOString(),
    }

    await scheduleDeadlineNotifications([completedTask], true, true)

    const scheduled = await getScheduledNotifications()
    if (scheduled.length !== 0) throw new Error('完了済みタスクがスケジュールされている')
  })

  // Test 5: 過去の期限の除外
  await runTest('過去期限除外', async () => {
    const { scheduleDeadlineNotifications, getScheduledNotifications, saveScheduledNotifications } =
      await import('../lib/notificationScheduler')

    // クリア
    await saveScheduledNotifications([])

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const pastTask = {
      id: 'task-past',
      title: '過去のタスク',
      notes: '',
      quadrant: 'q1' as const,
      completed: false,
      createdAt: new Date().toISOString(),
      due: yesterday.toISOString(),
    }

    await scheduleDeadlineNotifications([pastTask], true, true)

    const scheduled = await getScheduledNotifications()
    if (scheduled.length !== 0) throw new Error('過去の期限がスケジュールされている')
  })

  // 結果表示
  console.log('\n📊 テスト結果\n')
  console.log('━'.repeat(60))

  let passCount = 0
  let failCount = 0

  for (const result of results) {
    const statusIcon = result.status === 'PASS' ? '✅' : '❌'
    const duration = `${result.duration}ms`

    console.log(`${statusIcon} ${result.name.padEnd(30)} ${duration.padStart(10)}`)

    if (result.status === 'PASS') {
      passCount++
    } else {
      failCount++
      console.log(`   エラー: ${result.message}`)
    }
  }

  console.log('━'.repeat(60))
  console.log(`\n合計: ${results.length}件 | 成功: ${passCount}件 | 失敗: ${failCount}件\n`)

  if (failCount > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ テスト実行エラー:', error)
  process.exit(1)
})
