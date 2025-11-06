import { create } from 'zustand'
import { User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}))

// Firebase認証状態の監視
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user)
    useAuthStore.getState().setLoading(false)
  })
}
