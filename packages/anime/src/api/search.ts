import client from './client'
import type { PageResult, SearchResult } from '@/types'

/** 搜索（分页） → GET /api/search */
export function search(q: string, page = 1, pageSize = 20): Promise<PageResult<SearchResult>> {
  return client.get('/search', { params: { q, page, pageSize } })
}

/** 热门搜索词 → GET /api/search/hot */
export function getHotKeywords(): Promise<string[]> {
  return client.get('/search/hot')
}

/** 清空搜索历史 → DELETE /api/search/history */
export function clearHistory(): Promise<null> {
  return client.delete('/search/history')
}