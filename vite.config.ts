import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:9686',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../cmd/server/web',
    emptyOutDir: true,
    rollupOptions: {
        output: {
            entryFileNames: `static/js/[name].js`,
            chunkFileNames: `static/js/[name].js`,
            assetFileNames: `static/[ext]/[name].[ext]`
        }
    }
  }
})