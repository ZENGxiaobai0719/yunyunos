<template>
  <div class="app-shell">
    <RouterView />

    <!-- Toast -->
    <Transition name="fade">
      <div
        v-if="toast.visible"
        class="toast"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 10px 24px;
  background: rgb(var(--color-foreground));
  color: rgb(var(--color-text));
  font-size: 1.3rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(49,54,68,.15);
}
</style>
