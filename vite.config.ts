import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import createSitemap from 'vite-plugin-sitemap'
import routes from './routes.json'

// Alle Routen der Website: routes.json ist die einzige Liste
// (Sitemap hier, statisches Prerendering in scripts/prerender.mjs).

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createSitemap({
      hostname: 'https://newlivingdesign.ch',
      exclude: ['/404', '/google3c30d00da3c2bb3b'],
      readable: true,
      // "/" fügt das Plugin selbst hinzu
      dynamicRoutes: routes.filter((r) => r !== '/')
    })
  ],
  build: {
    // Enable code splitting for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          helmet: ['react-helmet-async']
        }
      }
    },
    // Enable source maps for better debugging
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  // Enable server-side prerendering hints
  ssr: {
    noExternal: ['react-helmet-async']
  }
})
