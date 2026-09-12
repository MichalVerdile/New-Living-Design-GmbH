import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Server-Build für das statische Prerendering (scripts/prerender.mjs).
 * Erzeugt dist-ssr/entry-server.js mit einer render(url)-Funktion.
 * Assets und CSS kommen weiterhin aus dem normalen Client-Build (dist/).
 */
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: 'dist-ssr',
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: false,
    rollupOptions: {
      output: { format: 'es', entryFileNames: 'entry-server.js' }
    }
  },
  ssr: {
    // Pakete, die Vite mitbündeln soll (CJS/ESM-Interop in Node)
    noExternal: ['react-helmet-async', 'react-cookie-consent', '@vercel/analytics', '@vercel/speed-insights']
  }
})
