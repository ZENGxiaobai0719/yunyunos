<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <p class="text-6xl font-bold text-gray-600 mb-4">404</p>
    <p class="text-[#9ca3af] mb-6">{{ t('notFound.message') }}</p>
    <router-link to="/" class="px-6 py-2 bg-[#f09199] text-[#0f1419] rounded hover:bg-[#e88090] transition-colors">
      {{ t('notFound.goHome') }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
