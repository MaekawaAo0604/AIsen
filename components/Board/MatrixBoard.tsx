'use client'

import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, useDroppable } from '@dnd-kit/core'
import { useBoardStore } from '@/stores/useBoardStore'
import type { Task, Quadrant } from '@/lib/types'
import { TaskCard } from './TaskCard'
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
    const quadrant = active.data.current.quadrant as Quadrant
    const task = tasks[quadrant].find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const fromQuadrant = active.data.current.quadrant as Quadrant
    const toQuadrant = over.id as Quadrant

    if (fromQuadrant !== toQuadrant) {
      moveTask(active.id as string, fromQuadrant, toQuadrant)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative w-full h-[700px] bg-white rounded-[3px] border border-[#e9e9e7] overflow-hidden">
        {/* Y軸ラベル（左側） */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-[#fafafa] border-r border-[#e9e9e7]">
          <div className="transform -rotate-90 whitespace-nowrap text-[12px] font-medium text-[#787774] tracking-wide">
            重要度
          </div>
        </div>

        {/* X軸ラベル（下部） */}
        <div className="absolute left-16 right-0 bottom-0 h-12 flex items-center justify-center bg-[#fafafa] border-t border-[#e9e9e7]">
          <div className="text-[12px] font-medium text-[#787774] tracking-wide">緊急度</div>
        </div>

        {/* メイングリッド */}
        <div className="absolute left-16 right-0 top-0 bottom-12 grid grid-cols-2 grid-rows-2 gap-[1px] bg-[#e9e9e7]">
          {/* Q1: 緊急 × 重要（左上） */}
          <QuadrantZone
            quadrant="q1"
            tasks={tasks.q1}
            label="Q1"
            title="今すぐやる"
            description="重要かつ緊急"
          />

          {/* Q2: 非緊急 × 重要（右上） */}
          <QuadrantZone
            quadrant="q2"
            tasks={tasks.q2}
            label="Q2"
            title="計画してやる"
            description="重要だが緊急ではない"
          />

          {/* Q3: 緊急 × 非重要（左下） */}
          <QuadrantZone
            quadrant="q3"
            tasks={tasks.q3}
            label="Q3"
            title="誰かに任せる"
            description="緊急だが重要ではない"
          />

          {/* Q4: 非緊急 × 非重要（右下） */}
          <QuadrantZone
            quadrant="q4"
            tasks={tasks.q4}
            label="Q4"
            title="やらない"
            description="重要でも緊急でもない"
          />
        </div>


        {/* 軸ラベル */}
        <div className="absolute left-2 top-12 text-[11px] font-medium text-[#9b9a97]">高</div>
        <div className="absolute left-2 bottom-16 text-[11px] font-medium text-[#9b9a97]">低</div>
        <div className="absolute left-20 bottom-2 text-[11px] font-medium text-[#9b9a97]">高</div>
        <div className="absolute right-4 bottom-2 text-[11px] font-medium text-[#9b9a97]">低</div>
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

interface QuadrantZoneProps {
  quadrant: Quadrant
  tasks: Task[]
  label: string
  title: string
  description: string
}

function QuadrantZone({ quadrant, tasks, label, title, description }: QuadrantZoneProps) {
  const { setNodeRef } = useDroppable({ id: quadrant })

  const getColors = () => {
    switch (quadrant) {
      case 'q1':
        return {
          bg: 'bg-[#fef2f2]',
          badge: 'bg-[#dc2626] text-white',
        }
      case 'q2':
        return {
          bg: 'bg-[#eff6ff]',
          badge: 'bg-[#2563eb] text-white',
        }
      case 'q3':
        return {
          bg: 'bg-[#fefce8]',
          badge: 'bg-[#ca8a04] text-white',
        }
      case 'q4':
        return {
          bg: 'bg-[#fafafa]',
          badge: 'bg-[#6b7280] text-white',
        }
    }
  }

  const colors = getColors()

  return (
    <div
      ref={setNodeRef}
      id={quadrant}
      className={`${colors.bg} p-4 overflow-y-auto relative`}
    >
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-[#e9e9e7]">
        <div className="flex items-center gap-2">
          <div className={`${colors.badge} text-[11px] font-semibold px-2 py-0.5 rounded-[3px]`}>
            {label}
          </div>
          <div className="text-[13px] font-medium text-[#37352f]">{title}</div>
        </div>
      </div>
      <div className="text-[11px] text-[#9b9a97] mb-4">{description}</div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} quadrant={quadrant} />
        ))}
      </div>
    </div>
  )
}
