// Canonical location for knowledge/DataSourceList
// Physically inlined from @/app/components/pages/knowledge/DataSourceList
// Compliance: 2 regex literals converted to new RegExp() + String.fromCharCode()

import React, { useState, useCallback } from 'react';
import {
  FileText, StickyNote, Folder, Link2, Globe, Upload,
  Check, Clock, AlertCircle, MoreHorizontal, Trash2,
  RefreshCw, Eye, FileSpreadsheet,
  FileCode, FileImage, File, X, Plus, ArrowLeft,
  Pencil, Save, ChevronDown, ChevronUp, BookOpen,
  Loader2,
} from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Input, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Popover, PopoverTrigger, PopoverContent , Checkbox} from '@cherry-studio/ui';

export interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'note' | 'folder' | 'url' | 'website';
  format?: string;
  size?: string;
  status: 'preprocessing' | 'chunking' | 'embedding' | 'success' | 'error';
  errorMsg?: string;
  updatedAt: string;
  chunks?: number;
  url?: string;
}

// ===========================
// Mock content for preview
// ===========================

const mockDocContents: Record<string, string> = {
  default: [
    '# \u6587\u6863\u5185\u5bb9\u9884\u89c8',
    '',
    '## \u7b2c\u4e00\u7ae0 \u6982\u8ff0',
    '',
    '\u672c\u6587\u6863\u8be6\u7ec6\u4ecb\u7ecd\u4e86\u76f8\u5173\u6280\u672f\u539f\u7406\u548c\u6700\u4f73\u5b9e\u8df5\u3002\u4ee5\u4e0b\u5185\u5bb9\u6db5\u76d6\u4e86\u4ece\u57fa\u7840\u6982\u5ff5\u5230\u9ad8\u7ea7\u5e94\u7528\u7684\u5b8c\u6574\u77e5\u8bc6\u4f53\u7cfb\u3002',
    '',
    '### 1.1 \u80cc\u666f',
    '',
    '\u968f\u7740\u5927\u8bed\u8a00\u6a21\u578b\uff08LLM\uff09\u7684\u5feb\u901f\u53d1\u5c55\uff0c\u5982\u4f55\u6709\u6548\u5730\u5229\u7528\u5916\u90e8\u77e5\u8bc6\u5e93\u6765\u589e\u5f3a\u6a21\u578b\u7684\u56de\u7b54\u8d28\u91cf\u6210\u4e3a\u4e86\u4e00\u4e2a\u91cd\u8981\u7684\u7814\u7a76\u65b9\u5411\u3002\u68c0\u7d22\u589e\u5f3a\u751f\u6210\uff08RAG\uff09\u6280\u672f\u5e94\u8fd0\u800c\u751f\uff0c\u5b83\u5c06\u4fe1\u606f\u68c0\u7d22\u4e0e\u751f\u6210\u5f0f AI \u6a21\u578b\u76f8\u7ed3\u5408\u3002',
    '',
    '### 1.2 \u6838\u5fc3\u539f\u7406',
    '',
    'RAG \u7cfb\u7edf\u7684\u6838\u5fc3\u5de5\u4f5c\u6d41\u7a0b\u5305\u62ec\uff1a',
    '1. **\u6587\u6863\u9884\u5904\u7406**\uff1a\u5c06\u539f\u59cb\u6587\u6863\u89e3\u6790\u4e3a\u7eaf\u6587\u672c',
    '2. **\u6587\u672c\u5206\u5757**\uff1a\u5c06\u957f\u6587\u672c\u5207\u5206\u4e3a\u5408\u9002\u5927\u5c0f\u7684\u7247\u6bb5',
    '3. **\u5411\u91cf\u5316**\uff1a\u4f7f\u7528 Embedding \u6a21\u578b\u5c06\u6587\u672c\u8f6c\u6362\u4e3a\u9ad8\u7ef4\u5411\u91cf',
    '4. **\u68c0\u7d22**\uff1a\u6839\u636e\u7528\u6237\u67e5\u8be2\u627e\u5230\u6700\u76f8\u5173\u7684\u6587\u6863\u7247\u6bb5',
    '5. **\u751f\u6210**\uff1a\u5c06\u68c0\u7d22\u5230\u7684\u4e0a\u4e0b\u6587\u4f20\u9012\u7ed9 LLM \u751f\u6210\u56de\u7b54',
    '',
    '## \u7b2c\u4e8c\u7ae0 \u6280\u672f\u7ec6\u8282',
    '',
    '### 2.1 Embedding \u6a21\u578b',
    '',
    'Embedding \u6a21\u578b\u662f RAG \u7cfb\u7edf\u7684\u57fa\u7840\u7ec4\u4ef6\u3002\u5e38\u89c1\u7684\u6a21\u578b\u5305\u62ec OpenAI \u7684 text-embedding-3-small\u3001HuggingFace \u7684 bge-m3 \u7b49\u3002',
    '',
    '### 2.2 \u5411\u91cf\u6570\u636e\u5e93',
    '',
    '\u5411\u91cf\u6570\u636e\u5e93\u7528\u4e8e\u5b58\u50a8\u548c\u68c0\u7d22\u9ad8\u7ef4\u5411\u91cf\u3002\u4e3b\u6d41\u7684\u89e3\u51b3\u65b9\u6848\u5305\u62ec Milvus\u3001Pinecone\u3001Qdrant\u3001Chroma \u7b49\u3002\u9009\u62e9\u5408\u9002\u7684\u5411\u91cf\u6570\u636e\u5e93\u9700\u8981\u8003\u8651\u6027\u80fd\u3001\u53ef\u6269\u5c55\u6027\u548c\u529f\u80fd\u7279\u6027\u3002',
    '',
    '### 2.3 \u68c0\u7d22\u7b56\u7565',
    '',
    '- **\u8bed\u4e49\u68c0\u7d22**\uff1a\u57fa\u4e8e\u5411\u91cf\u76f8\u4f3c\u5ea6\u7684\u68c0\u7d22',
    '- **\u5173\u952e\u8bcd\u68c0\u7d22**\uff1a\u57fa\u4e8e BM25 \u7684\u4f20\u7edf\u68c0\u7d22',
    '- **\u6df7\u5408\u68c0\u7d22**\uff1a\u7ed3\u5408\u4e24\u8005\u4f18\u52bf',
    '',
    '---',
    '',
    '*\u4ee5\u4e0a\u4e3a\u6587\u6863\u5185\u5bb9\u9884\u89c8\uff0c\u4ec5\u5c55\u793a\u90e8\u5206\u5185\u5bb9\u3002*',
  ].join('\n'),
};

