import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { accessSync, createReadStream, readFileSync, statSync } from 'fs'
import { extname } from 'path'
import type { Plugin } from 'vite'

function serveMusicPlayerLocal(): Plugin {
  const MUSIC_ROOT = resolve(__dirname, '..', '..', '音乐播放器')
  const MIME: Record<string, string> = {
    '.flac': 'audio/flac', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
    '.webm': 'video/webm', '.mp4': 'video/mp4',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.srt': 'text/plain; charset=utf-8',
  }
  return {
    name: 'serve-music-player-local',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/music-player/')) return next()
        const relative = decodeURIComponent(req.url.slice('/music-player/'.length).split('?')[0])

        if (['data.json', 'index.html', 'style.css', 'script.js'].includes(relative)) {
          return next()
        }
        const filePath = resolve(MUSIC_ROOT, relative)
        try {
          accessSync(filePath)
          const ext = extname(filePath).toLowerCase()
          const stat = statSync(filePath)
          const fileSize = stat.size
          const range = req.headers.range

          res.setHeader('Accept-Ranges', 'bytes')
          res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
          res.setHeader('Cache-Control', 'public, max-age=3600')

          if (range) {
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunkSize = (end - start) + 1

            res.statusCode = 206
            res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`)
            res.setHeader('Content-Length', chunkSize)
            createReadStream(filePath, { start, end }).pipe(res)
          } else {
            res.setHeader('Content-Length', fileSize)
            createReadStream(filePath).pipe(res)
          }
        } catch {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    tailwindcss(),
    serveMusicPlayerLocal(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        timeout: 300000,
      },
      '/static': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
