'use client'

import { useBoardStore } from '@/stores/useBoardStore'
import { Quadrant } from './Quadrant'

const quadrantConfig = {
  q1: { title: '緊急 × 重要', description: '今すぐやる' },
  q2: { title: '非緊急 × 重要', description: '計画してやる' },
  q3: { title: '緊急 × 非重要', description: '誰かに任せる' },
  q4: { title: '非緊急 × 非重要', description: 'やらない' },
} as const

export function BoardCanvas() {
  const tasks = useBoardStore((state) => state.tasks)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrant
          quadrant="q1"
          title={quadrantConfig.q1.title}
          description={quadrantConfig.q1.description}
          tasks={tasks.q1}
          colorClass="bg-q1-50 border-q1-200"
        />
        <Quadrant
          quadrant="q2"
          title={quadrantConfig.q2.title}
          description={quadrantConfig.q2.description}
          tasks={tasks.q2}
          colorClass="bg-q2-50 border-q2-200"
        />
        <Quadrant
          quadrant="q3"
          title={quadrantConfig.q3.title}
          description={quadrantConfig.q3.description}
          tasks={tasks.q3}
          colorClass="bg-q3-50 border-q3-200"
        />
        <Quadrant
          quadrant="q4"
          title={quadrantConfig.q4.title}
          description={quadrantConfig.q4.description}
          tasks={tasks.q4}
          colorClass="bg-q4-50 border-q4-200"
        />
      </div>
    </div>
  )
}
