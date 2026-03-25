import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

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
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
