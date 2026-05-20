<template>
  <div class="page">
    <ChartHeader
      :year="currentYear"
      :active-season="''"
      :active-year="currentYear"
      :banner-images="[]"
      :active-banner-id="null"
      @select-season="onSelectSeason"
    />

    <div class="content">
      <div class="sections" :class="{ loaded: !store.airingLoading }">
        <section v-for="group in dayGroups" :key="group.key" class="day-section">
          <h2 class="day-heading">{{ group.label }}</h2>
          <div v-if="group.items.length > 0" class="card-list">
            <AnimeChartCard
              v-for="item in group.items"
              :key="item.media.id"
              :media="item.media"
            />
          </div>
          <div v-else class="empty-day">Nothing scheduled</div>
        </section>

        <!-- Loading -->
        <div v-if="store.airingLoading && allItems.length === 0" class="card-list">
          <LoadingCard v-for="n in 6" :key="'skel-'+n" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'
import ChartHeader from '@/components/chart/ChartHeader.vue'
import AnimeChartCard from '@/components/chart/AnimeChartCard.vue'
import LoadingCard from '@/components/chart/LoadingCard.vue'

const router = useRouter()
const store = useAnimeStore()

const currentYear = computed(() => new Date().getFullYear())

const weekDays = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

// All items
const allItems = computed(() => store.airingList)

// Group by weekday
const weekDaySections = computed(() => {
  const groups: Record<string, typeof store.airingList> = {}
  weekDays.forEach((d) => (groups[d.key] = []))

  allItems.value.forEach((item) => {
    const day = new Date(item.airingAt * 1000).getDay()
    const key = weekDays[day === 0 ? 6 : day - 1].key
    groups[key].push(item)
  })

  return groups
})

const dayGroups = computed(() =>
  weekDays.map((d) => ({
    ...d,
    items: weekDaySections.value[d.key] || [],
  }))
)

// Get start/end of current week
function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return {
    start: Math.floor(monday.getTime() / 1000),
    end: Math.floor(sunday.getTime() / 1000),
  }
}

function onSelectSeason(season: string, year: number) {
  router.push(`/${season}-${year}`)
}

onMounted(async () => {
  const { start, end } = getWeekRange()
  await store.fetchAiringSchedule(start, end)
})
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

.day-section {
  margin-bottom: 30px;
}

.day-heading {
  color: rgb(var(--color-text, 92,114,138));
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 16px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(3, 492px);
  gap: 20px;
  justify-content: center;
}

.empty-day {
  color: rgb(var(--color-text-light, 110,133,158));
  font-size: 1.3rem;
  padding: 12px 0;
}

@media (max-width: 1560px) {
  .card-list { grid-template-columns: repeat(2, 492px); }
}
@media (max-width: 1050px) {
  .content { padding: 0 12px 60px; }
  .card-list { grid-template-columns: 1fr; }
}
</style>
