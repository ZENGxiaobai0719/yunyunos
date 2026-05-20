import { useWindowStore } from '../../stores/useWindowStore'
import WindowFrame from './WindowFrame'

export default function WindowManager() {
  const windows = useWindowStore((s) => s.windows)
  const focus = useWindowStore((s) => s.focus)

  // Render ALL open windows (including minimized) so restore animation can run.
  // Hidden via CSS when minimized + animation complete.
  const openWindows = Object.values(windows).filter((w) => w.isOpen)

  return (
    <>
      {openWindows.map((win) => (
        <WindowFrame key={win.id} instance={win} onFocus={() => focus(win.id)} />
      ))}
    </>
  )
}
