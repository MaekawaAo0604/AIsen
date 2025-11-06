'use client'

import { useBoardController } from '@/hooks/useBoardController'
import { MatrixBoard } from '@/components/Board/MatrixBoard'
import { TaskForm } from '@/components/Board/TaskForm'

interface BoardPageClientProps {
  boardId: string
}

export function BoardPageClient({ boardId }: BoardPageClientProps) {
  const { isLoading } = useBoardController(boardId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] px-4 sm:px-6 lg:px-24 py-6 sm:py-12 flex items-center justify-center">
        <div className="text-[14px] text-[#787774]">ボードを読み込んでいます...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-6 lg:px-24 py-6 sm:py-12">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-[#37352f] leading-tight tracking-tight">
            アイゼンハワー・マトリクス
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#787774]">
            タスクを重要度と緊急度で整理して、優先順位を明確にしましょう
          </p>
        </div>

        {/* Task Form */}
        <TaskForm />

        {/* Matrix Board */}
        <MatrixBoard />
      </div>
    </div>
  )
}
