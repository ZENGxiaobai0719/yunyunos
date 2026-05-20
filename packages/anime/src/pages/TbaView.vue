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
      <div class="sections" :class="{ loaded: !loading }">
        <h2 class="page-heading">To Be Announced</h2>
        <p class="page-subtitle">Anime that have not yet received an air date.</p>

        <div v-if="allItems.length > 0" class="card-list">
          <AnimeChartCard
            v-for="item in allItems"
            :key="item.id"
            :media="item"
          />
        </div>
        <div v-else-if="loading" class="card-list">
          <LoadingCard v-for="n in 6" :key="'skel-'+n" />
        </div>
        <div v-else class="empty">No TBA anime</div>
      </div>

      <div v-if="store.tbaPageInfo.hasNextPage" class="load-more">
        <button class="load-more-btn" :disabled="loading" @click="loadMore">
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'
import ChartHeader from '@/components/chart/ChartHeader.vue'
import AnimeChartCard from '@/components/chart/AnimeChartCard.vue'
import LoadingCard from '@/components/chart/LoadingCard.vue'

const router = useRouter()
const store = useAnimeStore()

const loading = ref(false)
const currentPage = ref(1)
const currentYear = computed(() => new Date().getFullYear())

const allItems = computed(() => store.tbaList)

function onSelectSeason(season: string, year: number) {
  router.push(`/${season}-${year}`)
}

async function fetchData(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    await store.fetchTba(page)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  fetchData(currentPage.value + 1)
}

onMounted(() => fetchData(1))
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
.sections.loaded { opacity: 1; transform: translateY(0); }

.page-heading {
  color: rgb(var(--color-text, 92,114,138));
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}
.page-subtitle {
  color: rgb(var(--color-text-light, 110,133,158));
  font-size: 1.3rem;
  margin: 8px 0 24px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(3, 492px);
  gap: 20px;
  justify-content: center;
}

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
  font-size: 1.3rem;
  font-weight: 600;
  padding: 10px 40px;
  transition: all 0.2s;
}
.load-more-btn:hover { box-shadow: 0 4px 12px rgba(49,54,68,.15); }
.load-more-btn:disabled { opacity: 0.5; cursor: default; }

.empty {
  color: rgb(var(--color-text-light, 110,133,158));
  font-size: 1.4rem;
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 1560px) {
  .card-list { grid-template-columns: repeat(2, 492px); }
}
@media (max-width: 1050px) {
  .content { padding: 0 12px 60px; }
  .card-list { grid-template-columns: 1fr; }
}
</style>
