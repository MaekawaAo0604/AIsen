import { create } from 'zustand'
import type { Board, Task, Quadrant } from '@/lib/types'

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
  addTask: (quadrant: Quadrant, task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (quadrant: Quadrant, taskId: string, updates: Partial<Task>) => void
  deleteTask: (quadrant: Quadrant, taskId: string) => void
  moveTask: (taskId: string, fromQuadrant: Quadrant, toQuadrant: Quadrant) => void
}

export const useBoardStore = create<BoardState>((set) => ({
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

  addTask: (quadrant, taskData) => set((state) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    return {
      tasks: {
        ...state.tasks,
        [quadrant]: [...state.tasks[quadrant], newTask],
      },
    }
  }),

  updateTask: (quadrant, taskId, updates) => set((state) => ({
    tasks: {
      ...state.tasks,
      [quadrant]: state.tasks[quadrant].map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    },
  })),

  deleteTask: (quadrant, taskId) => set((state) => ({
    tasks: {
      ...state.tasks,
      [quadrant]: state.tasks[quadrant].filter((task) => task.id !== taskId),
    },
  })),

  moveTask: (taskId, fromQuadrant, toQuadrant) => set((state) => {
    const task = state.tasks[fromQuadrant].find((t) => t.id === taskId)
    if (!task) return state

    return {
      tasks: {
        ...state.tasks,
        [fromQuadrant]: state.tasks[fromQuadrant].filter((t) => t.id !== taskId),
        [toQuadrant]: [...state.tasks[toQuadrant], task],
      },
    }
  }),
}))
