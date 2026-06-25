import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

// ---------------------------------------------------------------------------
// Babel plugin: stamp `data-loc="relativeFile:line:col"` onto every host
// (lowercase) JSX element so the in-browser annotation overlay can map a
// clicked DOM node back to its exact source location. React 19 dropped
// fiber `_debugSource`, so we inject the location ourselves at compile time.
// Dev-only — wired up conditionally from vite.config.ts.
// ---------------------------------------------------------------------------
export function annotationsDataLocBabelPlugin({ types: t }: { types: any }) {
  return {
    name: 'annotations-data-loc',
    visitor: {
      JSXOpeningElement(p: any, state: any) {
        const node = p.node
        const nameNode = node.name
        if (!nameNode || nameNode.type !== 'JSXIdentifier') return
        // Host DOM elements only (lowercase tag). Component data-loc never
        // reaches the DOM, so it would be useless.
        if (!/^[a-z]/.test(nameNode.name)) return
        if (!node.loc) return
        // Don't double-stamp.
        if (
          node.attributes.some(
            (a: any) => a.type === 'JSXAttribute' && a.name?.name === 'data-loc',
          )
        )
          return
        const root: string = state.opts?.root || process.cwd()
        const filename: string = state.filename || ''
        const rel = filename ? path.relative(root, filename) : 'unknown'
        const loc = `${rel}:${node.loc.start.line}:${node.loc.start.column + 1}`
        node.attributes.push(
          t.jsxAttribute(t.jsxIdentifier('data-loc'), t.stringLiteral(loc)),
        )
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Vite plugin: serves the annotation REST endpoint and injects the overlay.
// ---------------------------------------------------------------------------
type StoredAnnotation = {
  id: string
  createdAt: string
  status: 'new' | 'done'
  text: string
  loc: string | null
  route: string
  rect: { x: number; y: number; w: number; h: number } | null
  elementTag: string | null
  elementText: string | null
  shot: string | null
  images: string[]
  reply?: string
}

function sendJson(res: ServerResponse, code: number, data: unknown) {
  const body = JSON.stringify(data)
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(body)
}

function readBody(req: IncomingMessage, limit = 64 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > limit) {
        reject(new Error('payload too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function annotationsPlugin(): Plugin {
  let root = process.cwd()
  const dir = () => path.join(root, '.context', 'annotations')
  const jsonPath = () => path.join(root, '.context', 'annotations.json')

  function ensure() {
    fs.mkdirSync(dir(), { recursive: true })
    if (!fs.existsSync(jsonPath())) {
      fs.writeFileSync(jsonPath(), JSON.stringify({ annotations: [] }, null, 2))
    }
  }

  function load(): { annotations: StoredAnnotation[] } {
    try {
      return JSON.parse(fs.readFileSync(jsonPath(), 'utf8'))
    } catch {
      return { annotations: [] }
    }
  }

  function save(data: { annotations: StoredAnnotation[] }) {
    fs.writeFileSync(jsonPath(), JSON.stringify(data, null, 2))
  }

  function saveDataUrl(id: string, name: string, dataUrl: string): string | null {
    const m = /^data:(image\/[a-zA-Z+]+);base64,(.*)$/s.exec(dataUrl || '')
    if (!m) return null
    const ext = m[1].split('/')[1].replace('+xml', '').replace('jpeg', 'jpg')
    const fileName = `${name}.${ext}`
    const rel = path.join('.context', 'annotations', id, fileName)
    const abs = path.join(root, rel)
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, Buffer.from(m[2], 'base64'))
    return rel
  }

  return {
    name: 'annotations-server',
    apply: 'serve',
    configResolved(c) {
      root = c.root
    },
    configureServer(server) {
      ensure()
      server.middlewares.use('/__annotations', async (req, res) => {
        try {
          const url = req.url || '/'
          // GET /  -> list all annotations
          if (req.method === 'GET' && (url === '/' || url.startsWith('/?'))) {
            return sendJson(res, 200, load())
          }
          // POST /clear -> wipe everything
          if (req.method === 'POST' && url.startsWith('/clear')) {
            save({ annotations: [] })
            fs.rmSync(dir(), { recursive: true, force: true })
            fs.mkdirSync(dir(), { recursive: true })
            return sendJson(res, 200, { ok: true })
          }
          // POST / -> create annotation
          if (req.method === 'POST' && (url === '/' || url.startsWith('/?'))) {
            const payload = JSON.parse((await readBody(req)) || '{}')
            const id = `${Date.now().toString(36)}-${Math.floor(
              (Date.now() % 1000) + (payload.seq || 0),
            ).toString(36)}`
            const shot = payload.shot ? saveDataUrl(id, 'shot', payload.shot) : null
            const images: string[] = []
            if (Array.isArray(payload.images)) {
              payload.images.forEach((d: string, i: number) => {
                const saved = saveDataUrl(id, `img-${i}`, d)
                if (saved) images.push(saved)
              })
            }
            const entry: StoredAnnotation = {
              id,
              createdAt: new Date().toISOString(),
              status: 'new',
              text: String(payload.text || ''),
              loc: payload.loc || null,
              route: String(payload.route || '/'),
              rect: payload.rect || null,
              elementTag: payload.elementTag || null,
              elementText: payload.elementText || null,
              shot,
              images,
            }
            const data = load()
            data.annotations.push(entry)
            save(data)
            return sendJson(res, 200, { ok: true, annotation: entry })
          }
          sendJson(res, 404, { ok: false, error: 'not found' })
        } catch (e: any) {
          sendJson(res, 500, { ok: false, error: String(e?.message || e) })
        }
      })
    },
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module', src: '/devtools/annotations-overlay.ts' },
          injectTo: 'body',
        },
      ]
    },
  }
}
