import { db } from './firestore'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import type { Board, Task, User, Quadrant } from './types'

// ==================== Board 操作 ====================

/**
 * ボードを作成
 */
export async function createBoard(board: Omit<Board, 'id'>): Promise<string> {
  const boardId = crypto.randomUUID()
  const boardRef = doc(db, 'boards', boardId)
  const batch = writeBatch(db)

  // ボードメタデータをbatchに追加
  batch.set(boardRef, {
    ...board,
    id: boardId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })

  // サンプルタスクを自動投入（全ての新規ボード作成時）
  const sampleTasks: Array<{ quadrant: Quadrant; task: Omit<Task, 'id'> }> = [
    {
      quadrant: 'q1',
      task: {
        title: '今日中に返信するメール',
        notes: '',
        due: null,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    },
    {
      quadrant: 'q2',
      task: {
        title: '今週中に進めたい資料作成',
        notes: '',
        due: null,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    },
    {
      quadrant: 'q3',
      task: {
        title: 'いつか着手したい学習テーマ',
        notes: '',
        due: null,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    },
    {
      quadrant: 'q4',
      task: {
        title: 'やらないと決めたこと',
        notes: '',
        due: null,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    },
  ]

  sampleTasks.forEach(({ quadrant, task }) => {
    const taskId = crypto.randomUUID()
    const taskRef = doc(db, 'boards', boardId, 'tasks', taskId)
    batch.set(taskRef, {
      ...task,
      id: taskId,
      quadrant,
    })
  })

  // batch commit（ボード作成とサンプルタスク作成を一度に実行）
  await batch.commit()

  return boardId
}

/**
 * ボードを取得（タスク含む）
 */
export async function getBoard(boardId: string): Promise<Board | null> {
  try {
    const boardRef = doc(db, 'boards', boardId)
    const boardSnap = await getDoc(boardRef)

    if (!boardSnap.exists()) {
      return null
    }

    const boardData = boardSnap.data()

    // タスクを取得
    const tasksRef = collection(db, 'boards', boardId, 'tasks')
    const tasksSnap = await getDocs(tasksRef)

    const tasks: Board['tasks'] = {
      q1: [],
      q2: [],
      q3: [],
      q4: [],
    }

    tasksSnap.forEach((taskDoc) => {
      const taskData = taskDoc.data() as Task & { quadrant: Quadrant }
      const quadrant = taskData.quadrant
      delete (taskData as any).quadrant // quadrant フィールドを削除
      tasks[quadrant].push(taskData as Task)
    })

    return {
      id: boardId,
      title: boardData.title,
      editKey: boardData.editKey,
      createdAt: boardData.createdAt,
      updatedAt: boardData.updatedAt,
      tasks,
    }
  } catch (error) {
    console.error('Error getting board:', error)
    return null
  }
}

/**
 * editKeyでボードを検索
 */
export async function getBoardByEditKey(editKey: string): Promise<Board | null> {
  try {
    const boardsRef = collection(db, 'boards')
    const q = query(boardsRef, where('editKey', '==', editKey))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const boardDoc = querySnapshot.docs[0]
    return getBoard(boardDoc.id)
  } catch (error) {
    console.error('Error getting board by editKey:', error)
    return null
  }
}

/**
 * ボードを更新
 */
export async function updateBoard(
  boardId: string,
  updates: Partial<Omit<Board, 'id' | 'tasks'>>
): Promise<void> {
  const boardRef = doc(db, 'boards', boardId)
  await updateDoc(boardRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

/**
 * ボード全体を保存（タスク含む）
 */
export async function saveBoardWithTasks(board: Board): Promise<void> {
  const batch = writeBatch(db)

  // ボードメタデータを保存
  const boardRef = doc(db, 'boards', board.id)
  batch.set(boardRef, {
    id: board.id,
    title: board.title,
    editKey: board.editKey,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })

  // 既存のタスクを全て削除してから新しいタスクを保存
  const tasksRef = collection(db, 'boards', board.id, 'tasks')
  const existingTasks = await getDocs(tasksRef)
  existingTasks.forEach((taskDoc) => {
    batch.delete(taskDoc.ref)
  })

  // 新しいタスクを保存
  Object.entries(board.tasks).forEach(([quadrant, tasks]) => {
    tasks.forEach((task) => {
      const taskRef = doc(db, 'boards', board.id, 'tasks', task.id)
      batch.set(taskRef, {
        ...task,
        quadrant,
      })
    })
  })

  await batch.commit()
}

// ==================== Task 操作 ====================

/**
 * undefinedフィールドを除外するヘルパー関数
 */
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  }
  return cleaned
}

/**
 * タスクを追加
 */
export async function addTask(
  boardId: string,
  quadrant: Quadrant,
  task: Task
): Promise<void> {
  const taskRef = doc(db, 'boards', boardId, 'tasks', task.id)

  const taskData = removeUndefinedFields({
    ...task,
    quadrant,
    createdAt: task.createdAt || new Date().toISOString(),
  })

  await setDoc(taskRef, taskData)

  // ボードの更新日時を更新
  await updateBoard(boardId, {})
}

/**
 * タスクを更新
 */
export async function updateTask(
  boardId: string,
  taskId: string,
  quadrant: Quadrant,
  updates: Partial<Task>
): Promise<void> {
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId)

  const updateData = removeUndefinedFields({
    ...updates,
    quadrant,
  })

  await updateDoc(taskRef, updateData)

  // ボードの更新日時を更新
  await updateBoard(boardId, {})
}

/**
 * タスクを削除
 */
export async function deleteTask(
  boardId: string,
  taskId: string
): Promise<void> {
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId)
  await deleteDoc(taskRef)

  // ボードの更新日時を更新
  await updateBoard(boardId, {})
}

/**
 * タスクを別の象限に移動
 */
export async function moveTask(
  boardId: string,
  taskId: string,
  fromQuadrant: Quadrant,
  toQuadrant: Quadrant
): Promise<void> {
  if (fromQuadrant === toQuadrant) return

  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId)
  await updateDoc(taskRef, {
    quadrant: toQuadrant,
  })

  // ボードの更新日時を更新
  await updateBoard(boardId, {})
}

// ==================== User 操作 ====================

/**
 * ユーザーを作成
 */
export async function createUser(uid: string, email: string): Promise<void> {
  const userRef = doc(db, 'users', uid)

  await setDoc(userRef, {
    uid,
    email,
    entitlements: {
      pro: false,
      lifetime: false,
    },
    createdAt: Timestamp.now(),
  })
}

/**
 * ユーザーを取得
 */
export async function getUser(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return null
    }

    return userSnap.data() as User
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * ユーザーのPro権限を更新
 */
export async function updateUserEntitlements(
  uid: string,
  entitlements: User['entitlements']
): Promise<void> {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    entitlements,
    updatedAt: Timestamp.now(),
  })
}
