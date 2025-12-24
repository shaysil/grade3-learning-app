import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/grade3-learning-app/',
  plugins: [react()]
})
