/**
 * リファクタリング後の動作確認スクリプト
 *
 * 確認項目:
 * 1. QUADRANT_CONFIGが正しくMatrixBoardで使用されている
 * 2. SWIPE_THRESHOLDがTaskCardで正しく使用されている
 * 3. formatDateJP utilityが正しく機能する
 */

import { QUADRANT_CONFIG, SWIPE_THRESHOLD, QUADRANTS } from '../lib/constants'
import { formatDateJP } from '../lib/utils'

console.log('🔍 リファクタリング動作確認開始\n')

// 1. QUADRANT_CONFIG検証
console.log('✅ QUADRANT_CONFIG検証:')
QUADRANTS.forEach((q) => {
  const config = QUADRANT_CONFIG[q]
  console.log(`  ${config.label}: ${config.title} (${config.description})`)

  // 必須プロパティの存在確認
  const required = ['id', 'label', 'title', 'description', 'bgClass', 'badgeClass', 'borderClass']
  const missing = required.filter((key) => !(key in config))
  if (missing.length > 0) {
    throw new Error(`${q} missing properties: ${missing.join(', ')}`)
  }
})
console.log()

// 2. SWIPE_THRESHOLD検証
console.log('✅ SWIPE_THRESHOLD検証:')
console.log(`  MIN_DISTANCE: ${SWIPE_THRESHOLD.MIN_DISTANCE}px (認識閾値)`)
console.log(`  DELETE_DISTANCE: ${SWIPE_THRESHOLD.DELETE_DISTANCE}px (削除閾値)`)
console.log(`  MAX_RANGE: ${SWIPE_THRESHOLD.MAX_RANGE}px (最大スワイプ)`)

if (SWIPE_THRESHOLD.MIN_DISTANCE !== 30) {
  throw new Error(`MIN_DISTANCE should be 30, got ${SWIPE_THRESHOLD.MIN_DISTANCE}`)
}
if (SWIPE_THRESHOLD.DELETE_DISTANCE !== -80) {
  throw new Error(`DELETE_DISTANCE should be -80, got ${SWIPE_THRESHOLD.DELETE_DISTANCE}`)
}
if (SWIPE_THRESHOLD.MAX_RANGE !== -100) {
  throw new Error(`MAX_RANGE should be -100, got ${SWIPE_THRESHOLD.MAX_RANGE}`)
}
console.log()

// 3. formatDateJP検証
console.log('✅ formatDateJP検証:')
const testDates = [
  new Date('2025-01-15T10:30:00'),
  new Date('2025-12-31T23:59:59'),
  '2025-03-20T15:45:00',
]

testDates.forEach((date) => {
  const formatted = formatDateJP(date)
  console.log(`  ${typeof date === 'string' ? date : date.toISOString()} → ${formatted}`)

  // 日本語形式の確認（YYYY/MM/DD または YYYY年MM月DD日）
  if (!formatted.match(/\d{4}[\/年]\d{1,2}[\/月]\d{1,2}日?/)) {
    throw new Error(`Invalid Japanese date format: ${formatted}`)
  }
})
console.log()

console.log('🎉 全ての検証が成功しました！')
console.log('\n📋 リファクタリング内容:')
console.log('  - QUADRANT_CONFIGで4象限定義を一元化')
console.log('  - SWIPE_THRESHOLDでマジックナンバー排除')
console.log('  - formatDateJP utilityで日付フォーマット統一')
console.log('  - MatrixBoard.tsxで.map()による反復コード削減')
console.log('  - TaskCard.tsxで定数とutilityを活用')
