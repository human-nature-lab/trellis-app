import { defineConfig, mergeConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { fileURLToPath, URL } from 'url'
// import { createServer } from 'vite'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const baseConfig = defineConfig({
  appType: 'spa',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'typeorm/browser': resolve(__dirname, 'node_modules/typeorm/browser',)
    }
  },
  build: {
    rollupOptions: {
      input: {
        web: resolve(__dirname, 'web/index.html'),
        mobile: resolve(__dirname, 'mobile/index.html'),
      },
    },
  },
  // environments: {
  //   mobile: {
  //     consumer: 'client',
  //     resolve: {
  //       extensions: ['.mobile.ts', '.ts'],
  //     },
  //     build: {
  //       outDir: '/www',
  //     }
  //   },
  //   web: {
  //     consumer: 'client',
  //     resolve: {
  //       extensions: ['.web.ts', '.ts'],
  //     },
  //     build: {
  //       outDir: '/dist/web',
  //     }
  //   },
  // },
})


export default mergeConfig(baseConfig, {
  resolve: {
    extensions: ['.web.ts', '.ts'],
  },
})