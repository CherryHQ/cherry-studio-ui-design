import React, { useState } from 'react';
import {
  ChevronRight, Copy, Check, X,
  Brain, GitBranch, Download, ZoomIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard } from '@/app/utils/clipboard';
import { highlightLine } from '@/app/utils/syntaxHighlight';
import { shakeAnimation } from '@/app/config/animations';

// ===========================
// ThinkingBlock (collapsible thinking process)
// ===========================

export function ThinkingBlock({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = content.split('\n');
  const previewLines = lines.slice(0, 2).join(' ').slice(0, 80);

  return (
    <div className="my-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-2.5 py-[6px] rounded-lg text-left hover:bg-accent/10 transition-colors text-[10px] group"
      >
        <motion.div {...shakeAnimation} className="flex items-center justify-center flex-shrink-0">
          <Brain size={11} className="text-purple-500/70" />
        </motion.div>
        <span className="text-foreground/60 text-[10px]">思考过程</span>
        <span className="flex-1 text-muted-foreground/40 truncate text-[9px]">
          {!expanded && previewLines + '...'}
        </span>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.1 }}>
          <ChevronRight size={9} className="text-muted-foreground/40" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 ml-5">
              <pre className="text-[10px] text-muted-foreground/50 leading-[1.7] whitespace-pre-wrap font-sans">
                {content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// InlineCodeBlock (code block with syntax highlighting)
// ===========================

export function InlineCodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = () => {
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-2.5 rounded-lg overflow-hidden border border-border/30">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/20">
        <span className="text-[9px] text-muted-foreground">{language}</span>
        <button onClick={handleCopy} className="p-1 rounded text-muted-foreground/50 hover:text-foreground transition-colors text-[10px]">
          {copied ? <Check size={10} className="text-cherry-primary" /> : <Copy size={10} />}
        </button>
      </div>
      <pre className="px-3 py-2.5 overflow-x-auto text-[10.5px] leading-[1.7] font-mono bg-muted/15 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-7 text-right pr-2 text-[9px] text-muted-foreground/25 select-none flex-shrink-0 tabular-nums">{i + 1}</span>
            <span className="flex-1">{highlightLine(line)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

// ===========================
// MermaidBlock (mock mermaid diagram render)
// ===========================

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
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border/20">
        <div className="flex items-center gap-1.5">
          <GitBranch size={10} className="text-muted-foreground/60" />
          <span className="text-[9px] text-muted-foreground/60">Mermaid 图表</span>
        </div>
        <button onClick={() => { copyToClipboard(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="p-1 rounded text-muted-foreground/50 hover:text-foreground transition-colors">
          {copied ? <Check size={10} className="text-cherry-primary" /> : <Copy size={10} />}
        </button>
      </div>
      <div className="p-4 bg-muted/8 min-h-[120px]">
        <div className="flex flex-col items-center gap-3">
          {nodes.slice(0, 8).map((node, i) => (
            <div key={node.id} className="flex flex-col items-center gap-3">
              {i > 0 && <div className="w-px h-3 bg-border/30" />}
              <div className={`px-3 py-1.5 rounded-lg border text-[10px] text-center min-w-[100px] ${
                i === 0 ? 'bg-accent/30 border-border/40 text-foreground/80' :
                'bg-accent/15 border-border/25 text-foreground/65'
              }`}>
                {node.label}
              </div>
              {i === 0 && nodes.length > 3 && (
                <div className="flex items-start gap-4">
                  {nodes.slice(1, 4).map((child) => (
                    <div key={child.id} className="flex flex-col items-center gap-1.5">
                      <div className="w-px h-3 bg-border/30" />
                      <div className="px-2.5 py-1 rounded-md border bg-accent/15 border-border/25 text-[9px] text-foreground/65 text-center min-w-[70px]">
                        {child.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )).slice(0, 2)}
        </div>
        <p className="text-[9px] text-muted-foreground/40 text-center mt-3 italic">
          Mermaid 图表预览（完整渲染需安装 mermaid 插件）
        </p>
      </div>
      <details className="border-t border-border/15">
        <summary className="px-3 py-1.5 text-[9px] text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors">
          查看源码
        </summary>
        <pre className="px-3 pb-2 text-[9px] leading-[1.6] font-mono text-muted-foreground/60 whitespace-pre-wrap">{code}</pre>
      </details>
    </div>
  );
}

// ===========================
// ImageGallery (with lightbox)
// ===========================

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
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button className="p-1.5 rounded-full bg-black/50 text-white"><ZoomIn size={12} /></button>
                <button className="p-1.5 rounded-full bg-black/50 text-white"><Download size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8"
            onClick={() => setLightbox(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={lightbox} alt="Preview"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
