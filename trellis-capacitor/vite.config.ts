import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import typescript from '@rollup/plugin-typescript'
import path from 'path'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    typescript(),
    Components({
      resolvers: [VuetifyResolver()],
    }),
  ],
  root: './src',
  // assetsInclude: ['**/*.ttf'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
  },
  esbuild: false,
})
