import { toPng } from "html-to-image"

/**
 * Capture a PNG screenshot of an element.
 *
 * Returns a data URL or `null` on failure. Failures can happen if the page has
 * cross-origin images, font issues, or the element is detached.
 */
export async function captureElementScreenshot(
  selector: string,
  maxWidth = 600,
): Promise<string | null> {
  try {
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) return null

    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null

    // Cap dimensions to keep storage reasonable
    const scale = Math.min(1, maxWidth / rect.width)

    const dataUrl = await toPng(el, {
      cacheBust: true,
      pixelRatio: scale,
      skipFonts: true, // skip CORS-blocked font requests
      filter: (node) => {
        // Skip our own annotation UI
        if (node instanceof HTMLElement) {
          return !node.hasAttribute("data-annotation-ui")
        }
        return true
      },
    })

    return dataUrl
  } catch (err) {
    console.warn("[marker] screenshot capture failed:", err)
    return null
  }
}
