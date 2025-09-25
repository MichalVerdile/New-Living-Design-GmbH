# Next.js Migration Guide for Perfect SEO

## Why Next.js?
- **Server-Side Rendering (SSR)**: Pages are rendered on the server
- **Static Site Generation (SSG)**: Pre-built HTML files 
- **Perfect SEO**: Google sees full content immediately
- **Better Performance**: Faster initial page loads
- **Built-in Image Optimization**: Automatic WebP conversion and lazy loading

## Migration Steps

### 1. Create New Next.js Project
```bash
npx create-next-app@latest new-living-design-nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 2. Project Structure Comparison
```
Current Vite Structure:
src/
├── components/
├── pages/
├── assets/
└── App.tsx

Next.js Structure:
src/
├── app/
│   ├── page.tsx (Home)
│   ├── produkte/page.tsx
│   ├── dienstleistungen/page.tsx
│   └── layout.tsx
├── components/
└── public/
```

### 3. Key Benefits for SEO

#### Automatic SEO Features:
```typescript
// app/produkte/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produkte – New Living Design GmbH',
  description: 'Hochwertige Badezimmermöbel, Küchen, Armaturen...',
  openGraph: {
    title: 'Produkte – New Living Design GmbH',
    description: 'Hochwertige Badezimmermöbel...',
    images: ['/images/products-hero.jpg'],
  },
}

export default function ProductsPage() {
  return (
    <main>
      <h1>Unsere Produkte</h1>
      {/* Your content */}
    </main>
  )
}
```

#### Automatic Sitemap Generation:
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.newlivingdesign.ch',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.newlivingdesign.ch/produkte',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ... other pages
  ]
}
```

#### Automatic Robots.txt:
```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://www.newlivingdesign.ch/sitemap.xml',
  }
}
```

### 4. Migration Timeline
- **Time Required**: 2-3 days
- **SEO Impact**: Immediate improvement
- **Performance**: 40-60% faster initial load