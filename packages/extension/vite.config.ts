import { crx } from "@crxjs/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { resolve } from "node:path"
import { defineConfig } from "vite"
import manifest from "./src/manifest.config"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
  ],
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5175,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      // Welcome page is opened dynamically by the background service worker
      // (chrome.tabs.create) — manifest doesn't reference it, so crxjs won't
      // auto-detect it. Declaring it here makes Vite process the HTML and
      // bundle its TS entry as a proper module script.
      input: {
        welcome: resolve(__dirname, "src/welcome/index.html"),
      },
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
})
