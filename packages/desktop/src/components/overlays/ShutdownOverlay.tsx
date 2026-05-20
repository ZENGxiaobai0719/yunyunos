export default function ShutdownOverlay() {
  return (
    <div className="award-shutdown-overlay open" id="awardShutdownOverlay" aria-hidden="false">
      <div className="shutdown-noise" aria-hidden="true" />
      <div className="shutdown-panel">
        <div className="shutdown-title">SYSTEM HALTED</div>
        <div className="shutdown-subtitle">Yunyun OS is now offline.</div>
        <div className="shutdown-tip">Tap screen to resume.</div>
      </div>
    </div>
  )
}
