<template>
  <div class="page">
    <ChartHeader
      :year="activeYear"
      :active-season="activeSeason"
      :active-year="activeYear"
      :banner-images="bannerImages"
      :active-banner-id="activeBannerId"
      @select-season="onSelectSeason"
    />

    <div class="content">
      <div class="sections" :class="{ loaded: store.chartLoaded }">
        <section
          v-for="group in formatSections"
          :key="group.key"
          class="format-section"
        >
          <div class="section-heading">
            <h2 class="section-title">
              {{ group.label }}
            </h2>
            <div class="filters">
              <!-- Share -->
              <span class="filter-btn" title="Share">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span>Share</span>
              </span>
              <!-- Search -->
              <span class="filter-btn" :class="{ open: searchOpen }" @click="searchOpen = !searchOpen" title="Search">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>Search</span>
                <input
                  v-if="searchOpen"
                  v-model="store.filterText"
                  class="search-input"
                  placeholder="Search..."
                  @blur="onSearchBlur"
                />
              </span>
              <!-- Sort -->
              <span class="filter-btn" title="Sort" @click="cycleSort">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <span>Sort</span>
              </span>
            </div>
          </div>

          <!-- Card Grid -->
          <div class="card-list" v-if="group.ids.length > 0">
            <AnimeChartCard
              v-for="id in group.ids"
              :key="id"
              :media="store.entity('media', id)"
            />
          </div>
          <div v-else-if="store.seasonalLoading" class="card-list">
            <LoadingCard v-for="n in 6" :key="'skel-'+n" />
          </div>
          <div v-else class="empty-section">No data available</div>

          <!-- Load more -->
          <div v-if="group.ids.length > 0 && store.seasonalPageInfo.hasNextPage" class="load-more">
            <button
              class="load-more-btn"
              :disabled="store.seasonalLoading"
              @click="loadMore"
            >
              {{ store.seasonalLoading ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'
import ChartHeader from '@/components/chart/ChartHeader.vue'
import AnimeChartCard from '@/components/chart/AnimeChartCard.vue'
import LoadingCard from '@/components/chart/LoadingCard.vue'

const props = defineProps<{
  season?: string
  year?: string
}>()

const router = useRouter()
const store = useAnimeStore()

const searchOpen = ref(false)
const currentPage = ref(1)

const activeSeason = computed(() => props.season || store.currentSeason)
const activeYear = computed(() => Number(props.year) || store.currentYear)

const formatSections = computed(() => {
  const groups = store.chartByFormat
  const order = [
    { key: 'TV', label: 'TV' },
    { key: 'TV_SHORT', label: 'TV Short' },
    { key: 'MOVIE', label: 'Movie' },
    { key: 'OVA / ONA / Special', label: 'OVA / ONA / Special' },
  ]
  return order
    .filter((o) => groups[o.key] && groups[o.key].length > 0)
    .map((o) => ({ ...o, ids: groups[o.key] }))
})

const bannerImages = computed(() =>
  store.seasonalMedia
    .filter((m) => m.format === 'TV' && m.bannerImage)
    .slice(0, 6)
    .map((m, i) => ({ id: i + 1, url: m.bannerImage! }))
)
const activeBannerId = computed(() => (bannerImages.value.length > 0 ? 1 : null))

const sortOptions = [
  { key: 'popularity', label: 'Popularity' },
  { key: 'averageScore', label: 'Score' },
  { key: 'title', label: 'Title' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
]
const sortIndex = ref(0)

function onSearchBlur() {
  if (!store.filterText) searchOpen.value = false
}

function cycleSort() {
  sortIndex.value = (sortIndex.value + 1) % sortOptions.length
  const opt = sortOptions[sortIndex.value]
  store.sortKey = opt.key
  store.sortDirection = store.sortDirection === 'desc' ? 'asc' : 'desc'
}

async function fetchData(page = 1) {
  currentPage.value = page
  await store.fetchSeasonalChart(activeSeason.value, activeYear.value, undefined, page)
}

function onSelectSeason(season: string, year: number) {
  if (season === activeSeason.value && year === activeYear.value) return
  router.push(`/${season}-${year}`)
}

function loadMore() {
  fetchData(currentPage.value + 1)
}

watch(
  () => [props.season, props.year],
  () => { fetchData(1) },
)

onMounted(() => { fetchData(1) })
</script>

<style scoped>
.page {
  background: rgb(var(--color-background, 237,241,245));
  min-height: 100vh;
}

.content {
  margin: 0 auto;
  max-width: 1560px;
  padding: 0 20px 80px;
  position: relative;
  z-index: 20;
  margin-top: 20px;
}

.sections {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.sections.loaded {
  opacity: 1;
  transform: translateY(0);
}

.format-section {
  margin-bottom: 30px;
}

/* ===== Section Heading ===== */
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 2px;
}
.section-title {
  color: rgb(var(--color-text, 92,114,138));
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.filters {
  display: flex;
  align-items: center;
  gap: 0;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgb(var(--color-text-light, 110,133,158));
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 400;
  transition: color 0.2s;
  user-select: none;
}
.filter-btn:hover {
  color: rgb(var(--color-text, 92,114,138));
}
.filter-btn svg {
  flex-shrink: 0;
}

.search-input {
  background: rgb(var(--color-foreground, 250,252,252));
  border: none;
  border-radius: 3px;
  color: rgb(var(--color-text, 92,114,138));
  font-size: 14px;
  font-weight: 400;
  margin-left: 4px;
  outline: none;
  padding: 4px 8px;
  width: 160px;
  box-shadow: 0 2px 8px rgba(49,54,68,.12);
}
.search-input::placeholder {
  color: rgb(var(--color-text-light, 110,133,158));
}

/* ===== Card Grid ===== */
.card-list {
  display: grid;
  grid-template-columns: repeat(3, 492px);
  gap: 20px;
  justify-content: center;
}

/* ===== Load More ===== */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.load-more-btn {
  background: rgb(var(--color-foreground, 250,252,252));
  border: none;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(49,54,68,.08);
  color: rgb(var(--color-blue, 61,180,242));
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 40px;
  transition: all 0.2s;
}
.load-more-btn:hover { box-shadow: 0 4px 12px rgba(49,54,68,.15); }
.load-more-btn:disabled { opacity: 0.5; cursor: default; }

.empty-section {
  color: rgb(var(--color-text-light, 110,133,158));
  font-size: 16px;
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 1560px) {
  .card-list { grid-template-columns: repeat(2, 492px); }
}
@media (max-width: 1050px) {
  .content { padding: 0 12px 60px; }
  .card-list { grid-template-columns: 1fr; }
  .section-heading { flex-wrap: wrap; gap: 8px; }
}
</style>
