import React, { useEffect, useRef } from 'react';
import { ANNOT_CHANNEL, injectProbe } from './iframeProbe';
import type { Annotation, AnnotationAnchor } from '@/app/types/agent';

interface Props {
  html: string;
  device?: 'desktop' | 'tablet' | 'mobile';
  refreshKey: number;
  annotations: Annotation[];
  enabled: boolean;
  /** Bumped to scroll the in-iframe focus pin (best effort). */
  focusAnnotationId?: string | null;
  onSelectAnchor: (anchor: AnnotationAnchor, position: { x: number; y: number }) => void;
  /** Pin hover bridge — same contract as MarkdownArtifact. The probe inside
   *  the iframe posts pinHover / pinLeave messages and we translate them
   *  into viewport coords before bubbling up. */
  onPinHover?: (info: { id: string; rect: { x: number; y: number; w: number; h: number } } | null) => void;
}

export function HtmlArtifactWithProbe({ html, device = 'desktop', refreshKey, annotations, enabled, focusAnnotationId, onSelectAnchor, onPinHover }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Inline (no useMemo) so HMR edits to the probe always land fresh on the
  // next render; injectProbe is a cheap string replace, not worth caching.
  const srcDoc = injectProbe(html);
  const deviceWidth = device === 'mobile' ? 375 : device === 'tablet' ? 768 : '100%';

  // Listen for probe messages and translate them into annotation requests.
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const msg = ev.data;
      if (!msg || msg.source !== ANNOT_CHANNEL) return;
      if (msg.type === 'ready') {
        // Probe is alive — re-send the current enabled state + highlights.
        try {
          iframeRef.current?.contentWindow?.postMessage(
            { source: ANNOT_CHANNEL, type: 'setEnabled', payload: enabledRef.current },
            '*',
          );
          iframeRef.current?.contentWindow?.postMessage(
            { source: ANNOT_CHANNEL, type: 'applyHighlights', payload: annotations.map(a => ({ id: a.id, descriptor: a.anchor.descriptor })) },
            '*',
          );
        } catch { /* noop */ }
        return;
      }
      const iframe = iframeRef.current;
      if (!iframe) return;
      const rect = iframe.getBoundingClientRect();
      const offsetX = rect.left;
      const offsetY = rect.top;
      // Pin hover translates iframe-relative coords to viewport coords, then
      // delegates to the host. This works regardless of annotation mode.
      if (msg.type === 'pinHover' && onPinHover) {
        const p = msg.payload;
        onPinHover({
          id: p.id,
          rect: { x: offsetX + p.rect.x, y: offsetY + p.rect.y, w: p.rect.w, h: p.rect.h },
        });
        return;
      }
      if (msg.type === 'pinLeave' && onPinHover) {
        onPinHover(null);
        return;
      }
      if (!enabledRef.current) return;
      if (msg.type === 'selectionAnchor') {
        const p = msg.payload;
        const anchor: AnnotationAnchor = {
          kind: 'text',
          label: `${p.blockTag ? `<${p.blockTag}>` : '段落'} · 第 ${Number(p.blockIdx || 0) + 1} 个`,
          excerpt: p.excerpt,
          descriptor: p.descriptor,
        };
        onSelectAnchor(anchor, { x: offsetX + p.rect.x + p.rect.w / 2 - 150, y: offsetY + p.rect.y + p.rect.h });
      } else if (msg.type === 'elementAnchor') {
        const p = msg.payload;
        const anchor: AnnotationAnchor = {
          kind: 'element',
          label: `<${p.tag}> · 第 ${Number(p.index || 0) + 1} 个`,
          excerpt: p.excerpt,
          descriptor: p.descriptor,
        };
        onSelectAnchor(anchor, { x: offsetX + p.rect.x + p.rect.w / 2 - 150, y: offsetY + p.rect.y + p.rect.h + 6 });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [annotations, onSelectAnchor, onPinHover]);

  // Push enabled flag + highlights to the probe when they change.
  useEffect(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { source: ANNOT_CHANNEL, type: 'setEnabled', payload: enabled },
        '*',
      );
    } catch { /* noop */ }
  }, [enabled]);

  useEffect(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { source: ANNOT_CHANNEL, type: 'applyHighlights', payload: annotations.map(a => ({ id: a.id, descriptor: a.anchor.descriptor })) },
        '*',
      );
    } catch { /* noop */ }
  }, [annotations]);

  // focusAnnotationId — could scroll the iframe to bring the marker into view.
  useEffect(() => {
    if (!focusAnnotationId) return;
    const a = annotations.find(x => x.id === focusAnnotationId);
    if (!a) return;
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { source: ANNOT_CHANNEL, type: 'scrollTo', payload: { descriptor: a.anchor.descriptor } },
        '*',
      );
    } catch { /* noop */ }
  }, [focusAnnotationId, annotations]);

  return (
    <div className="h-full w-full flex justify-center" style={device !== 'desktop' ? { padding: '16px' } : undefined}>
      <div
        className={`bg-background h-full overflow-hidden ${device !== 'desktop' ? 'rounded-lg shadow-lg border border-border/20' : 'w-full'}`}
        style={device !== 'desktop' ? { width: deviceWidth, maxWidth: '100%' } : undefined}
      >
        <iframe
          ref={iframeRef}
          key={refreshKey}
          srcDoc={srcDoc}
          className="w-full h-full border-0"
          title="预览"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}
