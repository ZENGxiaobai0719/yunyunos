import { registerCommand } from './registry'

registerCommand('shutdown', (_args, ctx) => {
  ctx.pushLine('正在关闭系统...', 'info')
  ctx.pushLine('')
  setTimeout(() => ctx.bootStore.startShutdown(), 500)
})
