'use client'

import { useBoardController } from '@/hooks/useBoardController'
import { MatrixBoard } from './MatrixBoard'
import { TaskForm } from './TaskForm'

interface BoardPageProps {
  isSSR?: boolean
}

export function BoardPage({ isSSR = false }: BoardPageProps) {
  const { isLoading } = useBoardController()

  // SSR用の仮タスク（空の4象限 + サンプル1〜2件）
  const ssrInitialTasks = isSSR
    ? {
        q1: [
          {
            id: 'ssr-demo-1',
            title: '今日中 顧客対応',
            quadrant: 'q1' as const,
            createdAt: new Date().toISOString(),
            priority: 1,
            notes: '',
            due: null,
          },
        ],
        q2: [
          {
            id: 'ssr-demo-2',
            title: '採用戦略の見直し',
            quadrant: 'q2' as const,
            createdAt: new Date().toISOString(),
            priority: 2,
            notes: '',
            due: null,
          },
        ],
        q3: [],
        q4: [],
      }
    : undefined

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-full sm:max-w-[1200px] lg:max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] sm:text-[32px] md:text-[40px] font-bold text-slate-900 leading-tight tracking-tight">
                アイゼンハワー・マトリクス
              </h1>
              {/* 自動保存バッジ */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                自動保存中
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              タスクを重要度と緊急度で整理して、優先順位を明確にしましょう
            </p>
          </div>
          
          {/* Task Form - PC版は右寄せボタン */}
          <div className="w-full md:w-auto md:flex-shrink-0">
            <TaskForm />
          </div>
        </div>

        {/* Matrix Board - SSR時は仮タスクを表示、クライアント側で実データに差し替え */}
        <MatrixBoard initialTasks={ssrInitialTasks} />
      </div>
    </div>
  )
}
