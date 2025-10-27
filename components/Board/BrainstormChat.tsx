'use client'

import { useState, useRef, useEffect } from 'react'
import type { Quadrant } from '@/lib/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface BrainstormResult {
  quadrant: Quadrant
  priority: number
  reason: string
  importance: number
  urgency: number
}

interface BrainstormChatProps {
  taskTitle: string
  onComplete: (result: BrainstormResult) => void
  onCancel: () => void
}

export function BrainstormChat({ taskTitle, onComplete, onCancel }: BrainstormChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // 初回メッセージを取得
    startBrainstorm()
  }, [])

  const startBrainstorm = async () => {
    setIsInitializing(true)
    await sendMessage([])
    setIsInitializing(false)
  }

  const sendMessage = async (currentMessages: Message[]) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle,
          messages: currentMessages,
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                assistantMessage += parsed.text
                setMessages((prev) => {
                  const newMessages = [...prev]
                  if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                    newMessages[newMessages.length - 1].content = assistantMessage
                  } else {
                    newMessages.push({ role: 'assistant', content: assistantMessage })
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Parse error - skip
            }
          }
        }
      }

      // CONCLUSIONチェック
      const conclusionMatch = assistantMessage.match(/CONCLUSION:\s*(\{[\s\S]*?\})/i)
      if (conclusionMatch) {
        try {
          const result = JSON.parse(conclusionMatch[1]) as BrainstormResult
          // CONCLUSION部分を削除して表示
          const cleanMessage = assistantMessage.replace(/CONCLUSION:[\s\S]*$/i, '').trim()
          setMessages((prev) => {
            const newMessages = [...prev]
            newMessages[newMessages.length - 1].content = cleanMessage
            return newMessages
          })
          setTimeout(() => onComplete(result), 500)
        } catch (e) {
          console.error('Failed to parse conclusion:', e)
        }
      }
    } catch (error) {
      console.error('Brainstorm error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')

    await sendMessage(newMessages)
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-[#787774]">
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-[14px]">AIと接続中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[400px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-[8px] px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-[#2383e2] text-white'
                  : 'bg-[#f7f6f3] text-[#37352f] border border-[#e9e9e7]'
              }`}
            >
              <p className="text-[14px] leading-[1.6] whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#f7f6f3] border border-[#e9e9e7] rounded-[8px] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#9b9a97] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#9b9a97] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#9b9a97] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#e9e9e7] px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="回答を入力..."
            className="flex-1 h-10 px-3 text-[14px] text-[#37352f] placeholder:text-[#9b9a97] bg-white border border-[#e9e9e7] rounded-[6px] focus:outline-none focus:border-[#2383e2] disabled:bg-[#fafafa] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[6px] hover:bg-[#1a73d1] active:bg-[#155cb3] disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
          >
            送信
          </button>
        </form>
        <button
          onClick={onCancel}
          className="mt-2 text-[12px] text-[#9b9a97] hover:text-[#37352f] transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
