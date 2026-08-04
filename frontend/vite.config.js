import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['node_modules'],
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
        quietDeps: true,
      },
    },
  },
})
