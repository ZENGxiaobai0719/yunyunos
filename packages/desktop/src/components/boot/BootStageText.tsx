import { useBootStore } from '../../stores/useBootStore'

export default function BootStageText() {
  const stageText = useBootStore((s) => s.stageText)

  return (
    <div className="boot-subtitle" id="awardBootStageText">
      {stageText}
    </div>
  )
}
