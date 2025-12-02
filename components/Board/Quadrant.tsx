'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Task, Quadrant as QuadrantType } from '@/lib/types'
import { TaskCard } from './TaskCard'

interface QuadrantProps {
  quadrant: QuadrantType
  title: string
  description: string
  tasks: Task[]
  colorClass: string
  bgClass?: string
  badgeClass?: string
  label?: string
  readOnly?: boolean
}

export function Quadrant({ quadrant, title, description, tasks, colorClass, bgClass, badgeClass, label, readOnly = false }: QuadrantProps) {
  const { setNodeRef, isOver } = useDroppable({ id: quadrant, disabled: readOnly })
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false)

  // アクティブタスクと完了タスクを分離
  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div
      ref={setNodeRef}
      data-quadrant={quadrant.toUpperCase()}
      className={`rounded-2xl bg-white border border-slate-200 shadow-md p-4 md:p-5 overflow-y-auto relative flex flex-col transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 ${
        isOver ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50' : ''
      }`}
    >
      {/* ヘッダー部分 */}
      <div className={`-mx-4 -mt-4 md:-mx-5 md:-mt-5 px-4 md:px-5 py-3 md:py-4 rounded-t-2xl ${bgClass} border-b border-slate-200 mb-3 md:mb-4`}>
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-base md:text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      {/* アクティブタスク */}
      <div className="space-y-2 md:space-y-3 min-h-[80px] md:min-h-[120px]">
        {activeTasks.map((task) => (
          <TaskCard key={task.id} task={task} quadrant={quadrant} readOnly={readOnly} />
        ))}
        {activeTasks.length === 0 && (
          <div className="text-center py-6 md:py-8 text-slate-400 text-sm">
            タスクをドラッグ&ドロップ
          </div>
        )}
      </div>

      {/* 完了タスク */}
      {completedTasks.length > 0 && (
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors mb-2 w-full"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isCompletedExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium">完了済み ({completedTasks.length})</span>
          </button>
          {isCompletedExpanded && (
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} quadrant={quadrant} readOnly={readOnly} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* タスク追加ボタン - SPは直後、PCは下部固定風 */}
      {!readOnly && (
        <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-slate-100">
          <button className="w-full md:w-auto md:ml-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg active:scale-[0.98] transition-all duration-150">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            タスクを追加
          </button>
        </div>
      )}
    </div>
  )
}
