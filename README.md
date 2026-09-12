# New Living Design

A modern React application built with TypeScript and Vite for fast development and optimized builds.

## Features

- ⚡️ Fast development with Vite HMR
- 📝 TypeScript for type safety
- ⚛️ React 18 with modern hooks
- 🎨 Custom CSS styling
- 🔧 ESLint configuration
- 📦 Optimized production builds

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable React components
│   ├── Header.tsx  # Modern navigation header
│   ├── Header.css  # Header component styles
│   └── index.ts    # Component exports
├── types/          # TypeScript type definitions
├── assets/         # Static assets (images, fonts, etc.)
├── App.tsx         # Main App component
├── App.css         # App component styles
├── main.tsx        # Application entry point
└── index.css       # Global styles
```

## Static prerendering (SEO)

`npm run build` runs three steps: `tsc -b`, `vite build` (the normal SPA build into `dist/`) and
`node scripts/prerender.mjs`. The script builds `src/entry-server.tsx` with `vite.config.ssr.ts`
(into `dist-ssr/`, ignored by git), renders every route listed in `routes.json` with
`renderToString` and writes the result to `dist/<route>/index.html` (home: `dist/index.html`),
including the `<head>` tags from react-helmet-async (title, meta, canonical, JSON-LD).
Crawlers that do not execute JavaScript (Bing, ChatGPT, previews) therefore see the full page.

- `routes.json` is the single list of routes: it feeds the sitemap and the prerendering.
  New page = new `<Route>` in `src/App.tsx` + entry in `routes.json`.
- `src/main.tsx` hydrates prerendered HTML (`data-prerendered="<path>"` on `#root`) and falls
  back to a normal client render for the SPA fallback.
- If the server build or a single route fails, the script logs a warning and keeps the SPA HTML
  for that route, so the deployment never breaks because of prerendering.
- `npm run build:spa` builds without prerendering.

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS** - Custom styling
- **ESLint** - Code linting

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
