<template>
  <div class="w-full px-2 py-8">
    <div v-if="animeStore.detailLoading" class="flex justify-center py-20">
      <p class="text-[#9ca3af]">{{ t('common.loading') }}</p>
    </div>

    <template v-else-if="animeStore.currentDetail">
      <div class="flex gap-4">
        <!-- Video Player -->
        <div class="flex-1">
          <video
            v-if="downloadStatus === 'COMPLETED'"
            :key="`video-${animeId}-${currentEpNum}`"
            controls autoplay
            class="w-full aspect-video bg-black rounded-lg"
          >
            <source :src="`/api/video/${animeId}/${currentEpNum}`" />
          </video>

          <div v-else-if="downloadStatus === 'DOWNLOADING'" class="w-full aspect-video bg-black rounded-lg flex flex-col items-center justify-center gap-4">
            <div class="w-64 bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                class="bg-[#f09199] h-3 rounded-full transition-all duration-500"
                :style="{ width: (downloadProgress || 0) + '%' }"
              />
            </div>
            <p class="text-gray-300 text-sm">{{ t('play.downloading') }} {{ downloadProgress || 0 }}%</p>
          </div>

          <div v-else class="w-full aspect-video bg-black rounded-lg flex flex-col items-center justify-center gap-3">
            <p v-if="downloadStatus === 'FAILED'" class="text-red-400 text-sm">{{ t('play.downloadFailed') }}</p>
            <p v-else class="text-gray-400 text-sm">{{ t('play.notDownloaded') }}</p>
            <button
              class="px-6 py-2 bg-[#f09199] text-[#0f1419] rounded text-sm font-medium hover:bg-[#e88090] transition-colors"
              @click="startDownload"
            >{{ t('play.startDownload') }}</button>
          </div>
        </div>

        <!-- Side Panel -->
        <div class="w-80 shrink-0">
          <router-link :to="`/detail/${animeId}`" class="text-lg font-bold text-[#0f1419] hover:text-[#f09199] transition-colors">
            {{ displayTitle }}
          </router-link>

          <div class="flex items-center gap-4 text-xs text-[#9ca3af] mt-2">
            <span>{{ detailYear }}</span>
          </div>

          <div class="flex gap-2 mt-4">
            <button @click="nextEpisode" :disabled="!hasNext" class="flex-1 px-4 py-2 bg-[#f09199] text-[#0f1419] text-sm rounded hover:bg-[#e88090] disabled:opacity-50 transition-colors">{{ t('play.nextEpisode') }}</button>
            <button @click="epAsc = !epAsc" class="px-4 py-2 bg-[#f0f2f5] text-[#6b7280] text-sm rounded hover:bg-[#d5d9df] transition-colors">{{ t('common.sort') }}</button>
          </div>

          <div class="mt-4">
            <h4 class="text-sm text-[#9ca3af] mb-2">{{ episodes.length }} {{ t('play.episodes') }}</h4>
            <div class="flex flex-wrap gap-1.5">
              <router-link
                v-for="ep in sortedEpisodes" :key="ep.number"
                :to="`/play/${animeId}/${ep.number}`"
                :class="[
                  'px-3 py-1.5 rounded text-xs transition-colors relative',
                  ep.number === currentEpNum
                    ? 'bg-[#f09199] text-[#0f1419]'
                    : 'bg-[#f0f2f5] text-[#6b7280] hover:bg-[#d5d9df]'
                ]"
              >
                {{ String(ep.number).padStart(2, '0') }}
                <span
                  v-if="ep.downloadStatus === 'COMPLETED'"
                  class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full"
                  title="已缓存"
                />
                <span
                  v-else-if="ep.downloadStatus === 'DOWNLOADING'"
                  class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                  :title="'下载中 ' + (ep.progress || 0) + '%'"
                />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'
import { useWatchStore } from '@/stores/watch'
import { useI18n } from 'vue-i18n'
import { getEpisodeStatus, startEpisodeDownload } from '@/api/anime'

const route = useRoute()
const router = useRouter()
const animeStore = useAnimeStore()
const watchStore = useWatchStore()
const { t } = useI18n()

const epAsc = ref(true)
const downloadStatus = ref<string | null>(null)
const downloadProgress = ref(0)
let pollTimer: ReturnType<typeof setInterval> | null = null

const animeId = computed(() => Number(route.params.animeId))
const currentEpNum = computed(() => Number(route.params.episode))

const displayTitle = computed(() => {
  const d = animeStore.currentDetail
  if (!d) return ''
  return d.title?.romaji || d.title?.nativeTitle || d.title?.english || 'Unknown'
})

const detailYear = computed(() => {
  const d = animeStore.currentDetail
  return d?.startDate?.year || ''
})

const episodes = computed(() => animeStore.currentDetail?.episodeList || [])

const sortedEpisodes = computed(() =>
  epAsc.value ? episodes.value : [...episodes.value].reverse()
)

const hasNext = computed(() =>
  currentEpNum.value < episodes.value.length
)

function nextEpisode() {
  if (hasNext.value) {
    router.push(`/play/${animeId.value}/${currentEpNum.value + 1}`)
  }
}

function startDownload() {
  startEpisodeDownload(animeId.value, currentEpNum.value).then(() => {
    startPolling()
  }).catch(() => {
    downloadStatus.value = 'FAILED'
  })
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(async () => {
    try {
      const status = await getEpisodeStatus(animeId.value, currentEpNum.value)
      downloadStatus.value = status.downloadStatus
      downloadProgress.value = status.progress || 0
      if (status.downloadStatus === 'COMPLETED') {
        stopPolling()
      }
    } catch {
      stopPolling()
    }
  }, 2000)
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

function checkStatus() {
  getEpisodeStatus(animeId.value, currentEpNum.value).then((status) => {
    downloadStatus.value = status.downloadStatus
    downloadProgress.value = status.progress || 0
    if (status.downloadStatus === 'DOWNLOADING') {
      startPolling()
    }
  }).catch(() => {})
}

async function loadPage() {
  await animeStore.fetchDetail(animeId.value)
  if (animeStore.currentDetail) {
    watchStore.addRecord({
      animeId: animeStore.currentDetail.id,
      animeTitle: displayTitle.value,
      type: animeStore.currentDetail.format || '',
      episodeNum: currentEpNum.value,
      coverUrl: animeStore.currentDetail.coverImage?.extraLarge || '',
      watchedAt: new Date().toISOString(),
    })
  }
  checkStatus()
}

watch([animeId, currentEpNum], () => {
  loadPage()
  checkStatus()
})
onMounted(() => loadPage())
onUnmounted(() => stopPolling())
</script>
