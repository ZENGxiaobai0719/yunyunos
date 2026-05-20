import { useEffect, useRef } from 'react'
import { useBootStore } from '../../stores/useBootStore'
import BootProgress from './BootProgress'
import BootStageText from './BootStageText'

export default function BootOverlay() {
  const progress = useBootStore((s) => s.progress)
  const setProgress = useBootStore((s) => s.setProgress)
  const setStage = useBootStore((s) => s.setStage)
  const triggerLogin = useBootStore((s) => s.triggerLogin)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    const BOOT_DURATION = 4000
    const startTime = Date.now()
    let booted = false

    setProgress(0)
    setStage('BOOTING...')

    const timer = setInterval(() => {
      if (cancelledRef.current || booted) return
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, Math.round((elapsed / BOOT_DURATION) * 100))
      setProgress(pct)

      if (elapsed < 1500) setStage('BOOTING...')
      else if (elapsed < 3000) setStage('LOADING...')
      else setStage('READY')

      if (pct >= 100) {
        booted = true
        clearInterval(timer)
        setProgress(100)
        setStage('BOOT COMPLETE')
        setTimeout(() => triggerLogin(), 150)
      }
    }, 50)

    return () => {
      cancelledRef.current = true
      clearInterval(timer)
    }
  }, [setProgress, setStage, triggerLogin])

  return (
    <div className="award-boot-overlay" id="desktopBootOverlay" aria-hidden="false">
      <div className="boot-panel">
        <div className="boot-title">YUNYUN OS</div>
        <BootStageText />
        <BootProgress />
        <div className="boot-progress-text" id="desktopBootProgressText">
          {progress}%
        </div>
      </div>
    </div>
  )
}
