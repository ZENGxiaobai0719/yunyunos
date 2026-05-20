import client from './client'
import type { SeasonalChartResponse, AiringScheduleResponse, AnimeDetail, Episode } from '@/types'

const BASE = '/anime'
const VIDEO_BASE = '/video'

/** 季节榜单 */
export function getSeasonalChart(params: {
  season: string
  year: number
  format?: string
  page?: number
}): Promise<SeasonalChartResponse> {
  return client.get(`${BASE}/seasonal`, { params })
}

/** Airing 播出日程 */
export function getAiringSchedule(params: {
  start: number
  end: number
  page?: number
}): Promise<AiringScheduleResponse> {
  return client.get(`${BASE}/airing`, { params })
}

export interface SeasonStat {
  count: number
  coverImage: string | null
  title: string | null
}

/** 归档统计: year → season → {count, coverImage, title} */
export function getArchiveStats(): Promise<Record<number, Record<string, SeasonStat>>> {
  return client.get(`${BASE}/archive/stats`)
}

/** 归档 */
export function getArchive(params: {
  year?: number
  page?: number
}): Promise<SeasonalChartResponse> {
  return client.get(`${BASE}/archive`, { params })
}

/** TBA 未定档 */
export function getTba(page?: number): Promise<SeasonalChartResponse> {
  return client.get(`${BASE}/tba`, { params: { page } })
}

/** 番剧详情 */
export function getAnimeDetail(id: number): Promise<AnimeDetail> {
  return client.get(`${BASE}/${id}`)
}

/** 排行榜 (legacy) */
export function getRanking(params: { type?: string }): Promise<any> {
  return client.get('/api/ranking', { params })
}

/** 开始下载剧集 */
export function startEpisodeDownload(animeId: number, episodeNum: number): Promise<Episode> {
  return client.post(`${VIDEO_BASE}/${animeId}/${episodeNum}/start`)
}

/** 查询剧集下载状态 */
export function getEpisodeStatus(animeId: number, episodeNum: number): Promise<Episode> {
  return client.get(`${VIDEO_BASE}/${animeId}/${episodeNum}/status`)
}

/** 获取番剧所有剧集及下载状态 */
export function getEpisodeList(animeId: number): Promise<Episode[]> {
  return client.get(`${VIDEO_BASE}/${animeId}/episodes`)
}
