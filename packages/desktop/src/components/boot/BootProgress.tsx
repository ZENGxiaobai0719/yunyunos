import { useBootStore } from '../../stores/useBootStore'

export default function BootProgress() {
  const progress = useBootStore((s) => s.progress)

  return (
    <div className="boot-progress">
      <div
        className="boot-progress-fill"
        id="awardBootProgress"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
