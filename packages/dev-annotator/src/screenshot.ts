import { toPng } from "html-to-image"

/** Capture a PNG of an element and return a data URL (or null on failure). */
export async function captureElementScreenshot(
  selector: string,
  maxWidth = 600,
): Promise<string | null> {
  try {
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) return null
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const scale = Math.min(1, maxWidth / rect.width)

    return await toPng(el, {
      cacheBust: true,
      pixelRatio: scale,
      skipFonts: true,
      filter: (node) =>
        !(node instanceof HTMLElement && node.hasAttribute("data-annotation-ui")),
    })
  } catch (err) {
    console.warn("[loupe] screenshot capture failed:", err)
    return null
  }
}
