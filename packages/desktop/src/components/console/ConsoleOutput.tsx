import { useEffect, useRef } from 'react'
import type { ConsoleLine } from '../../types'

interface Props {
  lines: ConsoleLine[]
}

export default function ConsoleOutput({ lines }: Props) {
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="console-output" id="awardConsoleOutput" role="log" aria-live="polite" ref={outputRef}>
      {lines.map((line, i) => (
        <div key={i} className={`console-line${line.kind !== 'output' ? ` is-${line.kind}` : ''}`}>
          {line.text}
        </div>
      ))}
    </div>
  )
}
