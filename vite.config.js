import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works on GitHub Pages under /japanese-learning-journey/
export default defineConfig({
  plugins: [react()],
  base: './',
})
