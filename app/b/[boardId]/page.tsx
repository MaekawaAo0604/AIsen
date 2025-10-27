import { MatrixBoard } from '@/components/Board/MatrixBoard'
import { TaskForm } from '@/components/Board/TaskForm'

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params

  return (
    <div className="min-h-screen bg-[#ffffff] px-24 py-12">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-[40px] font-bold text-[#37352f] leading-tight tracking-tight">
            アイゼンハワー・マトリクス
          </h1>
          <p className="text-[14px] text-[#787774]">
            タスクを重要度と緊急度で整理して、優先順位を明確にしましょう
          </p>
          <p className="text-[12px] text-[#9b9a97]">
            Board ID: {boardId}
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
