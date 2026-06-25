// In-browser annotation overlay (dev-only, injected by vite-plugin-annotations).
// Lets you point at any element, auto-captures a screenshot of it, type a note,
// optionally paste/drop extra reference images, and ships everything to
// .context/annotations.json — which the Claude /loop reads to make edits.
//
// Style is isolated in a Shadow DOM so it never interferes with the app, and
// the overlay is never part of the captured screenshots.
import { snapdom } from '@zumer/snapdom'

const API = '/__annotations'

type Anno = {
  id: string
  status: 'new' | 'done'
  text: string
  loc: string | null
  route: string
  rect: { x: number; y: number; w: number; h: number } | null
  reply?: string
  createdAt: string
}

// ---- shadow host ---------------------------------------------------------
const host = document.createElement('div')
host.setAttribute('data-anno-overlay', '')
host.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:2147483000'
document.body.appendChild(host)
const root = host.attachShadow({ mode: 'open' })

const style = document.createElement('style')
style.textContent = `
  * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
  .toggle {
    position: fixed; left: 16px; bottom: 16px; z-index: 10;
    display: flex; align-items: center; gap: 6px;
    padding: 8px 12px; border-radius: 999px; border: none; cursor: pointer;
    background: #18181b; color: #fff; font-size: 13px; font-weight: 600;
    box-shadow: 0 4px 14px rgba(0,0,0,.25); user-select: none;
  }
  .toggle.on { background: #f59e0b; color: #18181b; }
  .toggle .count { background: #ef4444; color:#fff; border-radius:999px; padding:0 6px; font-size:11px; line-height:18px; min-width:18px; text-align:center; }
  .toggle.on .count { background:#18181b; color:#fff; }
  .hl {
    position: fixed; pointer-events: none; z-index: 5;
    border: 2px solid #f59e0b; background: rgba(245,158,11,.12);
    border-radius: 4px; transition: all .04s linear;
  }
  .sel {
    position: fixed; pointer-events: none; z-index: 7;
    border: 2px dashed #f59e0b; background: rgba(245,158,11,.10);
    border-radius: 2px;
  }
  .lightbox {
    position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,.75);
    display: flex; align-items: center; justify-content: center; cursor: zoom-out; padding: 32px;
  }
  .lightbox img { max-width: 92vw; max-height: 92vh; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,.5); }
  .hint {
    position: fixed; left: 16px; bottom: 60px; z-index: 9;
    background: #18181b; color:#fff; font-size:12px; padding:6px 10px; border-radius:8px;
    box-shadow:0 4px 14px rgba(0,0,0,.2);
  }
  .composer {
    position: fixed; left: 16px; bottom: 16px; z-index: 11; width: 340px;
    background: #fff; border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,.28);
    border: 1px solid #e4e4e7; overflow: hidden; color:#18181b;
  }
  .composer header { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #f1f1f4; }
  .composer header b { font-size:13px; }
  .composer header .x { cursor:pointer; color:#71717a; font-size:18px; line-height:1; border:none; background:none; }
  .composer .body { padding:12px 14px; display:flex; flex-direction:column; gap:10px; }
  .shot { width:100%; max-height:140px; object-fit:contain; border:1px solid #e4e4e7; border-radius:8px; background:#fafafa; cursor:zoom-in; }
  textarea { width:100%; min-height:64px; resize:vertical; border:1px solid #e4e4e7; border-radius:8px; padding:8px 10px; font-size:13px; outline:none; }
  textarea:focus { border-color:#f59e0b; }
  .imgs { display:flex; gap:6px; flex-wrap:wrap; }
  .imgs .thumb { position:relative; width:48px; height:48px; }
  .imgs .thumb img { width:48px; height:48px; object-fit:cover; border-radius:6px; border:1px solid #e4e4e7; display:block; cursor:zoom-in; }
  .imgs .thumb .del {
    position:absolute; top:-6px; right:-6px; width:18px; height:18px; padding:0;
    border-radius:999px; border:1.5px solid #fff; background:#ef4444; color:#fff;
    font-size:12px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center;
    box-shadow:0 1px 3px rgba(0,0,0,.3);
  }
  .imgs .thumb .del:hover { background:#dc2626; }
  .loc { font-size:11px; color:#a1a1aa; font-family: ui-monospace, monospace; word-break: break-all; }
  .row { display:flex; gap:8px; align-items:center; justify-content:space-between; }
  .btn { border:none; border-radius:8px; padding:7px 14px; font-size:13px; font-weight:600; cursor:pointer; }
  .btn.primary { background:#18181b; color:#fff; }
  .btn.ghost { background:#f4f4f5; color:#52525b; }
  .pin {
    position: absolute; z-index: 6; width: 22px; height: 22px; transform: translate(-50%,-50%);
    border-radius: 999px; border:2px solid #fff; cursor: pointer;
    font-size: 11px; font-weight: 700; color:#fff; display:flex; align-items:center; justify-content:center;
    box-shadow: 0 2px 6px rgba(0,0,0,.3);
  }
  .pin.new { background:#f59e0b; }
  .pin.done { background:#22c55e; }
  .pop {
    position:absolute; z-index:12; width:260px; background:#fff; color:#18181b; border-radius:12px;
    box-shadow:0 12px 40px rgba(0,0,0,.28); border:1px solid #e4e4e7; padding:12px; font-size:12px;
    transform: translate(-50%, 12px);
  }
  .pop .st { display:inline-block; padding:1px 8px; border-radius:999px; font-size:11px; font-weight:600; margin-bottom:6px; }
  .pop .st.new { background:#fef3c7; color:#b45309; }
  .pop .st.done { background:#dcfce7; color:#15803d; }
  .pop .reply { margin-top:8px; padding-top:8px; border-top:1px dashed #e4e4e7; color:#16a34a; }
`
root.appendChild(style)

