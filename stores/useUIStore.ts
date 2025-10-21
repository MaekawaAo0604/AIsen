import { create } from 'zustand'

type ModalType = 'brainstorm' | 'paywall' | 'auth' | 'share' | 'taskEdit'

interface UIState {
  modals: Record<ModalType, boolean>
  openModal: (modal: ModalType) => void
  closeModal: (modal: ModalType) => void
}

export const useUIStore = create<UIState>((set) => ({
  modals: {
    brainstorm: false,
    paywall: false,
    auth: false,
    share: false,
    taskEdit: false,
  },

  openModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: true },
  })),

  closeModal: (modal) => set((state) => ({
    modals: { ...state.modals, [modal]: false },
  })),
}))
