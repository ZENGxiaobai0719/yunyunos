import { defineStore } from 'pinia'
import { ref } from 'vue'
import { search, getHotKeywords } from '@/api/search'
import type { SearchResult } from '@/types'

const HISTORY_KEY = 'search_history'

export const useSearchStore = defineStore('search', () => {
  const results = ref<SearchResult[]>([])
  const searchTotal = ref(0)
  const hotKeywords = ref<string[]>([])
  const history = ref<string[]>([])
  const loading = ref(false)
  const keyword = ref('')

  async function fetchHot() {
    hotKeywords.value = await getHotKeywords()
  }

  async function doSearch(q: string, page = 1, pageSize = 20) {
    loading.value = true
    keyword.value = q
    try {
      const data = await search(q, page, pageSize)
      results.value = data.list
      searchTotal.value = data.total
      addHistory(q)
    } finally {
      loading.value = false
    }
  }

  function addHistory(q: string) {
    const list: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    const filtered = list.filter(item => item !== q)
    const updated = [q, ...filtered].slice(0, 20)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    history.value = updated
  }

  function loadHistory() {
    history.value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  }

  function removeHistory(keyword?: string) {
    if (keyword) {
      history.value = history.value.filter(h => h !== keyword)
    } else {
      history.value = []
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  }

  return {
    results, searchTotal, hotKeywords, history, loading, keyword,
    fetchHot, doSearch, loadHistory, removeHistory,
  }
})