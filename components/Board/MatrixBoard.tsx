'use client'

import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, useDroppable } from '@dnd-kit/core'
import { useBoardStore } from '@/stores/useBoardStore'
import type { Task, Quadrant as QuadrantType } from '@/lib/types'
import { TaskCard } from './TaskCard'
import { Quadrant } from './Quadrant'
import { useState } from 'react'

export function MatrixBoard() {
  const tasks = useBoardStore((state) => state.tasks)
  const moveTask = useBoardStore((state) => state.moveTask)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: any) => {
    const { active } = event
    const quadrant = active.data.current.quadrant as QuadrantType
    const task = tasks[quadrant].find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return
    if (!active.data.current) return

    const fromQuadrant = active.data.current.quadrant as QuadrantType
    const toQuadrant = over.id as QuadrantType

    if (fromQuadrant !== toQuadrant) {
      moveTask(active.id as string, fromQuadrant, toQuadrant)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] bg-white rounded-[3px] border border-[#e9e9e7] overflow-hidden">
        {/* Y軸ラベル（左側） */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 md:w-16 flex items-center justify-center bg-[#fafafa] border-r border-[#e9e9e7]">
          <div className="transform -rotate-90 whitespace-nowrap text-[10px] sm:text-[11px] md:text-[12px] font-medium text-[#787774] tracking-wide">
            重要度
          </div>
        </div>

        {/* X軸ラベル（下部） */}
        <div className="absolute left-10 sm:left-12 md:left-16 right-0 bottom-0 h-8 sm:h-10 md:h-12 flex items-center justify-center bg-[#fafafa] border-t border-[#e9e9e7]">
          <div className="text-[10px] sm:text-[11px] md:text-[12px] font-medium text-[#787774] tracking-wide">緊急度</div>
        </div>

        {/* メイングリッド */}
        <div className="absolute left-10 sm:left-12 md:left-16 right-0 top-0 bottom-8 sm:bottom-10 md:bottom-12 grid grid-cols-2 grid-rows-2 gap-[1px] bg-[#e9e9e7]">
          {/* Q1: 緊急 × 重要（左上） */}
          <Quadrant
            quadrant="q1"
            tasks={tasks.q1}
            label="Q1"
            title="今すぐやる"
            description="重要かつ緊急"
            colorClass=""
            bgClass="bg-[#fef2f2]"
            badgeClass="bg-[#dc2626] text-white"
          />

          {/* Q2: 非緊急 × 重要（右上） */}
          <Quadrant
            quadrant="q2"
            tasks={tasks.q2}
            label="Q2"
            title="計画してやる"
            description="重要だが緊急ではない"
            colorClass=""
            bgClass="bg-[#eff6ff]"
            badgeClass="bg-[#2563eb] text-white"
          />

          {/* Q3: 緊急 × 非重要（左下） */}
          <Quadrant
            quadrant="q3"
            tasks={tasks.q3}
            label="Q3"
            title="誰かに任せる"
            description="緊急だが重要ではない"
            colorClass=""
            bgClass="bg-[#fefce8]"
            badgeClass="bg-[#ca8a04] text-white"
          />

          {/* Q4: 非緊急 × 非重要（右下） */}
          <Quadrant
            quadrant="q4"
            tasks={tasks.q4}
            label="Q4"
            title="やらない"
            description="重要でも緊急でもない"
            colorClass=""
            bgClass="bg-[#fafafa]"
            badgeClass="bg-[#6b7280] text-white"
          />
        </div>


        {/* 軸ラベル */}
        <div className="absolute left-0.5 sm:left-1 md:left-2 top-8 sm:top-10 md:top-12 text-[9px] sm:text-[10px] md:text-[11px] font-medium text-[#9b9a97]">高</div>
        <div className="absolute left-0.5 sm:left-1 md:left-2 bottom-12 sm:bottom-14 md:bottom-16 text-[9px] sm:text-[10px] md:text-[11px] font-medium text-[#9b9a97]">低</div>
        <div className="absolute left-12 sm:left-16 md:left-20 bottom-0.5 sm:bottom-1 md:bottom-2 text-[9px] sm:text-[10px] md:text-[11px] font-medium text-[#9b9a97]">高</div>
        <div className="absolute right-2 sm:right-3 md:right-4 bottom-0.5 sm:bottom-1 md:bottom-2 text-[9px] sm:text-[10px] md:text-[11px] font-medium text-[#9b9a97]">低</div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="bg-white p-3 shadow-lg border-2 border-[#2383e2] rounded-[3px] cursor-grabbing">
            <p className="text-[14px] text-[#37352f]">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
