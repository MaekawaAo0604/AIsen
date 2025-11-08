'use client'

import { useBoardController } from '@/hooks/useBoardController'
import { MatrixBoard } from './MatrixBoard'
import { TaskForm } from './TaskForm'

export function BoardPage() {
  const { isLoading } = useBoardController()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] px-24 py-12 flex items-center justify-center">
        <div className="text-[14px] text-[#787774]">ボードを読み込んでいます...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-full sm:max-w-[1200px] lg:max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-[28px] sm:text-[32px] md:text-[40px] font-bold text-[#37352f] leading-tight tracking-tight">
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
