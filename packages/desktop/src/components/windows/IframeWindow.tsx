interface Props {
  src: string
  title?: string
}

export default function IframeWindow({ src, title }: Props) {
  return (
    <iframe
      src={src}
      title={title || 'Anime'}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
      }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  )
}
