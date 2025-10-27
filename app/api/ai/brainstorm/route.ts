import { NextRequest } from 'next/server'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface BrainstormRequest {
  taskTitle: string
  messages: Message[]
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const { taskTitle, messages } = (await req.json()) as BrainstormRequest

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(
        encoder.encode(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' })),
        { status: 500 }
      )
    }

    const systemPrompt = `あなたはタスク管理の専門家で、ユーザーとブレインストーミングを行います。

タスク: "${taskTitle}"

目的:
- 対話を通じて、タスクの緊急度と重要度を一緒に考える
- 3-5個の質問でタスクの背景・期限・影響度を把握
- 最終的にアイゼンハワーマトリクスの象限を決定

質問例:
- このタスクの期限はいつですか？
- このタスクはプロジェクトにどのような影響を与えますか？
- 現在の進捗状況を教えてください
- これが遅れると何が起きますか？
- あなたの目標達成にどう関係しますか？

象限の定義:
- q1 (緊急×重要): 今すぐやる
- q2 (重要×非緊急): 計画してやる
- q3 (緊急×非重要): できれば減らす/誰かに任せる
- q4 (非緊急×非重要): やらない

ルール:
1. 親しみやすく、自然な会話口調で
2. 1回に1-2個の質問のみ
3. 短く簡潔に（2-3文）
4. 十分な情報が集まったら結論を出す
5. 結論時は必ず以下のJSON形式で終える:

CONCLUSION:
{
  "quadrant": "q1" | "q2" | "q3" | "q4",
  "priority": 0-100の数値,
  "reason": "判定理由を1-2文で",
  "importance": 0-100,
  "urgency": 0-100
}`

    const anthropicMessages: Array<{ role: string; content: string }> = messages.length === 0
      ? [
          {
            role: 'user',
            content: 'このタスクについて一緒に考えてください。',
          },
        ]
      : messages

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
        messages: anthropicMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API Error:', error)
      return new Response(
        encoder.encode(JSON.stringify({ error: 'Failed to brainstorm' })),
        { status: response.status }
      )
    }

    // ストリーミングレスポンスを返す
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)

                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`))
                  }

                  if (parsed.type === 'message_stop') {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  }
                } catch (e) {
                  // JSON parse error - skip
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Brainstorm error:', error)
    return new Response(
      encoder.encode(JSON.stringify({ error: 'Failed to brainstorm' })),
      { status: 500 }
    )
  }
}
