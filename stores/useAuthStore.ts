import { create } from 'zustand'
import type { User } from '@/lib/types'

interface AuthState {
  user: User | null
  idToken: string | null
  loading: boolean
  setUser: (user: User | null) => void
  setIdToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  idToken: null,
  loading: false,

  setUser: (user) => set({ user }),
  setIdToken: (token) => set({ idToken: token }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, idToken: null }),
}))
