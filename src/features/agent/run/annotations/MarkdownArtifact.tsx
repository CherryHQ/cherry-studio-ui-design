import React, { useEffect, useMemo, useRef } from 'react';
import { renderMarkdown } from './simpleMarkdown';
import type { Annotation, AnnotationAnchor } from '@/app/types/agent';

interface Props {
  content: string;
  annotations: Annotation[];
  enabled: boolean;
  /** Called when the user finishes a text selection while annotation mode is
   *  on. The host should open a comment popover anchored at `position`. */
  onSelectAnchor: (anchor: AnnotationAnchor, position: { x: number; y: number }) => void;
  /** Bump this when the host wants to scroll the artifact to a specific
   *  annotation marker (focus from the side panel). */
  focusAnnotationId?: string | null;
  /** Called when the user hovers (or focus-leaves) an annotation pin. The
   *  host then renders the `AnnotationPinPopover` at the supplied viewport
   *  rect. Passing `null` indicates the pointer has left the pin. */
  onPinHover?: (info: { id: string; rect: { x: number; y: number; w: number; h: number } } | null) => void;
}

function describeBlock(node: HTMLElement, root: HTMLElement): { tag: string; index: number; label: string } {
  // Walk up to nearest block-level tag inside the root.
  let n: HTMLElement | null = node;
  while (n && n !== root) {
    const t = n.tagName.toLowerCase();
    if (/^(p|li|h1|h2|h3|h4|h5|h6|blockquote|td|th)$/.test(t)) break;
    n = n.parentElement;
  }
  if (!n || n === root) return { tag: 'p', index: 0, label: '段落' };
  const tag = n.tagName.toLowerCase();
  const same = root.querySelectorAll(tag);
  let index = 0;
  for (let i = 0; i < same.length; i++) {
    if (same[i] === n) { index = i; break; }
  }
  const labelMap: Record<string, string> = {
    p: '段落', li: '列表项', h1: '一级标题', h2: '二级标题', h3: '三级标题', h4: '四级标题', h5: '五级标题', h6: '六级标题', blockquote: '引用',
  };
  return { tag, index, label: `${labelMap[tag] || tag} · 第 ${index + 1} 个` };
}

