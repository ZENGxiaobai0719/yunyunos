import { useWindowStore } from '../../stores/useWindowStore'

interface Props {
  id: string
  icon: string
  label: string
  iconClass: string
  index: number
}

export default function DesktopIcon({ id, icon, label, iconClass, index }: Props) {
  const open = useWindowStore((s) => s.open)

  return (
    <div
      className={`desktop-icon ${iconClass}`}
      role="button"
      tabIndex={0}
      data-open-app={id}
      onClick={() => open(id)}
      style={{ '--icon-delay': `${1000 + index * 100}ms` } as React.CSSProperties}
    >
      <div className="icon-img">{icon}</div>
      <div className="icon-label">{label}</div>
    </div>
  )
}
