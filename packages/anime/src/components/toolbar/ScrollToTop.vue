<template>
  <div class="relative group">
    <button
      @click="scrollToTop"
      class="w-11 h-11 rounded-full bg-[#f0f2f5]/80 hover:bg-[#d5d9df] flex items-center justify-center transition-all hover:scale-110 text-lg"
      :title="t('toolbar.backToTop')"
    >
      ↑
    </button>
    <span class="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#f0f2f5] text-[#0f1419] text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      {{ t('common.backToTop') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
