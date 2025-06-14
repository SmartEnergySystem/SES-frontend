import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // 将所有 /api 开头的请求代理到后端服务
      '/api': {
        target: 'https://109eo7ty57340.vicp.fun/SES', // 已修正：target应指向后端服务的根路径
        changeOrigin: true, // 必须设置为 true，开启代理
        headers: {
          // 伪装来源，解决后端的CORS策略问题
          'Origin': 'https://109eo7ty57340.vicp.fun'
        }
        // 注意：如果你的后端接口路径本身不包含 /api，则需要重写路径
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
}) 