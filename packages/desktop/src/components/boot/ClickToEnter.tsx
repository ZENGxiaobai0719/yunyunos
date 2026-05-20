import { useState, useCallback, useRef } from 'react'
import { useBootStore } from '../../stores/useBootStore'

export default function ClickToEnter() {
  const [dragging, setDragging] = useState(false)
  const [offsetY, setOffsetY] = useState(0)
  const [startY, setStartY] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const completeBoot = useBootStore((s) => s.completeBoot)
  const containerRef = useRef<HTMLDivElement>(null)

  const threshold = typeof window !== 'undefined' ? window.innerHeight * 0.25 : 200

  const downTimeRef = useRef(0)
  const downPosRef = useRef({ x: 0, y: 0 })
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (unlocked) return
      setDragging(true)
      setStartY(e.clientY)
      setOffsetY(0)
      downTimeRef.current = Date.now()
      downPosRef.current = { x: e.clientX, y: e.clientY }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [unlocked],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Always forward mousemove to Spine iframe for character tracking
      if (iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.document.dispatchEvent(
            new MouseEvent('mousemove', { clientX: e.clientX, clientY: e.clientY, bubbles: true }),
          )
        } catch { /* cross-origin guard */ }
      }

      if (!dragging || unlocked) return
      const dy = startY - e.clientY
      if (dy > 0) {
        setOffsetY(dy)
        if (dy > threshold) {
          setUnlocked(true)
          setOffsetY(window.innerHeight)
          setTimeout(() => completeBoot(), 500)
        }
      }
    },
    [dragging, startY, threshold, unlocked, completeBoot],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (unlocked) return
      const dt = Date.now() - downTimeRef.current
      const dx = e.clientX - downPosRef.current.x
      const dy = e.clientY - downPosRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Tap (not swipe) — forward click to Spine iframe for skin switching
      if (dist < 10 && dt < 300) {
        if (iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.document.dispatchEvent(
              new MouseEvent('click', { clientX: e.clientX, clientY: e.clientY, bubbles: true }),
            )
          } catch { /* cross-origin guard */ }
        }
      }

      setDragging(false)
      setOffsetY(0)
    },
    [unlocked],
  )

  const progress = Math.min(offsetY / threshold, 1)

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 800,
        background: '#000',
        overflow: 'hidden',
      }}
    >
      {/* Initial loading veil — hides flash of desktop */}
      {!iframeLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '2vh',
              fontWeight: 200,
              letterSpacing: '0.3em',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(144,238,144,0.5) 45%, rgba(144,238,144,0.85) 50%, rgba(144,238,144,0.5) 55%, rgba(255,255,255,0.35) 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              animation: 'shimmerGreen 2.5s ease-in-out infinite',
            }}
          >
            YUNYUN OS
          </div>
        </div>
      )}

      {/* Spine animation iframe */}
      <iframe
        ref={iframeRef}
        src="/boot-anim/mf.html"
        onLoad={() => setIframeLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          transform: unlocked
            ? 'translateY(-100%)'
            : `translateY(${-offsetY}px)`,
          transition: unlocked ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
        title="Boot Animation"
      />

      {/* Transparent gesture overlay — on top of iframe */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          cursor: dragging ? 'grabbing' : 'default',
          touchAction: 'none',
          userSelect: 'none',
        }}
      />

      {/* Swipe hint — subtle indicator at bottom */}
      {!dragging && iframeLoaded && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '6vh',
            pointerEvents: 'none',
            opacity: Math.max(0, 1 - progress),
            transition: 'opacity 0.3s',
          }}
        >
          <div
            style={{
              width: '5vh',
              height: '5vh',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5vh',
              animation: 'swipeBounce 2s ease-in-out infinite',
            }}
          >
            <svg
              width="2vh"
              height="2vh"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
            >
              <path d="M12 5v14M5 12l7-7 7 7" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '1.6vh',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.15em',
            }}
          >
            Swipe up to enter
          </span>
        </div>
      )}

      {/* Progress indicator during swipe */}
      {dragging && !unlocked && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${Math.max(0, 10 - progress * 10)}vh`,
            zIndex: 3,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: 'bottom 0.1s',
          }}
        >
          <div
            style={{
              height: 3,
              width: `${Math.min(100, progress * 100)}%`,
              maxWidth: '30vh',
              background: `rgba(255,255,255,${0.3 + progress * 0.5})`,
              borderRadius: 999,
              transition: 'width 0.05s linear, background 0.2s',
            }}
          />
        </div>
      )}
    </div>
  )
}
