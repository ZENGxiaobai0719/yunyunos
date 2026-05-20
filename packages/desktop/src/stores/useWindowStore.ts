import { create } from 'zustand'
import type { WindowConfig, WindowInstance } from '../types'

interface WindowState {
  zIndexCounter: number
  windows: Record<string, WindowInstance>
  windowConfigs: Record<string, WindowConfig>

  registerConfig: (config: WindowConfig) => void
  open: (id: string) => void
  close: (id: string) => void
  minimize: (id: string) => void
  focus: (id: string) => void
  toggleMax: (id: string) => void
  showDesktop: () => void
  setPosition: (id: string, pos: { x: number; y: number }) => void
  setSize: (id: string, size: { width: number; height: number }) => void
  getActiveWindowId: () => string | null
}

function initWindow(id: string, config: WindowConfig): WindowInstance {
  return {
    id,
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 200,
    position: { x: config.defaultLeft, y: config.defaultTop },
    size: { width: config.defaultWidth, height: config.defaultHeight },
  }
}

export const useWindowStore = create<WindowState>((set, get) => {
  const configs: Record<string, WindowConfig> = {}

  const staticConfigs: WindowConfig[] = [
    {
      id: 'anime',
      title: 'ANIME',
      icon: 'A',
      defaultLeft: 80,
      defaultTop: 30,
      defaultWidth: 1100,
      defaultHeight: 750,
      variant: 'iframe',
    },
    {
      id: 'user',
      title: 'USER',
      icon: 'U',
      defaultLeft: 50,
      defaultTop: 20,
      defaultWidth: 1100,
      defaultHeight: 750,
      variant: 'iframe',
    },
    {
      id: 'link',
      title: 'LINK',
      icon: 'L',
      defaultLeft: 100,
      defaultTop: 40,
      defaultWidth: 1200,
      defaultHeight: 800,
      variant: 'iframe',
    },
    {
      id: 'console',
      title: 'CONSOLE',
      icon: '^_',
      defaultLeft: 60,
      defaultTop: 20,
      defaultWidth: 800,
      defaultHeight: 600,
      variant: 'intro',
    },
  ]
  staticConfigs.forEach((c) => {
    configs[c.id] = c
  })

  const initialWindows: Record<string, WindowInstance> = {}
  Object.values(configs).forEach((c) => {
    initialWindows[c.id] = initWindow(c.id, c)
  })

  return {
    zIndexCounter: 210,
    windows: initialWindows,
    windowConfigs: configs,

    registerConfig: (config) =>
      set((s) => ({
        windowConfigs: { ...s.windowConfigs, [config.id]: config },
        windows: { ...s.windows, [config.id]: initWindow(config.id, config) },
      })),

    open: (id) =>
      set((s) => {
        const win = s.windows[id]
        if (!win || win.isOpen) return s
        const nextZ = s.zIndexCounter + 1
        return {
          zIndexCounter: nextZ,
          windows: {
            ...s.windows,
            [id]: { ...win, isOpen: true, isMinimized: false, zIndex: nextZ },
          },
        }
      }),

    close: (id) =>
      set((s) => {
        const win = s.windows[id]
        if (!win) return s
        return {
          windows: {
            ...s.windows,
            [id]: { ...win, isOpen: false, isMinimized: false, isMaximized: false },
          },
        }
      }),

    minimize: (id) =>
      set((s) => {
        const win = s.windows[id]
        if (!win) return s
        return {
          windows: {
            ...s.windows,
            [id]: { ...win, isMinimized: true, isMaximized: false },
          },
        }
      }),

    focus: (id) =>
      set((s) => {
        const win = s.windows[id]
        if (!win) return s
        const nextZ = s.zIndexCounter + 1
        return {
          zIndexCounter: nextZ,
          windows: {
            ...s.windows,
            [id]: { ...win, zIndex: nextZ, isMinimized: false },
          },
        }
      }),

    toggleMax: (id) =>
      set((s) => {
        const win = s.windows[id]
        if (!win) return s
        return {
          windows: { ...s.windows, [id]: { ...win, isMaximized: !win.isMaximized } },
        }
      }),

    showDesktop: () =>
      set((s) => {
        const updated: Record<string, WindowInstance> = {}
        Object.values(s.windows).forEach((w) => {
          if (w.isOpen) {
            updated[w.id] = { ...w, isMinimized: true, isMaximized: false }
          }
        })
        return { windows: { ...s.windows, ...updated } }
      }),

    setPosition: (id, pos) =>
      set((s) => {
        const win = s.windows[id]
        if (!win) return s
        return { windows: { ...s.windows, [id]: { ...win, position: pos } } }
      }),

    setSize: (id, size) =>
      set((s) => {
        const win = s.windows[id]
        if (!win) return s
        return { windows: { ...s.windows, [id]: { ...win, size } } }
      }),

    getActiveWindowId: () => {
      const s = get()
      let maxZ = 0
      let activeId: string | null = null
      Object.values(s.windows).forEach((w) => {
        if (w.isOpen && !w.isMinimized && w.zIndex > maxZ) {
          maxZ = w.zIndex
          activeId = w.id
        }
      })
      return activeId
    },
  }
})
