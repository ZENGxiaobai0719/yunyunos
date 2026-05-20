import type { CommandHandler } from '../../../types'

const registry = new Map<string, CommandHandler>()

export function registerCommand(name: string, handler: CommandHandler) {
  registry.set(name, handler)
}

export function getCommand(name: string): CommandHandler | undefined {
  // Check exact match
  if (registry.has(name)) return registry.get(name)
  // Check aliases
  for (const [key, handler] of registry) {
    const aliases = key.split('|')
    if (aliases.includes(name)) return handler
  }
  return undefined
}

export function getCommandNames(): string[] {
  const names: string[] = []
  registry.forEach((_, key) => {
    names.push(key.split('|')[0])
  })
  return names.sort()
}

export function getAllCommands(): Array<{ name: string; aliases: string[] }> {
  const result: Array<{ name: string; aliases: string[] }> = []
  registry.forEach((_, key) => {
    const parts = key.split('|')
    result.push({ name: parts[0], aliases: parts.slice(1) })
  })
  return result
}

export { registry }
