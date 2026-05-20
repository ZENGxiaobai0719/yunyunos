import { registerCommand } from './registry'

registerCommand('close|kill', (args, ctx) => {
  if (args.length === 0) {
    ctx.pushLine('用法: close <module>', 'error')
    return
  }
  ctx.pushLine(`正在关闭 ${args[0]}...`)
  ctx.windowStore.close(args[0])
})
