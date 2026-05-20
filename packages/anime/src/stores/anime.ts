import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSeasonalChart, getAiringSchedule, getArchive, getTba, getAnimeDetail } from '@/api/anime'
import type { SeasonalAnime, AiringScheduleItem, AnimeDetail } from '@/types'

function getCurrentSeason(): { season: string; year: number } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const s = m <= 3 ? 'WINTER' : m <= 6 ? 'SPRING' : m <= 9 ? 'SUMMER' : 'FALL'
  return { season: s, year: y }
}

export const useAnimeStore = defineStore('anime', () => {
  // ===== 季节榜单 =====
  const seasonalMedia = ref<SeasonalAnime[]>([])
  const seasonalPageInfo = ref({ hasNextPage: false, total: 0 })
  const seasonalLoading = ref(false)
  const currentSeason = ref(getCurrentSeason().season)
  const currentYear = ref(getCurrentSeason().year)
  const currentFormat = ref<string>('TV')
  const filterText = ref('')
  const sortKey = ref('popularity')
  const sortDirection = ref<'asc' | 'desc'>('desc')
  const chartLoaded = ref(false)

  // ===== Airing =====
  const airingList = ref<AiringScheduleItem[]>([])
  const airingLoading = ref(false)

  // ===== Archive =====
  const archiveList = ref<SeasonalAnime[]>([])
  const archivePageInfo = ref({ hasNextPage: false, total: 0 })

  // ===== TBA =====
  const tbaList = ref<SeasonalAnime[]>([])
  const tbaPageInfo = ref({ hasNextPage: false, total: 0 })

  // ===== Detail =====
  const currentDetail = ref<AnimeDetail | null>(null)
  const loadedDetailId = ref<number | null>(null)
  const detailLoading = ref(false)

  // ===== Computed: chart by format (matches anichart) =====
  const chartByFormat = computed(() => {
    const groups: Record<string, number[]> = {
      TV: [],
      TV_SHORT: [],
      MOVIE: [],
      'OVA / ONA / Special': [],
    }
    const leftovers = ['OVA', 'ONA', 'SPECIAL']
    seasonalMedia.value.forEach((m) => {
      let key = m.format
      if (leftovers.includes(m.format)) {
        key = 'OVA / ONA / Special'
      }
      if (!groups[key]) groups[key] = []
      groups[key].push(m.id)
    })
    return groups
  })

  // ===== Computed: filtered & sorted =====
  const filteredChart = computed(() => {
    const ids: number[] = []
    const f = filterText.value.toLowerCase()
    seasonalMedia.value.forEach((m) => {
      const title = getMediaTitle(m).toLowerCase()
      if (!f || title.includes(f)) ids.push(m.id)
    })
    return ids
  })

  const sortedChart = computed(() => {
    const ids = [...filteredChart.value]
    ids.sort((aId, bId) => {
      const a = entity('media', aId)
      const b = entity('media', bId)
      if (!a || !b) return 0
      const dir = sortDirection.value === 'desc' ? -1 : 1
      const aVal = sortValue(a, sortKey.value)
      const bVal = sortValue(b, sortKey.value)
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return dir
      if (bVal == null) return -dir
      return aVal > bVal ? dir : aVal < bVal ? -dir : 0
    })
    return ids
  })

  // ===== Entity cache (for quick lookup by ID) =====
  const entityCache = ref<Record<string, Record<number, any>>>({
    media: {},
    studio: {},
  })

  function entity(type: string, id: number): any {
    return entityCache.value[type]?.[id] || null
  }

  function cacheEntity(type: string, data: any) {
    if (!entityCache.value[type]) entityCache.value[type] = {}
    entityCache.value[type][data.id] = data
  }

  // ===== Actions =====
  async function fetchSeasonalChart(season?: string, year?: number, format?: string, page = 1) {
    const s = season || currentSeason.value
    const y = year || currentYear.value
    const f = format || currentFormat.value

    if (page === 1) {
      seasonalLoading.value = true
      chartLoaded.value = false
      currentSeason.value = s
      currentYear.value = y
      currentFormat.value = f
    }

    try {
      const data = await getSeasonalChart({ season: s, year: y, format: f, page })
      if (page === 1) {
        seasonalMedia.value = []
      }
      data.media.forEach((m) => cacheEntity('media', m))
      seasonalMedia.value = [...seasonalMedia.value, ...data.media]
      seasonalPageInfo.value = data.pageInfo
      chartLoaded.value = true
    } finally {
      seasonalLoading.value = false
    }
  }

  async function fetchAiringSchedule(start: number, end: number, page = 1) {
    airingLoading.value = true
    try {
      const data = await getAiringSchedule({ start, end, page })
      if (page === 1) airingList.value = []
      data.airingSchedules.forEach((s) => cacheEntity('media', s.media))
      airingList.value = [...airingList.value, ...data.airingSchedules]
      return data.pageInfo
    } finally {
      airingLoading.value = false
    }
  }

  async function fetchArchive(year?: number, page = 1) {
    const data = await getArchive({ year, page })
    data.media.forEach((m) => cacheEntity('media', m))
    if (page === 1) archiveList.value = []
    archiveList.value = [...archiveList.value, ...data.media]
    archivePageInfo.value = data.pageInfo
  }

  async function fetchTba(page = 1) {
    const data = await getTba(page)
    data.media.forEach((m) => cacheEntity('media', m))
    if (page === 1) tbaList.value = []
    tbaList.value = [...tbaList.value, ...data.media]
    tbaPageInfo.value = data.pageInfo
  }

  async function fetchDetail(id: number) {
    if (loadedDetailId.value === id && currentDetail.value) return
    detailLoading.value = true
    try {
      currentDetail.value = await getAnimeDetail(id)
      loadedDetailId.value = id
    } finally {
      detailLoading.value = false
    }
  }

  function setSort(key: string) {
    sortKey.value = key
    sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
  }

  // ===== Backward compat =====
  const loading = computed(() => detailLoading.value || seasonalLoading.value)
  const related = ref<any[]>([])

  async function fetchRelated(_type: string, _id: number) {
    // Stub — related anime not implemented in new API yet
    related.value = []
  }

  return {
    seasonalMedia, seasonalPageInfo, seasonalLoading, currentSeason, currentYear,
    currentFormat, filterText, sortKey, sortDirection, chartLoaded,
    chartByFormat, filteredChart, sortedChart,
    airingList, airingLoading,
    archiveList, archivePageInfo,
    tbaList, tbaPageInfo,
    currentDetail, loadedDetailId, detailLoading,
    entityCache, entity, cacheEntity,
    fetchSeasonalChart, fetchAiringSchedule, fetchArchive, fetchTba, fetchDetail,
    setSort,
    loading, related, fetchRelated,
  }
})

