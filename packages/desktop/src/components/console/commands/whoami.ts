import { registerCommand } from './registry'
import { useAuthStore } from '../../../stores/useAuthStore'

registerCommand('whoami', (_args, ctx) => {
  const authStore = useAuthStore.getState()
  const username = authStore.isLoggedIn ? authStore.username : ctx.consoleStore.username
  ctx.pushLine(`用户: ${username}`)
  ctx.pushLine(`UID: ${ctx.consoleStore.uid}`)
  ctx.pushLine(`模式: ${ctx.consoleStore.mode}`)
})
