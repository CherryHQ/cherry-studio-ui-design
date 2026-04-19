import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

const uiSrc = path.resolve(__dirname, "../ui/src")

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@cherry-studio/ui/theme.css": path.resolve(uiSrc, "styles/theme.css"),
      "@cherry-studio/ui": path.resolve(uiSrc, "index.ts"),
      "@/": path.resolve(uiSrc) + "/",
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
