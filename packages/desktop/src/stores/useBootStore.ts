import { create } from 'zustand'
import type { BootPhase, ShutdownPhase } from '../types'

interface BootState {
  phase: BootPhase
  progress: number
  stageText: string
  shutdownPhase: ShutdownPhase
  isCrashed: boolean

  setProgress: (pct: number) => void
  setStage: (text: string) => void
  startBoot: () => void
  triggerLogin: () => void
  completeBoot: () => void
  startShutdown: () => void
  powerOff: () => void
  startReboot: () => void
  triggerCrash: () => void
  clearCrash: () => void
  reset: () => void
}

export const useBootStore = create<BootState>((set) => ({
  phase: 'booting',
  progress: 0,
  stageText: 'BOOTING...',
  shutdownPhase: 'on',
  isCrashed: false,

  setProgress: (pct) => set({ progress: Math.max(0, Math.min(100, Math.round(pct))) }),
  setStage: (text) => set({ stageText: text }),

  startBoot: () =>
    set({
      phase: 'booting',
      progress: 0,
      stageText: 'BOOTING...',
      shutdownPhase: 'on',
      isCrashed: false,
    }),

  triggerLogin: () => set({ phase: 'login', progress: 100 }),

  completeBoot: () => set({ phase: 'boot-complete', progress: 100 }),

  startShutdown: () => set({ shutdownPhase: 'shutting' }),

  powerOff: () => set({ shutdownPhase: 'off' }),

  startReboot: () =>
    set({
      shutdownPhase: 'booting',
      phase: 'booting',
      progress: 0,
      stageText: 'REBOOTING...',
      isCrashed: false,
    }),

  triggerCrash: () => set({ isCrashed: true }),

  clearCrash: () => set({ isCrashed: false }),

  reset: () =>
    set({
      phase: 'pre-boot',
      progress: 0,
      stageText: 'BOOTING...',
      shutdownPhase: 'on',
      isCrashed: false,
    }),
}))
