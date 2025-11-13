'use client'

import { useEffect } from 'react'
import { useBoardStore } from '@/stores/useBoardStore'
import { useNotifications } from './useNotifications'
import { updateNotificationSchedules } from '@/lib/notificationScheduler'
import type { Task } from '@/lib/types'

/**
 * タスク変更を監視して通知スケジュールを自動更新するフック
 */
export function useNotificationScheduler() {
  const { tasks } = useBoardStore()
  const { settings } = useNotifications()

  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined') {
      return
    }

    // 通知が無効の場合はスキップ
    if (!settings.enabled) {
      return
    }

    // 全象限のタスクを配列に変換
    const allTasks: Task[] = [
      ...tasks.q1,
      ...tasks.q2,
      ...tasks.q3,
      ...tasks.q4,
    ]

    console.log('📋 Tasks changed, updating notification schedules...')
    console.log(`  - Total tasks: ${allTasks.length}`)
    console.log(`  - Settings:`, settings)

    // 通知スケジュールを更新
    updateNotificationSchedules(allTasks, {
      deadlineReminder: settings.deadlineReminder,
      dailySummary: settings.dailySummary,
    })
  }, [tasks, settings])
}
