import { useRef, useCallback, useState, useEffect } from 'react'
import type { WindowInstance } from '../../types'
import { useWindowStore } from '../../stores/useWindowStore'
import WindowHeader from './WindowHeader'
import WindowContent from './WindowContent'
import ResizeHandle from './ResizeHandle'

interface Props {
  instance: WindowInstance
  onFocus: () => void
}

export default function WindowFrame({ instance, onFocus }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const config = useWindowStore((s) => s.windowConfigs[instance.id])
  const activeId = useWindowStore((s) => {
    const openWindows = Object.values(s.windows).filter((w) => w.isOpen && !w.isMinimized)
    return openWindows.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), openWindows[0] || null)?.id || null
  })
  const setPosition = useWindowStore((s) => s.setPosition)
  const minimizeStore = useWindowStore((s) => s.minimize)
  const toggleMaxStore = useWindowStore((s) => s.toggleMax)

  const [animState, setAnimState] = useState<'normal' | 'minimizing' | 'restoring'>('normal')
  const prevMinimized = useRef(instance.isMinimized)

  // Restore animation when un-minimized
  useEffect(() => {
    if (prevMinimized.current && !instance.isMinimized) {
      setAnimState('restoring')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimState('normal')
        })
      })
    } else if (!instance.isMinimized) {
      setAnimState('normal')
    }
    prevMinimized.current = instance.isMinimized
  }, [instance.isMinimized])

  const isActive = instance.id === activeId

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      onFocus()
      const el = frameRef.current
      if (!el || instance.isMaximized) return

      const startX = e.clientX
      const startY = e.clientY
      const startLeft = el.offsetLeft
      const startTop = el.offsetTop

      const onMove = (ev: MouseEvent) => {
        el.style.left = (startLeft + (ev.clientX - startX)) + 'px'
        el.style.top = Math.max(0, startTop + (ev.clientY - startY)) + 'px'
      }
      const onUp = () => {
        setPosition(instance.id, {
          x: parseFloat(el.style.left) || startLeft,
          y: parseFloat(el.style.top) || startTop,
        })
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [instance.id, instance.isMaximized, onFocus, setPosition],
  )

  const handleMinimize = useCallback(
    (appId: string) => {
      setAnimState('minimizing')
      setTimeout(() => {
        minimizeStore(appId)
      }, 280)
    },
    [minimizeStore],
  )

  if (!config) return null

  const isHidden = instance.isMinimized && animState !== 'minimizing'

  return (
    <div
      ref={frameRef}
      id={`win-${instance.id}`}
      className={`window window-${config.variant} open${isActive ? ' active-win' : ''}${instance.isMaximized ? ' maximized' : ''}${animState === 'minimizing' ? ' minimizing' : ''}${animState === 'restoring' ? ' restoring' : ''}${isHidden ? ' hidden-win' : ''}`}
      data-app={instance.id}
      data-icon={config.icon}
      data-title={config.title}
      style={{
        left: instance.position.x,
        top: instance.position.y,
        width: instance.size.width,
        height: instance.size.height,
        zIndex: instance.zIndex,
        display: 'flex',
      }}
      onMouseDown={onFocus}
    >
      <WindowHeader
        title={`${config.title} ${config.icon}`}
        appId={instance.id}
        onDragStart={handleDragStart}
        onMinimize={handleMinimize}
        onToggleMax={toggleMaxStore}
      />
      <WindowContent variant={config.variant} appId={instance.id} />
      {!instance.isMaximized && <ResizeHandle appId={instance.id} winEl={frameRef} />}
    </div>
  )
}
