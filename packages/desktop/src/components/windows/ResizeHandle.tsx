import { useCallback, useRef, type RefObject } from 'react'
import { useWindowStore } from '../../stores/useWindowStore'

interface Props {
  appId: string
  winEl: RefObject<HTMLDivElement | null>
}

export default function ResizeHandle({ appId, winEl }: Props) {
  const setSize = useWindowStore((s) => s.setSize)
  const handleRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const el = winEl.current
      const handle = handleRef.current
      if (!el || !handle) return

      handle.setPointerCapture(e.pointerId)

      const startX = e.clientX
      const startY = e.clientY
      const startWidth = el.offsetWidth
      const startHeight = el.offsetHeight
      document.body.style.cursor = 'nwse-resize'

      const onMove = (ev: PointerEvent) => {
        // setProperty with 'important' prevents React re-renders from
        // overwriting the width/height during resize
        const w = Math.max(280, startWidth + (ev.clientX - startX))
        const h = Math.max(180, startHeight + (ev.clientY - startY))
        el.style.setProperty('width', w + 'px', 'important')
        el.style.setProperty('height', h + 'px', 'important')
      }
      const onUp = () => {
        document.body.style.cursor = ''
        handle.releasePointerCapture(e.pointerId)
        handle.removeEventListener('pointermove', onMove)
        handle.removeEventListener('pointerup', onUp)
        setSize(appId, {
          width: parseFloat(el.style.width) || startWidth,
          height: parseFloat(el.style.height) || startHeight,
        })
      }
      handle.addEventListener('pointermove', onMove)
      handle.addEventListener('pointerup', onUp)
    },
    [appId, winEl, setSize],
  )

  return (
    <div
      ref={handleRef}
      className="resize-handle"
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
    />
  )
}
