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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group relative bg-white rounded-[3px] border border-[#e9e9e7] hover:bg-[#f7f6f3] transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 shadow-lg' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-[#37352f] leading-[1.5]">{task.title}</p>
          {task.notes && (
            <p className="mt-1 text-[12px] text-[#787774] line-clamp-2 leading-[1.4]">{task.notes}</p>
          )}
          {task.due && (
            <p className="mt-1.5 text-[11px] text-[#9b9a97] leading-[1.3]">
              期限: {new Date(task.due).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9b9a97] hover:text-[#eb5757] p-1 -mt-1 -mr-1 rounded-[3px] hover:bg-[#eb575715]"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
