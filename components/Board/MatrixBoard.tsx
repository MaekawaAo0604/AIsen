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
      <div className="relative w-full h-[800px] bg-white rounded-2xl shadow-2xl border-2 border-gray-300 overflow-hidden">
        {/* Y軸ラベル（左側） */}
        <div className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center bg-gray-50 border-r-2 border-gray-300">
          <div className="transform -rotate-90 whitespace-nowrap text-lg font-bold text-gray-800 tracking-wide">
            重要度
          </div>
        </div>

        {/* X軸ラベル（下部） */}
        <div className="absolute left-24 right-0 bottom-0 h-20 flex items-center justify-center bg-gray-50 border-t-2 border-gray-300">
          <div className="text-lg font-bold text-gray-800 tracking-wide">緊急度</div>
        </div>

        {/* メイングリッド */}
        <div className="absolute left-24 right-0 top-0 bottom-20 grid grid-cols-2 grid-rows-2 gap-0">
          {/* Q2: 非緊急 × 重要（左上） */}
          <QuadrantZone
            quadrant="q2"
            tasks={tasks.q2}
            label="Q2"
            title="計画してやる"
            description="重要だが緊急ではない"
          />

          {/* Q1: 緊急 × 重要（右上） */}
          <QuadrantZone
            quadrant="q1"
            tasks={tasks.q1}
            label="Q1"
            title="今すぐやる"
            description="重要かつ緊急"
          />

          {/* Q4: 非緊急 × 非重要（左下） */}
          <QuadrantZone
            quadrant="q4"
            tasks={tasks.q4}
            label="Q4"
            title="やらない"
            description="重要でも緊急でもない"
          />

          {/* Q3: 緊急 × 非重要（右下） */}
          <QuadrantZone
            quadrant="q3"
            tasks={tasks.q3}
            label="Q3"
            title="誰かに任せる"
            description="緊急だが重要ではない"
          />
        </div>

        {/* 中央の十字線 */}
        <div className="absolute left-24 right-0 top-[calc(50%-40px)] h-1 bg-gray-400 pointer-events-none z-10" />
        <div className="absolute left-[calc(50%+12px)] top-0 bottom-20 w-1 bg-gray-400 pointer-events-none z-10" />

        {/* Y軸の矢印（上） */}
        <div className="absolute left-24 top-8 w-1 h-16 bg-gray-700 z-10">
          <div className="absolute -top-2 -left-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-gray-700" />
        </div>

        {/* X軸の矢印（右） */}
        <div className="absolute right-8 bottom-20 h-1 w-16 bg-gray-700 z-10">
          <div className="absolute -right-2 -top-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[16px] border-l-gray-700" />
        </div>

        {/* 軸ラベル */}
        <div className="absolute left-4 top-16 text-base font-bold text-gray-700 bg-white px-3 py-1 rounded-lg shadow z-10">高</div>
        <div className="absolute left-4 bottom-28 text-base font-bold text-gray-700 bg-white px-3 py-1 rounded-lg shadow z-10">低</div>
        <div className="absolute left-32 bottom-4 text-base font-bold text-gray-700 bg-white px-3 py-1 rounded-lg shadow z-10">低</div>
        <div className="absolute right-16 bottom-4 text-base font-bold text-gray-700 bg-white px-3 py-1 rounded-lg shadow z-10">高</div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="bg-white p-4 shadow-2xl border-2 border-blue-500 rounded-lg cursor-grabbing transform rotate-2 scale-105">
            <p className="font-semibold text-gray-900">{activeTask.title}</p>
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
          bg: 'bg-red-100',
          border: 'border-red-300',
          badge: 'bg-red-600',
        }
      case 'q2':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          badge: 'bg-blue-600',
        }
      case 'q3':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          badge: 'bg-yellow-600',
        }
      case 'q4':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          badge: 'bg-gray-600',
        }
    }
  }

  const colors = getColors()

  return (
    <div
      ref={setNodeRef}
      id={quadrant}
      className={`${colors.bg} ${colors.border} border-2 p-6 overflow-y-auto relative`}
    >
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className={`${colors.badge} text-white text-sm font-bold px-3 py-1 rounded-lg shadow-md`}>
          {label}
        </div>
      </div>
      <div className="absolute top-4 right-4 text-right">
        <div className="text-base font-bold text-gray-900">{title}</div>
        <div className="text-sm text-gray-700 mt-1">{description}</div>
      </div>
      <div className="mt-20 space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} quadrant={quadrant} />
        ))}
      </div>
    </div>
  )
}
