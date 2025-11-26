'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { httpsCallable } from 'firebase/functions'
import { functions, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { getInboxTasks, deleteInboxTask, convertInboxTaskToTask } from '@/lib/inboxStorage'
import { getOrCreateDefaultBoard, updateBoard, getUserBoards, setDefaultBoardId, getUserSettings, type SavedBoard } from '@/lib/boardStorage'
import { GmailConnectButton } from '@/components/GmailConnectButton'
import { AlertModal } from '@/components/Modal/AlertModal'
import type { InboxTask, InboxQuadrant, Quadrant, User } from '@/lib/types'
import { isPro } from '@/lib/utils'
import Link from 'next/link'

export function InboxPage() {
  const firebaseUser = useAuthStore((state) => state.user)
  const [userData, setUserData] = useState<User | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tasks, setTasks] = useState<InboxTask[]>([])
  const [loading, setLoading] = useState(true)
  const [organizing, setOrganizing] = useState(false)
  const [gmailConnectKey, setGmailConnectKey] = useState(0)
  const [boards, setBoards] = useState<SavedBoard[]>([])
  const [defaultBoardId, setDefaultBoardIdState] = useState<string | undefined>()
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })

  // Firestoreからユーザーデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser) {
        setUserData(null)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        const data = userDoc.data() as User | undefined
        if (data) {
          setUserData(data)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }

    fetchUserData()
  }, [firebaseUser])

  // OAuth callbackを処理
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (code && firebaseUser) {
      // codeを使う前にURLから削除（1回しか使えないため）
      window.history.replaceState({}, '', '/inbox')

      const saveToken = async () => {
        try {
          const saveGmailToken = httpsCallable(functions, 'saveGmailToken')
          await saveGmailToken({ code })

          alert('Gmail連携が完了しました！15分ごとに自動的にメールが同期されます。')
          // GmailConnectButtonを再レンダリングして状態を更新
          setGmailConnectKey(prev => prev + 1)
        } catch (error) {
          console.error('Token save error:', error)
          alert('Gmail連携に失敗しました。もう一度お試しください。')
        }
      }

      saveToken()
    }
  }, [searchParams, firebaseUser])

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const [inboxTasks, userBoards, settings] = await Promise.all([
          getInboxTasks(firebaseUser.uid, 'INBOX'),
          getUserBoards(firebaseUser.uid),
          getUserSettings(firebaseUser.uid),
        ])
        setTasks(inboxTasks)
        setBoards(userBoards)
        setDefaultBoardIdState(settings.defaultBoardId)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [firebaseUser])

  const handleSetDefaultBoard = async (boardId: string) => {
    if (!firebaseUser) return

    try {
      await setDefaultBoardId(firebaseUser.uid, boardId)
      setDefaultBoardIdState(boardId)
    } catch (error) {
      console.error('Error setting default board:', error)
      setAlertModal({
        isOpen: true,
        title: 'エラー',
        message: 'デフォルトボードの設定に失敗しました',
        type: 'error',
      })
    }
  }

  const handleOrganize = async () => {
    if (!firebaseUser) return

    setOrganizing(true)
    try {
      const organizeInboxTasks = httpsCallable(functions, 'organizeInboxTasks')
      const result = await organizeInboxTasks()
      const data = result.data as any

      console.log('AI整理完了:', data)

      // 象限ごとの件数を集計
      const counts = { q1: 0, q2: 0, q3: 0, q4: 0 }
      data.results?.forEach((r: any) => {
        const q = r.quadrant.toLowerCase()
        if (q in counts) counts[q as keyof typeof counts]++
      })

      // 結果を反映（Inboxリロード）
      const inboxTasks = await getInboxTasks(firebaseUser.uid, 'INBOX')
      setTasks(inboxTasks)

      // 結果サマリを表示してボードに遷移
      setAlertModal({
        isOpen: true,
        title: 'AI整理完了',
        message: `AIが ${data.organized} 件のタスクを整理しました

Q1（緊急・重要）: ${counts.q1}件
Q2（重要）: ${counts.q2}件
Q3（緊急）: ${counts.q3}件
Q4（後回し）: ${counts.q4}件

ボードページに移動します。`,
        type: 'success',
      })

      // モーダルを閉じた後にボードに遷移
      setTimeout(() => {
        router.push(`/b/${data.boardId}`)
      }, 2000)
    } catch (error) {
      console.error('Error organizing inbox:', error)
      setAlertModal({
        isOpen: true,
        title: 'エラー',
        message: 'タスクの整理に失敗しました',
        type: 'error',
      })
    } finally {
      setOrganizing(false)
    }
  }

  const handleMoveToQuadrant = async (task: InboxTask, inboxQuadrant: InboxQuadrant) => {
    if (!firebaseUser) return

    try {
      // InboxQuadrant (Q1,Q2,Q3,Q4) を Quadrant (q1,q2,q3,q4) に変換
      const quadrantMap: Record<string, Quadrant> = {
        Q1: 'q1',
        Q2: 'q2',
        Q3: 'q3',
        Q4: 'q4',
      }
      const quadrant = quadrantMap[inboxQuadrant]
      if (!quadrant) return

      // デフォルトボードを取得または作成
      const { boardId, board } = await getOrCreateDefaultBoard(firebaseUser.uid)

      // InboxTask を Task に変換
      const newTask = convertInboxTaskToTask(task)

      // ボードの該当象限に追加
      const updatedBoard = {
        ...board,
        tasks: {
          ...board.tasks,
          [quadrant]: [...board.tasks[quadrant], newTask],
        },
      }

      // ボード更新
      await updateBoard(firebaseUser.uid, boardId, updatedBoard)

      // InboxTask を削除
      await deleteInboxTask(firebaseUser.uid, task.id)

      // ローカル状態から削除
      setTasks(tasks.filter((t) => t.id !== task.id))
    } catch (error) {
      console.error('Error moving task:', error)
      setAlertModal({
        isOpen: true,
        title: 'エラー',
        message: 'タスクの移動に失敗しました',
        type: 'error',
      })
    }
  }

  // ログインしていない、またはFreeプランの場合はProプラン案内を表示
  if (!firebaseUser || !isPro(userData)) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          {/* 戻るボタン */}
          {firebaseUser && (
            <div className="mb-4">
              <Link
                href="/boards"
                className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                マイボードに戻る
              </Link>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                Inbox と AI 整理は Pro プラン専用です
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Pro プランでは、Gmail からタスク候補を自動で集め、<br />
                ワンクリックで 4 象限（Q1〜Q4）に振り分けられます。
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6 space-y-4">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pro プランで使える機能
              </h2>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-[#37352f]">Gmail 自動同期</strong>
                    <p className="text-xs mt-1">15分ごとにメールからタスク候補を収集</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-[#37352f]">AI 一括整理</strong>
                    <p className="text-xs mt-1">溜まったタスクを Q1〜Q4 に自動分類</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="text-[#37352f]">ボード数無制限</strong>
                    <p className="text-xs mt-1">プロジェクトごとにボードを作成可能</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700">
                💡 <strong>まずは無料でお試しください</strong><br />
                基本的なボード機能（2枚まで）は無料で使えます。<br />
                必要になったら Pro プランをご検討ください。
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/pricing"
                className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
              >
                料金プランを見る
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* 戻るボタン */}
        <div className="mb-4">
          <Link
            href="/boards"
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            マイボードに戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="space-y-4 mb-8">
          {/* 機能説明カード */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span>📬</span>
                <span>AIでInboxを一括整理</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gmailから集めたタスク候補を、AIが4象限（Q1〜Q4）にまとめて分類します。<br />
                整理後も、各タスクの象限はいつでも変更できます。
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/50 rounded-[6px] px-3 py-2">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Gmail同期 → AI分類 → ボードに自動配置</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#37352f]">Inbox</h1>
              <p className="text-slate-600 mt-2">タスク候補を確認・整理</p>
            </div>
            <div className="flex items-center gap-3">
              <GmailConnectButton key={gmailConnectKey} />
              <button
                disabled={organizing || tasks.length === 0 || loading}
                onClick={handleOrganize}
                className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {organizing ? '整理中...' : 'AIで整理する'}
              </button>
            </div>
          </div>

          {/* デフォルトボード選択 */}
          {boards.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-900">
                  タスクの移動先ボード:
                </label>
                <select
                  value={defaultBoardId || ''}
                  onChange={(e) => handleSetDefaultBoard(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                >
                  {!defaultBoardId && <option value="">最新のボードを使用</option>}
                  {boards.map((board) => (
                    <option key={board.boardId} value={board.boardId}>
                      {board.title} {board.boardId === defaultBoardId && '(デフォルト)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* タスク一覧 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-slate-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Inbox は空です</h2>
            <p className="text-slate-600">
              Gmail 同期が有効になると、ここにタスク候補が表示されます
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-150"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{task.title}</h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {new Date(task.createdAt).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{task.source}</span>
                    </div>

                    {/* 象限選択ボタン */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">移動先:</span>
                      <button
                        onClick={() => handleMoveToQuadrant(task, 'Q1')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 active:scale-[0.98] transition-colors"
                      >
                        Q1 緊急重要
                      </button>
                      <button
                        onClick={() => handleMoveToQuadrant(task, 'Q2')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-colors"
                      >
                        Q2 重要
                      </button>
                      <button
                        onClick={() => handleMoveToQuadrant(task, 'Q3')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 active:scale-[0.98] transition-colors"
                      >
                        Q3 緊急
                      </button>
                      <button
                        onClick={() => handleMoveToQuadrant(task, 'Q4')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-600 rounded-lg hover:bg-slate-700 active:scale-[0.98] transition-colors"
                      >
                        Q4 その他
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
