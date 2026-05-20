import { registerCommand } from './registry'

registerCommand('reboot', (_args, ctx) => {
  ctx.pushLine('正在重启...', 'info')
  setTimeout(() => ctx.bootStore.startReboot(), 600)
})
