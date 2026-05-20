<template>
  <nav class="chart-nav">
    <div class="nav-row">
      <!-- Left spacer -->
      <div class="nav-left" />

      <!-- Season tabs (centered) -->
      <div class="seasons">
        <RouterLink
          v-for="s in seasonTabs"
          :key="s.key"
          :to="`/${s.key}-${year}`"
          class="season-tab"
          :class="{ active: activeSeason === s.key && activeYear === year }"
          @click="$emit('selectSeason', s.key, year)"
        >
          <span class="season-name">{{ s.label }}</span>
          <span class="season-year">{{ year }}</span>
        </RouterLink>
      </div>

      <!-- Action links -->
      <div class="actions">
        <RouterLink to="/airing" class="action-link" :class="{ active: route.name === 'airing' }">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Airing</span>
        </RouterLink>
        <RouterLink to="/archive" class="action-link" :class="{ active: route.name === 'archive' }">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
          </svg>
          <span>Archive</span>
        </RouterLink>
        <RouterLink to="/tba" class="action-link" :class="{ active: route.name === 'tba' }">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>TBA</span>
        </RouterLink>
      </div>
    </div>

    <!-- Banner background images -->
    <div class="nav-banners">
      <div
        v-for="banner in bannerImages"
        :key="banner.id"
        class="nav-banner-img"
        :class="{ active: banner.id === activeBannerId }"
        :style="{ backgroundImage: `url(${banner.url})` }"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  year: number
  activeSeason: string
  activeYear: number
  bannerImages: { id: number; url: string }[]
  activeBannerId: number | null
}>()

defineEmits<{
  selectSeason: [season: string, year: number]
}>()

const route = useRoute()

const seasonTabs = computed(() => {
  const all = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  return all.map((s) => ({
    key: s,
    label: s === 'FALL' ? 'Autumn' : s.charAt(0) + s.slice(1).toLowerCase(),
  }))
})
</script>

<style scoped>
.chart-nav {
  background: #2b2d42;
  color: #fff;
  height: 80px;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.nav-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  padding: 0 40px;
  position: relative;
  z-index: 30;
}

.nav-left {
  /* left column spacer */
}

.seasons {
  display: flex;
  gap: 0;
  justify-self: center;
}

.actions {
  justify-self: end;
}

.season-tab {
  color: rgb(var(--color-nav-link, 188,190,220));
  text-align: center;
  padding: 8px 16px;
  text-decoration: none;
  transition: color 0.3s;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.season-tab.active {
  color: #fff;
}
.season-tab.active .season-year {
  color: #a2a6cd;
}
.season-tab:hover {
  color: rgb(var(--color-nav-link-hover, 211,213,243));
}

.season-name {
  font-size: 1.6rem;
  font-weight: 600;
}
.season-year {
  color: #8b8fb6;
  font-size: 0.9rem;
  font-weight: 400;
}

.actions {
  display: flex;
  gap: 20px;
}

.action-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: rgb(var(--color-nav-link, 188,190,220));
  font-size: 1rem;
  gap: 3px;
  transition: color 0.3s;
}
.action-link.active,
.action-link.active svg {
  color: #fff;
}
.action-link:hover {
  color: rgb(var(--color-nav-link-hover, 211,213,243));
}

/* Banner images */
.nav-banners {
  position: absolute;
  inset: 0;
  z-index: 10;
}
.nav-banner-img {
  backface-visibility: hidden;
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  filter: grayscale(100%);
  height: 100%;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  transition: opacity 0.5s ease-in-out;
  width: 100%;
}
.nav-banner-img.active {
  opacity: 0.1;
}

@media (max-width: 900px) {
  .nav-row {
    padding: 0 16px;
  }
  .season-tab {
    padding: 8px 10px;
  }
  .season-name {
    font-size: 1.2rem;
  }
  .actions {
    gap: 12px;
  }
}
</style>
