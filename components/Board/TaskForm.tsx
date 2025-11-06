'use client'

import { useState } from 'react'
import type { Quadrant } from '@/lib/types'
import { useBoardStore } from '@/stores/useBoardStore'
import { TaskPlacementModal } from './TaskPlacementModal'

export function TaskForm() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const addTask = useBoardStore((state) => state.addTask)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handlePlaceTask = (
    quadrant: Quadrant,
    title: string,
    subtasks: string,
    dueDate: string | null,
    priority?: number,
    aiReason?: string
  ) => {
    addTask(quadrant, {
      title,
      notes: subtasks,
      due: dueDate,
      priority,
      aiReason,
    })

    setIsModalOpen(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="w-full h-9 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[3px] hover:bg-[#1a73d1] active:bg-[#155cb3] transition-colors"
      >
        ＋ 新しいタスクを追加
      </button>

      <TaskPlacementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlace={handlePlaceTask}
      />
    </>
  )
}
