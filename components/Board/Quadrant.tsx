'use client'

import type { Task, Quadrant as QuadrantType } from '@/lib/types'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'

interface QuadrantProps {
  quadrant: QuadrantType
  title: string
  description: string
  tasks: Task[]
  colorClass: string
}

export function Quadrant({ quadrant, title, description, tasks, colorClass }: QuadrantProps) {
  return (
    <div
      className={`rounded-lg border-2 ${colorClass} p-4 min-h-[400px]`}
      data-quadrant={quadrant}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <TaskForm quadrant={quadrant} />

      <div className="mt-4 space-y-2">
        {tasks.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            タスクを追加してください
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} quadrant={quadrant} />
          ))
        )}
      </div>
    </div>
  )
}
