'use client'

import { useState } from 'react'
import type { Quadrant } from '@/lib/types'
import { useBoardStore } from '@/stores/useBoardStore'

interface TaskFormProps {
  quadrant: Quadrant
}

export function TaskForm({ quadrant }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const addTask = useBoardStore((state) => state.addTask)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addTask(quadrant, {
      title: title.trim(),
      notes: '',
      due: null,
    })

    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タスクを追加..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </form>
  )
}
