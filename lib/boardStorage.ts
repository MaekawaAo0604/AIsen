import { db } from '@/lib/firebase'
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore'
import type { Board } from '@/lib/types'

export interface SavedBoard {
  boardId: string
  title: string
  createdAt: Date
  updatedAt: Date
  board: Board
}

// ボードを保存
export async function saveBoard(userId: string, boardId: string, board: Board): Promise<void> {
  const boardRef = doc(db, 'users', userId, 'boards', boardId)

  await setDoc(boardRef, {
    title: board.title || '無題のボード',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    board: board,
  })
}

// ボードを更新
export async function updateBoard(userId: string, boardId: string, board: Board): Promise<void> {
  const boardRef = doc(db, 'users', userId, 'boards', boardId)

  await setDoc(boardRef, {
    title: board.title || '無題のボード',
    updatedAt: Timestamp.now(),
    board: board,
  }, { merge: true })
}

// ボードを取得
export async function getBoard(userId: string, boardId: string): Promise<SavedBoard | null> {
  const boardRef = doc(db, 'users', userId, 'boards', boardId)
  const boardSnap = await getDoc(boardRef)

  if (!boardSnap.exists()) {
    return null
  }

  const data = boardSnap.data()
  return {
    boardId,
    title: data.title,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    board: data.board,
  }
}

// ユーザーの全ボードを取得
export async function getUserBoards(userId: string): Promise<SavedBoard[]> {
  const boardsRef = collection(db, 'users', userId, 'boards')
  const q = query(boardsRef, orderBy('updatedAt', 'desc'))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      boardId: doc.id,
      title: data.title,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      board: data.board,
    }
  })
}

// ボードを削除
export async function deleteBoard(userId: string, boardId: string): Promise<void> {
  const boardRef = doc(db, 'users', userId, 'boards', boardId)
  await deleteDoc(boardRef)
}
