import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getSongs } from '@/api/music'
import type { MusicSongResponse } from '@/api/music'

export const useMusicStore = defineStore('musicPlayer', () => {
  const songs = ref<MusicSongResponse[]>([])
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  const isMuted = ref(false)
  const shuffleMode = ref(false)
  const repeatMode = ref<'none' | 'one' | 'all'>('all')
  const activeBgIndex = ref(1)
  const loading = ref(false)
  const audioEl = ref<HTMLAudioElement | null>(null)

  const currentSong = computed(() => songs.value[currentIndex.value] ?? null)

  const musicUrl = computed(() => {
    const s = currentSong.value
    if (!s || !s.musicFile) return ''
    return `/api/music/stream/${encodeURIComponent(s.musicFile)}`
  })

  const coverUrl = computed(() => {
    const s = currentSong.value
    if (!s || !s.coverFile) return ''
    return `/api/music/cover/${encodeURIComponent(s.coverFile)}`
  })

  const progress = computed(() =>
    duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  )

  function initAudio() {
    if (audioEl.value) return
    const el = new Audio()
    el.volume = volume.value
    el.preload = 'auto'
    el.addEventListener('loadedmetadata', () => { duration.value = el.duration })
    el.addEventListener('timeupdate', () => { currentTime.value = el.currentTime })
    el.addEventListener('ended', () => { onEnded() })
    el.addEventListener('error', () => { isPlaying.value = false })
    audioEl.value = el
  }

  async function fetchSongs() {
    loading.value = true
    try {
      songs.value = await getSongs()
    } catch (e) {
      console.error('Failed to load songs:', e)
    } finally {
      loading.value = false
    }
  }

  function loadAndPlay(index: number) {
    initAudio()
    const el = audioEl.value!
    if (index < 0 || index >= songs.value.length) return
    currentIndex.value = index
    el.src = musicUrl.value
    el.load()
    el.play().then(() => { isPlaying.value = true }).catch(() => {})
  }

  function togglePlay() {
    const el = audioEl.value
    if (!el || !el.src) { loadAndPlay(0); return }
    if (isPlaying.value) {
      el.pause()
      isPlaying.value = false
    } else {
      el.play().then(() => { isPlaying.value = true }).catch(() => {})
    }
  }

  function next() {
    const len = songs.value.length
    if (len === 0) return
    if (shuffleMode.value) {
      const next = Math.floor(Math.random() * len)
      loadAndPlay(next)
    } else {
      loadAndPlay((currentIndex.value + 1) % len)
    }
  }

  function prev() {
    const len = songs.value.length
    if (len === 0) return
    if (currentTime.value > 3) {
      seek(0)
      return
    }
    loadAndPlay((currentIndex.value - 1 + len) % len)
  }

  function seek(time: number) {
    const el = audioEl.value
    if (el) {
      el.currentTime = time
      currentTime.value = time
    }
  }

  function seekPercent(pct: number) {
    const el = audioEl.value
    if (el && duration.value > 0) {
      el.currentTime = (pct / 100) * duration.value
    }
  }

  function setVolume(v: number) {
    volume.value = Math.max(0, Math.min(1, v))
    if (audioEl.value) audioEl.value.volume = volume.value
    if (volume.value > 0) isMuted.value = false
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (audioEl.value) {
      audioEl.value.volume = isMuted.value ? 0 : volume.value
    }
  }

  function toggleShuffle() { shuffleMode.value = !shuffleMode.value }
  function toggleRepeat() {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all']
    const idx = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(idx + 1) % modes.length]
  }

  function setBgIndex(idx: number) { activeBgIndex.value = idx }

  function onEnded() {
    switch (repeatMode.value) {
      case 'one':
        seek(0)
        audioEl.value?.play()
        break
      case 'all':
        next()
        break
      default:
        isPlaying.value = false
    }
  }

  // sync audio src when currentSong changes
  watch(currentIndex, () => {
    const el = audioEl.value
    if (el && currentSong.value) {
      el.src = musicUrl.value
      el.load()
      if (isPlaying.value) el.play().catch(() => {})
    }
  })

  return {
    songs, currentIndex, isPlaying, currentTime, duration,
    volume, isMuted, shuffleMode, repeatMode, activeBgIndex,
    loading, audioEl, currentSong, musicUrl, coverUrl, progress,
    fetchSongs, loadAndPlay, togglePlay, next, prev, seek, seekPercent,
    setVolume, toggleMute, toggleShuffle, toggleRepeat, setBgIndex,
  }
})
