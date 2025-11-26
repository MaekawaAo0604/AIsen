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
        className="w-full md:w-auto inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-md active:bg-blue-800 active:scale-[0.98] transition-all duration-150"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        新しいタスクを追加
      </button>

      <TaskPlacementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlace={handlePlaceTask}
      />
    </>
  )
}
