import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Resolve @/ imports: files inside packages/ui/src/ resolve to that package's
// src directory; all other files resolve to the root src directory. This is
// needed because the ui package exports source files directly in dev mode.
function atAliasPlugin() {
  const rootSrcDir = path.resolve(__dirname, 'src')
  const uiSrcDir = path.resolve(__dirname, 'packages/ui/src')
  return {
    name: 'at-alias',
    enforce: 'pre' as const,
    async resolveId(source: string, importer: string | undefined, options: any) {
      if (!source.startsWith('@/')) return null
      const baseDir =
        importer && importer.replace(/[?#].*$/, '').startsWith(uiSrcDir)
          ? uiSrcDir
          : rootSrcDir
      const resolved = path.resolve(baseDir, source.slice(2))
      return this.resolve(resolved, importer, { ...options, skipSelf: true })
    },
  }
}

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
    atAliasPlugin(),
    figmaAssetStub(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
