<template>
  <div
    v-if="!media.isAdult"
    class="media-card"
    :style="cardColors"
  >
    <!-- Left: Cover Image -->
    <RouterLink :to="`/detail/${media.id}`" class="cover">
      <div class="background-color" />
      <img
        :src="media.coverImage.extraLarge"
        :alt="getMediaTitle(media)"
        class="media-image"
        :class="{ loaded: imageLoaded }"
        @load="imageLoaded = true"
      />
      <div class="overlay">
        <span class="overlay-title">{{ getMediaTitle(media) }}</span>
        <div v-if="firstStudio" class="overlay-studio">
          <a
            :href="firstStudio.siteUrl"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >{{ firstStudio.name }}</a>
        </div>
      </div>
    </RouterLink>

    <!-- Right: Data -->
    <div class="data">
      <!-- Top Section: Info + Stats (hover slides to external links) -->
      <div class="top-section">
        <div class="top-slider">
          <div class="info-panel">
            <div class="info-text">
              <div class="episode">
                {{ episodeString }}
              </div>
              <div v-if="airingCountdown" class="countdown">
                {{ airingCountdown }}
              </div>
              <div v-if="relationText" class="source relation">
                {{ relationText }}
              </div>
              <div v-else-if="sourceText" class="source">
                {{ sourceText }}
              </div>
            </div>
            <div class="info-stats">
              <div v-if="media.averageScore" class="stat-item">
                <svg version="1.1" viewBox="0 0 512 512" class="svg-icon svg-fill" style="width:18px">
                  <path :fill="scoreColor" stroke="none" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm4 72.6c-20.8 25-51.5 39.4-84 39.4s-63.2-14.3-84-39.4c-8.5-10.2-23.7-11.5-33.8-3.1-10.2 8.5-11.5 23.6-3.1 33.8 30 36 74.1 56.6 120.9 56.6s90.9-20.6 120.9-56.6c8.5-10.2 7.1-25.3-3.1-33.8-10.1-8.4-25.3-7.1-33.8 3.1z"/>
                </svg>
                <span class="stat">{{ media.averageScore }}%</span>
              </div>
              <div v-if="popularityRank" class="stat-item">
                <svg version="1.1" viewBox="0 0 18 18" class="svg-icon" style="width:18px">
                  <path stroke="rgb(var(--color-red))" fill="none" d="M15.63 3.458a4.125 4.125 0 0 0-5.835 0L9 4.253l-.795-.795A4.126 4.126 0 1 0 2.37 9.293l.795.795L9 15.922l5.835-5.835.795-.795a4.125 4.125 0 0 0 0-5.835v0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="stat">#{{ popularityRank.rank }}</span>
              </div>
            </div>
          </div>
          <div class="ext-panel">
            <a
              v-if="hashtag"
              :href="hashtagUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="hashtag"
            >
              <svg version="1.1" viewBox="0 0 15 15" class="icon svg-icon" style="width:16px">
                <path d="M2.5 5.625h10M2.5 9.375h10M6.25 1.875L5 13.125M10 1.875l-1.25 11.25" stroke="#76868E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ hashtag }}</span>
            </a>
            <div v-if="externalLinks.length" class="ext-links">
              <a
                v-for="link in externalLinks"
                :key="link.url"
                :href="link.url"
                :alt="link.site"
                target="_blank"
                rel="noopener noreferrer"
                class="ext-link"
                :style="{ '--link-color': (link.color || '#515381') + 'e0' }"
              >
                <div class="icon-wrap" :style="{ background: link.color || '#515381' }">
                  <img v-if="link.icon" :src="link.icon" class="icon" alt="" />
                  <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </div>
              </a>
            </div>
            <div
              v-if="media.trailer"
              class="trailer-btn"
              :style="{ backgroundImage: `url(${media.trailer.thumbnail})` }"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Description (scrollable on hover) -->
      <div v-if="media.description" class="desc-section">
        <p class="description">{{ stripHtml(media.description) }}</p>
      </div>
    </div>

    <!-- Footer: Genres + Highlighter -->
    <div class="footer">
      <div class="genres">
        <span
          v-for="genre in media.genres"
          :key="genre"
          class="genre-tag"
        >{{ genre }}</span>
      </div>
      <div class="highlighter" :class="{ active: highlight }" @click="toggleHighlight">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" :stroke="highlight ? '#fff' : 'currentColor'" stroke-width="2">
          <circle cx="12" cy="12" r="10" :fill="highlight ? 'rgb(var(--color-green))' : 'none'" />
          <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SeasonalAnime } from '@/types'