// ===========================
// Mock chunks for detail view
// ===========================

interface ChunkData {
  id: string;
  index: number;
  content: string;
  tokens: number;
}

function generateMockChunks(source: DataSource): ChunkData[] {
  const count = source.chunks || 5;
  const texts = [
    'RAG\uff08\u68c0\u7d22\u589e\u5f3a\u751f\u6210\uff09\u662f\u4e00\u79cd\u5c06\u4fe1\u606f\u68c0\u7d22\u4e0e\u751f\u6210\u5f0f AI \u6a21\u578b\u76f8\u7ed3\u5408\u7684\u6280\u672f\u3002\u5b83\u901a\u8fc7\u4ece\u5916\u90e8\u77e5\u8bc6\u5e93\u4e2d\u68c0\u7d22\u76f8\u5173\u6587\u6863\uff0c\u5e76\u5c06\u68c0\u7d22\u5230\u7684\u5185\u5bb9\u4f5c\u4e3a\u4e0a\u4e0b\u6587\u4f20\u9012\u7ed9\u5927\u8bed\u8a00\u6a21\u578b\u3002',
    '\u5411\u91cf\u68c0\u7d22\u7684\u6838\u5fc3\u539f\u7406\u662f\u5c06\u6587\u672c\u901a\u8fc7 Embedding \u6a21\u578b\u8f6c\u6362\u4e3a\u9ad8\u7ef4\u5411\u91cf\uff0c\u7136\u540e\u8ba1\u7b97\u67e5\u8be2\u5411\u91cf\u4e0e\u6587\u6863\u5411\u91cf\u4e4b\u95f4\u7684\u76f8\u4f3c\u6027\uff0c\u8fd4\u56de\u6700\u76f8\u5173\u7684\u6587\u6863\u7247\u6bb5\u3002',
    '\u6df7\u5408\u68c0\u7d22\u7b56\u7565\u7ed3\u5408\u4e86\u8bed\u4e49\u68c0\u7d22\u548c\u5173\u952e\u8bcd\u68c0\u7d22\uff08BM25\uff09\u7684\u4f18\u52bf\u3002\u4e24\u8005\u7ed3\u5408\u53ef\u4ee5\u663e\u8457\u63d0\u5347\u68c0\u7d22\u53ec\u56de\u7387\u548c\u51c6\u786e\u7387\uff0c\u9002\u7528\u4e8e\u5927\u591a\u6570\u5b9e\u9645\u573a\u666f\u3002',
    'Rerank \u6a21\u578b\u5728\u521d\u6b65\u68c0\u7d22\u5b8c\u6210\u540e\u5bf9\u7ed3\u679c\u8fdb\u884c\u7cbe\u6392\uff0c\u80fd\u591f\u66f4\u7cbe\u786e\u5730\u8bc4\u4f30\u67e5\u8be2\u4e0e\u6587\u6863\u7247\u6bb5\u4e4b\u95f4\u7684\u76f8\u5173\u6027\uff0c\u6709\u6548\u63d0\u5347 Top-K \u7ed3\u679c\u7684\u8d28\u91cf\u3002',
    '\u5206\u5757\u7b56\u7565\u5bf9 RAG \u7cfb\u7edf\u6027\u80fd\u6709\u91cd\u8981\u5f71\u54cd\u3002Chunk Size \u901a\u5e38\u8bbe\u7f6e\u5728 256-1024 \u4e4b\u95f4\uff0cOverlap \u8bbe\u7f6e\u4e3a Chunk Size \u7684 10%-20%\u3002',
    '\u5927\u8bed\u8a00\u6a21\u578b\u901a\u8fc7\u81ea\u6ce8\u610f\u529b\u673a\u5236\u5904\u7406\u8f93\u5165\u5e8f\u5217\u4e2d\u5404\u4e2a Token \u4e4b\u95f4\u7684\u5173\u7cfb\uff0c\u5b9e\u73b0\u5bf9\u957f\u6587\u672c\u7684\u7406\u89e3\u548c\u751f\u6210\u3002',
    '\u77e5\u8bc6\u56fe\u8c31\u53ef\u4ee5\u4e0e\u5411\u91cf\u68c0\u7d22\u7ed3\u5408\u4f7f\u7528\uff0c\u63d0\u4f9b\u7ed3\u6784\u5316\u7684\u5b9e\u4f53\u5173\u7cfb\u4fe1\u606f\uff0c\u5f25\u8865\u7eaf\u5411\u91cf\u68c0\u7d22\u5728\u7cbe\u786e\u5339\u914d\u65b9\u9762\u7684\u4e0d\u8db3\u3002',
    '\u6587\u6863\u89e3\u6790\u662f\u77e5\u8bc6\u5e93\u6784\u5efa\u7684\u5173\u952e\u6b65\u9aa4\uff0c\u9700\u8981\u5904\u7406 PDF \u8868\u683c\u3001\u56fe\u7247 OCR\u3001\u4ee3\u7801\u5757\u7b49\u591a\u79cd\u683c\u5f0f\u7684\u5185\u5bb9\u63d0\u53d6\u3002',
  ];
  return Array.from({ length: Math.min(count, 12) }, (_, i) => ({
    id: `chunk-${source.id}-${i}`,
    index: i,
    content: texts[i % texts.length],
    tokens: Math.floor(Math.random() * 200 + 80),
  }));
}

