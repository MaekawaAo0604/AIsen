import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { taskTitle, subtasks } = await request.json()

    if (!taskTitle) {
      return NextResponse.json({ error: 'タスクタイトルが必要です' }, { status: 400 })
    }

    const prompt = `あなたはタスク管理のエキスパートです。アイゼンハワー・マトリクスに基づいて、タスクを4つの象限に分類してください。

タスク情報:
タイトル: ${taskTitle}
${subtasks ? `詳細: ${subtasks}` : ''}

4つの象限:
- q1: 重要かつ緊急 (今すぐやる)
- q2: 重要だが緊急ではない (計画してやる)
- q3: 緊急だが重要ではない (誰かに任せる)
- q4: 重要でも緊急でもない (やらない)

以下のJSON形式で回答してください:
{
  "status": "thinking" または "completed",
  "quadrant": "q1" | "q2" | "q3" | "q4" (statusがcompletedの場合のみ),
  "priority": 0-100の数値 (statusがcompletedの場合のみ),
  "reason": "判定理由の説明"
}

判定が難しい場合は、status: "thinking"で推理中であることを示してください。
判定できた場合は、status: "completed"として象限と優先度を返してください。`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたはタスク管理のエキスパートです。アイゼンハワー・マトリクスに基づいてタスクを分類します。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json(result)
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return NextResponse.json(
      { error: 'AI処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
