import { db } from './firestore'
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  getDocs,
  Timestamp,
  runTransaction,
} from 'firebase/firestore'

/**
 * ユーザー・ボード紐付け用ヘルパー関数
 */

/**
 * ボードをユーザーに紐付ける
 *
 * @param boardId ボードID
 * @param uid ユーザーID
 *
 * - boards/{boardId}.ownerUid を uid に更新
 * - users/{uid}/boards/{boardId} サブコレクションにメタデータ保存
 * - 既に別のユーザーが所有している場合はエラー
 */
export async function attachBoardToUser(boardId: string, uid: string): Promise<void> {
  const boardRef = doc(db, 'boards', boardId)
  const userBoardRef = doc(db, 'users', uid, 'boards', boardId)

  await runTransaction(db, async (transaction) => {
    const boardSnap = await transaction.get(boardRef)

    if (!boardSnap.exists()) {
      throw new Error('Board not found')
    }

    const currentOwner = boardSnap.data().ownerUid
    if (currentOwner && currentOwner !== uid) {
      throw new Error('Board already owned by another user')
    }

    // すでにこのユーザーが所有している場合はスキップ
    if (currentOwner === uid) {
      return
    }

    // boards/{boardId}.ownerUid を更新
    transaction.update(boardRef, {
      ownerUid: uid,
      updatedAt: Timestamp.now(),
    })

    // users/{uid}/boards/{boardId} にメタデータ保存
    const boardData = boardSnap.data()
    transaction.set(userBoardRef, {
      title: boardData.title || 'マイボード',
      createdAt: boardData.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
      board: {
        id: boardId,
        title: boardData.title || 'マイボード',
        editKey: boardData.editKey,
        createdAt: boardData.createdAt,
        updatedAt: boardData.updatedAt,
        ownerUid: uid,
        tasks: boardData.tasks || { q1: [], q2: [], q3: [], q4: [] },
      },
    })
  })
}

/**
 * ボードがユーザーに紐付いているか確認
 *
 * @param boardId ボードID
 * @param uid ユーザーID
 * @returns ユーザーが所有者の場合 true
 */
export async function isBoardOwnedBy(boardId: string, uid: string): Promise<boolean> {
  try {
    const boardRef = doc(db, 'boards', boardId)
    const boardSnap = await getDoc(boardRef)

    if (!boardSnap.exists()) {
      return false
    }

    return boardSnap.data().ownerUid === uid
  } catch (error) {
    console.error('Error checking board ownership:', error)
    return false
  }
}

/**
 * ユーザーの全てのボードIDを取得
 *
 * @param uid ユーザーID
 * @returns ボードIDの配列
 */
export async function getUserBoardIds(uid: string): Promise<string[]> {
  try {
    const userBoardsRef = collection(db, 'users', uid, 'boards')
    const snapshot = await getDocs(userBoardsRef)
    return snapshot.docs.map((doc) => doc.id)
  } catch (error) {
    console.error('Error getting user board IDs:', error)
    return []
  }
}

/**
 * ボードがゲストボード（ownerUid が null）かどうか確認
 *
 * @param boardId ボードID
 * @returns ゲストボードの場合 true
 */
export async function isGuestBoard(boardId: string): Promise<boolean> {
  try {
    const boardRef = doc(db, 'boards', boardId)
    const boardSnap = await getDoc(boardRef)

    if (!boardSnap.exists()) {
      return false
    }

    const ownerUid = boardSnap.data().ownerUid
    return !ownerUid || ownerUid === null
  } catch (error) {
    console.error('Error checking if guest board:', error)
    return false
  }
}
