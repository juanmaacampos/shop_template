import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'CMSMenuSDK',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'firebase'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          firebase: 'firebase'
        }
      }
    }
  }
})