// ===== Helpers =====
export function getMediaTitle(m: SeasonalAnime): string {
  return m.title.romaji || m.title.english || m.title.nativeTitle || ''
}

export function getMediaUrl(m: SeasonalAnime): string {
  return m.siteUrl
}

export function getStudioNames(m: SeasonalAnime): string[] {
  return m.studios?.nodes?.map((n) => n.name) || []
}

// Sort value helpers
function sortValue(m: SeasonalAnime, key: string): number | string | null {
  switch (key) {
    case 'popularity':
      return m.popularity || 0
    case 'averageScore':
      return m.averageScore || 0
    case 'title':
      return getMediaTitle(m).toLowerCase()
    case 'nextAiring': {
      const now = Date.now() / 1000
      const next = m.airingSchedule?.nodes?.find((n) => n.airingAt > now)
      return next ? next.airingAt - now : Infinity
    }
    case 'startDate':
      return (m.startDate.year || 0) * 10000 + ((m.startDate.month || 0) * 100) + (m.startDate.day || 0)
    case 'endDate':
      return (m.endDate.year || 0) * 10000 + ((m.endDate.month || 0) * 100) + (m.endDate.day || 0)
    default:
      return null
  }
}

export function getSeasonLabel(s: string): string {
  if (s === 'FALL') return 'Autumn'
  return s.charAt(0) + s.slice(1).toLowerCase()
}

export function getSourceLabel(s: string | null): string {
  if (!s) return ''
  const map: Record<string, string> = {
    MANGA: 'Manga',
    LIGHT_NOVEL: 'Light Novel',
    ORIGINAL: 'Original',
    GAME: 'Game',
    NOVEL: 'Novel',
    OTHER: 'Other',
  }
  return map[s] || s
}

export function getStatusLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
