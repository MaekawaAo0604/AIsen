import { db } from './firestore'
import { doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore'

/**
 * 将来のユーザー・ボード紐付け用ヘルパー関数
 *
 * 認証導入後に実装予定：
 * - boards/{boardId}.ownerUid = uid を更新
 * - users/{uid}/boards/{boardId} サブコレクションを作成
 */

/**
 * ボードをユーザーに紐付ける
 *
 * @param boardId ボードID
 * @param uid ユーザーID
 *
 * TODO: 認証導入時に実装
 * - boards/{boardId}.ownerUid を uid に更新
 * - users/{uid}/boards/{boardId} サブコレクションにメタデータ保存
 * - 紐付け時の権限チェック（既に別のユーザーが所有している場合のエラー処理）
 * - トランザクションで原子性を担保
 */
export async function attachBoardToUser(boardId: string, uid: string): Promise<void> {
  // TODO: 認証導入時に実装
  console.warn('attachBoardToUser: Not implemented yet. Will be implemented when auth is enabled.')

  // 実装予定の処理（コメントアウト）:
  // const boardRef = doc(db, 'boards', boardId)
  // const userBoardRef = doc(db, 'users', uid, 'boards', boardId)
  //
  // // トランザクションで両方を更新
  // await runTransaction(db, async (transaction) => {
  //   const boardSnap = await transaction.get(boardRef)
  //
  //   if (!boardSnap.exists()) {
  //     throw new Error('Board not found')
  //   }
  //
  //   const currentOwner = boardSnap.data().ownerUid
  //   if (currentOwner && currentOwner !== uid) {
  //     throw new Error('Board already owned by another user')
  //   }
  //
  //   // boards/{boardId}.ownerUid を更新
  //   transaction.update(boardRef, {
  //     ownerUid: uid,
  //     updatedAt: Timestamp.now(),
  //   })
  //
  //   // users/{uid}/boards/{boardId} にメタデータ保存
  //   transaction.set(userBoardRef, {
  //     boardId,
  //     attachedAt: Timestamp.now(),
  //   })
  // })
}

/**
 * ボードがユーザーに紐付いているか確認
 *
 * @param boardId ボードID
 * @param uid ユーザーID
 * @returns ユーザーが所有者の場合 true
 *
 * TODO: 認証導入時に実装
 */
export async function isBoardOwnedBy(boardId: string, uid: string): Promise<boolean> {
  // TODO: 認証導入時に実装
  console.warn('isBoardOwnedBy: Not implemented yet. Will be implemented when auth is enabled.')
  return false

  // 実装予定の処理（コメントアウト）:
  // const boardRef = doc(db, 'boards', boardId)
  // const boardSnap = await getDoc(boardRef)
  //
  // if (!boardSnap.exists()) {
  //   return false
  // }
  //
  // return boardSnap.data().ownerUid === uid
}

/**
 * ユーザーの全てのボードIDを取得
 *
 * @param uid ユーザーID
 * @returns ボードIDの配列
 *
 * TODO: 認証導入時に実装
 */
export async function getUserBoardIds(uid: string): Promise<string[]> {
  // TODO: 認証導入時に実装
  console.warn('getUserBoardIds: Not implemented yet. Will be implemented when auth is enabled.')
  return []

  // 実装予定の処理（コメントアウト）:
  // const userBoardsRef = collection(db, 'users', uid, 'boards')
  // const snapshot = await getDocs(userBoardsRef)
  // return snapshot.docs.map((doc) => doc.id)
}
