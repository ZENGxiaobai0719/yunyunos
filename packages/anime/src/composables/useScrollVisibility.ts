import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollVisibility() {
  const visible = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function show() {
    visible.value = true
    resetTimer()
  }

  function resetTimer() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      visible.value = false
    }, 1500)
  }

  function onScroll() {
    show()
  }

  function onMouseEnter() {
    if (timer) clearTimeout(timer)
  }

  function onMouseLeave() {
    resetTimer()
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    if (timer) clearTimeout(timer)
  })

  return { visible, onMouseEnter, onMouseLeave }
}
