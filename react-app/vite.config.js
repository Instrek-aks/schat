import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Copy logo from secrity to react-app public folder on config load
try {
  const srcPath = path.resolve(__dirname, '../secrity/public/log.png')
  const destPath = path.resolve(__dirname, 'public/logo.png')
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath)
    console.log('Logo copied successfully to public/logo.png')
  }
} catch (e) {
  console.error('Failed to copy logo:', e)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
})
