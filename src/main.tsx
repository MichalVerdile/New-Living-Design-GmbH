import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')!

const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)

// Seiten aus dem Prerendering (scripts/prerender.mjs) tragen data-prerendered="<pfad>".
// Nur wenn der Pfad zur aktuellen URL passt, wird das fertige HTML hydriert;
// sonst (Fallback-HTML, unbekannte Route) rendert React die Seite neu.
const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
const prerenderedPath = rootEl.dataset.prerendered

if (prerenderedPath && prerenderedPath === currentPath) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}
