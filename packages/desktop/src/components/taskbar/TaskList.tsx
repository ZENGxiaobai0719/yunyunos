import { useWindowStore } from '../../stores/useWindowStore'

export default function TaskList() {
  const windows = useWindowStore((s) => s.windows)
  const windowConfigs = useWindowStore((s) => s.windowConfigs)
  const focus = useWindowStore((s) => s.focus)
  const minimize = useWindowStore((s) => s.minimize)

  const openWindows = Object.values(windows).filter((w) => w.isOpen)

  return (
    <div className="task-list" id="task-list">
      {openWindows.map((win) => {
        const config = windowConfigs[win.id]
        const isActive = !win.isMinimized && win.zIndex === Math.max(...openWindows.map((w) => w.zIndex))
        return (
          <div
            key={win.id}
            className={`task-item${isActive ? ' active' : ''}`}
            data-app={win.id}
            onClick={() => {
              if (win.isMinimized) {
                focus(win.id)
              } else if (isActive) {
                minimize(win.id)
              } else {
                focus(win.id)
              }
            }}
          >
            <span className="task-icon">{config?.icon || '?'}</span>
            <span>{config?.title || win.id}</span>
          </div>
        )
      })}
    </div>
  )
}
