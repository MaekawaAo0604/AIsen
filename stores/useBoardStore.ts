import { create } from 'zustand'
import type { Board, Task, Quadrant } from '@/lib/types'
import * as firestoreHelpers from '@/lib/firestore-helpers'

interface BoardState {
  boardId: string | null
  title: string
  editKey: string | null
  tasks: {
    q1: Task[]
    q2: Task[]
    q3: Task[]
    q4: Task[]
  }
  setBoard: (board: Board) => void
  clearBoard: () => void
  addTask: (quadrant: Quadrant, task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (quadrant: Quadrant, taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (quadrant: Quadrant, taskId: string) => Promise<void>
  moveTask: (taskId: string, fromQuadrant: Quadrant, toQuadrant: Quadrant) => Promise<void>
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boardId: null,
  title: 'マイボード',
  editKey: null,
  tasks: {
    q1: [],
    q2: [],
    q3: [],
    q4: [],
  },

  setBoard: (board) => set({
    boardId: board.id,
    title: board.title,
    editKey: board.editKey,
    tasks: board.tasks,
  }),

  clearBoard: () => set({
    boardId: null,
    title: 'マイボード',
    editKey: null,
    tasks: {
      q1: [],
      q2: [],
      q3: [],
      q4: [],
    },
  }),

  addTask: async (quadrant, taskData) => {
    const state = get()
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    // Optimistic UI更新
    set({
      tasks: {
        ...state.tasks,
        [quadrant]: [...state.tasks[quadrant], newTask],
      },
    })

    // Firestoreに保存
    if (state.boardId) {
      try {
        await firestoreHelpers.addTask(state.boardId, quadrant, newTask)
      } catch (error) {
        console.error('Error adding task to Firestore:', error)
        // ロールバック
        set({
          tasks: {
            ...state.tasks,
            [quadrant]: state.tasks[quadrant].filter((t) => t.id !== newTask.id),
          },
        })
      }
    }
  },

  updateTask: async (quadrant, taskId, updates) => {
    const state = get()
    const oldTasks = state.tasks[quadrant]

    // Optimistic UI更新
    set({
      tasks: {
        ...state.tasks,
        [quadrant]: state.tasks[quadrant].map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      },
    })

    // Firestoreに保存
    if (state.boardId) {
      try {
        await firestoreHelpers.updateTask(state.boardId, taskId, quadrant, updates)
      } catch (error) {
        console.error('Error updating task in Firestore:', error)
        // ロールバック
        set({
          tasks: {
            ...state.tasks,
            [quadrant]: oldTasks,
          },
        })
      }
    }
  },

  deleteTask: async (quadrant, taskId) => {
    const state = get()
    const oldTasks = state.tasks[quadrant]

    // Optimistic UI更新
    set({
      tasks: {
        ...state.tasks,
        [quadrant]: state.tasks[quadrant].filter((task) => task.id !== taskId),
      },
    })

    // Firestoreから削除
    if (state.boardId) {
      try {
        await firestoreHelpers.deleteTask(state.boardId, taskId)
      } catch (error) {
        console.error('Error deleting task from Firestore:', error)
        // ロールバック
        set({
          tasks: {
            ...state.tasks,
            [quadrant]: oldTasks,
          },
        })
      }
    }
  },

  moveTask: async (taskId, fromQuadrant, toQuadrant) => {
    const state = get()
    const task = state.tasks[fromQuadrant].find((t) => t.id === taskId)
    if (!task) return

    const oldFromTasks = state.tasks[fromQuadrant]
    const oldToTasks = state.tasks[toQuadrant]

    // Optimistic UI更新
    set({
      tasks: {
        ...state.tasks,
        [fromQuadrant]: state.tasks[fromQuadrant].filter((t) => t.id !== taskId),
        [toQuadrant]: [...state.tasks[toQuadrant], task],
      },
    })

    // Firestoreに保存
    if (state.boardId) {
      try {
        await firestoreHelpers.moveTask(state.boardId, taskId, fromQuadrant, toQuadrant)
      } catch (error) {
        console.error('Error moving task in Firestore:', error)
        // ロールバック
        set({
          tasks: {
            ...state.tasks,
            [fromQuadrant]: oldFromTasks,
            [toQuadrant]: oldToTasks,
          },
        })
      }
    }
  },
}))
