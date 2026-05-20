import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export const useLocaleStore = defineStore('locale', () => {
  const { locale } = useI18n()
  const current = ref<'zh-CN' | 'zh-TW'>(
    (localStorage.getItem('locale') as 'zh-CN' | 'zh-TW') || 'zh-CN'
  )

  function toggle() {
    current.value = current.value === 'zh-CN' ? 'zh-TW' : 'zh-CN'
  }

  watch(current, (v) => {
    locale.value = v
    localStorage.setItem('locale', v)
  }, { immediate: true })

  return { current, toggle }
})
