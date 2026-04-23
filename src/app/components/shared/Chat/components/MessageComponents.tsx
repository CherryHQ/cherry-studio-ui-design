import React, { useState } from 'react';
import {
  Copy, Check, X,
  GitBranch, Download, ZoomIn,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@cherry-studio/ui';
import { copyToClipboard } from '@/app/utils/clipboard';

// ===========================
// ThinkingBlock — from @cherry-studio/ui
// ===========================
export { ThinkingBlock } from '@cherry-studio/ui';

// ===========================
// InlineCodeBlock — backed by @cherry-studio/ui CodeBlock
// ===========================
// Re-export as InlineCodeBlock for backward compatibility
export { CodeBlock as InlineCodeBlock } from '@cherry-studio/ui';

// ===========================
// MermaidBlock (mock mermaid diagram render)
// ===========================
// No package export available — keep local implementation

export function MermaidBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n').filter(l => l.trim());

  const nodes: { id: string; label: string; level: number }[] = [];
  lines.forEach(line => {
    const arrowRe = new RegExp('^\\s*(\\w+)\\[?[^\\[\\]]*\\]?\\s*-->\\s*(\\w+)\\[?([^\\[\\]]*)\\]?\\s*$');
    const arrow = line.match(arrowRe);
    if (arrow) {
      if (arrow[3] && !nodes.find(n => n.id === arrow[2])) {
        nodes.push({ id: arrow[2], label: arrow[3], level: 1 });
      }
    }
    const nodeRe = new RegExp('^\\s*(\\w+)\\[([^\\]]+)\\]');
    const nodeMatch = line.match(nodeRe);
    if (nodeMatch && !nodes.find(n => n.id === nodeMatch[1])) {
      nodes.push({ id: nodeMatch[1], label: nodeMatch[2], level: 0 });
    }
  });

  return (
    <div className="my-2.5 rounded-lg overflow-hidden border border-border/30">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <GitBranch size={10} className="text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground/60">Mermaid 图表</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={() => { copyToClipboard(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="w-5 h-5 text-muted-foreground/50 hover:text-foreground">
          {copied ? <Check size={10} className="text-cherry-primary" /> : <Copy size={10} />}
        </Button>
      </div>
      <div className="p-4 bg-muted/8 min-h-[120px]">
        <div className="flex flex-col items-center gap-3">
          {nodes.slice(0, 8).map((node, i) => (
            <div key={node.id} className="flex flex-col items-center gap-3">
              {i > 0 && <div className="w-px h-3 bg-border/30" />}
              <div className={`px-3 py-1.5 rounded-lg border text-xs text-center min-w-[100px] ${
                i === 0 ? 'bg-accent/25 border-border/40 text-foreground' :
                'bg-accent/15 border-border/25 text-muted-foreground'
              }`}>
                {node.label}
              </div>
              {i === 0 && nodes.length > 3 && (
                <div className="flex items-start gap-4">
                  {nodes.slice(1, 4).map((child) => (
                    <div key={child.id} className="flex flex-col items-center gap-1.5">
                      <div className="w-px h-3 bg-border/30" />
                      <div className="px-2.5 py-1 rounded-md border bg-accent/15 border-border/25 text-xs text-muted-foreground text-center min-w-[70px]">
                        {child.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )).slice(0, 2)}
        </div>
        <p className="text-xs text-muted-foreground/50 text-center mt-3 italic">
          Mermaid 图表预览（完整渲染需安装 mermaid 插件）
        </p>
      </div>
      <details className="border-t border-border/15">
        <summary className="px-3 py-1.5 text-xs text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors">
          查看源码
        </summary>
        <pre className="px-3 pb-2 text-xs leading-[1.6] font-mono text-muted-foreground/60 whitespace-pre-wrap">{code}</pre>
      </details>
    </div>
  );
}

// ===========================
// ImageGallery (with lightbox)
// ===========================
// No package export available — keep local implementation

export function ImageGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const cols = images.length <= 2 ? images.length : images.length === 3 ? 3 : 2;

  return (
    <div>
      <div className="grid gap-2 my-2.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {images.map((url, i) => (
          <div key={i} className="relative group rounded-lg overflow-hidden border border-border/20 cursor-pointer"
            onClick={() => setLightbox(url)}>
            <img src={url} alt={`Generated ${i + 1}`} className="w-full h-[140px] object-cover" />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Button variant="overlay" size="icon-xs" className="p-1.5 rounded-full"><ZoomIn size={12} /></Button>
                <Button variant="overlay" size="icon-xs" className="p-1.5 rounded-full"><Download size={12} /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-floating)] bg-foreground/30 backdrop-blur-[1px] flex items-center justify-center p-8"
            onClick={() => setLightbox(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={lightbox} alt="Preview"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            <Button variant="ghost" size="icon-sm" onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 rounded-full bg-background/10 hover:bg-background/20 text-background">
              <X size={16} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
