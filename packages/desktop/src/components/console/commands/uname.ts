import { registerCommand } from './registry'

registerCommand('uname', (args, ctx) => {
  if (args.includes('-a')) {
    ctx.pushLine(`YunyunOS ${ctx.consoleStore.year}.0.0 (desktop-${ctx.consoleStore.mode})`)
    ctx.pushLine('Architecture: React + TypeScript + Vite')
    ctx.pushLine(`Session: ${ctx.consoleStore.username}@yunyun`)
  } else {
    ctx.pushLine('YunyunOS')
  }
})
