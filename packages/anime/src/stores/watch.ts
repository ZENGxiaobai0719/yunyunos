import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WatchRecord } from '@/types'

const RECORDS_KEY = 'watch_records'

export const useWatchStore = defineStore('watch', () => {
  const records = ref<WatchRecord[]>([])

  function loadRecords() {
    records.value = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]')
  }

  function addRecord(record: WatchRecord) {
    // 同番剧同集去重
    const filtered = records.value.filter(
      r => !(r.animeId === record.animeId && r.episodeNum === record.episodeNum)
    )
    records.value = [record, ...filtered].slice(0, 50)
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records.value))
  }

  function clearRecords() {
    records.value = []
    localStorage.removeItem(RECORDS_KEY)
  }

  return { records, loadRecords, addRecord, clearRecords }
})