import { getMediaTitle } from '@/stores/anime'

const props = defineProps<{
  media: SeasonalAnime
}>()

const imageLoaded = ref(false)
const highlight = ref(false)

// ===== Colors =====
const cardColors = computed(() => {
  const color = props.media.coverImage.color || '#a2c8f2'
  return {
    '--media-color': color,
    '--media-color-text': adjustBrightness(color, -40),
    '--media-overlay-text-color': adjustBrightness(color, -20),
  } as Record<string, string>
})

function adjustBrightness(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, v + amount))
  return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`
}

// ===== Episode / Airing =====
const nextEpisode = computed(() => {
  const now = Date.now() / 1000
  return props.media.airingSchedule?.nodes?.find((n) => n.airingAt > now)
})

const episodeString = computed(() => {
  const next = nextEpisode.value
  if (next) {
    let s = `Ep ${next.episode}`
    if (props.media.episodes) s += ` of ${props.media.episodes}`
    return s + ' airing in'
  }
  const sd = props.media.startDate
  if (sd.year) {
    const isPast = new Date().getFullYear() > (sd.year || 0)
    const prefix = isPast && props.media.status !== 'RELEASING' ? 'Aired in' : 'Airing in'
    if (props.media.episodes) return `${props.media.episodes} Episodes · ${prefix}`
    return prefix
  }
  return 'TBA'
})

const airingCountdown = computed(() => {
  const next = nextEpisode.value
  if (!next) return null
  const diff = next.airingAt - Date.now() / 1000
  if (diff > 30 * 24 * 3600) return null
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const mins = Math.floor((diff % 3600) / 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
  if (mins > 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`)
  return parts.join(', ')
})

// ===== Stats =====
const popularityRank = computed(() =>
  props.media.rankings?.find((r) => r.type === 'POPULAR' && !r.allTime && r.season) || null
)

const scoreColor = computed(() => {
  const s = props.media.averageScore || 0
  if (s > 74) return 'rgb(var(--color-green))'
  if (s > 60) return 'rgb(var(--color-yellow))'
  return 'rgb(var(--color-red))'
})

const relationText = computed(() => {
  const prequel = props.media.relations?.edges?.find((e) => e.relationType === 'PREQUEL')
  if (prequel) {
    const title = prequel.node.title.romaji || prequel.node.title.english || ''
    return `Sequel to ${title}`
  }
  const sequel = props.media.relations?.edges?.find((e) => e.relationType === 'SEQUEL')
  if (sequel) {
    const title = sequel.node.title.romaji || sequel.node.title.english || ''
    return `Prequel to ${title}`
  }
  return null
})

const sourceText = computed(() => {
  const s = props.media.source
  if (!s) return null
  const map: Record<string, string> = {
    MANGA: 'Manga',
    LIGHT_NOVEL: 'Light Novel',
    ORIGINAL: 'Original',
    GAME: 'Game',
    NOVEL: 'Novel',
    OTHER: 'Other',
  }
  return `Source • ${map[s] || s}`
})

const firstStudio = computed(() => {
  const nodes = props.media.studios?.nodes
  if (!nodes || nodes.length === 0) return null
  return { name: nodes[0].name, siteUrl: nodes[0].siteUrl }
})

// ===== Hashtag & External Links =====
const hashtag = computed(() => {
  const h = props.media.hashtag
  if (!h) return null
  return h.replace(/#/g, '').split(' ')[0]
})

const hashtagUrl = computed(() => {
  const h = props.media.hashtag
  if (!h) return '#'
  return `https://twitter.com/search?q=${encodeURIComponent(h).replace(/%20/g, '+OR ')}`
})

const externalLinks = computed(() => {
  const links = props.media.externalLinks || []
  return links.length > 5
    ? links.filter((l) => l.site !== 'Official Site').slice(0, 5)
    : links
})

function toggleHighlight() {
  highlight.value = !highlight.value
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#?[a-z0-9]+;/gi, '')
}
</script>

<style scoped>
/* ===== Media Card ===== */
.media-card {
  backface-visibility: hidden;
  background: rgb(var(--color-foreground, 250,252,252));
  border-radius: 3px;
  box-shadow: 0 4px 6px rgba(49,54,68,.05), 0 5px 20px rgba(49,54,68,.08);
  display: grid;
  grid-template-columns: 185px 1fr;
  grid-template-rows: 1fr 44px;
  height: 265px;
  overflow: hidden;
  position: relative;
  text-align: left;
  transition: box-shadow 0.6s ease;
  width: 100%;
}
.media-card:hover {
  box-shadow: 0 4px 6px rgba(49,54,68,.09), 0 10px 40px rgba(49,54,68,.3);
  z-index: 50;
}

/* ===== Cover ===== */
.cover {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  z-index: 10;
  text-decoration: none;
  grid-row: 1 / 3;
}
.background-color {
  background-color: var(--media-color);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
}
.media-image {
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 0.3s;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
}
.media-image.loaded { opacity: 1; }

.overlay {
  background: rgba(41,41,41,.9);
  color: rgb(var(--color-text-bright, 237,241,245));
  font-size: 1.4rem;
  padding: 12px;
  position: relative;
  width: 100%;
  font-weight: 600;
}
.overlay::before {
  background: var(--media-color);
  content: '';
  height: 100%;
  left: 0;
  opacity: 0.05;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 3;
}
.overlay-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  z-index: 10;
  display: inline;
}
.overlay-studio {
  color: var(--media-overlay-text-color);
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
  position: relative;
  z-index: 10;
}
.overlay-studio a { color: inherit; text-decoration: none; }
.overlay-studio a:hover { text-decoration: underline; }

