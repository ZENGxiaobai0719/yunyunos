import { registerCommand } from './registry'

registerCommand('exit|quit', (_args, ctx) => {
  ctx.windowStore.minimize('intro')
})
