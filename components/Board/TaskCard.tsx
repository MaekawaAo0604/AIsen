'use client'

import { useDraggable } from '@dnd-kit/core'
import type { Task, Quadrant } from '@/lib/types'
import { useBoardStore } from '@/stores/useBoardStore'

interface TaskCardProps {
  task: Task
  quadrant: Quadrant
}

export function TaskCard({ task, quadrant }: TaskCardProps) {
  const deleteTask = useBoardStore((state) => state.deleteTask)
  const updateTask = useBoardStore((state) => state.updateTask)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { quadrant },
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('このタスクを削除しますか？')) {
      deleteTask(quadrant, task.id)
    }
  }

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newCompleted = !task.completed
    updateTask(quadrant, task.id, {
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
    })
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group relative bg-white rounded-[3px] border border-[#e9e9e7] hover:bg-[#f7f6f3] transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 shadow-lg' : 'opacity-100'
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {/* チェックボックス */}
            <button
              type="button"
              onClick={handleToggleComplete}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-[3px] border-2 border-[#9b9a97] hover:border-[#2383e2] transition-colors flex items-center justify-center cursor-pointer z-10 relative"
              style={{
                backgroundColor: task.completed ? '#2383e2' : 'transparent',
                borderColor: task.completed ? '#2383e2' : undefined,
              }}
            >
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <p className={`text-[14px] text-[#37352f] leading-[1.5] flex-1 ${task.completed ? 'line-through text-[#9b9a97]' : ''}`}>
              {task.title}
            </p>
            {task.priority !== undefined && (
              <span
                className={`flex-shrink-0 inline-flex items-center justify-center w-8 h-5 text-[10px] font-semibold rounded-[3px] ${
                  task.priority >= 80
                    ? 'bg-[#dc2626] text-white'
                    : task.priority >= 60
                    ? 'bg-[#f59e0b] text-white'
                    : task.priority >= 40
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-[#6b7280] text-white'
                }`}
                title={task.aiReason || '優先度スコア'}
              >
                {task.priority}
              </span>
            )}
          </div>
          {task.aiReason && (
            <p className="mt-1 text-[11px] text-[#787774] leading-[1.3] italic">{task.aiReason}</p>
          )}
          {task.notes && (
            <p className="mt-1 text-[12px] text-[#787774] line-clamp-2 leading-[1.4]">{task.notes}</p>
          )}
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#9b9a97] leading-[1.3]">
            {task.due && (
              <span>📅 期限: {new Date(task.due).toLocaleDateString('ja-JP')}</span>
            )}
            {task.due && task.createdAt && <span>•</span>}
            <span>🕒 追加: {new Date(task.createdAt).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          onMouseDown={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9b9a97] hover:text-[#eb5757] p-1 -mt-1 -mr-1 rounded-[3px] hover:bg-[#eb575715] cursor-pointer z-10 relative"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