export function MarkdownArtifact({ content, annotations, enabled, onSelectAnchor, focusAnnotationId, onPinHover }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const html = useMemo(() => renderMarkdown(content), [content]);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;
    // Defer the read by one tick so the selection is fully committed; this
    // also gives the browser a chance to update Selection state after a
    // click-and-drag completes inside a contenteditable-free element.
    const onUp = () => {
      window.setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
        const text = sel.toString();
        if (!text || text.trim().length < 2) return;
        const range = sel.getRangeAt(0);
        // Reject selections that don't intersect with this artifact (e.g.
        // user selecting in the side chat instead).
        if (!root.contains(range.commonAncestorContainer)) {
          // Also accept the case where commonAncestor IS the root itself
          // (happens when selecting across two top-level blocks).
          if (range.commonAncestorContainer !== root) return;
        }
        const rect = range.getBoundingClientRect();
        let container: HTMLElement | null = range.commonAncestorContainer.nodeType === 3
          ? (range.commonAncestorContainer.parentElement as HTMLElement)
          : (range.commonAncestorContainer as HTMLElement);
        if (!container) return;
        const block = describeBlock(container, root);
        const anchor: AnnotationAnchor = {
          kind: 'text',
          label: block.label,
          excerpt: text.trim().slice(0, 200),
          descriptor: `${block.tag}[${block.index}]/text`,
        };
        // Anchor popover under the selection.
        onSelectAnchor(anchor, { x: rect.left, y: rect.bottom + 8 });
      }, 0);
    };
    document.addEventListener('mouseup', onUp);
    return () => document.removeEventListener('mouseup', onUp);
  }, [enabled, onSelectAnchor]);

  // Render highlights — paint a wash + pin number on each annotated block.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Clear previous marker classes.
    root.querySelectorAll('.cherry-annot-wash').forEach(n => n.remove());
    root.querySelectorAll('[data-annot-pinned="true"]').forEach(n => {
      (n as HTMLElement).removeAttribute('data-annot-pinned');
      (n as HTMLElement).style.removeProperty('background-color');
      (n as HTMLElement).style.removeProperty('box-shadow');
    });

    annotations.forEach((a, i) => {
      const m = /^([a-z0-9]+)\[(\d+)\]/.exec(a.anchor.descriptor);
      if (!m) return;
      const sels = root.querySelectorAll(m[1]);
      const idx = Number(m[2]);
      const node = sels[idx] as HTMLElement | undefined;
      if (!node) return;
      node.setAttribute('data-annot-pinned', 'true');
      node.style.backgroundColor = 'rgba(245,158,11,0.08)';
      node.style.boxShadow = 'inset 3px 0 0 rgba(245,158,11,0.7)';
      // Add a numeric pin (absolutely positioned via inline span).
      const pin = document.createElement('span');
      pin.className = 'cherry-annot-wash';
      pin.setAttribute('data-annot-id', a.id);
      pin.textContent = String(i + 1);
      pin.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:9999px;background:#f59e0b;color:#fff;font-size:9px;font-weight:600;line-height:1;margin-left:6px;vertical-align:middle;cursor:pointer;transition:transform .12s;';
      node.appendChild(pin);
    });
  }, [annotations, html]);

  // Pin hover delegation — emit hovered annotation id + viewport rect of the
  // pin so the host can render an overlay popover anchored to it.
  useEffect(() => {
    if (!onPinHover) return;
    const root = rootRef.current;
    if (!root) return;
    let leaveTimer: number | null = null;
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const pin = target.closest('[data-annot-id]') as HTMLElement | null;
      if (!pin || !root.contains(pin)) return;
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
      const id = pin.getAttribute('data-annot-id') || '';
      const r = pin.getBoundingClientRect();
      pin.style.transform = 'scale(1.15)';
      onPinHover({ id, rect: { x: r.left, y: r.top, w: r.width, h: r.height } });
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const pin = target.closest('[data-annot-id]') as HTMLElement | null;
      if (!pin) return;
      pin.style.transform = '';
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => onPinHover(null), 220);
    };
    root.addEventListener('mouseover', onOver);
    root.addEventListener('mouseout', onOut);
    return () => {
      root.removeEventListener('mouseover', onOver);
      root.removeEventListener('mouseout', onOut);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [onPinHover, annotations]);

  // Focus an annotation (scroll into view + brief flash).
  useEffect(() => {
    if (!focusAnnotationId) return;
    const root = rootRef.current;
    if (!root) return;
    const a = annotations.find(x => x.id === focusAnnotationId);
    if (!a) return;
    const m = /^([a-z0-9]+)\[(\d+)\]/.exec(a.anchor.descriptor);
    if (!m) return;
    const sels = root.querySelectorAll(m[1]);
    const node = sels[Number(m[2])] as HTMLElement | undefined;
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const prev = node.style.outline;
    node.style.outline = '2px solid rgba(245,158,11,.7)';
    setTimeout(() => { node.style.outline = prev; }, 900);
  }, [focusAnnotationId, annotations]);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-background">
      <article
        ref={rootRef}
        className={`cherry-md-artifact select-text mx-auto max-w-[760px] px-8 py-10 text-foreground ${enabled ? 'cherry-md-annot-on' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        /* The page-level container in AgentRunPage uses select-none for UX
           polish; explicitly allow selection inside the MD artifact so the
           annotation flow can actually capture user text selections. */
        .cherry-md-artifact, .cherry-md-artifact * { -webkit-user-select: text; user-select: text; }
        .cherry-md-artifact { font-size: 14px; line-height: 1.75; }
        .cherry-md-artifact h1 { font-size: 24px; font-weight: 600; margin: 0 0 16px; letter-spacing: -0.01em; }
        .cherry-md-artifact h2 { font-size: 18px; font-weight: 600; margin: 28px 0 10px; letter-spacing: -0.005em; }
        .cherry-md-artifact h3 { font-size: 15px; font-weight: 600; margin: 20px 0 8px; }
        .cherry-md-artifact p { margin: 0 0 12px; }
        .cherry-md-artifact ul, .cherry-md-artifact ol { margin: 0 0 12px; padding-left: 22px; }
        .cherry-md-artifact li { margin-bottom: 4px; }
        .cherry-md-artifact blockquote {
          margin: 12px 0; padding: 4px 12px;
          border-left: 3px solid hsl(var(--border)); color: hsl(var(--muted-foreground)); background: hsl(var(--accent)/0.3);
          border-radius: 0 6px 6px 0;
        }
        .cherry-md-artifact code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px;
          padding: 1px 5px; border-radius: 4px; background: hsl(var(--accent)/0.5);
        }
        .cherry-md-artifact pre {
          background: hsl(var(--accent)/0.4); padding: 12px 14px; border-radius: 8px; overflow-x: auto;
          margin: 0 0 14px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px;
        }
        .cherry-md-artifact pre code { background: transparent; padding: 0; }
        .cherry-md-artifact a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
        .cherry-md-artifact hr { margin: 22px 0; border: 0; border-top: 1px solid hsl(var(--border)/0.5); }
        .cherry-md-annot-on { cursor: text; }
        .cherry-md-annot-on::selection { background: rgba(245,158,11,0.25); }
        .cherry-md-annot-on *::selection { background: rgba(245,158,11,0.25); }
        [data-annot-pinned="true"] { border-radius: 4px; padding-left: 8px; transition: background-color .15s; }
      `}</style>
    </div>
  );
}
