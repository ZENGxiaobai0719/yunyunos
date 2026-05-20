<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSongs, deleteSong, createSong } from '@/api/music'
import type { MusicSongResponse } from '@/api/music'

const songs = ref<MusicSongResponse[]>([])
const loading = ref(false)
const uploading = ref(false)
const message = ref('')

const form = ref({
  title: '',
  artist: '',
  album: '',
})
const musicFile = ref<File | null>(null)
const coverFile = ref<File | null>(null)
const musicInputRef = ref<HTMLInputElement | null>(null)
const coverInputRef = ref<HTMLInputElement | null>(null)

async function loadSongs() {
  loading.value = true
  try {
    songs.value = await getSongs()
  } catch (e: any) {
    message.value = '加载失败: ' + e.message
  } finally {
    loading.value = false
  }
}

async function handleUpload() {
  if (!form.value.title || !form.value.artist || !musicFile.value) {
    message.value = '请填写歌曲名、歌手并选择音乐文件'
    return
  }
  uploading.value = true
  message.value = ''
  try {
    const fd = new FormData()
    fd.append('title', form.value.title)
    fd.append('artist', form.value.artist)
    fd.append('album', form.value.album || '')
    fd.append('musicFile', musicFile.value)
    if (coverFile.value) fd.append('coverFile', coverFile.value)

    await createSong(fd)
    message.value = '上传成功!'
    form.value = { title: '', artist: '', album: '' }
    musicFile.value = null
    coverFile.value = null
    if (musicInputRef.value) musicInputRef.value.value = ''
    if (coverInputRef.value) coverInputRef.value.value = ''
    await loadSongs()
  } catch (e: any) {
    message.value = '上传失败: ' + e.message
  } finally {
    uploading.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定删除这首歌？')) return
  try {
    await deleteSong(id)
    message.value = '已删除'
    await loadSongs()
  } catch (e: any) {
    message.value = '删除失败: ' + e.message
  }
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

onMounted(loadSongs)
</script>

<template>
  <div class="admin-music">
    <h1>音乐管理</h1>

    <div v-if="message" class="msg" :class="{ error: message.includes('失败') }">{{ message }}</div>

    <!-- Upload form -->
    <div class="upload-form">
      <h2>上传新歌曲</h2>
      <div class="form-row">
        <input v-model="form.title" placeholder="歌曲名 *" class="input" />
        <input v-model="form.artist" placeholder="歌手 *" class="input" />
        <input v-model="form.album" placeholder="专辑 (可选)" class="input" />
      </div>
      <div class="form-row">
        <label class="file-label">
          <span>🎵 音乐文件 *</span>
          <input ref="musicInputRef" type="file" accept="audio/*" @change="e => musicFile = (e.target as HTMLInputElement).files?.[0] ?? null" />
        </label>
        <label class="file-label">
          <span>🖼 封面图片</span>
          <input ref="coverInputRef" type="file" accept="image/*" @change="e => coverFile = (e.target as HTMLInputElement).files?.[0] ?? null" />
        </label>
      </div>
      <button class="btn-upload" :disabled="uploading" @click="handleUpload">
        {{ uploading ? '上传中...' : '上传歌曲' }}
      </button>
    </div>

    <!-- Song list -->
    <div class="song-list">
      <h2>歌曲列表 ({{ songs.length }})</h2>
      <div v-if="loading">加载中...</div>
      <table v-else>
        <thead>
          <tr>
            <th>#</th>
            <th>封面</th>
            <th>歌曲名</th>
            <th>歌手</th>
            <th>专辑</th>
            <th>时长</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in songs" :key="s.id">
            <td>{{ i + 1 }}</td>
            <td>
              <img v-if="s.coverFile" :src="`/music-player/cover/${encodeURIComponent(s.coverFile)}`" class="cover-thumb" />
              <span v-else class="no-cover">-</span>
            </td>
            <td>{{ s.title }}</td>
            <td>{{ s.artist }}</td>
            <td>{{ s.album || '-' }}</td>
            <td>{{ formatDuration(s.duration) }}</td>
            <td>
              <button class="btn-delete" @click="handleDelete(s.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!loading && songs.length === 0" class="empty">暂无歌曲，请上传</div>
    </div>
  </div>
</template>

<style scoped>
.admin-music {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
  color: #c9d1d9;
  font-family: 'Segoe UI', 'PingFang SC', sans-serif;
}
h1 { font-size: 24px; margin: 0 0 24px; color: #f0f6fc; }
h2 { font-size: 16px; margin: 24px 0 12px; color: #8b949e; }
.msg { padding: 10px 16px; border-radius: 8px; background: rgba(63,185,80,0.15); color: #3fb950; margin-bottom: 16px; }
.msg.error { background: rgba(248,81,73,0.15); color: #f85149; }

.upload-form {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 24px;
}
.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.input {
  flex: 1;
  min-width: 160px;
  padding: 8px 12px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  outline: none;
}
.input:focus { border-color: #58a6ff; }

.file-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #8b949e;
}
.file-label:hover { border-color: #58a6ff; color: #c9d1d9; }
.file-label input { display: none; }

.btn-upload {
  padding: 10px 28px;
  background: #238636;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-upload:hover { background: #2ea043; }
.btn-upload:disabled { opacity: 0.5; cursor: not-allowed; }

.song-list {
  margin-top: 8px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #21262d;
  font-size: 14px;
}
th { color: #8b949e; font-weight: 500; }
.cover-thumb { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; }
.no-cover { color: #484f58; }
.btn-delete {
  padding: 4px 12px;
  background: transparent;
  color: #f85149;
  border: 1px solid #f85149;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.btn-delete:hover { background: rgba(248,81,73,0.1); }
.empty { text-align: center; padding: 40px; color: #484f58; }
</style>
