import { create } from 'zustand'
import type { ConsoleLine } from '../types'

interface ConsoleState {
  output: ConsoleLine[]
  history: string[]
  historyIndex: number
  mode: 'guest' | 'user'
  uid: number
  username: string
  year: string

  pushLine: (text: string, kind?: ConsoleLine['kind']) => void
  clearOutput: () => void
  pushHistory: (cmd: string) => void
  setHistoryIndex: (idx: number) => void
  setUser: (username: string) => void
  typeLine: (text: string, kind?: ConsoleLine['kind'], delay?: number) => Promise<void>
}

export const useConsoleStore = create<ConsoleState>((set, get) => ({
  output: [],
  history: [],
  historyIndex: -1,
  mode: 'guest',
  uid: 0,
  username: 'guest',
  year: '2025',

  pushLine: (text, kind = 'output') =>
    set((s) => ({
      output: [...s.output, { text, kind }],
    })),

  clearOutput: () => set({ output: [] }),

  pushHistory: (cmd) =>
    set((s) => ({
      history: [...s.history, cmd],
      historyIndex: s.history.length + 1,
    })),

  setHistoryIndex: (idx) => set({ historyIndex: idx }),

  setUser: (username) => set({ username, mode: 'user', uid: 1000 }),

  typeLine: async (text, kind = 'output', delay = 30) => {
    const chars = text.split('')
    let accumulated = ''
    const line = get().output.length
    set((s) => ({
      output: [...s.output, { text: '', kind }],
    }))
    for (const ch of chars) {
      await new Promise((r) => setTimeout(r, delay))
      accumulated += ch
      set((s) => {
        const updated = [...s.output]
        updated[line] = { text: accumulated, kind }
        return { output: updated }
      })
    }
  },
}))
