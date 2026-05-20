<template>
  <div class="page">
    <ChartHeader
      :year="new Date().getFullYear()"
      :active-season="''"
      :active-year="0"
      :banner-images="[]"
      :active-banner-id="null"
      @select-season="() => {}"
    />

    <div class="archive-content">
      <div v-if="loading" class="flex justify-center py-20">
        <p class="loading-text">Loading...</p>
      </div>

      <template v-else>
        <section v-for="[year, seasons] in sortedStats" :key="year" class="year-section">
          <h2 class="year-heading">{{ year }}</h2>
          <div class="season-grid">
            <router-link
              v-for="sn in seasonOrder"
              :key="sn"
              :to="`/${sn}-${year}`"
              class="season-card"
            >
              <div class="card-cover">
                <img
                  v-if="getCover(seasons, sn)"
                  :src="getCover(seasons, sn)!"
                  :alt="sn"
                  class="cover-img"
                />
                <span v-else class="season-emoji">{{ seasonEmoji(sn) }}</span>
              </div>
              <div class="card-body">
                <div class="season-name">{{ seasonLabel(sn) }}</div>
                <div class="season-count">{{ getCount(seasons, sn) }} Anime</div>
              </div>
            </router-link>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ChartHeader from '@/components/chart/ChartHeader.vue'
import { getArchiveStats, type SeasonStat } from '@/api/anime'

const loading = ref(true)
const stats = ref<Record<number, Record<string, SeasonStat>>>({})

const seasonOrder = ['WINTER', 'SPRING', 'SUMMER', 'FALL']

const sortedStats = computed(() => {
  return Object.entries(stats.value)
    .map(([y, s]) => [Number(y), s] as [number, Record<string, SeasonStat>])
    .sort((a, b) => b[0] - a[0])
})

function getCount(seasons: Record<string, SeasonStat> | undefined, season: string): number {
  return seasons?.[season]?.count || 0
}

function getCover(seasons: Record<string, SeasonStat> | undefined, season: string): string | null {
  const s = seasons?.[season]
  if (s?.coverImage) return s.coverImage

  const idx = seasonOrder.indexOf(season)
  for (let offset = 1; offset <= 3; offset++) {
    for (const delta of [offset, -offset]) {
      const adjIdx = idx + delta
      if (adjIdx < 0 || adjIdx >= 4) continue
      const adjSeason = seasonOrder[adjIdx]
      const adjCover = seasons?.[adjSeason]?.coverImage
      if (adjCover) return adjCover
    }
  }
  return null
}

function seasonLabel(s: string): string {
  const m: Record<string, string> = { WINTER: 'Winter', SPRING: 'Spring', SUMMER: 'Summer', FALL: 'Fall' }
  return m[s] || s
}

function seasonEmoji(s: string): string {
  const m: Record<string, string> = { WINTER: '❄️', SPRING: '🌸', SUMMER: '☀️', FALL: '🍂' }
  return m[s] || '📺'
}

onMounted(async () => {
  try {
    stats.value = await getArchiveStats()
  } catch {
    stats.value = {}
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page {
  background: rgb(var(--color-background, 243,246,249));
  min-height: 100vh;
}
.archive-content {
  max-width: 1024px;
  margin: 0 auto;
  padding: 24px;
}

.year-section {
  margin-bottom: 40px;
}
.year-heading {
  font-size: 26px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 16px;
  padding-left: 2px;
}

.season-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.season-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(15,23,42,0.06);
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}
.season-card:hover {
  box-shadow: 0 8px 24px rgba(15,23,42,0.12);
  transform: translateY(-2px);
}

.card-cover {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.season-emoji {
  font-size: 48px;
}

.card-body {
  padding: 14px 16px 16px;
}

.season-name {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}
.season-count {
  font-size: 13px;
  color: #64748b;
}
.loading-text {
  color: #94a3b8;
}
</style>
