'use client'

import { useState, useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { Task, Quadrant } from '@/lib/types'
import { useBoardStore } from '@/stores/useBoardStore'
import { TaskDetailModal } from './TaskDetailModal'

interface TaskCardProps {
  task: Task
  quadrant: Quadrant
}

export function TaskCard({ task, quadrant }: TaskCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const deleteTask = useBoardStore((state) => state.deleteTask)
  const updateTask = useBoardStore((state) => state.updateTask)
  const touchStartX = useRef(0)
  const isSwiping = useRef(false)

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

  const handleCardClick = () => {
    if (!isSwiping.current) {
      setIsDetailModalOpen(true)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    isSwiping.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchX = e.touches[0].clientX
    const diff = touchX - touchStartX.current

    // スワイプ判定（30px以上移動でスワイプと認識）
    if (Math.abs(diff) > 30) {
      isSwiping.current = true
    }

    // 左スワイプのみ対応（削除アクション用）
    if (diff < 0 && diff > -100) {
      setSwipeOffset(diff)
    }
  }

  const handleTouchEnd = () => {
    // -80px以上スワイプで削除確認
    if (swipeOffset < -80) {
      if (confirm('このタスクを削除しますか？')) {
        deleteTask(quadrant, task.id)
      }
    }
    setSwipeOffset(0)
    setTimeout(() => {
      isSwiping.current = false
    }, 100)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        className={`group relative bg-white rounded-[3px] border border-[#e9e9e7] hover:bg-[#f7f6f3] transition-all cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50 shadow-lg' : 'opacity-100'
        } ${task.completed ? 'opacity-60' : ''} ${swipeOffset !== 0 ? 'transition-none' : 'transition-transform duration-200'}`}
      >
      <div className="flex items-start justify-between gap-2 sm:gap-2 px-3 sm:px-3 py-3 sm:py-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5 sm:gap-2">
            {/* チェックボックス（タップ領域拡大） */}
            <button
              type="button"
              onClick={handleToggleComplete}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex-shrink-0 mt-0.5 p-2 -m-2 rounded-[3px] hover:bg-[#f7f6f3] transition-colors cursor-pointer z-10 relative"
            >
              <span
                className="block w-4 h-4 sm:w-5 sm:h-5 rounded-[3px] border-2 border-[#9b9a97] hover:border-[#2383e2] transition-colors flex items-center justify-center"
                style={{
                  backgroundColor: task.completed ? '#2383e2' : 'transparent',
                  borderColor: task.completed ? '#2383e2' : undefined,
                }}
              >
                {task.completed && (
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
            </button>
            <p className={`text-[12px] sm:text-[13px] md:text-[14px] text-[#37352f] leading-[1.5] flex-1 ${task.completed ? 'line-through text-[#9b9a97]' : ''}`}>
              {task.title}
            </p>
            {task.priority !== undefined && (
              <span
                className={`flex-shrink-0 inline-flex items-center justify-center w-7 h-4.5 sm:w-8 sm:h-5 text-[9px] sm:text-[10px] font-semibold rounded-[3px] ${
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
            <p className="mt-1 text-[10px] sm:text-[11px] text-[#787774] leading-[1.3] italic">{task.aiReason}</p>
          )}
          <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#9b9a97] leading-[1.3] flex-wrap">
            {task.due && (
              <span className="whitespace-nowrap">📅 期限: {new Date(task.due).toLocaleDateString('ja-JP')}</span>
            )}
            {task.due && task.createdAt && <span className="hidden sm:inline">•</span>}
            <span className="whitespace-nowrap">🕒 追加: {new Date(task.createdAt).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
        {/* 削除ボタン（タップ領域拡大） */}
        <button
          type="button"
          onClick={handleDelete}
          onMouseDown={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity text-[#9b9a97] hover:text-[#eb5757] p-2 -mt-1 -mr-1 rounded-[3px] hover:bg-[#eb575715] cursor-pointer z-10 relative"
        >
          <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        task={task}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  )
}
