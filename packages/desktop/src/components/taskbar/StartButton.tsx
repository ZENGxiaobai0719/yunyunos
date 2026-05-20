import { useWindowStore } from '../../stores/useWindowStore'

export default function StartButton() {
  const showDesktop = useWindowStore((s) => s.showDesktop)

  return (
    <button type="button" className="start-btn" onClick={showDesktop}>
      <span className="start-dot" />
      YUN:OS
    </button>
  )
}
