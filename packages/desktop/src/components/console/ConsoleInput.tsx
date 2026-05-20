import { useState, useRef, useCallback } from 'react'
import { useConsoleStore } from '../../stores/useConsoleStore'
import { getCommandNames } from './commands/registry'

interface Props {
  prompt: string
  onCommand: (cmd: string) => void
}

export default function ConsoleInput({ prompt, onCommand }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const history = useConsoleStore((s) => s.history)
  const historyIndex = useConsoleStore((s) => s.historyIndex)
  const setHistoryIndex = useConsoleStore((s) => s.setHistoryIndex)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onCommand(value)
        setValue('')
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const idx = Math.max(0, historyIndex - 1)
        setHistoryIndex(idx)
        if (history[idx] !== undefined) setValue(history[idx])
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const idx = Math.min(history.length, historyIndex + 1)
        setHistoryIndex(idx)
        if (idx < history.length) setValue(history[idx])
        else setValue('')
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        const cmds = getCommandNames()
        const match = cmds.find((c) => c.startsWith(value))
        if (match) setValue(match)
        return
      }
    },
    [value, history, historyIndex, setHistoryIndex, onCommand],
  )

  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="console-input-row" onClick={handleContainerClick}>
      <span className="cli-prompt" id="awardConsolePrompt">
        {prompt}{' '}
      </span>
      <input
        ref={inputRef}
        id="awardConsoleInput"
        className="console-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <button
        type="button"
        className="console-complete-btn"
        id="awardConsoleCompleteBtn"
        aria-label="补全命令"
        onClick={() => {
          const cmds = getCommandNames()
          const match = cmds.find((c) => c.startsWith(value))
          if (match) setValue(match)
        }}
      >
        Tab
      </button>
    </div>
  )
}
