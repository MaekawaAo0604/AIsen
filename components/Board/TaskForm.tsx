'use client'

import { useState } from 'react'
import type { Quadrant } from '@/lib/types'
import { useBoardStore } from '@/stores/useBoardStore'

export function TaskForm() {
  const [title, setTitle] = useState('')
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant>('q1')
  const addTask = useBoardStore((state) => state.addTask)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addTask(selectedQuadrant, {
      title: title.trim(),
      notes: '',
      due: null,
    })

    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <select
        value={selectedQuadrant}
        onChange={(e) => setSelectedQuadrant(e.target.value as Quadrant)}
        className="h-9 px-3 text-[14px] text-[#37352f] bg-[#ffffff] border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] focus:outline-none focus:border-[#2383e2] transition-colors cursor-pointer"
      >
        <option value="q1">緊急×重要</option>
        <option value="q2">非緊急×重要</option>
        <option value="q3">緊急×非重要</option>
        <option value="q4">非緊急×非重要</option>
      </select>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいタスクを入力..."
        className="flex-1 h-9 px-3 text-[14px] text-[#37352f] placeholder:text-[#9b9a97] bg-[#ffffff] border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] focus:outline-none focus:bg-[#ffffff] focus:border-[#2383e2] transition-colors"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="h-9 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[3px] hover:bg-[#1a73d1] active:bg-[#155cb3] disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
      >
        追加
      </button>
    </form>
  )
}
