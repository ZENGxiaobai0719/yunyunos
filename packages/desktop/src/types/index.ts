// === Window Types ===
export interface WindowConfig {
  id: string
  title: string
  icon: string
  defaultLeft: number
  defaultTop: number
  defaultWidth: number
  defaultHeight: number
  align?: 'right' | 'left'
  autostart?: boolean
  variant: 'intro' | 'personal' | 'iframe'
}

export interface WindowInstance {
  id: string
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
}

// === Boot Types ===
export type BootPhase = 'pre-boot' | 'booting' | 'login' | 'boot-complete'
export type ShutdownPhase = 'on' | 'shutting' | 'powering-off' | 'power-cut' | 'off' | 'booting'

// === Console Types ===
export interface ConsoleLine {
  text: string
  kind: 'input' | 'output' | 'error' | 'info' | 'success' | 'banner' | 'muted'
}

export type CommandHandler = (args: string[], ctx: CommandContext) => void | Promise<void>

export interface CommandContext {
  pushLine: (text: string, kind?: ConsoleLine['kind']) => void
  clearOutput: () => void
  pushHistory: (cmd: string) => void
  windowStore: {
    open: (id: string) => void
    close: (id: string) => void
    focus: (id: string) => void
    minimize: (id: string) => void
  }
  bootStore: {
    startShutdown: () => void
    startReboot: () => void
    triggerCrash: () => void
  }
  consoleStore: {
    mode: 'guest' | 'user'
    uid: number
    username: string
    year: string
  }
}

// === Greeting Types ===
export interface GreetingItem {
  nickname: string
  username: string
  avatar: string
  message: string
}

// === Model Debug Types ===
export interface ModelState {
  posX: number
  posY: number
  posZ: number
  rotX: number
  rotY: number
  rotZ: number
  scaleRatio: number
  spinDeg: number
  lineWidth: number
  fillRatio: number
}

// === Desktop Icons ===
export interface DesktopIconEntry {
  id: string
  icon: string
  label: string
  iconClass: string
}
