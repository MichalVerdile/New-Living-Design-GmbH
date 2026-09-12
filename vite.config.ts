import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import createSitemap from 'vite-plugin-sitemap'
import { getRoutes, getBlogPosts } from './scripts/routes.mjs'

// Alle Routen der Website kommen aus scripts/routes.mjs:
// routes.json (feste Seiten) + src/content/blog/*.md (Artikel).
// Dieselbe Liste nutzt das statische Prerendering in scripts/prerender.mjs.
const routes: string[] = getRoutes()
const blogPosts = getBlogPosts()

// Sitemap: Artikel mit ihrem Veröffentlichungs-/Änderungsdatum, alles andere mit dem Build-Datum
const lastmod: Record<string, Date> = { '*': new Date() }
const changefreq: Record<string, string> = { '*': 'monthly', '/': 'weekly', '/blog': 'weekly' }
const priority: Record<string, number> = { '*': 0.6, '/': 1, '/badumbau-zofingen': 0.9, '/referenzen': 0.8, '/blog': 0.7 }
for (const p of blogPosts) {
  if (p.updated) lastmod[p.route] = new Date(p.updated)
  priority[p.route] = 0.7
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createSitemap({
      hostname: 'https://newlivingdesign.ch',
      exclude: ['/404', '/google3c30d00da3c2bb3b'],
      readable: true,
      // "/" fügt das Plugin selbst hinzu
      dynamicRoutes: routes.filter((r) => r !== '/'),
      lastmod,
      changefreq,
      priority
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
