import { useWindowStore } from '../../stores/useWindowStore'

interface Props {
  title: string
  appId: string
  onDragStart: (e: React.MouseEvent) => void
  onMinimize?: (appId: string) => void
  onToggleMax?: (appId: string) => void
}

export default function WindowHeader({ title, appId, onDragStart, onMinimize, onToggleMax }: Props) {
  const minimize = useWindowStore((s) => s.minimize)
  const toggleMax = useWindowStore((s) => s.toggleMax)
  const close = useWindowStore((s) => s.close)

  return (
    <div className="win-header" onMouseDown={onDragStart}>
      <div className="win-title">{title}</div>
      <div className="win-controls">
        <button className="win-btn min-btn" data-action="min" onClick={() => onMinimize ? onMinimize(appId) : minimize(appId)}>
          _
        </button>
        <button className="win-btn max-btn" data-action="max" onClick={() => onToggleMax ? onToggleMax(appId) : toggleMax(appId)}>
          □
        </button>
        <button className="win-btn close-btn" data-action="close" onClick={() => close(appId)}>
          ×
        </button>
      </div>
    </div>
  )
}
