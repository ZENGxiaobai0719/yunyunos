<template>
  <div class="w-full px-2 py-8">
    <div v-if="animeStore.detailLoading" class="flex justify-center py-20">
      <p class="text-[#9ca3af]">{{ t('common.loading') }}</p>
    </div>

    <template v-else-if="animeStore.currentDetail">
      <!-- Banner -->
      <div v-if="detail.bannerImage" class="relative w-full h-48 -mt-8 -mx-2 mb-6 rounded-b-lg overflow-hidden">
        <img :src="detail.bannerImage" alt="" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#edf0f5] via-transparent to-transparent" />
      </div>

      <div class="flex gap-8">
        <!-- Cover -->
        <div class="w-52 shrink-0">
          <img
            :src="detail.coverImage?.extraLarge || ''"
            :alt="displayTitle"
            class="w-full aspect-[2/3] object-cover rounded-lg shadow-md"
          />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-[#0f1419] mb-1">{{ displayTitle }}</h1>
          <p v-if="detail.title?.nativeTitle" class="text-sm text-[#9ca3af] mb-3">{{ detail.title.nativeTitle }}</p>

          <!-- Studio · Format · Episodes · Duration -->
          <div class="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b7280] mb-3">
            <span v-if="firstStudio">{{ firstStudio }}</span>
            <span v-if="detail.format">{{ formatMap[detail.format] || detail.format }}</span>
            <span v-if="detail.episodes">{{ detail.episodes }} Episodes</span>
            <span v-if="detail.duration">{{ detail.duration }} min</span>
          </div>

          <!-- Status · Source · Season -->
          <div class="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b7280] mb-3">
            <span v-if="detail.status" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full" :class="statusDotClass" />
              {{ statusMap[detail.status] || detail.status }}
            </span>
            <span v-if="detail.source">Source: {{ sourceMap[detail.source] || detail.source }}</span>
            <span v-if="detail.season && detail.startDate?.year">{{ seasonLabel(detail.season, detail.startDate.year) }}</span>
          </div>

          <!-- Score + Popularity -->
          <div class="flex items-center gap-6 mb-4">
            <div v-if="detail.averageScore" class="flex items-center gap-1.5">
              <span class="text-2xl font-bold" :style="{ color: scoreColor }">{{ detail.averageScore }}%</span>
              <span class="text-xs text-[#9ca3af]">score</span>
            </div>
            <div v-if="detail.popularity" class="flex items-center gap-1">
              <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="rgb(232,93,117)" stroke-width="2">
                <path d="M15.63 3.458a4.125 4.125 0 0 0-5.835 0L9 4.253l-.795-.795A4.126 4.126 0 1 0 2.37 9.293l.795.795L9 15.922l5.835-5.835.795-.795a4.125 4.125 0 0 0 0-5.835z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="text-sm text-[#6b7280]">#{{ detail.popularity }}</span>
            </div>
          </div>

          <!-- Genres -->
          <div v-if="detail.genres?.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="genre in detail.genres" :key="genre"
              class="px-3 py-1 text-xs font-semibold rounded-full"
              :style="genreStyle"
            >{{ genre }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <router-link
              :to="`/play/${detail.id}/1`"
              class="px-6 py-2 bg-[#f09199] text-[#0f1419] rounded hover:bg-[#e88090] transition-colors text-sm font-medium"
            >{{ t('common.play') }}</router-link>
            <button
              @click="shareLink"
              class="px-6 py-2 bg-[#f0f2f5] text-[#6b7280] rounded hover:bg-[#d5d9df] transition-colors text-sm"
            >{{ t('common.share') }}</button>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="detail.description" class="mt-8">
        <h3 class="text-lg font-bold text-[#0f1419] mb-2">{{ t('detail.synopsis') }}</h3>
        <div class="relative">
          <p :class="['text-sm text-[#6b7280] leading-relaxed', !showFullDesc && 'line-clamp-4']" v-html="formattedDescription" />
          <button
            v-if="(detail.description?.length || 0) > 200"
            @click="showFullDesc = !showFullDesc"
            class="text-[#f09199] text-sm mt-1 hover:underline"
          >{{ showFullDesc ? t('common.collapse') : t('common.expand') }}</button>
        </div>
      </div>

      <!-- Episode List -->
      <div v-if="episodes.length > 0" class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-[#0f1419]">{{ t('detail.episodeList', [episodes.length]) }}</h3>
          <button
            @click="epAsc = !epAsc"
            class="px-3 py-1 text-sm bg-[#f0f2f5] text-[#6b7280] rounded hover:bg-[#d5d9df] transition-colors"
          >{{ t('common.sort') }}</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <router-link
            v-for="ep in sortedEpisodes" :key="ep.number"
            :to="`/play/${detail.id}/${ep.number}`"
            class="px-4 py-2 bg-[#f0f2f5] text-[#6b7280] rounded text-sm hover:bg-[#f09199] hover:text-[#0f1419] transition-colors relative"
          >
            {{ String(ep.number).padStart(2, '0') }}
            <span v-if="ep.downloadStatus === 'COMPLETED'" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full" title="已缓存" />
            <span v-else-if="ep.downloadStatus === 'DOWNLOADING'" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" :title="'下载中 ' + (ep.progress || 0) + '%'" />
          </router-link>
        </div>
      </div>

      <!-- External Links + Trailer -->
      <div v-if="detail.externalLinks?.length || detail.trailer" class="mt-8 flex flex-wrap items-center gap-3">
        <a
          v-for="link in detail.externalLinks" :key="link.url"
          :href="link.url" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f0f2f5] rounded text-sm text-[#6b7280] hover:bg-[#d5d9df] transition-colors"
        >
          <img v-if="link.icon" :src="link.icon" class="w-4 h-4" alt="" />
          {{ link.site }}
        </a>
        <a
          v-if="detail.trailer"
          :href="trailerUrl" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#292929] rounded text-sm text-white hover:opacity-80 transition-opacity"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Trailer
        </a>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="flex justify-center py-20">
      <p class="text-[#9ca3af]">{{ t('detail.notFound') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'
import { useToastStore } from '@/stores/toast'
import { useI18n } from 'vue-i18n'
import type { AnimeDetail } from '@/types'

const route = useRoute()
const animeStore = useAnimeStore()
const toast = useToastStore()
const { t } = useI18n()

const showFullDesc = ref(false)
const epAsc = ref(true)

const detail = computed<AnimeDetail>(() => animeStore.currentDetail!)

const displayTitle = computed(() => {
  const d = detail.value
  return d.title?.romaji || d.title?.nativeTitle || d.title?.english || 'Unknown'
})

const firstStudio = computed(() => detail.value.studios?.nodes?.[0]?.name || null)

const formatMap: Record<string, string> = {
  TV: 'TV', TV_SHORT: 'TV Short', MOVIE: 'Movie', OVA: 'OVA', ONA: 'ONA', SPECIAL: 'Special', MUSIC: 'Music',
}

const statusMap: Record<string, string> = {
  RELEASING: 'Airing', FINISHED: 'Finished', NOT_YET_RELEASED: 'Not Yet Aired', CANCELLED: 'Cancelled', HIATUS: 'Hiatus',
}

const sourceMap: Record<string, string> = {
  MANGA: 'Manga', LIGHT_NOVEL: 'Light Novel', ORIGINAL: 'Original', GAME: 'Game', NOVEL: 'Novel', OTHER: 'Other',
}

const statusDotClass = computed(() => {
  const s = detail.value.status
  if (s === 'RELEASING') return 'bg-green-400'
  if (s === 'FINISHED') return 'bg-blue-400'
  if (s === 'NOT_YET_RELEASED') return 'bg-yellow-400'
  return 'bg-gray-400'
})

const scoreColor = computed(() => {
  const s = detail.value.averageScore || 0
  if (s > 74) return '#4caf50'
  if (s > 60) return '#ff9800'
  return '#f44336'
})

const genreStyle = computed(() => {
  const color = detail.value.coverImage?.color || '#a2c8f2'
  return {
    backgroundColor: color + '30',
    color: color,
    border: `1px solid ${color}50`,
  }
})

function seasonLabel(season: string, year: number): string {
  const labels: Record<string, string> = { WINTER: 'Winter', SPRING: 'Spring', SUMMER: 'Summer', FALL: 'Fall' }
  return `${labels[season] || season} ${year}`
}

const formattedDescription = computed(() => {
  const desc = detail.value.description || ''
  return desc
    .replace(/<br\s*\/?>/gi, '<br/>')
    .replace(/<i>(.*?)<\/i>/gi, '<em>$1</em>')
    .replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>')
})

const trailerUrl = computed(() => {
  const tr = detail.value.trailer
  if (!tr) return '#'
  if (tr.site === 'youtube') return `https://www.youtube.com/watch?v=${tr.id}`
  return `https://www.youtube.com/watch?v=${tr.id}`
})

const episodes = computed(() => detail.value.episodeList || [])

const sortedEpisodes = computed(() =>
  epAsc.value ? episodes.value : [...episodes.value].reverse()
)

function shareLink() {
  navigator.clipboard.writeText(location.href)
  toast.show(t('common.linkCopied'))
}

onMounted(() => {
  animeStore.fetchDetail(Number(route.params.id))
})
</script>
