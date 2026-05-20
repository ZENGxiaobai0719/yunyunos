import { useBootStore } from './stores/useBootStore'
import BootOverlay from './components/boot/BootOverlay'
import ClickToEnter from './components/boot/ClickToEnter'
import Desktop from './components/desktop/Desktop'
import WindowManager from './components/windows/WindowManager'
import Taskbar from './components/taskbar/Taskbar'
import ShutdownOverlay from './components/overlays/ShutdownOverlay'
import CrashOverlay from './components/overlays/CrashOverlay'
import { useEffect } from 'react'
import { useWindowStore } from './stores/useWindowStore'

export default function DesktopApp() {
  const phase = useBootStore((s) => s.phase)
  const shutdownPhase = useBootStore((s) => s.shutdownPhase)
  const isCrashed = useBootStore((s) => s.isCrashed)

  const isBooting = phase === 'booting'
  const isLogin = phase === 'login'
  const isRunning = phase === 'boot-complete'
  const isShuttingDown = shutdownPhase !== 'on'

  // Forward mousemove events into the music player iframe so its built-in
  // "BG Mouse Animation" parallax responds even when cursor is over windows/taskbar.
  // (When cursor is over the iframe itself, the native event fires directly.)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const iframe = document.getElementById('desktopObjBg')?.querySelector('iframe') as HTMLIFrameElement | null
      const doc = iframe?.contentDocument
      if (!doc) return
      try {
        doc.dispatchEvent(new MouseEvent('mousemove', {
          clientX: e.clientX, clientY: e.clientY, bubbles: true,
        }))
      } catch { /* cross-origin guard */ }
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  // Auto-open console window when desktop becomes ready
  useEffect(() => {
    if (!isRunning) return
    const timer = setTimeout(() => {
      useWindowStore.getState().open('console')
      useWindowStore.getState().focus('console')
    }, 600)
    return () => clearTimeout(timer)
  }, [isRunning])

  // Auto-pause music when any window becomes maximized
  useEffect(() => {
    const unsub = useWindowStore.subscribe((state, prev) => {
      const wasMaximized = Object.values(prev.windows).some((w) => w.isMaximized)
      const isMaximized = Object.values(state.windows).some((w) => w.isMaximized)
      if (!wasMaximized && isMaximized) {
        const iframe = document.getElementById('desktopObjBg')?.querySelector('iframe') as HTMLIFrameElement | null
        const audio = iframe?.contentDocument?.getElementById('audio-player') as HTMLAudioElement | null
        audio?.pause()
      }
    })
    return () => unsub()
  }, [])

  return (
    <div className="desktop-root award-root">
      <div id="awardWrapper" className="awardDesktop">
        {/* Music Player Wallpaper — fullscreen background, always mounted */}
        <div className="desktop-obj-bg" id="desktopObjBg" aria-hidden="true">
          <iframe
            src="/music-player/index.html"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              position: 'absolute',
              inset: 0,
              display: 'block',
            }}
            title="Music Player"
          />
        </div>

        {isBooting && <BootOverlay />}
        {isLogin && <ClickToEnter />}
        {isShuttingDown && <ShutdownOverlay />}
        {isCrashed && <CrashOverlay />}
        {isRunning && <Desktop />}
        {isRunning && <WindowManager />}
        {isRunning && <Taskbar />}
      </div>
    </div>
  )
}
