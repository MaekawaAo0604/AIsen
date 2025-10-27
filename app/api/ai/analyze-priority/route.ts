import { NextRequest, NextResponse } from 'next/server'

interface AnalyzePriorityRequest {
  title: string
  notes?: string
  due?: string | null
  allTasks?: Array<{
    title: string
    notes: string
    quadrant: string
  }>
}

export async function POST(req: NextRequest) {
  try {
    const { title, notes, due, allTasks } = (await req.json()) as AnalyzePriorityRequest

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const systemPrompt = `あなたはタスク管理の専門家です。
緊急度と重要度を分析し、アイゼンハワーマトリクスの象限を決定してください。

分析基準:
- 緊急度: 期限の近さ、すぐ対応が必要か
- 重要度: 目標達成への影響度、長期的価値

象限の定義:
- q1 (緊急×重要): すぐやる
- q2 (重要×非緊急): 計画してやる
- q3 (緊急×非重要): できれば減らす
- q4 (非緊急×非重要): やらない`

    const userPrompt = `以下のタスクを分析してください。

タスク: ${title}
${notes ? `詳細: ${notes}` : ''}
${due ? `期限: ${due}` : '期限: なし'}

${allTasks && allTasks.length > 0 ? `
既存タスク（参考）:
${allTasks.map((t) => `- [${t.quadrant}] ${t.title}`).join('\n')}
` : ''}

以下のJSON形式で回答してください:
{
  "importance": 0-100の数値,
  "urgency": 0-100の数値,
  "priority": 0-100の数値 (総合優先度),
  "quadrant": "q1" | "q2" | "q3" | "q4",
  "reason": "判定理由を1-2文で"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API Error:', error)
      return NextResponse.json(
        { error: 'Failed to analyze priority' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.content[0].text

    // JSON部分を抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }

    const result = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      importance: result.importance,
      urgency: result.urgency,
      priority: result.priority,
      quadrant: result.quadrant,
      reason: result.reason,
    })
  } catch (error) {
    console.error('Priority analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze priority' },
      { status: 500 }
    )
  }
}
