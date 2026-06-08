import type { Annotation } from '@/app/types/agent';

// Prototype-grade revision applicators. They make a subtle in-place edit on
// the targeted block so reviewers can see the v2 content has actually
// shifted — but no banners / revision logs. The change history surfaces in
// the artifact viewer's top-right version dropdown instead.

export function applyMarkdownRevisions(src: string, batch: Annotation[]): string {
  const lines = src.split('\n');
  for (const a of batch) {
    const m = /^([a-z0-9]+)\[(\d+)\]/.exec(a.anchor.descriptor);
    if (!m) continue;
    const tag = m[1];
    const idx = Number(m[2]);
    let seen = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let kind = '';
      if (/^#{1,6}\s+/.test(line)) {
        const h = line.match(/^(#{1,6})\s+/);
        kind = `h${h ? h[1].length : 1}`;
      } else if (/^\s*[-*]\s+/.test(line)) kind = 'li';
      else if (/^\s*\d+\.\s+/.test(line)) kind = 'li';
      else if (/^>\s?/.test(line)) kind = 'blockquote';
      else if (line.trim() && !/^```/.test(line)) kind = 'p';
      if (kind === tag) {
        seen++;
        if (seen === idx) {
          // Tiny italic suffix at the end of the block to signal the edit
          // landed there. Not a banner — just a hint.
          lines[i] = lines[i].replace(/\s*$/, '') + ` *（已按批注调整）*`;
          break;
        }
      }
    }
  }
  return lines.join('\n');
}

export function applyHtmlRevisions(src: string, batch: Annotation[]): string {
  // No-op for the prototype: we surface the revision summary via the version
  // dropdown in the artifact toolbar instead of polluting the artifact with
  // a sticky in-iframe banner.
  void batch;
  return src;
}
