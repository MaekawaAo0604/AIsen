import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore'
import { db } from './firebase'
import type { InboxTask, InboxQuadrant, AIStatus, Task } from './types'

/**
 * Inbox タスクを Firestore から取得
 */
export async function getInboxTasks(userId: string, quadrantFilter?: InboxQuadrant): Promise<InboxTask[]> {
  try {
    const inboxRef = collection(db, 'users', userId, 'inboxTasks')
    let q = query(inboxRef, orderBy('createdAt', 'desc'), limit(100))

    if (quadrantFilter) {
      q = query(inboxRef, where('quadrant', '==', quadrantFilter), orderBy('createdAt', 'desc'), limit(100))
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        source: data.source,
        gmail: data.gmail,
        quadrant: data.quadrant,
        aiStatus: data.aiStatus,
        aiMeta: data.aiMeta,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as InboxTask
    })
  } catch (error) {
    console.error('Error fetching inbox tasks:', error)
    throw error
  }
}

/**
 * Inbox タスクを Firestore に追加
 */
export async function addInboxTask(
  userId: string,
  task: Omit<InboxTask, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const inboxRef = collection(db, 'users', userId, 'inboxTasks')
    const docRef = await addDoc(inboxRef, {
      ...task,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding inbox task:', error)
    throw error
  }
}

/**
 * Inbox タスクの quadrant と aiStatus を更新
 */
export async function updateInboxTask(
  userId: string,
  taskId: string,
  updates: {
    quadrant?: InboxQuadrant
    aiStatus?: AIStatus
    aiMeta?: {
      lastOrganizedAt: string
      model: string
    }
  }
): Promise<void> {
  try {
    const taskRef = doc(db, 'users', userId, 'inboxTasks', taskId)
    const firestoreUpdates: any = {}

    if (updates.quadrant) {
      firestoreUpdates.quadrant = updates.quadrant
    }
    if (updates.aiStatus) {
      firestoreUpdates.aiStatus = updates.aiStatus
    }
    if (updates.aiMeta) {
      firestoreUpdates.aiMeta = {
        lastOrganizedAt: Timestamp.fromDate(new Date(updates.aiMeta.lastOrganizedAt)),
        model: updates.aiMeta.model,
      }
    }

    await updateDoc(taskRef, firestoreUpdates)
  } catch (error) {
    console.error('Error updating inbox task:', error)
    throw error
  }
}

/**
 * INBOX で pending なタスクを取得（AI整理用）
 */
export async function getPendingInboxTasks(userId: string, maxCount: number = 50): Promise<InboxTask[]> {
  try {
    const inboxRef = collection(db, 'users', userId, 'inboxTasks')
    const q = query(
      inboxRef,
      where('quadrant', '==', 'INBOX'),
      where('aiStatus', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        source: data.source,
        gmail: data.gmail,
        quadrant: data.quadrant,
        aiStatus: data.aiStatus,
        aiMeta: data.aiMeta,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as InboxTask
    })
  } catch (error) {
    console.error('Error fetching pending inbox tasks:', error)
    throw error
  }
}

/**
 * InboxTask を削除
 */
export async function deleteInboxTask(userId: string, taskId: string): Promise<void> {
  try {
    const taskRef = doc(db, 'users', userId, 'inboxTasks', taskId)
    await deleteDoc(taskRef)
  } catch (error) {
    console.error('Error deleting inbox task:', error)
    throw error
  }
}

/**
 * InboxTask を Board の Task に変換
 */
export function convertInboxTaskToTask(inboxTask: InboxTask): Task {
  return {
    id: crypto.randomUUID(),
    title: inboxTask.title,
    notes: inboxTask.description,
    due: null,
    createdAt: inboxTask.createdAt,
    completed: false,
  }
}
