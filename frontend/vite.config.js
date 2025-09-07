import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ตั้ง alias '@' ให้ชี้ไป src/ → import จะสั้นและย้ายไฟล์ง่ายขึ้น
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
