import { createRoot } from "react-dom/client"
import { Welcome } from "./Welcome"
import "./styles.css"

const mq = matchMedia("(prefers-color-scheme: dark)")
const applyTheme = (m: { matches: boolean }) =>
  document.documentElement.classList.toggle("dark", m.matches)
applyTheme(mq)
mq.addEventListener("change", applyTheme)

createRoot(document.getElementById("root")!).render(<Welcome />)
