/* Tailwind Config */
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Expose REACT_APP_ prefix environment variables for compatibility
    define: {
      'import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY': JSON.stringify(env.REACT_APP_GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY || ''),
    },
  }
})
