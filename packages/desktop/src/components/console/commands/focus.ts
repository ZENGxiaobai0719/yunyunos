import { registerCommand } from './registry'

registerCommand('focus|activate', (args, ctx) => {
  if (args.length === 0) {
    ctx.pushLine('用法: focus <module>', 'error')
    return
  }
  ctx.windowStore.focus(args[0])
})
