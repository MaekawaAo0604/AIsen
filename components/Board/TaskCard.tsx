'use client'

import { useState, useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { Task, Quadrant } from '@/lib/types'
import { useBoardStore } from '@/stores/useBoardStore'
import { TaskDetailModal } from './TaskDetailModal'
import { ConfirmModal } from '@/components/Modal/ConfirmModal'
import { SWIPE_THRESHOLD } from '@/lib/constants'
import { formatDateJP } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  quadrant: Quadrant
  readOnly?: boolean
  onQuadrantChange?: (taskId: string, fromQuadrant: Quadrant, toQuadrant: Quadrant) => void
}

export function TaskCard({ task, quadrant, readOnly = false, onQuadrantChange }: TaskCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [showQuadrantPicker, setShowQuadrantPicker] = useState(false)
  const deleteTask = useBoardStore((state) => state.deleteTask)
  const updateTask = useBoardStore((state) => state.updateTask)
  const moveTask = useBoardStore((state) => state.moveTask)
  const touchStartX = useRef(0)
  const isSwiping = useRef(false)

  const handleQuadrantChange = (toQuadrant: Quadrant) => {
    if (toQuadrant === quadrant) {
      setShowQuadrantPicker(false)
      return
    }

    moveTask(task.id, quadrant, toQuadrant)

    // aiMetaがある場合、userOverrideフラグを追加
    if (task.aiMeta) {
      updateTask(toQuadrant, task.id, {
        aiMeta: {
          ...task.aiMeta,
          userOverride: true,
          from: quadrant,
        },
      })
    }

    setShowQuadrantPicker(false)
    onQuadrantChange?.(task.id, quadrant, toQuadrant)
  }

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { quadrant },
    disabled: readOnly,
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConfirmDeleteOpen(true)
  }

  const confirmDelete = () => {
    deleteTask(quadrant, task.id)
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
    if (readOnly) return // read-onlyの場合はスワイプ無効

    const touchX = e.touches[0].clientX
    const diff = touchX - touchStartX.current

    // スワイプ判定
    if (Math.abs(diff) > SWIPE_THRESHOLD.MIN_DISTANCE) {
      isSwiping.current = true
    }

    // 左スワイプのみ対応（削除アクション用）
    if (diff < 0 && diff > SWIPE_THRESHOLD.MAX_RANGE) {
      setSwipeOffset(diff)
    }
  }

  const handleTouchEnd = () => {
    if (readOnly) return // read-onlyの場合はスワイプ無効

    // 削除距離を超えたら削除確認
    if (swipeOffset < SWIPE_THRESHOLD.DELETE_DISTANCE) {
      setIsConfirmDeleteOpen(true)
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
        data-testid="task-card"
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        className={`group relative bg-white rounded-xl border border-slate-100 shadow-none hover:bg-slate-50 hover:shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50 shadow-lg scale-105' : 'opacity-100'
        } ${task.completed ? 'opacity-60' : ''} ${swipeOffset !== 0 ? 'transition-none' : 'transition-all duration-150'}`}
      >
      <div className="flex items-start justify-between gap-3 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5 sm:gap-2">
            {/* チェックボックス（read-onlyの場合は無効化） */}
            {!readOnly ? (
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
            ) : (
              <span className="flex-shrink-0 mt-0.5 block w-4 h-4 sm:w-5 sm:h-5 rounded-[3px] border-2 border-[#9b9a97]" />
            )}
            <p className={`text-[12px] sm:text-[13px] md:text-[14px] text-[#37352f] leading-[1.5] flex-1 ${task.completed ? 'line-through text-[#9b9a97]' : ''}`}>
              {task.title}
            </p>
            {task.priority !== undefined && (
              <span
                className={`flex-shrink-0 inline-flex items-center justify-center w-7 h-4.5 sm:w-8 sm:h-5 text-[9px] sm:text-[10px] font-semibold rounded-md border ${
                  task.priority >= 80
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : task.priority >= 60
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : task.priority >= 40
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
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
              <span className="whitespace-nowrap">📅 期限: {formatDateJP(task.due)}</span>
            )}
            {task.due && task.createdAt && <span className="hidden sm:inline">•</span>}
            <span className="whitespace-nowrap">🕒 追加: {formatDateJP(task.createdAt)}</span>
          </div>

          {/* AI整理されたタスクの象限変更UI */}
          {!readOnly && task.aiMeta && (
            <div className="mt-2 relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowQuadrantPicker(!showQuadrantPicker)
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2 py-1 rounded-[3px] text-[10px] sm:text-[11px] text-[#787774] hover:bg-[#e9e9e7] transition-colors"
              >
                <span className="text-[#2383e2]">🤖</span>
                <span>
                  現在: <span className="font-medium">{quadrant.toUpperCase()}</span>
                  {task.aiMeta.userOverride && <span className="ml-1">(変更済み)</span>}
                </span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showQuadrantPicker && (
                <div className="absolute left-0 top-full mt-1 z-20 bg-white border-2 border-[#e9e9e7] rounded-[6px] shadow-lg p-2 flex gap-1">
                  {(['q1', 'q2', 'q3', 'q4'] as Quadrant[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuadrantChange(q)
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`px-2 py-1 rounded-[3px] text-[10px] sm:text-[11px] font-medium transition-colors ${
                        q === quadrant
                          ? 'bg-[#2383e2] text-white'
                          : 'bg-[#f7f6f3] text-[#37352f] hover:bg-[#e9e9e7]'
                      }`}
                    >
                      {q.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {/* 削除ボタン（read-onlyの場合は非表示） */}
        {!readOnly && (
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
        )}
      </div>
    </div>

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        task={task}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="タスクを削除"
        message="このタスクを削除してもよろしいですか？"
        confirmText="削除"
        cancelText="キャンセル"
        type="danger"
      />
    </>
  )
}
