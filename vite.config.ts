import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import createSitemap from 'vite-plugin-sitemap'

// Define all routes for sitemap generation
const routes = [
  '/',
  '/badumbau-zofingen',
  '/referenzen',
  '/produkte',
  '/dienstleistungen',
  '/partner',
  '/booking',
  '/ueber-uns',
  '/kontakt',
  '/datenschutz',
  '/impressum',
  '/agb'
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createSitemap({
      hostname: 'https://newlivingdesign.ch',
      exclude: ['/404'],
      readable: true,
      dynamicRoutes: routes
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