// ---- state ---------------------------------------------------------------
let picking = false
let target: HTMLElement | null = null
let composerImages: string[] = []
let seq = 0
let annos: Anno[] = []

const hl = document.createElement('div')
hl.className = 'hl'
hl.style.display = 'none'

// selection box for drag-to-select-region
const sel = document.createElement('div')
sel.className = 'sel'
sel.style.display = 'none'

const toggle = document.createElement('button')
toggle.className = 'toggle'
const pinLayer = document.createElement('div')

// ---- lightbox (click any annotation image to enlarge) --------------------
function openLightbox(src: string) {
  const lb = document.createElement('div')
  lb.className = 'lightbox'
  const big = document.createElement('img')
  big.src = src
  lb.appendChild(big)
  lb.addEventListener('click', () => lb.remove())
  root.appendChild(lb)
}

function render() {
  const newCount = annos.filter((a) => a.status === 'new').length
  toggle.innerHTML = `<span>✎ 批注</span>${newCount ? `<span class="count">${newCount}</span>` : ''}`
  toggle.classList.toggle('on', picking)
  // pins — only show pending (new) ones; processed (done) annotations
  // disappear so they don't block the result.
  pinLayer.innerHTML = ''
  // While picking, pins must not intercept the drag: a mousedown/up on a pin
  // retargets to the shadow host and would abort region selection.
  pinLayer.style.pointerEvents = picking ? 'none' : ''
  const pending = annos.filter((a) => a.rect && a.status === 'new')
  pending.forEach((a, i) => {
    const pin = document.createElement('div')
    pin.className = `pin ${a.status}`
    pin.textContent = String(i + 1)
    pin.style.left = `${a.rect.x}px`
    pin.style.top = `${a.rect.y}px`
    pin.title = a.text
    pin.onclick = (e) => {
      e.stopPropagation()
      showPop(a, i + 1, a.rect!.x, a.rect!.y)
    }
    pinLayer.appendChild(pin)
  })
}

let pop: HTMLElement | null = null
function showPop(a: Anno, n: number, x: number, y: number) {
  if (pop) pop.remove()
  pop = document.createElement('div')
  pop.className = 'pop'
  pop.style.left = `${x}px`
  pop.style.top = `${y + 14}px`
  pop.innerHTML = `
    <span class="st ${a.status}">${a.status === 'done' ? '✓ 已处理' : '待处理'} · #${n}</span>
    <div>${escapeHtml(a.text) || '<i style="color:#a1a1aa">（无文字）</i>'}</div>
    ${a.loc ? `<div class="loc" style="margin-top:6px">${escapeHtml(a.loc)}</div>` : ''}
    ${a.reply ? `<div class="reply">↳ ${escapeHtml(a.reply)}</div>` : ''}
  `
  pinLayer.appendChild(pop)
  setTimeout(() => {
    const off = (ev: MouseEvent) => {
      if (pop && !pop.contains(ev.target as Node)) {
        pop.remove()
        pop = null
        document.removeEventListener('click', off, true)
      }
    }
    document.addEventListener('click', off, true)
  }, 0)
}

