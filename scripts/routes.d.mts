/** Typen für scripts/routes.mjs (Import in vite.config.ts). */
export interface BlogRoute {
  slug: string
  route: string
  date: string | undefined
  updated: string | undefined
  draft: boolean
}
export function getBlogPosts(): BlogRoute[]
export function getRoutes(): string[]
