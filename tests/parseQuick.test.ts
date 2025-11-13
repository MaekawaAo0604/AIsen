/**
 * parseQuick関数のテスト
 */

import { parseQuick, ParsedQuickTask } from '../lib/parseQuick'

describe('parseQuick - 日本語相対日解析', () => {
  const now = new Date('2025-01-15T10:00:00+09:00')

  test('今日', () => {
    const result = parseQuick('今日中にレポート提出', now)
    expect(result.due).not.toBeNull()
    expect(result.due?.getDate()).toBe(15)
    expect(result.due?.getMonth()).toBe(0) // 1月
  })

  test('明日', () => {
    const result = parseQuick('明日の会議資料準備', now)
    expect(result.due).not.toBeNull()
    expect(result.due?.getDate()).toBe(16)
  })

  test('明後日', () => {
    const result = parseQuick('あさって納品', now)
    expect(result.due).not.toBeNull()
    expect(result.due?.getDate()).toBe(17)
  })
})

describe('parseQuick - 絶対日解析', () => {
  const now = new Date('2025-01-15T10:00:00+09:00')

  test('mm/dd形式', () => {
    const result = parseQuick('12/25 プレゼン', now)
    expect(result.due).not.toBeNull()
    expect(result.due?.getMonth()).toBe(11) // 12月
    expect(result.due?.getDate()).toBe(25)
  })

  test('mm/dd hh:mm形式', () => {
    const result = parseQuick('1/20 14:30 打ち合わせ', now)
    expect(result.due).not.toBeNull()
    expect(result.due?.getMonth()).toBe(0) // 1月
    expect(result.due?.getDate()).toBe(20)
    expect(result.due?.getHours()).toBe(14)
    expect(result.due?.getMinutes()).toBe(30)
  })
})

describe('parseQuick - 時刻解析', () => {
  const now = new Date('2025-01-15T10:00:00+09:00')

  test('明日17時', () => {
    const result = parseQuick('明日17時 見積り送付', now)
    expect(result.due).not.toBeNull()
    expect(result.due?.getDate()).toBe(16)
    expect(result.due?.getHours()).toBe(17)
    expect(result.due?.getMinutes()).toBe(0)
  })

  test('明日17時30分', () => {
    const result = parseQuick('明日17時30分 電話', now)
    expect(result.due).not.toBeNull()
    expect(result.due?.getHours()).toBe(17)
    expect(result.due?.getMinutes()).toBe(30)
  })
})

describe('parseQuick - 緊急性判定', () => {
  const now = new Date('2025-01-15T10:00:00+09:00')

  test('急ぎキーワード → 緊急', () => {
    const result = parseQuick('至急対応が必要', now)
    expect(result.isUrgent).toBe(true)
    expect(result.quadrant).toBe('q3') // 緊急だが重要でない
  })

  test('48時間以内の期限 → 緊急', () => {
    const result = parseQuick('明日提出', now)
    expect(result.isUrgent).toBe(true)
  })

  test('48時間超の期限 → 非緊急', () => {
    const result = parseQuick('1/20 資料作成', now) // 5日後
    expect(result.isUrgent).toBe(false)
  })
})

describe('parseQuick - 重要性判定', () => {
  const now = new Date('2025-01-15T10:00:00+09:00')

  test('重要キーワード → 重要', () => {
    const result = parseQuick('重要な採用面接', now)
    expect(result.isImportant).toBe(true)
  })

  test('戦略キーワード → 重要', () => {
    const result = parseQuick('戦略会議の準備', now)
    expect(result.isImportant).toBe(true)
  })

  test('顧客キーワード → 重要', () => {
    const result = parseQuick('顧客対応', now)
    expect(result.isImportant).toBe(true)
  })
})

describe('parseQuick - 4象限自動判定', () => {
  const now = new Date('2025-01-15T10:00:00+09:00')

  test('Q1（緊急×重要）: 至急 + 重要', () => {
    const result = parseQuick('明日17時 見積り送付 至急 重要', now)
    expect(result.quadrant).toBe('q1')
    expect(result.isUrgent).toBe(true)
    expect(result.isImportant).toBe(true)
  })

  test('Q2（重要×非緊急）: 重要のみ', () => {
    const result = parseQuick('1/20 戦略会議', now)
    expect(result.quadrant).toBe('q2')
    expect(result.isUrgent).toBe(false)
    expect(result.isImportant).toBe(true)
  })

  test('Q3（緊急×非重要）: 至急のみ', () => {
    const result = parseQuick('今日中 雑務', now)
    expect(result.quadrant).toBe('q3')
    expect(result.isUrgent).toBe(true)
    expect(result.isImportant).toBe(false)
  })

  test('Q4（非緊急×非重要）: どちらもなし', () => {
    const result = parseQuick('いつか読む本', now)
    expect(result.quadrant).toBe('q4')
    expect(result.isUrgent).toBe(false)
    expect(result.isImportant).toBe(false)
  })
})

describe('parseQuick - 実践的なケース', () => {
  const now = new Date('2025-01-15T10:00:00+09:00')

  test('ケース1: 明日17時 見積り送付 至急', () => {
    const result = parseQuick('明日17時 見積り送付 至急', now)
    expect(result.quadrant).toBe('q3') // 緊急だが「見積り」だけでは重要判定されない
    expect(result.due?.getDate()).toBe(16)
    expect(result.due?.getHours()).toBe(17)
  })

  test('ケース2: 今日中 顧客対応 緊急', () => {
    const result = parseQuick('今日中 顧客対応 緊急', now)
    expect(result.quadrant).toBe('q1') // 緊急×重要
    expect(result.due?.getDate()).toBe(15)
  })

  test('ケース3: 採用面接の準備', () => {
    const result = parseQuick('採用面接の準備', now)
    expect(result.quadrant).toBe('q2') // 重要×非緊急（期限なし）
    expect(result.isImportant).toBe(true)
    expect(result.due).toBeNull()
  })

  test('ケース4: 1/20 14:30 品質改善MTG', () => {
    const result = parseQuick('1/20 14:30 品質改善MTG', now)
    expect(result.quadrant).toBe('q2') // 重要×非緊急（5日後）
    expect(result.due?.getDate()).toBe(20)
    expect(result.due?.getHours()).toBe(14)
    expect(result.due?.getMinutes()).toBe(30)
  })
})
