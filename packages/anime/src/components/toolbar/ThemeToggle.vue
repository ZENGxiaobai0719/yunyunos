<template>
  <div class="relative group">
    <button
      @click="theme.toggle()"
      class="w-11 h-11 rounded-full bg-[#f0f2f5]/80 hover:bg-[#d5d9df] flex items-center justify-center transition-all hover:scale-110 text-lg"
      :title="t('toolbar.theme')"
    >
      <Sun v-if="theme.mode === 'dark'" :size="20" class="text-[#f09199]" />
      <Moon v-else :size="20" class="text-[#6b7280]" />
    </button>
    <span class="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#f0f2f5] text-[#0f1419] text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      {{ t('toolbar.theme') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'

const theme = useThemeStore()
const { t } = useI18n()
</script>
