'use client'

import type { Task, Quadrant } from '@/lib/types'
import { useBoardStore } from '@/stores/useBoardStore'

interface TaskCardProps {
  task: Task
  quadrant: Quadrant
}

export function TaskCard({ task, quadrant }: TaskCardProps) {
  const deleteTask = useBoardStore((state) => state.deleteTask)

  const handleDelete = () => {
    if (confirm('このタスクを削除しますか？')) {
      deleteTask(quadrant, task.id)
    }
  }

  return (
    <div className="group relative rounded-md bg-white p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{task.title}</p>
          {task.notes && (
            <p className="mt-1 text-xs text-gray-600 line-clamp-2">{task.notes}</p>
          )}
          {task.due && (
            <p className="mt-1 text-xs text-gray-500">
              期限: {new Date(task.due).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