/* ===== Data Area ===== */
.data {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

/* ===== Top Section (Info + Stats, slides to External Links) ===== */
.top-section {
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}
.top-slider {
  display: flex;
  width: 200%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.top-section:hover .top-slider {
  transform: translateX(-50%);
}

/* Info Panel */
.info-panel {
  width: 50%;
  flex-shrink: 0;
  display: flex;
  padding: 14px 17px 10px;
}
.info-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.info-stats {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-left: 8px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.stat {
  color: rgb(var(--color-text-light, 110,133,158));
  font-size: 1.3rem;
  font-weight: 700;
}

.episode {
  color: rgb(var(--color-text-light, 110,133,158));
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.countdown {
  font-size: 18px;
  font-weight: 600;
  padding-top: 3px;
  color: rgb(var(--color-text, 92,114,138));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.source {
  display: inline-block;
  font-size: 11px;
  overflow: hidden;
  padding-top: 3px;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  color: rgb(var(--color-text-light, 110,133,158));
}
.source.relation {
  color: rgb(var(--color-red, 232,93,117));
}

/* External Links Panel */
.ext-panel {
  width: 50%;
  flex-shrink: 0;
  padding: 14px 17px 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.hashtag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  font-size: 12px;
  color: rgb(var(--color-text-light, 110,133,158));
  text-decoration: none;
  white-space: nowrap;
}
.hashtag:hover { color: rgb(var(--color-blue, 61,180,242)); }

.ext-links {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.ext-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  border-radius: 3px;
  text-decoration: none;
  transition: opacity 0.2s;
}
.ext-link:hover { opacity: 0.8; }
.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 3px;
}
.icon-wrap img {
  width: 14px;
  height: 14px;
}

.trailer-btn {
  align-items: center;
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  height: 42px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 75px;
}
.trailer-btn::before {
  background: rgba(41,41,41,.5);
  content: '';
  height: 100%;
  position: absolute;
  width: 100%;
}
.trailer-btn svg {
  position: relative;
  z-index: 1;
}

/* ===== Bottom Section: Description ===== */
.desc-section {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0 17px 10px;
  transition: overflow 0s 0.3s;
}
.desc-section:hover {
  overflow-y: auto;
  transition: overflow 0s 0s;
}
.description {
  color: rgb(var(--color-text, 92,114,138));
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  max-height: 4.2em;
}
.desc-section:hover .description {
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  max-height: none;
  overflow: visible;
}

/* ===== Footer ===== */
.footer {
  background: rgb(var(--color-foreground-blue, 239,247,251));
  display: flex;
  align-items: center;
  padding: 0 17px;
  padding-right: 14px;
  z-index: 5;
  grid-column: 1 / 3;
}

/* ===== Genres ===== */
.genres {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  height: 20px;
  flex: 1;
  gap: 8px;
}
.genre-tag {
  background: var(--media-color);
  border-radius: 10px;
  color: var(--media-color-text);
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
  height: 20px;
  line-height: 20px;
  padding: 0 12px;
  text-transform: lowercase;
  white-space: nowrap;
}

/* ===== Highlighter ===== */
.highlighter {
  cursor: pointer;
  margin-left: auto;
  transition: transform 0.2s;
  color: rgb(var(--color-text-light, 110,133,158));
}
.highlighter:hover { transform: scale(1.1); }
.highlighter.active svg circle { stroke: rgb(var(--color-green)); }
</style>
