import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getLocalIp() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return '127.0.0.1'
}

function kirtanUploadPlugin() {
  return {
    name: 'kirtan-upload-plugin',
    configureServer(server) {
      // Direct Video Upload API
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/upload' && req.method === 'POST') {
          const uploadsDir = path.resolve(__dirname, 'public/uploads')
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
          }

          const rawFilename = req.headers['x-file-name'] || `kirtan_film_${Date.now()}.mp4`
          const ext = path.extname(decodeURIComponent(rawFilename)) || '.mp4'
          const baseName = path.basename(decodeURIComponent(rawFilename), ext).replace(/[^a-zA-Z0-9_-]/g, '_')
          const safeName = `${baseName}_${Date.now()}${ext}`
          const filePath = path.join(uploadsDir, safeName)
          const writeStream = fs.createWriteStream(filePath)

          req.pipe(writeStream)

          writeStream.on('finish', () => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              success: true,
              url: `/uploads/${safeName}`,
              filename: safeName
            }))
          })

          writeStream.on('error', (err) => {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          })
          return
        }

        // Network Info API for other devices
        if (req.url === '/api/network-info' && req.method === 'GET') {
          const ip = getLocalIp()
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            ip,
            port: 5174,
            streamUrl: `http://${ip}:5174`
          }))
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    kirtanUploadPlugin()
  ],
  server: {
    host: '0.0.0.0',
    port: 5174,
  }
})
