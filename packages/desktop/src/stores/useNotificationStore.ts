import { create } from 'zustand'

interface NotificationState {
  isVisible: boolean
  isExpanded: boolean
  expandedKey: string | null
  isRotating: boolean

  toggle: () => void
  show: () => void
  hide: () => void
  expandCard: (key: string) => void
  collapseAll: () => void
  setRotating: (v: boolean) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isVisible: true,
  isExpanded: false,
  expandedKey: null,
  isRotating: false,

  toggle: () => set((s) => ({ isVisible: !s.isVisible, isExpanded: false, expandedKey: null })),
  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false, isExpanded: false, expandedKey: null }),
  expandCard: (key) => set({ isExpanded: true, expandedKey: key }),
  collapseAll: () => set({ isExpanded: false, expandedKey: null }),
  setRotating: (v) => set({ isRotating: v }),
}))
