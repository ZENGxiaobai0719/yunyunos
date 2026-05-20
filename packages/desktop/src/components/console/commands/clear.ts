import { registerCommand } from './registry'

registerCommand('clear', (_args, ctx) => {
  ctx.clearOutput()
})
