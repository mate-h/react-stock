import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import windi from 'vite-plugin-windicss'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    lib: {
      entry: 'src/app.tsx',
      name: 'react-stock',
      fileName: 'react-stock',
    },
  },
  plugins: [
    react({
      babel: {
        plugins: ['react-html-attrs'],
      },
    }),
    windi(),
    dts({
      insertTypesEntry: true,
      outputDir: 'dist',
    }),
  ],
})
