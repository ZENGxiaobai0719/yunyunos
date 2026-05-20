import { registerCommand } from './registry'

registerCommand('echo', (args, ctx) => {
  ctx.pushLine(args.join(' '))
})
