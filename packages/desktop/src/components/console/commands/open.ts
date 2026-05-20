import { registerCommand } from './registry'

const ALIASES: Record<string, string> = {
  user: 'user',
  personal: 'user',
  anime: 'anime',
  console: 'console',
  terminal: 'console',
  intro: 'console',
}

registerCommand('open|start|launch', (args, ctx) => {
  if (args.length === 0) {
    ctx.pushLine('用法: open <module>', 'error')
    ctx.pushLine('可用模块: anime, user, console')
    return
  }
  const target = ALIASES[args[0].toLowerCase()] || args[0].toLowerCase()
  ctx.pushLine(`正在打开 ${target}...`)
  ctx.windowStore.open(target)
})
