import { useState, useEffect } from 'react'

function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [])
  return <span id="desktopClock">{time || '00:00'}</span>
}

export default function SystemTray() {
  return (
    <div className="sys-tray">
      <Clock />
    </div>
  )
}
