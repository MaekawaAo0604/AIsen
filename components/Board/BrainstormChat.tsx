"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useBrainstormUsageStore } from "@/lib/store/useBrainstormUsageStore";
import { incrementBrainstormUsage } from "@/lib/brainstormUsage";
import type { Quadrant } from "@/lib/types";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BrainstormResult {
  quadrant: Quadrant;
  priority: number;
  reason: string;
  importance: number;
  urgency: number;
}

interface BrainstormChatProps {
  taskTitle: string;
  onComplete: (result: BrainstormResult) => void;
  onCancel: () => void;
  onLoginRequest?: () => void;
}

export function BrainstormChat({
  taskTitle,
  onComplete,
  onCancel,
  onLoginRequest,
}: BrainstormChatProps) {
  const user = useAuthStore((state) => state.user);
  const { canUse, remaining, limit, userIsPro, decrementRemaining, fetchUsage } =
    useBrainstormUsageStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [limitError, setLimitError] = useState<{
    message: string;
    limit: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ユーザーがログインしたら使用回数を再取得
  useEffect(() => {
    if (user && limitError && limitError.limit === 0) {
      // ログイン前のエラーだった場合、使用回数を取得してブレインストームを再開
      fetchUsage(user.uid).then(() => {
        startBrainstorm();
      });
    }
  }, [user]);

  useEffect(() => {
    startBrainstorm();
  }, []);

  const startBrainstorm = async () => {
    setIsInitializing(true);

    if (!user) {
      setLimitError({
        message:
          "AIブレインストーミング機能をお使いいただくには、ログインが必要です。\n\nログインすると、Freeプランでも1日5回まで無料でAIがタスクの優先順位を整理してくれます。",
        limit: 0,
      });
      setIsInitializing(false);
      return;
    }

    try {
      // 使用回数制限チェック（storeから取得）
      if (!canUse) {
        setLimitError({
          message: `Freeプランでは、AIブレインストーミングを1日${limit}回まで無料でお使いいただけます。\nまた明日、${limit}回分の無料枠が自動的に復活します。\n毎日回数を気にせず使いたい場合は、AIsen Pro へのアップグレードをご検討ください。`,
          limit,
        });
        setIsInitializing(false);
        return;
      }

      // 使用回数をインクリメント
      await incrementBrainstormUsage(user.uid);

      // storeの残り回数を更新
      decrementRemaining();

      // ブレインストーミング開始
      await sendMessage([]);
    } catch (error) {
      console.error("Brainstorm start error:", error);
      setLimitError({
        message: "エラーが発生しました。もう一度お試しください。",
        limit: 0,
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const sendMessage = async (currentMessages: Message[]) => {
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error("ログインが必要です");
      }

      const response = await fetch("/api/ai/brainstorm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskTitle,
          messages: currentMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(
          "AIとの通信に失敗しました。少し時間をおいて再度お試しください。"
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantMessage += parsed.text;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  if (
                    newMessages.length > 0 &&
                    newMessages[newMessages.length - 1].role === "assistant"
                  ) {
                    newMessages[newMessages.length - 1].content =
                      assistantMessage;
                  } else {
                    newMessages.push({
                      role: "assistant",
                      content: assistantMessage,
                    });
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Parse error - skip
            }
          }
        }
      }

      // CONCLUSIONチェック
      const conclusionMatch = assistantMessage.match(
        /CONCLUSION:\s*(\{[\s\S]*?\})/i
      );
      if (conclusionMatch) {
        try {
          const result = JSON.parse(conclusionMatch[1]) as BrainstormResult;
          // CONCLUSION部分を削除して表示
          const cleanMessage = assistantMessage
            .replace(/CONCLUSION:[\s\S]*$/i, "")
            .trim();
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = cleanMessage;
            return newMessages;
          });
          setTimeout(() => onComplete(result), 500);
        } catch (e) {
          console.error("Failed to parse conclusion:", e);
        }
      }
    } catch (error: any) {
      console.error("Brainstorm error:", error);
      setLimitError({
        message:
          error.message ||
          "AIとの通信に失敗しました。少し時間をおいて再度お試しください。",
        limit: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    await sendMessage(newMessages);
  };

  // 回数制限エラー表示
  if (limitError) {
    // ログインしていない場合
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-sky-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#37352f]">
              AIブレインストーミング機能
            </h3>
            <p className="text-[14px] text-[#787774] leading-relaxed whitespace-pre-line">
              {limitError.message}
            </p>
            <div className="pt-4 space-y-3">
              <button
                onClick={() => onLoginRequest?.()}
                className="block w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[14px] font-medium rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                ログインして使ってみる
              </button>
              <button
                onClick={onCancel}
                className="block w-full px-6 py-3 text-[14px] font-medium text-[#787774] hover:text-[#37352f] transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 回数制限到達（ログイン済み）
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#37352f]">
            今日はAIブレインストーミングの無料分を使い切りました
          </h3>
          <p className="text-[14px] text-[#787774] leading-relaxed whitespace-pre-line">
            {limitError.message}
          </p>
          <div className="pt-4 space-y-3">
            <Link
              href="/pricing"
              className="block w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[14px] font-medium rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              プランを見る
            </Link>
            <button
              onClick={onCancel}
              className="block w-full px-6 py-3 text-[14px] font-medium text-[#787774] hover:text-[#37352f] transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-[#787774]">
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* 残り回数表示（Freeユーザーのみ） */}
        {!userIsPro && (
          <div className="flex items-center justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-700">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[12px] font-medium">
                今日の残り: {remaining} / {limit}
              </span>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-[8px] px-4 py-2.5 ${
                message.role === "user"
                  ? "bg-[#2383e2] text-white"
                  : "bg-[#f7f6f3] text-[#37352f] border border-[#e9e9e7]"
              }`}
            >
              <p className="text-[14px] leading-[1.6] whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#f7f6f3] border border-[#e9e9e7] rounded-[8px] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 bg-[#9b9a97] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#9b9a97] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#9b9a97] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
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
  );
}
