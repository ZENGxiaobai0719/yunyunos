import { registerCommand } from './registry'

registerCommand('motd', (_args, ctx) => {
  const now = new Date()
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekStr = `星期${weekDays[now.getDay()]}`

  ctx.pushLine('╔══════════════════════════════════════╗', 'banner')
  ctx.pushLine('║   __  __  __  __  __  __  __  _   _ ║', 'banner')
  ctx.pushLine('║   \\ \\/ / | | | \\ | | | | | \\ | | \\ / | ║', 'banner')
  ctx.pushLine('║    \\  /  | | |  \\| | | | |  \\| |  |  | ║', 'banner')
  ctx.pushLine('║    /  \\  |_| |_|\\__| |_| |_|\\__|  |__| ║', 'banner')
  ctx.pushLine('║                                        ║', 'banner')
  ctx.pushLine('║         YUNYUN OS  v1.0               ║', 'banner')
  ctx.pushLine('╚══════════════════════════════════════╝', 'banner')
  ctx.pushLine('', 'output')
  ctx.pushLine(`${dateStr} ${weekStr}`, 'success')
  ctx.pushLine('', 'output')
  ctx.pushLine('欢迎来到云云动漫桌面系统', 'info')
  ctx.pushLine('点击桌面图标探索动漫内容，或输入 help 查看命令', 'muted')
})
