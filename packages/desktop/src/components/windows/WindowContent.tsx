import IframeWindow from './IframeWindow'
import IntroWindow from './IntroWindow'

interface Props {
  variant: string
  appId: string
}

const IFrame_URLS: Record<string, string> = {
  user: import.meta.env.VITE_RESUME_URL || 'http://localhost:3000',
  link: import.meta.env.VITE_SHORTLINK_URL || 'http://localhost:5175',
  anime: import.meta.env.VITE_ANIME_URL || 'http://localhost:5174',
}

function iframeSrc(appId: string) {
  return IFrame_URLS[appId] || IFrame_URLS.anime
}

export default function WindowContent({ variant, appId }: Props) {
  if (variant === 'iframe') {
    return (
      <div className="win-content">
        <IframeWindow src={iframeSrc(appId)} title={appId} />
      </div>
    )
  }
  if (variant === 'intro') {
    return (
      <div className="win-content">
        <IntroWindow />
      </div>
    )
  }
  return (
    <div className="win-content">
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--award25-text-dim, #888)' }}>
        即将推出...
      </div>
    </div>
  )
}