function escapeHtml(s: string) {
  return (s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
}

// ---- picking -------------------------------------------------------------
// Two ways to capture: click an element, or drag to select a region.
let dragStart: { x: number; y: number } | null = null
let isDragging = false
const DRAG_THRESHOLD = 5

function onMove(e: MouseEvent) {
  if (!picking) return
  if (dragStart) {
    // drawing a selection rectangle
    const x = Math.min(dragStart.x, e.clientX)
    const y = Math.min(dragStart.y, e.clientY)
    const w = Math.abs(e.clientX - dragStart.x)
    const h = Math.abs(e.clientY - dragStart.y)
    if (w > DRAG_THRESHOLD || h > DRAG_THRESHOLD) {
      isDragging = true
      hl.style.display = 'none'
      sel.style.display = 'block'
      sel.style.left = `${x}px`
      sel.style.top = `${y}px`
      sel.style.width = `${w}px`
      sel.style.height = `${h}px`
    }
    return
  }
  // hover highlight (element mode)
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
  if (!el || el === host || host.contains(el) || (el.getRootNode() as ShadowRoot)?.host === host) return
  const r = el.getBoundingClientRect()
  hl.style.display = 'block'
  hl.style.left = `${r.left}px`
  hl.style.top = `${r.top}px`
  hl.style.width = `${r.width}px`
  hl.style.height = `${r.height}px`
}

function onMouseDown(e: MouseEvent) {
  if (!picking || e.target === host) return
  e.preventDefault()
  e.stopPropagation()
  dragStart = { x: e.clientX, y: e.clientY }
  isDragging = false
}

async function onMouseUp(e: MouseEvent) {
  // NOTE: do *not* bail on `e.target === host`. Shadow-DOM event retargeting
  // reports the host for any mouseup that lands on our own overlay (e.g. an
  // existing pin), so checking it here would silently abort a legitimate drag
  // — leaving picking on, the selection box stuck, and no composer. `dragStart`
  // already guarantees the drag began on real app content.
  if (!picking || !dragStart) {
    dragStart = null
    return
  }
  e.preventDefault()
  e.stopPropagation()
  const start = dragStart
  const dragged = isDragging
  dragStart = null
  isDragging = false
  picking = false
  hl.style.display = 'none'
  sel.style.display = 'none'
  hint.style.display = 'none'
  render()

  if (dragged) {
    const clientRect = {
      left: Math.min(start.x, e.clientX),
      top: Math.min(start.y, e.clientY),
      width: Math.abs(e.clientX - start.x),
      height: Math.abs(e.clientY - start.y),
    }
    captureRegionAt(clientRect)
  } else {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    if (el && el !== host && !host.contains(el)) captureElement(el)
  }
}

// swallow the trailing click so the app doesn't react to it
function onClickCapture(e: MouseEvent) {
  if (!picking) return
  if (e.target === host) return
  e.preventDefault()
  e.stopPropagation()
}

// Robust snapshot via snapdom — fast even with Tailwind v4's huge dev stylesheet
// (html-to-image freezes inlining it). Returns a canvas, with a hard timeout so
// the composer never gets stuck on "截图中…".
function snapCanvas(node: HTMLElement): Promise<HTMLCanvasElement | null> {
  return Promise.race<HTMLCanvasElement | null>([
    snapdom.toCanvas(node, { scale: 1 }).catch(() => null),
    new Promise<null>((res) => setTimeout(() => res(null), 8000)),
  ])
}

function captureElement(el: HTMLElement) {
  target = el
  const locEl = el.closest('[data-loc]') as HTMLElement | null
  const r = el.getBoundingClientRect()
  openComposer({
    loc: locEl?.getAttribute('data-loc') || null,
    rect: { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height },
    elementTag: el.tagName.toLowerCase(),
    elementText: (el.innerText || '').trim().slice(0, 120),
    capture: async () => {
      const c = await snapCanvas(el)
      return c ? c.toDataURL('image/png') : null
    },
  })
}

function captureRegionAt(clientRect: { left: number; top: number; width: number; height: number }) {
  const pageRect = {
    x: clientRect.left + scrollX,
    y: clientRect.top + scrollY,
    w: clientRect.width,
    h: clientRect.height,
  }
  const cx = clientRect.left + clientRect.width / 2
  const cy = clientRect.top + clientRect.height / 2
  // Find the smallest element that fully contains the selection. Capturing
  // that subtree (instead of the whole page) is far more reliable.
  let el = document.elementFromPoint(cx, cy) as HTMLElement | null
  while (el && el !== document.body && el !== document.documentElement) {
    const r = el.getBoundingClientRect()
    if (
      r.left <= clientRect.left + 1 &&
      r.top <= clientRect.top + 1 &&
      r.right >= clientRect.left + clientRect.width - 1 &&
      r.bottom >= clientRect.top + clientRect.height - 1
    )
      break
    el = el.parentElement
  }
  const container = el && el !== host && !host.contains(el) ? el : document.body
  const locEl = container.closest?.('[data-loc]') as HTMLElement | null
  openComposer({
    loc: locEl?.getAttribute('data-loc') || null,
    rect: pageRect,
    elementTag: 'region',
    elementText: null,
    capture: () => captureRegion(container, clientRect),
  })
}

// capture a page region: snapshot the containing element, then crop to the
// selection box. Crop offsets are scaled to the canvas (snapdom may render at
// a different pixel ratio than CSS px).
async function captureRegion(
  container: HTMLElement,
  clientRect: { left: number; top: number; width: number; height: number },
): Promise<string | null> {
  const prevDisplay = host.style.display
  host.style.display = 'none' // keep the overlay out of the shot
  try {
    const cr = container.getBoundingClientRect()
    const canvas = await snapCanvas(container)
    if (!canvas) return null
    const scale = cr.width > 0 ? canvas.width / cr.width : 1
    const sx = Math.max(0, Math.round((clientRect.left - cr.left) * scale))
    const sy = Math.max(0, Math.round((clientRect.top - cr.top) * scale))
    const sw = Math.max(1, Math.round(clientRect.width * scale))
    const sh = Math.max(1, Math.round(clientRect.height * scale))
    const out = document.createElement('canvas')
    out.width = sw
    out.height = sh
    out.getContext('2d')!.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh)
    return out.toDataURL('image/png')
  } finally {
    host.style.display = prevDisplay
  }
}

