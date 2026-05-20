import { registerCommand } from './registry'

registerCommand('rm', (args, ctx) => {
  if (args.length === 0) {
    ctx.pushLine('rm: 缺少操作数', 'error')
    ctx.pushLine("试试 'rm /sys/core/reality'", 'info')
    return
  }
  const path = args[0]
  ctx.pushLine(`正在删除 ${path}...`, 'info')
  setTimeout(() => {
    ctx.bootStore.triggerCrash()
  }, 800)
})
