import { db } from '@/lib/firebase'
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy, Timestamp, updateDoc } from 'firebase/firestore'
import type { Board, User } from '@/lib/types'
import { FREE_BOARD_LIMIT } from '@/lib/constants'
import { getUserPlan } from '@/lib/utils'

export interface SavedBoard {
  boardId: string
  title: string
  createdAt: Date
  updatedAt: Date
  board: Board
}

export interface UserSettings {
  defaultBoardId?: string
}

// ボードを保存
export async function saveBoard(
  userId: string,
  boardId: string,
  board: Board,
  user?: User | null
): Promise<void> {
  // プラン制限チェック（新規作成時のみ）
  const existingBoard = await getBoard(userId, boardId)
  if (!existingBoard && user) {
    const plan = getUserPlan(user)
    if (plan === 'free') {
      const userBoards = await getUserBoards(userId)
      if (userBoards.length >= FREE_BOARD_LIMIT) {
        throw new Error('BOARD_LIMIT_REACHED')
      }
    }
  }

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

// ユーザー設定を取得
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    return {}
  }

  const data = userSnap.data()
  return {
    defaultBoardId: data.defaultBoardId,
  }
}

// デフォルトボードIDを設定
export async function setDefaultBoardId(userId: string, boardId: string): Promise<void> {
  const userRef = doc(db, 'users', userId)
  await setDoc(userRef, {
    defaultBoardId: boardId,
  }, { merge: true })
}

// デフォルトボードを取得または作成（Inbox用）
export async function getOrCreateDefaultBoard(userId: string): Promise<{ boardId: string; board: Board }> {
  // ユーザー設定からdefaultBoardIdを取得
  const settings = await getUserSettings(userId)

  if (settings.defaultBoardId) {
    const defaultBoard = await getBoard(userId, settings.defaultBoardId)
    if (defaultBoard) {
      return {
        boardId: settings.defaultBoardId,
        board: defaultBoard.board,
      }
    }
  }

  // defaultBoardIdが設定されていないか、ボードが存在しない場合は最新のボードを使用
  const boards = await getUserBoards(userId)

  if (boards.length > 0) {
    const firstBoard = boards[0]
    return {
      boardId: firstBoard.boardId,
      board: firstBoard.board,
    }
  }

  // なければ新規作成
  const newBoardId = crypto.randomUUID()
  const newBoard: Board = {
    id: newBoardId,
    title: 'My Board',
    editKey: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: {
      q1: [],
      q2: [],
      q3: [],
      q4: [],
    },
  }

  await saveBoard(userId, newBoardId, newBoard, null) // Inbox用の自動作成なので制限チェックなし

  return {
    boardId: newBoardId,
    board: newBoard,
  }
}
