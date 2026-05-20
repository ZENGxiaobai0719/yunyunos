// ===== 分页信息 =====
export interface PageInfo {
  hasNextPage: boolean
  total: number
}

// ===== 标题 =====
export interface MediaTitle {
  romaji: string | null
  nativeTitle: string | null
  english: string | null
}

// ===== 日期 =====
export interface FuzzyDate {
  year: number | null
  month: number | null
  day: number | null
}

// ===== 外链 =====
export interface ExternalLink {
  site: string
  icon: string | null
  color: string | null
  url: string
}

// ===== 排名 =====
export interface Ranking {
  rank: number
  type: 'RATED' | 'POPULAR'
  season: string | null
  allTime: boolean
}

// ===== 工作室 =====
export interface Studio {
  id: number
  name: string
  siteUrl: string
}

// ===== 播出节点 =====
export interface AiringNode {
  episode: number
  airingAt: number
}

// ===== 关联作品 =====
export interface Relation {
  relationType: string
  node: {
    id: number
    title: MediaTitle
    siteUrl: string
  }
}

// ===== 预告片 =====
export interface Trailer {
  id: string
  site: string
  thumbnail: string
}

// ===== 季节榜单动漫 (AniList media) =====
export interface SeasonalAnime {
  id: number
  idMal: number | null
  title: MediaTitle
  startDate: FuzzyDate
  endDate: FuzzyDate
  status: string // 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED' | 'CANCELLED'
  season: string // 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'
  format: string // 'TV' | 'TV_SHORT' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'MUSIC'
  genres: string[]
  synonyms: string[]
  duration: number | null
  popularity: number
  episodes: number | null
  source: string | null // 'MANGA' | 'LIGHT_NOVEL' | 'ORIGINAL' | 'GAME' | 'NOVEL' | 'OTHER'
  countryOfOrigin: string
  hashtag: string | null
  averageScore: number | null
  siteUrl: string
  description: string | null
  bannerImage: string | null
  isAdult: boolean
  coverImage: {
    extraLarge: string
    color: string | null
  }
  trailer: Trailer | null
  externalLinks: ExternalLink[]
  rankings: Ranking[]
  studios: {
    nodes: Studio[]
  }
  relations: {
    edges: Relation[]
  }
  airingSchedule: {
    nodes: AiringNode[]
  }
}

// ===== 后端 API 返回的季节榜单 =====
export interface SeasonalChartResponse {
  pageInfo: PageInfo
  media: SeasonalAnime[]
}

// ===== Airing 日程 =====
export interface AiringScheduleItem {
  id: number
  episode: number
  airingAt: number
  media: SeasonalAnime
}

export interface AiringScheduleResponse {
  pageInfo: PageInfo
  airingSchedules: AiringScheduleItem[]
}

// ===== 详情 (匹配后端 AniMediaRespDTO) =====
export interface AnimeDetail {
  id: number
  idMal: number | null
  title: MediaTitle
  startDate: FuzzyDate | null
  endDate: FuzzyDate | null
  status: string | null
  season: string | null
  format: string | null
  episodes: number | null
  duration: number | null
  genres: string[] | null
  synonyms: string[] | null
  source: string | null
  countryOfOrigin: string | null
  hashtag: string | null
  popularity: number | null
  averageScore: number | null
  siteUrl: string | null
  description: string | null
  bannerImage: string | null
  isAdult: boolean | null
  coverImage: {
    extraLarge: string
    color: string | null
  } | null
  trailer: Trailer | null
  externalLinks: ExternalLink[] | null
  rankings: Ranking[] | null
  studios: {
    nodes: Array<{ name: string; siteUrl: string }>
  } | null
  relations: {
    edges: Relation[]
  } | null
  airingSchedule: {
    nodes: AiringNode[]
  } | null
  episodeList: Episode[] | null
}

export interface Episode {
  number: number
  title: string | null
  url: string | null
  downloadStatus: string | null
  progress: number | null
  streamUrl: string | null
}

// ===== Legacy types (backward compat for Detail/Play/Desktop) =====
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  total: number
  list: T[]
  page: number
  pageSize: number
}

export interface SearchResult {
  id: number
  title: string
  coverUrl: string | null
  type: string | null
  year: number | null
  season: string | null
}

export interface AnimeItem {
  id: number
  title: string
  altTitle: string | null
  coverUrl: string | null
  type: string | null
  status: string
  episodeCount: number | null
  latestEpisode: string | null
  year: number | null
  season: string | null
  rating: number | null
}

export interface CarouselItem {
  id: number
  title: string
  bannerUrl: string | null
  description: string | null
  rating: number | null
}

export interface RankingItem {
  id: number
  title: string
  coverUrl: string | null
  rating: number | null
  views: number
}

export interface WatchRecord {
  animeId: number
  animeTitle: string
  type: string
  episodeNum: number
  coverUrl: string | null
  watchedAt: string
}

export interface AnimeQuery {
  type?: string
  year?: number
  season?: string
  status?: string
  sort?: string
  page?: number
  pageSize?: number
}
