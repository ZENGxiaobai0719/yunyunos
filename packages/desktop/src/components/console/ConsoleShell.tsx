import { useCallback, useEffect, useRef } from 'react'
import { useConsoleStore } from '../../stores/useConsoleStore'
import { useWindowStore } from '../../stores/useWindowStore'
import { useBootStore } from '../../stores/useBootStore'
import type { ConsoleLine } from '../../types'
import ConsoleOutput from './ConsoleOutput'
import ConsoleInput from './ConsoleInput'

interface ApiResponse {
  code: number
  message: string
  data: {
    lines: Array<{ text: string; kind: string }>
    sideEffects: string[]
  }
}

export default function ConsoleShell() {
  const output = useConsoleStore((s) => s.output)
  const pushLine = useConsoleStore((s) => s.pushLine)
  const pushHistory = useConsoleStore((s) => s.pushHistory)

  const greetedRef = useRef(false)

  useEffect(() => {
    if (!greetedRef.current) {
      greetedRef.current = true
      pushLine('  __  __  __  __  __  __  __  _   _', 'banner')
      pushLine("  \\ \\/ / | | | \\ | | | | | \\ | | \\ / |", 'banner')
      pushLine("   \\  /  | | |  \\| | | | |  \\| |  |  |", 'banner')
      pushLine("   /  \\  |_| |_|\\__| |_| |_|\\__|  |__|", 'banner')
      pushLine('', 'output')
      pushLine('  YUNYUN OS  v1.0.0', 'success')
      pushLine('', 'output')
      pushLine('  User: guest   Mode: guest   UID: 0   Modules: 3', 'muted')
      pushLine('', 'output')
      pushLine('  Try: help | ls modules | open <anime|user|console>', 'muted')
      pushLine('', 'output')
    }
  }, [pushLine])

  const handleSideEffect = useCallback((fx: string) => {
    const winStore = useWindowStore.getState()
    const bootStore = useBootStore.getState()
    const conStore = useConsoleStore.getState()

    if (fx === 'clear') {
      conStore.clearOutput()
      return
    }
    if (fx === 'shutdown') {
      bootStore.startShutdown()
      return
    }
    if (fx === 'reboot') {
      bootStore.startReboot()
      return
    }
    if (fx === 'crash') {
      bootStore.triggerCrash()
      return
    }
    if (fx.startsWith('open:')) {
      const appId = fx.slice(5)
      winStore.open(appId)
      return
    }
    if (fx.startsWith('close:')) {
      const appId = fx.slice(6)
      winStore.close(appId)
      return
    }
    if (fx.startsWith('focus:')) {
      const appId = fx.slice(6)
      winStore.focus(appId)
      return
    }
    if (fx.startsWith('minimize:')) {
      const appId = fx.slice(9)
      winStore.minimize(appId)
      return
    }
  }, [])

  const handleCommand = useCallback(
    async (cmd: string) => {
      const trimmed = cmd.trim()
      if (!trimmed) return

      pushLine(trimmed, 'input')
      pushHistory(trimmed)

      try {
        const resp = await fetch('/api/console/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: trimmed }),
        })
        const json: ApiResponse = await resp.json()

        if (json.code !== 0) {
          pushLine(json.message || '未知错误', 'error')
          return
        }

        const data = json.data
        if (!data) {
          pushLine('后端返回空数据', 'error')
          return
        }

        for (const line of data.lines) {
          pushLine(line.text, (line.kind || 'output') as ConsoleLine['kind'])
        }

        if (data.sideEffects) {
          for (const fx of data.sideEffects) {
            handleSideEffect(fx)
          }
        }
      } catch (err) {
        pushLine(
          '连接后端失败: ' + (err instanceof Error ? err.message : String(err)),
          'error',
        )
      }
    },
    [pushLine, pushHistory, handleSideEffect],
  )

  return (
    <div id="awardConsole" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ConsoleOutput lines={output} />
      <ConsoleInput prompt="guest@yunyun:~$" onCommand={handleCommand} />
    </div>
  )
}
