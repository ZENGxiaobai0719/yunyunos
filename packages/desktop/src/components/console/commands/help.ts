import { registerCommand, getAllCommands } from './registry'

registerCommand('help', (args, ctx) => {
  if (args.length > 0) {
    const detail: Record<string, string> = {
      help: 'help [command] — 显示命令列表或详细信息',
      motd: 'motd — 显示欢迎信息',
      clear: 'clear — 清屏',
      whoami: 'whoami — 显示当前用户',
      uname: 'uname [-a] — 显示系统信息',
      date: 'date — 显示本地时间',
      ls: 'ls [modules|windows] — 列出可用资源',
      rm: 'rm <path> — 删除文件 (危险操作)',
      shutdown: 'shutdown — 关闭系统',
      reboot: 'reboot — 重启系统',
      open: 'open <module> — 打开窗口',
      close: 'close <module> — 关闭窗口',
      focus: 'focus <module> — 聚焦窗口',
      exit: 'exit — 最小化控制台',
      echo: 'echo <text> — 输出文本',
    }
    const info = detail[args[0].toLowerCase()]
    if (info) {
      ctx.pushLine(info)
    } else {
      ctx.pushLine(`未知命令: ${args[0]}`, 'error')
    }
    return
  }

  ctx.pushLine('Yunyun OS — 可用命令:')
  ctx.pushLine('')
  getAllCommands().forEach(({ name, aliases }) => {
    const aliasStr = aliases.length > 0 ? ` (${aliases.join(', ')})` : ''
    ctx.pushLine(`  ${name}${aliasStr}`)
  })
  ctx.pushLine('')
  ctx.pushLine('输入 help <command> 查看命令详情')
})
