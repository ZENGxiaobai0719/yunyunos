import client from './client'

export interface MusicSongResponse {
  id: number
  title: string
  artist: string
  album: string | null
  musicFile: string
  coverFile: string | null
  duration: number
  lyrics: string | null
  sortOrder: number
  isDefault: number
  defaultBg: number
}

export function getSongs(): Promise<MusicSongResponse[]> {
  return client.get('/music/songs')
}

export function deleteSong(id: number): Promise<void> {
  return client.delete(`/music/songs/${id}`)
}

export function createSong(formData: FormData): Promise<MusicSongResponse> {
  return client.post('/music/songs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
