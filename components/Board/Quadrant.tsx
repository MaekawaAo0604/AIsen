'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Task, Quadrant as QuadrantType } from '@/lib/types'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'

interface QuadrantProps {
  quadrant: QuadrantType
  title: string
  description: string
  tasks: Task[]
  colorClass: string
  bgClass?: string
  badgeClass?: string
  label?: string
}

export function Quadrant({ quadrant, title, description, tasks, colorClass, bgClass, badgeClass, label }: QuadrantProps) {
  const { setNodeRef } = useDroppable({ id: quadrant })
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false)

  // アクティブタスクと完了タスクを分離
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div
      ref={setNodeRef}
      className={`${bgClass || `rounded-lg border-2 ${colorClass}`} p-4 min-h-[400px] overflow-y-auto relative`}
      data-quadrant={quadrant}
    >
      {label && badgeClass && (
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-[#e9e9e7]">
          <div className="flex items-center gap-2">
            <div className={`${badgeClass} text-[11px] font-semibold px-2 py-0.5 rounded-[3px]`}>
              {label}
            </div>
            <div className="text-[13px] font-medium text-[#37352f]">{title}</div>
          </div>
        </div>
      )}
      {!label && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      )}
      <div className="text-[11px] text-[#9b9a97] mb-4">{description}</div>

      {!label && <TaskForm quadrant={quadrant} />}

      {/* アクティブタスク */}
      <div className="mt-4 space-y-2">
        {activeTasks.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            タスクを追加してください
          </p>
        ) : (
          activeTasks.map((task) => (
            <TaskCard key={task.id} task={task} quadrant={quadrant} />
          ))
        )}
      </div>

      {/* 完了タスクセクション（折りたたみ式） */}
      {completedTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
            className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                className={`w-4 h-4 transition-transform ${isCompletedExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium">完了済み</span>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{completedTasks.length}</span>
          </button>

          {isCompletedExpanded && (
            <div className="mt-2 space-y-2">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} quadrant={quadrant} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
