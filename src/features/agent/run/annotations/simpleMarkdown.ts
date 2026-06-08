// Minimal Markdown renderer for prototype artifacts.
// Handles: # headings, paragraphs, **bold**, *italic*, `code`, [link](url),
// > blockquote, - / * / 1. lists, ``` fenced code blocks, --- hr.
// Not a real Markdown engine — just enough for the in-message annotation demo.

const ESCAPE: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPE[c]);

function renderInline(text: string): string {
  let s = escapeHtml(text);
  // Inline code spans first so other formatting doesn't eat them.
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold then italic.
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Links.
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return s;
}

export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf: string[] = [];
  let listKind: 'ul' | 'ol' | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${renderInline(para.join(' '))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (listKind) {
      out.push(`</${listKind}>`);
      listKind = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inCode) {
      if (/^```/.test(line)) {
        out.push(`<pre data-lang="${escapeHtml(codeLang)}"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        inCode = false;
        codeBuf = [];
        codeLang = '';
      } else {
        codeBuf.push(line);
      }
      continue;
    }

    const fence = line.match(/^```\s*([\w-]*)\s*$/);
    if (fence) {
      flushPara();
      closeList();
      inCode = true;
      codeLang = fence[1] || '';
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushPara();
      closeList();
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      flushPara();
      closeList();
      out.push('<hr />');
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushPara();
      closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const ulItem = line.match(/^\s*[-*]\s+(.*)$/);
    const olItem = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ulItem || olItem) {
      flushPara();
      const kind: 'ul' | 'ol' = ulItem ? 'ul' : 'ol';
      if (listKind !== kind) {
        closeList();
        out.push(`<${kind}>`);
        listKind = kind;
      }
      const item = (ulItem ? ulItem[1] : olItem![1]);
      out.push(`<li>${renderInline(item)}</li>`);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushPara();
      closeList();
      out.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
      continue;
    }

    para.push(line.trim());
  }

  if (inCode) {
    out.push(`<pre data-lang="${escapeHtml(codeLang)}"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  }
  flushPara();
  closeList();
  return out.join('\n');
}
