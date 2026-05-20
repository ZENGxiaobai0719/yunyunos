import { getCommand } from './registry'
import type { CommandContext } from '../../../types'

// Import all commands to ensure they're registered
import './help'
import './whoami'
import './uname'
import './date'
import './ls'
import './clear'
import './echo'
import './motd'
import './shutdown'
import './reboot'
import './rm'
import './open'
import './close'
import './focus'
import './exit'

export function executeCommand(input: string, ctx: CommandContext) {
  const parts = input.trim().split(/\s+/)
  const name = parts[0]?.toLowerCase() || ''
  const args = parts.slice(1)

  const handler = getCommand(name)

  if (!handler) {
    ctx.pushLine(`命令未找到: ${name}。输入 help 查看可用命令。`, 'error')
    return
  }

  try {
    handler(args, ctx)
  } catch (err) {
    ctx.pushLine(`执行错误: ${err instanceof Error ? err.message : String(err)}`, 'error')
  }
}