// ---- composer ------------------------------------------------------------
const composer = document.createElement('div')
composer.className = 'composer'
composer.style.display = 'none'

interface ComposerMeta {
  loc: string | null
  rect: { x: number; y: number; w: number; h: number }
  elementTag: string | null
  elementText: string | null
  capture: () => Promise<string | null>
}

async function openComposer(meta: ComposerMeta) {
  composerImages = []
  const { loc, rect, elementTag, elementText } = meta

  composer.innerHTML = `
    <header><b>新批注</b><button class="x">×</button></header>
    <div class="body">
      <img class="shot" alt="截图中…" />
      <textarea placeholder="描述你想改的地方…（可 ⌘V 粘贴 / 拖拽图片）"></textarea>
      <div class="imgs"></div>
      <div class="loc">${loc ? escapeHtml(loc) : '（未找到源码定位，仍可提交，按文字+截图处理）'}</div>
      <div class="row">
        <button class="btn ghost addimg">＋ 加图</button>
        <button class="btn primary submit">提交批注</button>
      </div>
      <input type="file" accept="image/*" multiple style="display:none" />
    </div>`
  composer.style.display = 'block'
  const shotImg = composer.querySelector('.shot') as HTMLImageElement
  const ta = composer.querySelector('textarea') as HTMLTextAreaElement
  const imgsBox = composer.querySelector('.imgs') as HTMLElement
  const fileInput = composer.querySelector('input[type=file]') as HTMLInputElement

  composer.querySelector('.x')!.addEventListener('click', closeComposer)
  composer.querySelector('.addimg')!.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', () => {
    Array.from(fileInput.files || []).forEach(addImageFile)
  })

  function renderImgs() {
    imgsBox.innerHTML = ''
    composerImages.forEach((d, idx) => {
      const thumb = document.createElement('div')
      thumb.className = 'thumb'
      const im = document.createElement('img')
      im.src = d
      im.title = '点击放大预览'
      im.onclick = () => openLightbox(d)
      const del = document.createElement('button')
      del.className = 'del'
      del.type = 'button'
      del.textContent = '×'
      del.title = '删除这张图'
      del.onclick = (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        composerImages.splice(idx, 1)
        renderImgs()
      }
      thumb.append(im, del)
      imgsBox.appendChild(thumb)
    })
  }
  function addImageFile(file: File) {
    const fr = new FileReader()
    fr.onload = () => {
      composerImages.push(String(fr.result))
      renderImgs()
    }
    fr.readAsDataURL(file)
  }
  ta.addEventListener('paste', (ev: ClipboardEvent) => {
    const items = ev.clipboardData?.items || []
    for (const it of items) {
      if (it.type.startsWith('image/')) {
        const f = it.getAsFile()
        if (f) addImageFile(f)
      }
    }
  })
  composer.addEventListener('dragover', (ev) => ev.preventDefault())
  composer.addEventListener('drop', (ev) => {
    ev.preventDefault()
    Array.from(ev.dataTransfer?.files || []).forEach((f) => {
      if (f.type.startsWith('image/')) addImageFile(f)
    })
  })

  let shot: string | null = null
  try {
    shot = await meta.capture()
    if (shot) {
      shotImg.src = shot
      shotImg.title = '点击放大预览'
      shotImg.onclick = () => shot && openLightbox(shot)
    } else {
      shotImg.style.display = 'none'
    }
  } catch {
    shotImg.alt = '截图失败（不影响提交）'
    shotImg.style.display = 'none'
  }

  composer.querySelector('.submit')!.addEventListener('click', async () => {
    const text = ta.value.trim()
    if (!text && composerImages.length === 0) {
      ta.focus()
      return
    }
    const btn = composer.querySelector('.submit') as HTMLButtonElement
    btn.textContent = '提交中…'
    btn.disabled = true
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          loc,
          route: location.pathname + location.hash,
          rect,
          elementTag,
          elementText,
          shot,
          images: composerImages,
          seq: seq++,
        }),
      })
      const data = await res.json()
      if (data?.annotation) annos.push(data.annotation)
      closeComposer()
      render()
    } catch (err) {
      btn.textContent = '失败，重试'
      btn.disabled = false
    }
  })
  ta.focus()
}

