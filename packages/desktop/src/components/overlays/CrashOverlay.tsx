export default function CrashOverlay() {
  return (
    <div className="award-crash-overlay" id="awardCrashOverlay" aria-hidden="false" style={{ opacity: 1 }}>
      <div className="crash-panel">
        <div className="crash-title">KERNEL PANIC</div>
        <div className="crash-subtitle">rm -rf / detected. System integrity compromised.</div>
        <div className="crash-dump">panic(cpu 0): attempted to remove /sys/core/reality</div>
        <div className="crash-tip">Auto rebooting...</div>
      </div>
    </div>
  )
}
