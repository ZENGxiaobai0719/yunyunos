import { useNotificationStore } from '../../stores/useNotificationStore'

export default function NotificationStack() {
  const isVisible = useNotificationStore((s) => s.isVisible)

  return (
    <div
      className={`desktop-notify-stack${isVisible ? ' is-visible' : ' is-hidden'}`}
      id="awardGreetingStack"
      aria-live="polite"
    >
      <div className="desktop-notify-card is-top">
        <div className="desktop-notify-header">
          <span className="desktop-notify-user">系统</span>
        </div>
        <div className="desktop-notify-text">欢迎来到 Yunyun OS 桌面系统</div>
      </div>
    </div>
  )
}
