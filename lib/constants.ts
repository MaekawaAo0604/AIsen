/**
 * アプリケーション全体で使用する定数
 */

import type { Quadrant } from './types'

/**
 * 4象限の定義
 */
export const QUADRANT_CONFIG = {
  q1: {
    id: 'q1' as const,
    label: 'Q1',
    title: '今すぐやる',
    description: '重要かつ緊急',
    longDescription: '今すぐ対応すべきタスク。危機管理や締切直前の作業。',
    bgClass: 'bg-[#fef2f2]',
    badgeClass: 'bg-[#dc2626] text-white',
    borderClass: 'border-q1-200',
  },
  q2: {
    id: 'q2' as const,
    label: 'Q2',
    title: '計画してやる',
    description: '重要だが緊急ではない',
    longDescription: '計画的に取り組むべきタスク。戦略立案や自己投資。',
    bgClass: 'bg-[#eff6ff]',
    badgeClass: 'bg-[#2563eb] text-white',
    borderClass: 'border-q2-200',
  },
  q3: {
    id: 'q3' as const,
    label: 'Q3',
    title: '誰かに任せる',
    description: '緊急だが重要ではない',
    longDescription: '他者に委任できるタスク。中断対応や急ぎの雑務。',
    bgClass: 'bg-[#fefce8]',
    badgeClass: 'bg-[#ca8a04] text-white',
    borderClass: 'border-q3-200',
  },
  q4: {
    id: 'q4' as const,
    label: 'Q4',
    title: 'やらない',
    description: '重要でも緊急でもない',
    longDescription: '後回しでよいタスク。暇つぶしや無駄な会議。',
    bgClass: 'bg-[#fafafa]',
    badgeClass: 'bg-[#6b7280] text-white',
    borderClass: 'border-q4-200',
  },
} as const

// ==================== プラン制限 ====================

/**
 * Freeプランのボード作成上限
 */
export const FREE_BOARD_LIMIT = 2

/**
 * AI ブレインストーミング回数制限（1日あたり）
 */
export const BRAINSTORM_LIMITS = {
  FREE: 5,   // Freeプラン: 1日5回まで
  PRO: -1,   // Proプラン: 無制限 (-1 = unlimited)
} as const

/**
 * プラン定義
 */
export const PLAN_FEATURES = {
  free: {
    boardLimit: FREE_BOARD_LIMIT,
    gmailSync: false,
    inboxAI: false,
    brainstormLimit: BRAINSTORM_LIMITS.FREE,
  },
  pro: {
    boardLimit: Infinity,
    gmailSync: true,
    inboxAI: true,
    brainstormLimit: BRAINSTORM_LIMITS.PRO,
  },
} as const

/**
 * 4象限の配列
 */
export const QUADRANTS: Quadrant[] = ['q1', 'q2', 'q3', 'q4']

/**
 * タップ領域の最小サイズ（Appleガイドライン）
 */
export const MIN_TAP_SIZE = 44 // px

/**
 * スワイプジェスチャーの閾値
 */
export const SWIPE_THRESHOLD = {
  /** スワイプと認識する最小移動距離 */
  MIN_DISTANCE: 30, // px
  /** 削除確認を表示する距離 */
  DELETE_DISTANCE: -80, // px
  /** スワイプの最大範囲 */
  MAX_RANGE: -100, // px
} as const

/**
 * パフォーマンス目標値
 */
export const PERFORMANCE_TARGETS = {
  /** Quick Add目標時間 */
  QUICK_ADD_TIME: 1500, // ms
  /** LCP目標時間 */
  LCP_TIME: 2500, // ms
  /** First Load JS目標サイズ */
  MAX_FIRST_LOAD_JS: 200, // KB
} as const

/**
 * 通知設定のデフォルト値
 */
export const NOTIFICATION_DEFAULTS = {
  /** デフォルト通知時刻（分前） */
  DEFAULT_MINUTES_BEFORE: 30,
  /** 最小通知時刻 */
  MIN_MINUTES_BEFORE: 5,
  /** 最大通知時刻 */
  MAX_MINUTES_BEFORE: 1440, // 24時間
} as const
