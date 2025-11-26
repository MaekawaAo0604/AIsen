/**
 * デモ用の固定データ
 * /s/DEMO で表示するサンプルタスク
 */

import type { Task, Quadrant } from './types'

export type TasksByQuadrant = {
  q1: Task[]
  q2: Task[]
  q3: Task[]
  q4: Task[]
}

export const DEMO_BOARD_TOKEN = 'DEMO'

// デモ用タスク（SSRで即座に表示）
// Task型に合わせてnotes, due, createdAtを文字列化
export const DEMO_TASKS: Task[] = [
  // Q1: 今すぐやる（緊急×重要）
  {
    id: 'demo-q1-1',
    title: 'クライアント提案書を完成させる',
    notes: '重要顧客向けの新規提案。競合との比較資料も必要。',
    due: '2025-11-13T17:00:00',
    createdAt: '2025-11-13T09:00:00',
    priority: 95,
    aiReason: '期限が今日中で、重要顧客向けの提案書のため最優先',
  },
  {
    id: 'demo-q1-2',
    title: 'サーバー障害の対応',
    notes: 'EC2インスタンスのCPU使用率が異常値。スケールアウト検討。',
    due: null,
    createdAt: '2025-11-13T10:30:00',
    priority: 98,
    aiReason: '現在進行形の障害対応のため緊急度・重要度ともに最高',
  },

  // Q2: 計画してやる（重要だが緊急ではない）
  {
    id: 'demo-q2-1',
    title: 'チーム研修の企画',
    notes: '新技術スタックの導入に向けた社内勉強会の計画。',
    due: '2025-11-20T18:00:00',
    createdAt: '2025-11-10T14:00:00',
    priority: 75,
    aiReason: '期限まで1週間あり、チーム成長に重要だが緊急ではない',
  },
  {
    id: 'demo-q2-2',
    title: '新規プロジェクトの要件定義',
    notes: 'ステークホルダーとの調整が必要。来期スタート予定。',
    due: null,
    createdAt: '2025-11-11T11:00:00',
    priority: 70,
    aiReason: 'プロジェクト成功に重要だが、開始まで時間がある',
  },
  {
    id: 'demo-q2-3',
    title: '四半期レポート作成',
    notes: 'Q4の実績まとめ。経営会議での報告用。',
    due: '2025-11-25T17:00:00',
    createdAt: '2025-11-12T16:00:00',
    priority: 80,
    aiReason: '経営報告に必要だが、期限まで2週間弱の余裕あり',
  },

  // Q3: 誰かに任せる（緊急だが重要ではない）
  {
    id: 'demo-q3-1',
    title: '出席だけしておけばいい定例会議',
    notes: '自分が発言する議題はないが、一応出席しておく必要がある。',
    due: '2025-11-13T15:00:00',
    createdAt: '2025-11-13T08:00:00',
    priority: 45,
    aiReason: '今日の会議だが、自分がやるほど重要な内容ではない',
  },
  {
    id: 'demo-q3-2',
    title: 'フォーマットに数字を転記するだけの作業',
    notes: '定型フォーマットへのデータ入力。急ぎだが単純作業。',
    due: null,
    createdAt: '2025-11-13T12:00:00',
    priority: 40,
    aiReason: '今日中に必要だが、誰でもできる単純作業',
  },

  // Q4: やらない（重要でも緊急でもない）
  {
    id: 'demo-q4-1',
    title: 'デスク周りの整理',
    notes: '書類が溜まってきた。時間があるときに整理。',
    due: null,
    createdAt: '2025-11-10T15:00:00',
    priority: 20,
    aiReason: '快適性向上には良いが、業務への影響は小さい',
  },
  {
    id: 'demo-q4-2',
    title: '古いメールの整理',
    notes: '1年以上前のメールをアーカイブ。ストレージ容量確保。',
    due: null,
    createdAt: '2025-11-09T10:00:00',
    priority: 15,
    aiReason: 'やらなくても特に問題はない作業',
  },
]

// 象限ごとにグループ化（SSR用）
export function getDemoTasksByQuadrant(): TasksByQuadrant {
  const tasks: TasksByQuadrant = {
    q1: [],
    q2: [],
    q3: [],
    q4: [],
  }

  // タスクタイトルから象限を判定（簡易的な実装）
  DEMO_TASKS.forEach((task) => {
    // Q1タスクの判定
    if (task.priority && task.priority >= 90) {
      tasks.q1.push(task)
    }
    // Q2タスクの判定
    else if (task.priority && task.priority >= 65 && task.priority < 90) {
      tasks.q2.push(task)
    }
    // Q3タスクの判定
    else if (task.priority && task.priority >= 35 && task.priority < 65) {
      tasks.q3.push(task)
    }
    // Q4タスクの判定
    else {
      tasks.q4.push(task)
    }
  })

  return tasks
}

// トークンがデモ用かどうかを判定
export function isDemoToken(token: string): boolean {
  return token === DEMO_BOARD_TOKEN
}
