import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<'dark' | 'light'>(
    (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  )

  function applyTheme(m: 'dark' | 'light') {
    document.documentElement.setAttribute('data-theme', m)
  }

  function toggle() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  applyTheme(mode.value)

  watch(mode, (m) => {
    localStorage.setItem('theme', m)
    applyTheme(m)
  })

  return { mode, toggle }
})
