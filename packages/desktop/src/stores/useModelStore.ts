import { create } from 'zustand'
import type { ModelState } from '../types'

interface ModelStore extends ModelState {
  isDebugVisible: boolean
  setParam: (key: keyof ModelState, value: number) => void
  toggleDebug: () => void
}

export const useModelStore = create<ModelStore>((set) => ({
  posX: 4,
  posY: 0,
  posZ: 0,
  rotX: 0,
  rotY: -90,
  rotZ: 6,
  scaleRatio: 45,
  spinDeg: 18,
  lineWidth: 1.6,
  fillRatio: 0.16,
  isDebugVisible: false,

  setParam: (key, value) => set({ [key]: value }),
  toggleDebug: () => set((s) => ({ isDebugVisible: !s.isDebugVisible })),
}))
