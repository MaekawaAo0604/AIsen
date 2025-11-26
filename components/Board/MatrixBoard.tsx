'use client'

import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { useBoardStore } from '@/stores/useBoardStore'
import type { Task, Quadrant as QuadrantType } from '@/lib/types'
import type { TasksByQuadrant } from '@/lib/demo-data'
import { Quadrant } from './Quadrant'
import { TaskCard } from './TaskCard'
import { QUADRANT_CONFIG, QUADRANTS } from '@/lib/constants'
import { useState } from 'react'

interface MatrixBoardProps {
  readOnly?: boolean
  initialTasks?: TasksByQuadrant
}

export function MatrixBoard({ readOnly = false, initialTasks }: MatrixBoardProps) {
  // read-onlyの場合はinitialTasksを使用、それ以外はstoreから取得
  const storeTasks = useBoardStore((state) => state.tasks)
  const tasks = readOnly && initialTasks ? initialTasks : storeTasks

  const moveTask = useBoardStore((state) => state.moveTask)
  const [activeTask, setActiveTask] = useState<{ task: Task; quadrant: QuadrantType } | null>(null)

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
    if (task) setActiveTask({ task, quadrant })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)

    // read-onlyの場合はD&D無効
    if (readOnly) return

    const { active, over } = event
    if (!over) return
    if (!active.data.current) return

    const fromQuadrant = active.data.current.quadrant as QuadrantType
    const toQuadrant = over.id as QuadrantType

    if (fromQuadrant !== toQuadrant) {
      moveTask(active.id as string, fromQuadrant, toQuadrant)
    }
  }

  // read-onlyの場合はD&Dコンテキストを無効化
  const BoardContent = () => (
    <div className="relative w-full bg-slate-50 rounded-lg p-4 md:p-6">
      {/* PC: 軸ラベル */}
      <div className="hidden lg:block">
        {/* Y軸ラベル（左側） */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
          <div className="transform -rotate-90 whitespace-nowrap text-xs font-medium text-slate-500 tracking-wide">
            重要度
          </div>
        </div>

        {/* X軸ラベル（下部） */}
        <div className="absolute left-12 right-0 bottom-0 h-10 flex items-center justify-center">
          <div className="text-xs font-medium text-slate-500 tracking-wide">緊急度</div>
        </div>
      </div>

      {/* メイングリッド */}
      <div className="lg:ml-12 lg:mb-10">
        {/* PC: 2x2 グリッド / SP: 縦並び */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {QUADRANTS.map((quadrant) => {
            const config = QUADRANT_CONFIG[quadrant]
            return (
              <Quadrant
                key={quadrant}
                quadrant={quadrant}
                tasks={tasks[quadrant]}
                label={config.label}
                title={config.title}
                description={config.description}
                colorClass=""
                bgClass={config.bgClass}
                badgeClass={config.badgeClass}
                readOnly={readOnly}
              />
            )
          })}
        </div>
      </div>
    </div>
  )

  return readOnly ? (
    <BoardContent />
  ) : (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <BoardContent />
      <DragOverlay>
        {activeTask && (
          <div className="opacity-80 rotate-3 scale-105">
            <TaskCard
              task={activeTask.task}
              quadrant={activeTask.quadrant}
              readOnly={true}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