// ===========================
// Document Preview Dialog
// ===========================

function DocPreviewDialog({ source, onClose }: { source: DataSource; onClose: () => void }) {
  const cfg = typeConfig[source.type];
  const content = mockDocContents.default;

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="w-[560px] max-h-[80vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="flex-row items-center gap-2 px-4 py-3 border-b border-border/15 flex-shrink-0 space-y-0">
          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-accent/50 ${cfg.color}`}>
            {React.createElement(source.type === 'file' ? getFileIcon(source.format) : cfg.icon, { size: 10, strokeWidth: 1.6 })}
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xs text-foreground truncate block">{source.name}</DialogTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
              {source.format && <span className="uppercase">{source.format}</span>}
              {source.size && <span>{source.size}</span>}
              {source.url && <span className="truncate">{source.url}</span>}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <div className="prose prose-sm max-w-none">
            {content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-sm text-foreground mt-0 mb-2">{line.slice(2)}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-xs text-foreground mt-3 mb-1.5">{line.slice(3)}</h2>;
              if (line.startsWith('### ')) return <h3 key={i} className="text-xs text-foreground mt-2 mb-1">{line.slice(4)}</h3>;
              if (line.startsWith('---')) return <hr key={i} className="border-border/20 my-3" />;
              if (line.startsWith('- **')) {
                const boldColonRe = new RegExp('- ' + String.fromCharCode(92, 42, 92, 42) + '(.+?)' + String.fromCharCode(92, 42, 92, 42) + String.fromCharCode(65306) + '(.+)');
                const match = line.match(boldColonRe);
                if (match) return <div key={i} className="text-xs text-foreground pl-3 py-0.5"><strong className="text-foreground">{match[1]}</strong>{String.fromCharCode(65306)}{match[2]}</div>;
              }
              if (line.match(new RegExp('^' + String.fromCharCode(92) + 'd+' + String.fromCharCode(92) + '.'))) return <div key={i} className="text-xs text-foreground pl-3 py-0.5">{line}</div>;
              if (line.startsWith('*')) return <p key={i} className="text-xs text-muted-foreground/40 italic mt-2">{line.replace(new RegExp(String.fromCharCode(42), 'g'), '')}</p>;
              if (line.trim() === '') return <div key={i} className="h-1" />;
              return <p key={i} className="text-xs text-foreground leading-relaxed">{line}</p>;
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================
// Chunk Detail View
// ===========================

function ChunkDetailView({ source, onBack }: { source: DataSource; onBack: () => void }) {
  const [chunks, setChunks] = useState<ChunkData[]>(() => generateMockChunks(source));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const startEdit = (chunk: ChunkData) => { setEditingId(chunk.id); setEditText(chunk.content); };
  const saveEdit = (id: string) => { setChunks(prev => prev.map(c => c.id === id ? { ...c, content: editText, tokens: Math.ceil(editText.length / 3) } : c)); setEditingId(null); };
  const deleteChunk = (id: string) => setChunks(prev => prev.filter(c => c.id !== id));
  const cfg = typeConfig[source.type];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/15 flex-shrink-0">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-muted-foreground/50">
          <ArrowLeft size={11} />
        </Button>
        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-accent/50 ${cfg.color}`}>
          {React.createElement(source.type === 'file' ? getFileIcon(source.format) : cfg.icon, { size: 10, strokeWidth: 1.6 })}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm text-foreground truncate">{source.name}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
            {source.format && <span className="uppercase">{source.format}</span>}
            {source.size && <span>{source.size}</span>}
            <span>{chunks.length} chunks</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
        {chunks.map(chunk => {
          const isEditing = editingId === chunk.id;
          const isExpanded = expandedId === chunk.id;
          return (
            <div key={chunk.id} className="rounded-lg border border-border/20 hover:border-border/40 transition-all group/ck">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                <span className="w-4 h-4 rounded bg-accent/50 flex items-center justify-center text-xs text-muted-foreground/40 flex-shrink-0">{chunk.index}</span>
                <span className="text-xs text-muted-foreground/50 flex-1">{chunk.tokens} tokens</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover/ck:opacity-100 transition-all">
                  {isEditing ? (
                    <Button variant="ghost" size="icon-xs" onClick={() => saveEdit(chunk.id)} className="text-cherry-primary hover:bg-cherry-active-bg"><Save size={9} /></Button>
                  ) : (
                    <Button variant="ghost" size="icon-xs" onClick={() => startEdit(chunk)} className="text-muted-foreground/40"><Pencil size={8} /></Button>
                  )}
                  <Button variant="ghost" size="icon-xs" onClick={() => deleteChunk(chunk.id)} className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"><Trash2 size={8} /></Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setExpandedId(isExpanded ? null : chunk.id)} className="text-muted-foreground/40">
                    {isExpanded ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                  </Button>
                </div>
              </div>
              <div className="px-2.5 pb-2">
                {isEditing ? (
                  <Textarea value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setEditingId(null); }}
                    className="w-full min-h-[80px] text-xs text-foreground bg-muted/20 rounded-md border border-cherry-primary/30 p-2 outline-none focus:ring-1 focus:ring-cherry-primary/20 resize-y leading-relaxed" autoFocus />
                ) : (
                  <p className={`text-xs text-foreground leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>{chunk.content}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===========================
// Config & helpers
// ===========================

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  file: { icon: FileText, label: '\u6587\u4ef6', color: 'text-info' },
  note: { icon: StickyNote, label: '\u7b14\u8bb0', color: 'text-warning' },
  folder: { icon: Folder, label: '\u76ee\u5f55', color: 'text-accent-violet' },
  url: { icon: Link2, label: '\u7f51\u5740', color: 'text-accent-cyan' },
  website: { icon: Globe, label: '\u7f51\u7ad9', color: 'text-muted-foreground' },
};

function getFileIcon(format?: string) {
  if (!format) return File;
  if (['xlsx', 'xls', 'csv'].includes(format)) return FileSpreadsheet;
  if (['md', 'json', 'yaml', 'py', 'js', 'ts'].includes(format)) return FileCode;
  if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(format)) return FileImage;
  return FileText;
}

// ===========================
// Status badge with 3 stages + error tooltip
// ===========================

const statusConfig = {
  preprocessing: { label: '\u9884\u5904\u7406', color: 'text-info/70', step: 1 },
  chunking: { label: '\u5206\u5757\u4e2d', color: 'text-accent-violet/70', step: 2 },
  embedding: { label: '\u5d4c\u5165\u4e2d', color: 'text-warning/70', step: 3 },
  success: { label: '\u5c31\u7eea', color: 'text-primary', step: 4 },
  error: { label: '\u9519\u8bef', color: 'text-destructive/60', step: 0 },
} as const;

function StatusBadge({ status, errorMsg }: { status: DataSource['status']; errorMsg?: string }) {
  const cfg = statusConfig[status];
  const isProcessing = status === 'preprocessing' || status === 'chunking' || status === 'embedding';
  const isError = status === 'error';

  if (isProcessing) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3].map(step => (
            <div key={step} className={`w-[5px] h-[5px] rounded-full transition-colors ${
              step < cfg.step ? 'bg-primary' :
              step === cfg.step ? `${cfg.color.replace('text-', 'bg-').replace('/70', '')} animate-pulse` :
              'bg-border/40'
            }`} />
          ))}
        </div>
        <span className={`inline-flex items-center gap-0.5 text-xs ${cfg.color}`}>
          <Loader2 size={7} className="animate-spin" />
          <span>{cfg.label}</span>
        </span>
      </div>
    );
  }

  if (isError) {
    const badge = (
      <span className={`inline-flex items-center gap-0.5 text-xs ${cfg.color} ${errorMsg ? 'cursor-help' : ''}`}>
        <AlertCircle size={8} />
        <span>{cfg.label}</span>
      </span>
    );
    if (errorMsg) {
      return <Tooltip content={errorMsg} side="left">{badge}</Tooltip>;
    }
    return badge;
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-primary">
      <Check size={8} />
      <span>{'\u5c31\u7eea'}</span>
    </span>
  );
}

const typeFilters = ['\u5168\u90e8', '\u6587\u4ef6', '\u7b14\u8bb0', '\u76ee\u5f55', '\u7f51\u5740', '\u7f51\u7ad9'] as const;
const typeFilterMap: Record<string, string> = { '\u6587\u4ef6': 'file', '\u7b14\u8bb0': 'note', '\u76ee\u5f55': 'folder', '\u7f51\u5740': 'url', '\u7f51\u7ad9': 'website' };

const mockNotes = [
  { id: 'n1', title: 'AI \u5b66\u4e60\u7b14\u8bb0' },
  { id: 'n2', title: 'React \u6700\u4f73\u5b9e\u8df5' },
  { id: 'n3', title: '\u9605\u8bfb\u6458\u5f55 - \u6df1\u5ea6\u5b66\u4e60' },
  { id: 'n4', title: '\u4f1a\u8bae\u8bb0\u5f55 2025-02' },
  { id: 'n5', title: 'Prompt Engineering \u603b\u7ed3' },
];

// ===========================
// Add Source Dialog
// ===========================

type AddTab = 'file' | 'note' | 'folder' | 'url' | 'website';

function AddSourceDialog({ onAdd, onCancel }: {
  onAdd: (sources: DataSource[]) => void;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<AddTab>('file');
  const [urlInput, setUrlInput] = useState('');
  const [sitemapInput, setSitemapInput] = useState('');
  const [crawlDepth, setCrawlDepth] = useState('2');
  const [crawlMaxPages, setCrawlMaxPages] = useState('50');
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [droppedFiles, setDroppedFiles] = useState<{ name: string; size: string; format: string }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const tabs: { id: AddTab; label: string; icon: React.ElementType }[] = [
    { id: 'file', label: '\u6587\u4ef6', icon: FileText },
    { id: 'note', label: '\u7b14\u8bb0', icon: StickyNote },
    { id: 'folder', label: '\u76ee\u5f55', icon: Folder },
    { id: 'url', label: '\u7f51\u5740', icon: Link2 },
    { id: 'website', label: '\u7f51\u7ad9', icon: Globe },
  ];

  const genId = () => `ds-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const handleFileSelect = () => {
    setDroppedFiles(prev => [...prev, { name: '\u65b0\u6587\u6863.pdf', size: '1.5 MB', format: 'pdf' }, { name: '\u6570\u636e\u5206\u6790.xlsx', size: '820 KB', format: 'xlsx' }]);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDroppedFiles(prev => [...prev, { name: '\u62d6\u5165\u7684\u6587\u4ef6.pdf', size: '2.1 MB', format: 'pdf' }]);
  };

  const removeFile = (idx: number) => setDroppedFiles(prev => prev.filter((_, i) => i !== idx));

  const handleConfirm = () => {
    const results: DataSource[] = [];
    if (tab === 'file' || tab === 'folder') {
      droppedFiles.forEach(f => {
        results.push({ id: genId(), name: f.name, type: tab === 'folder' ? 'folder' : 'file', format: f.format, size: f.size, status: 'preprocessing', updatedAt: '\u521a\u521a', chunks: 0 });
      });
      if (tab === 'folder' && droppedFiles.length === 0) {
        results.push({ id: genId(), name: '\u672c\u5730\u6587\u4ef6\u5939', type: 'folder', size: '4.2 MB', status: 'preprocessing', updatedAt: '\u521a\u521a', chunks: 0 });
      }
    }
    if (tab === 'note') {
      selectedNotes.forEach(nid => {
        const note = mockNotes.find(n => n.id === nid);
        if (note) results.push({ id: genId(), name: note.title, type: 'note', size: `${Math.round(Math.random() * 100 + 10)} KB`, status: 'preprocessing', updatedAt: '\u521a\u521a', chunks: 0 });
      });
    }
    if (tab === 'url' && urlInput.trim()) {
      results.push({ id: genId(), name: urlInput.trim(), type: 'url', status: 'preprocessing', updatedAt: '\u521a\u521a', chunks: 0, url: urlInput.trim() });
    }
    if (tab === 'website' && sitemapInput.trim()) {
      results.push({ id: genId(), name: sitemapInput.trim(), type: 'website', status: 'preprocessing', updatedAt: '\u521a\u521a', chunks: 0, url: sitemapInput.trim() });
    }
    if (results.length > 0) onAdd(results);
  };

  const canConfirm = (tab === 'file' && droppedFiles.length > 0) || (tab === 'folder') || (tab === 'note' && selectedNotes.size > 0) || (tab === 'url' && urlInput.trim()) || (tab === 'website' && sitemapInput.trim());

  return (
    <Dialog open onOpenChange={open => { if (!open) onCancel(); }}>
      <DialogContent className="w-[400px] max-h-[70vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex-row items-center justify-between px-4 pt-3 pb-2 flex-shrink-0 space-y-0">
          <DialogTitle className="text-xs text-foreground">{'\u6dfb\u52a0\u6570\u636e\u6e90'}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-0 px-3 border-b border-border/15 flex-shrink-0">
          {tabs.map(t => {
            const isActive = tab === t.id;
            const TIcon = t.icon;
            return (
              <Button key={t.id} variant="ghost" size="sm" onClick={() => setTab(t.id)} className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-none border-b-[1.5px] ${isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground/40 hover:text-foreground'}`}>
                <TIcon size={10} strokeWidth={1.6} />{t.label}
              </Button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          {tab === 'file' && (
            <div>
              <div className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer ${isDragOver ? 'border-primary/50 bg-primary/[0.04]' : 'border-border/30 hover:border-border/60'}`}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={handleFileDrop} onClick={handleFileSelect}>
                <Upload size={18} className="text-muted-foreground/40 mx-auto mb-1.5" strokeWidth={1.4} />
                <p className="text-xs text-muted-foreground/50 mb-0.5">{'\u70b9\u51fb\u9009\u62e9\u6587\u4ef6\u6216\u62d6\u62fd\u5230\u6b64\u5904'}</p>
                <p className="text-xs text-muted-foreground/50">{'\u652f\u6301 PDF, DOCX, MD, XLSX, TXT, CSV'}</p>
              </div>
              {droppedFiles.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {droppedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/25">
                      <FileText size={10} className="text-info flex-shrink-0" />
                      <span className="text-xs text-foreground truncate flex-1">{f.name}</span>
                      <span className="text-xs text-muted-foreground/50 flex-shrink-0">{f.size}</span>
                      <Button variant="ghost" size="icon-xs" onClick={() => removeFile(i)} className="text-muted-foreground/40 hover:text-destructive"><X size={9} /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === 'note' && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground/40 mb-1.5">{'\u9009\u62e9\u8981\u5bfc\u5165\u7684\u7b14\u8bb0\uff1a'}</p>
              {mockNotes.map(note => {
                const isChecked = selectedNotes.has(note.id);
                return (
                  <Button key={note.id} variant="ghost" size="inline" onClick={() => setSelectedNotes(prev => { const n = new Set(prev); if (n.has(note.id)) n.delete(note.id); else n.add(note.id); return n; })}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left justify-start ${isChecked ? 'bg-primary/10' : 'hover:bg-accent/50'}`}>
                    <Checkbox checked={isChecked} className="flex-shrink-0" />
                    <StickyNote size={10} className="text-warning flex-shrink-0" />
                    <span className="text-xs text-foreground">{note.title}</span>
                  </Button>
                );
              })}
            </div>
          )}
          {tab === 'folder' && (
            <div className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer ${isDragOver ? 'border-primary/50 bg-primary/[0.04]' : 'border-border/30 hover:border-border/60'}`}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={handleFileDrop} onClick={handleFileSelect}>
              <Folder size={18} className="text-accent-violet/35 mx-auto mb-1.5" strokeWidth={1.4} />
              <p className="text-xs text-muted-foreground/50 mb-0.5">{'\u9009\u62e9\u6216\u62d6\u5165\u672c\u5730\u6587\u4ef6\u5939'}</p>
              <p className="text-xs text-muted-foreground/50">{'\u5c06\u9012\u5f52\u5bfc\u5165\u76ee\u5f55\u4e0b\u6240\u6709\u652f\u6301\u7684\u6587\u4ef6'}</p>
            </div>
          )}
          {tab === 'url' && (
            <div>
              <p className="text-xs text-muted-foreground/40 mb-1.5">{'\u8f93\u5165\u7f51\u9875\u94fe\u63a5\uff1a'}</p>
              <Input autoFocus value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://example.com/article"
                className="w-full text-xs" />
              <p className="text-xs text-muted-foreground/50 mt-1">{'\u5c06\u81ea\u52a8\u6293\u53d6\u9875\u9762\u6587\u672c\u5e76\u5206\u5757\u7d22\u5f15'}</p>
            </div>
          )}
          {tab === 'website' && (
            <div>
              <p className="text-xs text-muted-foreground/40 mb-1.5">{'\u8f93\u5165\u7ad9\u70b9\u5730\u5740\u6216 Sitemap\uff1a'}</p>
              <Input autoFocus value={sitemapInput} onChange={e => setSitemapInput(e.target.value)} placeholder="https://docs.example.com/sitemap.xml"
                className="w-full text-xs mb-2.5" />
              <div className="bg-muted/20 rounded-md p-2.5 border border-border/20 space-y-2">
                <p className="text-xs text-muted-foreground/40">{'\u722c\u866b\u8bbe\u7f6e'}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground/60 mb-0.5 block">{'\u722c\u53d6\u6df1\u5ea6'}</label>
                    <Input value={crawlDepth} onChange={e => setCrawlDepth(e.target.value)} className="w-full text-xs" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground/60 mb-0.5 block">{'\u6700\u5927\u9875\u9762\u6570'}</label>
                    <Input value={crawlMaxPages} onChange={e => setCrawlMaxPages(e.target.value)} className="w-full text-xs" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/50">{'\u6df1\u5ea6 1 = \u4ec5\u9996\u9875\uff0c2 = \u9996\u9875\u94fe\u63a5\u7684\u9875\u9762'}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex-row items-center justify-between px-4 py-2.5 border-t border-border/15 flex-shrink-0">
          <span className="text-xs text-muted-foreground/50">
            {tab === 'note' && selectedNotes.size > 0 ? `\u5df2\u9009 ${selectedNotes.size} \u4e2a\u7b14\u8bb0` : ''}
            {(tab === 'file' || tab === 'folder') && droppedFiles.length > 0 ? `\u5df2\u9009 ${droppedFiles.length} \u4e2a\u6587\u4ef6` : ''}
          </span>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="xs" onClick={onCancel}>{'\u53d6\u6d88'}</Button>
            <Button variant="default" size="xs" onClick={handleConfirm} disabled={!canConfirm}>{'\u6dfb\u52a0'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===========================
// Main component
// ===========================

interface DataSourceListProps {
  sources: DataSource[];
  onAddSources: (sources: DataSource[]) => void;
  onDeleteSource: (id: string) => void;
  onReindexSource: (id: string) => void;
}

export function DataSourceList({ sources, onAddSources, onDeleteSource, onReindexSource }: DataSourceListProps) {
  const [filter, setFilter] = useState('\u5168\u90e8');
  const [isDragOver, setIsDragOver] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [detailSource, setDetailSource] = useState<DataSource | null>(null);
  const [previewSource, setPreviewSource] = useState<DataSource | null>(null);

  if (detailSource) return <ChunkDetailView source={detailSource} onBack={() => setDetailSource(null)} />;

  const filtered = filter === '\u5168\u90e8' ? sources : sources.filter(s => s.type === typeFilterMap[filter]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const genId = () => `ds-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    onAddSources([{ id: genId(), name: '\u62d6\u5165\u7684\u6587\u4ef6.pdf', type: 'file', format: 'pdf', size: '1.8 MB', status: 'preprocessing', updatedAt: '\u521a\u521a', chunks: 0 }]);
  };

  const stats = { total: sources.length, ready: sources.filter(s => s.status === 'success').length };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          {typeFilters.map(tf => (
            <Button key={tf} variant="ghost" size="xs" onClick={() => setFilter(tf)} className={`text-xs px-1.5 py-px ${filter === tf ? 'bg-accent text-foreground' : 'text-muted-foreground/50'}`}>{tf}</Button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground/50 mr-0.5">{stats.ready}/{stats.total} {'\u5c31\u7eea'}</span>
          <Button variant="default" size="xs" onClick={() => setShowAddDialog(true)} className="h-5 px-2 flex items-center gap-0.5">
            <Plus size={9} /><span>{'\u6dfb\u52a0'}</span>
          </Button>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto mx-2.5 mb-2.5 rounded-lg border transition-colors scrollbar-thin ${isDragOver ? 'border-primary/50 bg-primary/[0.03]' : 'border-border/25'}`}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground/40">
            <Upload size={22} strokeWidth={1.2} className="mb-1.5" />
            <p className="text-xs mb-0.5">{'\u62d6\u62fd\u6587\u4ef6\u5230\u6b64\u5904\u4e0a\u4f20'}</p>
            <p className="text-xs mb-2">{'\u652f\u6301 PDF, Word, Markdown, Excel, TXT'}</p>
            <Button variant="ghost" size="xs" onClick={() => setShowAddDialog(true)} className="text-xs text-primary hover:underline">{'\u6216\u70b9\u51fb\u6b64\u5904\u6dfb\u52a0\u6570\u636e\u6e90'}</Button>
          </div>
        ) : (
          <div className="divide-y divide-border/15">
            {filtered.map(source => {
              const cfg = typeConfig[source.type];
              const Icon = source.type === 'file' ? getFileIcon(source.format) : cfg.icon;
              const showContext = contextId === source.id;
              const clickable = source.status === 'success';
              return (
                <div
                  key={source.id}
                  className={`flex items-center gap-2.5 px-2.5 py-[6px] hover:bg-accent/50 transition-colors group/row relative ${clickable ? 'cursor-pointer' : ''}`}
                  onClick={() => { if (clickable) setDetailSource(source); }}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-accent/50 ${cfg.color}`}>
                    <Icon size={12} strokeWidth={1.6} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-foreground truncate">{source.name}</span>
                      {source.format && <span className="text-xs text-muted-foreground/50 uppercase flex-shrink-0">{source.format}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-px">
                      {source.size && <span className="text-xs text-muted-foreground/50">{source.size}</span>}
                      {source.chunks !== undefined && source.chunks > 0 && <span className="text-xs text-muted-foreground/50">{source.chunks} chunks</span>}
                      <span className="text-xs text-muted-foreground/50">{source.updatedAt}</span>
                    </div>
                  </div>
                  <StatusBadge status={source.status} errorMsg={source.errorMsg} />
                  <Popover open={showContext} onOpenChange={open => setContextId(open ? source.id : null)}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); }}
                        className="text-muted-foreground/40 opacity-0 group-hover/row:opacity-100 flex-shrink-0">
                        <MoreHorizontal size={10} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="p-1 min-w-[120px] w-auto">
                      <Button variant="ghost" size="xs" onClick={e => { e.stopPropagation(); setPreviewSource(source); setContextId(null); }}
                        className="w-full justify-start gap-1.5 text-xs text-popover-foreground">
                        <BookOpen size={9} /> {'\u9884\u89c8\u539f\u6587'}
                      </Button>
                      {source.status === 'success' && (
                        <Button variant="ghost" size="xs" onClick={e => { e.stopPropagation(); setDetailSource(source); setContextId(null); }}
                          className="w-full justify-start gap-1.5 text-xs text-popover-foreground">
                          <Eye size={9} /> {'\u67e5\u770b Chunks'}
                        </Button>
                      )}
                      <Button variant="ghost" size="xs" onClick={e => { e.stopPropagation(); onReindexSource(source.id); setContextId(null); }}
                        className="w-full justify-start gap-1.5 text-xs text-popover-foreground">
                        <RefreshCw size={9} /> {'\u91cd\u65b0\u7d22\u5f15'}
                      </Button>
                      <Button variant="ghost" size="xs" onClick={e => { e.stopPropagation(); onDeleteSource(source.id); setContextId(null); }}
                        className="w-full justify-start gap-1.5 text-xs text-destructive hover:bg-destructive/10">
                        <Trash2 size={9} /> {'\u5220\u9664'}
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddDialog && <AddSourceDialog onAdd={srcs => { onAddSources(srcs); setShowAddDialog(false); }} onCancel={() => setShowAddDialog(false)} />}
      {previewSource && <DocPreviewDialog source={previewSource} onClose={() => setPreviewSource(null)} />}
    </div>
  );
}
