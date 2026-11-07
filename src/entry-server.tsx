import { StrictMode } from 'react'
import type { ComponentProps } from 'react'
import { renderToReadableStream } from 'react-dom/server.browser'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'

/** Kontext-Objekt, das react-helmet-async nach dem Rendern befüllt. */
type HelmetContext = NonNullable<ComponentProps<typeof HelmetProvider>['context']>

export interface RenderResult {
  /** HTML für <div id="root"> */
  html: string
  /** Tags für <head> (Titel, Meta, Canonical, JSON-LD) */
  head: string
}

/**
 * Rendert eine Route zu statischem HTML. Wird von scripts/prerender.mjs
 * nach dem Client-Build aufgerufen, damit Suchmaschinen und KI-Crawler
 * den Seiteninhalt ohne JavaScript sehen.
 */
export async function render(url: string): Promise<RenderResult> {
  const helmetContext: HelmetContext = {}

  const app = (
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>
  )

  let renderError: unknown
  const stream = await renderToReadableStream(app, { onError(error) { renderError = error } })
  await stream.allReady
  if (renderError) throw renderError
  const html = await new Response(stream).text()

  const h = helmetContext.helmet
  const head = h
    ? [h.title.toString(), h.meta.toString(), h.link.toString(), h.script.toString()]
        .filter((s) => s.trim().length > 0)
        .join('\n    ')
    : ''

  return { html, head }
}
