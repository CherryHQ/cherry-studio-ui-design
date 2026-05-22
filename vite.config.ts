import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const uiSrc = path.resolve(__dirname, 'packages/ui/src')
const v2UiSrc = path.resolve(__dirname, 'packages/cherry-v2-ui/src')

// Stub out figma:asset/ imports so local dev doesn't break
function figmaAssetStub() {
  return {
    name: 'figma-asset-stub',
    resolveId(source: string) {
      if (source.startsWith('figma:asset/')) return '\0figma-asset-stub'
      return null
    },
    load(id: string) {
      if (id === '\0figma-asset-stub') {
        // Return a 1x1 transparent PNG data-URL as placeholder
        return 'export default "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualzQAAAABJRU5ErkJggg=="'
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetStub(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // V2 ui package — `packages/cherry-v2-ui/` is excluded from the
      // pnpm workspace; resolve directly off the source folder so it
      // can be imported without an install step. Order matters: the
      // more specific suffix-aware entries must come BEFORE the bare
      // package alias.
      '@cherrystudio/ui/lib/utils': path.resolve(v2UiSrc, 'lib/utils.ts'),
      '@cherrystudio/ui/styles/tokens.css': path.resolve(v2UiSrc, 'styles/tokens.css'),
      '@cherrystudio/ui/styles/theme.css': path.resolve(v2UiSrc, 'styles/theme.css'),
      '@cherrystudio/ui/styles/index.css': path.resolve(v2UiSrc, 'styles/index.css'),
      '@cherrystudio/ui/styles': path.resolve(v2UiSrc, 'styles/tokens.css'),
      // Deep imports — primitives can be imported individually to
      // avoid pulling in barrel deps the project doesn't have
      // (@dnd-kit/core, cmdk plugins, @tanstack/react-table, …).
      '@cherrystudio/ui/components/primitives': path.resolve(v2UiSrc, 'components/primitives'),
      '@cherrystudio/ui/components': path.resolve(v2UiSrc, 'components'),
      '@cherrystudio/ui': path.resolve(v2UiSrc, 'index.ts'),
      // Our own UI package (legacy `@cherry-studio/ui` — hyphenated)
      '@cherry-studio/ui/theme.css': path.resolve(uiSrc, 'styles/theme.css'),
      '@cherry-studio/ui': path.resolve(uiSrc, 'index.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
