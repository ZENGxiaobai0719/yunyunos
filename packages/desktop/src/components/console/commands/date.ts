import { registerCommand } from './registry'

registerCommand('date', (_args, ctx) => {
  const now = new Date()
  ctx.pushLine(now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
  }))
})