function closeComposer() {
  composer.style.display = 'none'
  composer.innerHTML = ''
  target = null
}

// ---- hint ----------------------------------------------------------------
const hint = document.createElement('div')
hint.className = 'hint'
hint.textContent = '点击元素 · 或拖拽框选区域 · Esc 取消'
hint.style.display = 'none'

// ---- wiring --------------------------------------------------------------
toggle.addEventListener('click', () => {
  if (composer.style.display === 'block') closeComposer()
  picking = !picking
  hint.style.display = picking ? 'block' : 'none'
  if (!picking) {
    hl.style.display = 'none'
    sel.style.display = 'none'
    dragStart = null
    isDragging = false
  }
  render()
})
document.addEventListener('mousemove', onMove, true)
document.addEventListener('mousedown', onMouseDown, true)
document.addEventListener('mouseup', onMouseUp, true)
document.addEventListener('click', onClickCapture, true)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    picking = false
    dragStart = null
    isDragging = false
    hl.style.display = 'none'
    sel.style.display = 'none'
    hint.style.display = 'none'
    closeComposer()
    render()
  }
})

root.append(hl, sel, toggle, hint, composer, pinLayer)

// ---- sync ----------------------------------------------------------------
async function refresh() {
  try {
    const res = await fetch(API, { cache: 'no-store' })
    const data = await res.json()
    if (Array.isArray(data?.annotations)) {
      annos = data.annotations
      render()
    }
  } catch {
    /* dev server busy / restarting */
  }
}
refresh()
setInterval(refresh, 4000)
render()

console.log('[annotations] overlay ready — 左下角「✎ 批注」开始标注')
