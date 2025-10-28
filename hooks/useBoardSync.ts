'use client'

import { useEffect } from 'react'
import { doc, collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useBoardStore } from '@/stores/useBoardStore'
import type { Board, Task, Quadrant } from '@/lib/types'

/**
 * Firestoreとボードを自動同期するフック
 * boardIdが変更されるたびにリアルタイムリスナーをセットアップ
 */
export function useBoardSync(boardId: string | null) {
  const setBoard = useBoardStore((state) => state.setBoard)

  useEffect(() => {
    if (!boardId) return

    let boardData: Omit<Board, 'tasks'> | null = null
    let tasks: Board['tasks'] = { q1: [], q2: [], q3: [], q4: [] }

    // 状態を更新するヘルパー関数
    const updateBoard = () => {
      if (boardData) {
        setBoard({ ...boardData, tasks: { ...tasks } })
      }
    }

    // ボードメタデータのリスナー
    const unsubscribeBoard = onSnapshot(
      doc(db, 'boards', boardId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          boardData = {
            id: docSnap.id,
            title: data.title,
            editKey: data.editKey,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          }
          updateBoard()
        }
      },
      (error) => {
        console.error('Error syncing board metadata from Firestore:', error)
      }
    )

    // タスクサブコレクションのリスナー
    const unsubscribeTasks = onSnapshot(
      collection(db, 'boards', boardId, 'tasks'),
      (snapshot) => {
        // 新しいtasksオブジェクトを作成
        tasks = { q1: [], q2: [], q3: [], q4: [] }

        // タスクを象限ごとに振り分け
        snapshot.forEach((doc) => {
          const taskData = doc.data() as Task & { quadrant: Quadrant }
          const { quadrant, ...task } = taskData
          tasks[quadrant].push(task as Task)
        })

        updateBoard()
      },
      (error) => {
        console.error('Error syncing tasks from Firestore:', error)
      }
    )

    // クリーンアップ
    return () => {
      unsubscribeBoard()
      unsubscribeTasks()
    }
  }, [boardId, setBoard])
}
