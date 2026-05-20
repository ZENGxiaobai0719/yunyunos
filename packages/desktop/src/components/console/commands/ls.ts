import { registerCommand } from './registry'

registerCommand('ls', (args, ctx) => {
  const target = args[0]?.toLowerCase() || 'modules'

  if (target === 'modules' || target === 'windows') {
    ctx.pushLine('可用窗口/模块:')
    ctx.pushLine('  anime    — 动漫番剧浏览器')
    ctx.pushLine('  user     — 用户个人页')
    ctx.pushLine('  console  — 系统控制台 (当前窗口)')
  } else {
    ctx.pushLine(`未知分类: ${target}`, 'error')
    ctx.pushLine('用法: ls [modules|windows]')
  }
})
