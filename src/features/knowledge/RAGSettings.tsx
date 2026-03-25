import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown, Check, Info, RotateCcw,
  AlertTriangle, RefreshCw, Layers, Search as SearchIcon,
  Cpu, MessageSquare,
} from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';

// ===========================
// Options data
// ===========================

const embeddingModels = [
  { id: 'oai-3-s', name: 'text-embedding-3-small', provider: 'OpenAI', dim: 1536 },
  { id: 'oai-3-l', name: 'text-embedding-3-large', provider: 'OpenAI', dim: 3072 },
  { id: 'oai-ada', name: 'text-embedding-ada-002', provider: 'OpenAI', dim: 1536 },
  { id: 'bge-m3', name: 'bge-m3', provider: 'HuggingFace', dim: 1024 },
  { id: 'bge-large', name: 'bge-large-zh-v1.5', provider: 'HuggingFace', dim: 1024 },
  { id: 'ollama-nomic', name: 'nomic-embed-text', provider: 'Ollama', dim: 768 },
  { id: 'ollama-mxbai', name: 'mxbai-embed-large', provider: 'Ollama', dim: 1024 },
  { id: 'jina-v3', name: 'jina-embeddings-v3', provider: 'Jina', dim: 1024 },
];

const docProcessors = [
  { id: 'unstructured', name: 'Unstructured.io' },
  { id: 'llamaparse', name: 'LlamaParse' },
  { id: 'docling', name: 'Docling (IBM)' },
  { id: 'marker', name: 'Marker' },
];

const rerankModels = [
  { id: 'none', name: '不使用' },
  { id: 'bge-reranker', name: 'bge-reranker-v2-m3' },
  { id: 'bge-reranker-l', name: 'bge-reranker-large' },
  { id: 'cohere-v3', name: 'rerank-v3.5' },
  { id: 'cohere-multi', name: 'rerank-multilingual-v3' },
  { id: 'jina-reranker', name: 'jina-reranker-v2' },
];

const separatorOptions = [
  { id: 'auto', name: '自动 (推荐)' },
  { id: 'newline', name: '换行符 \\n' },
  { id: 'double-newline', name: '双换行 \\n\\n' },
  { id: 'sentence', name: '句号分隔' },
  { id: 'recursive', name: '递归字符分割' },
  { id: 'markdown', name: 'Markdown 标题' },
  { id: 'custom', name: '自定义分隔符' },
];

// ===========================
// Defaults
// ===========================

const DEFAULTS = {
  embeddingModel: 'oai-3-s',
  embeddingDim: '1536',
  docProcessor: 'unstructured',
  chunkSize: '512',
  chunkOverlap: '50',
  separator: 'auto',
  topK: 10,
  scoreThreshold: '0.6',
  rerankModel: 'none',
};

// ===========================
// Reusable components
// ===========================

function MiniSelect({ items, selectedId, onSelect }: {
  items: { id: string; name: string; provider?: string; dim?: number }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const selected = items.find(i => i.id === selectedId);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-2.5 py-[6px] rounded-md border text-[11px] bg-transparent hover:bg-muted/20 transition-colors ${open ? 'border-cherry-primary/40 ring-1 ring-cherry-primary/15' : 'border-border/40'}`}
      >
        <span className="text-foreground truncate">{selected?.name || '选择...'}</span>
        <ChevronDown size={10} className={`text-muted-foreground/40 transition-transform flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border/40 rounded-lg shadow-lg z-50 p-1 overflow-y-auto max-h-[200px] animate-in fade-in slide-in-from-top-1 duration-150 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); setOpen(false); }}
              className={`w-full text-left px-2 py-[5px] text-[11px] rounded-md transition-colors flex items-center gap-1.5 ${selectedId === item.id ? 'bg-cherry-active-bg text-cherry-primary-dark' : 'text-foreground hover:bg-accent/60'}`}
            >
              <span className="truncate flex-1">{item.name}</span>
              {item.provider && <span className="text-[9px] text-muted-foreground/30 flex-shrink-0">{item.provider}</span>}
              {item.dim && <span className="text-[9px] text-muted-foreground/25 flex-shrink-0">{item.dim}d</span>}
              {selectedId === item.id && <Check size={10} className="text-cherry-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GreenSlider({ value, onChange, min, max, step }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative h-5 flex items-center">
      <div className="absolute inset-x-0 h-[3px] bg-border/25 rounded-full" />
      <div className="absolute left-0 h-[3px] bg-cherry-primary rounded-full" style={{ width: `${pct}%` }} />
      <div className="absolute left-0 w-[5px] h-[5px] rounded-full bg-cherry-primary -translate-x-[1px]" />
      <div className="absolute right-0 w-[5px] h-[5px] rounded-full bg-border/40 translate-x-[1px]" />
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div
        className="absolute w-[13px] h-[13px] rounded-full bg-white border-[2px] border-cherry-primary shadow-sm pointer-events-none transition-[left] duration-75"
        style={{ left: `calc(${pct}% - 6px)` }}
      />
    </div>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <span className="text-[11px] text-foreground/75">{children}</span>
      {hint && (
        <Tooltip content={hint} side="top">
          <Info size={9} className="text-muted-foreground/40 cursor-help" />
        </Tooltip>
      )}
    </div>
  );
}

function FieldInput({ value, onChange, placeholder, suffix }: { value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string }) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-[6px] rounded-md border border-border/40 bg-transparent text-[11px] text-foreground outline-none focus:border-cherry-primary/40 focus:ring-1 focus:ring-cherry-primary/15 transition-all placeholder:text-muted-foreground/30"
      />
      {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/25 pointer-events-none">{suffix}</span>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-foreground font-medium pt-1 pb-1.5">
      <Icon size={13} strokeWidth={1.8} className="text-cherry-primary/70" />
      <span>{title}</span>
    </div>
  );
}

// ===========================
// Main
// ===========================

export function RAGSettings() {
  const [embeddingModel, setEmbeddingModel] = useState(DEFAULTS.embeddingModel);
  const [embeddingDim, setEmbeddingDim] = useState(DEFAULTS.embeddingDim);
  const [docProcessor, setDocProcessor] = useState(DEFAULTS.docProcessor);
  const [chunkSize, setChunkSize] = useState(DEFAULTS.chunkSize);
  const [chunkOverlap, setChunkOverlap] = useState(DEFAULTS.chunkOverlap);
  const [separator, setSeparator] = useState(DEFAULTS.separator);
  const [customSeparator, setCustomSeparator] = useState('\\n\\n---\\n\\n');
  const [topK, setTopK] = useState(DEFAULTS.topK);
  const [scoreThreshold, setScoreThreshold] = useState(DEFAULTS.scoreThreshold);
  const [rerankModel, setRerankModel] = useState(DEFAULTS.rerankModel);

  const handleReset = () => {
    setEmbeddingModel(DEFAULTS.embeddingModel);
    setEmbeddingDim(DEFAULTS.embeddingDim);
    setDocProcessor(DEFAULTS.docProcessor);
    setChunkSize(DEFAULTS.chunkSize);
    setChunkOverlap(DEFAULTS.chunkOverlap);
    setSeparator(DEFAULTS.separator);
    setTopK(DEFAULTS.topK);
    setScoreThreshold(DEFAULTS.scoreThreshold);
    setRerankModel(DEFAULTS.rerankModel);
  };

  const handleResetChunking = () => {
    setChunkSize(DEFAULTS.chunkSize);
    setChunkOverlap(DEFAULTS.chunkOverlap);
    setSeparator(DEFAULTS.separator);
  };

  // Sync dim when model changes
  useEffect(() => {
    const m = embeddingModels.find(m => m.id === embeddingModel);
    if (m) setEmbeddingDim(String(m.dim));
  }, [embeddingModel]);

  return (
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="max-w-[480px] mx-auto px-5 py-4 space-y-5">

        {/* ========== Section 1: 文档预处理 ========== */}
        <div className="space-y-2.5">
          <SectionHeader icon={MessageSquare} title="文档预处理" />

          <div>
            <FieldLabel hint="选择文档解析引擎，影响内容提取质量">处理服务商</FieldLabel>
            <MiniSelect items={docProcessors} selectedId={docProcessor} onSelect={setDocProcessor} />
          </div>

          <div className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-cherry-active-bg border border-cherry-ring">
            <Info size={10} className="text-cherry-primary/60 flex-shrink-0 mt-px" />
            <span className="text-[9px] text-cherry-text-muted leading-relaxed">文档预处理将在文档导入时自动执行，选择合适的处理服务商可提升文档解析质量</span>
          </div>
        </div>

        <div className="border-t border-border/15" />

        {/* ========== Section 2: 分块规则 ========== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <SectionHeader icon={Layers} title="分块规则 (Chunking)" />
            <button
              onClick={handleResetChunking}
              className="h-5 px-2 rounded text-[9px] text-muted-foreground/50 hover:text-foreground hover:bg-accent/60 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={8} />
              <span>恢复默认</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel hint="每个文本块的最大 Token 数">分段大小</FieldLabel>
              <FieldInput value={chunkSize} onChange={setChunkSize} suffix="tokens" />
            </div>

            <div>
              <FieldLabel hint="相邻块之间的重叠 Token 数，建议为分段大小的 10%-20%">重叠大小</FieldLabel>
              <FieldInput value={chunkOverlap} onChange={setChunkOverlap} suffix="tokens" />
            </div>
          </div>

          <div>
            <FieldLabel hint="文本切分时使用的分隔方式">分隔符规则</FieldLabel>
            <MiniSelect items={separatorOptions} selectedId={separator} onSelect={setSeparator} />
          </div>

          {separator === 'custom' && (
            <div>
              <FieldLabel hint="自定义分隔符，支持正则表达式">自定义分隔符</FieldLabel>
              <FieldInput value={customSeparator} onChange={setCustomSeparator} placeholder="例如：\n\n---\n\n" />
            </div>
          )}

          <div className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-amber-500/[0.06] border border-amber-500/12">
            <AlertTriangle size={10} className="text-amber-500/60 flex-shrink-0 mt-px" />
            <span className="text-[9px] text-amber-600/60 leading-relaxed">分段大小和重叠大小修改只针对新添加的内容有效，不会影响已索引的数据</span>
          </div>
        </div>

        <div className="border-t border-border/15" />

        {/* ========== Section 3: Embedding ========== */}
        <div className="space-y-2.5">
          <SectionHeader icon={Cpu} title="Embedding 模型" />

          <div className="grid grid-cols-[1fr_140px] gap-2">
            <div>
              <FieldLabel hint="将文本转换为向量的模型，影响检索质量">模型选择</FieldLabel>
              <MiniSelect items={embeddingModels} selectedId={embeddingModel} onSelect={setEmbeddingModel} />
            </div>

            <div>
              <FieldLabel hint="向量维度，由模型决定">向量维度</FieldLabel>
              <div className="flex items-center gap-2">
                <FieldInput value={embeddingDim} onChange={setEmbeddingDim} />
                <button
                  onClick={() => { const m = embeddingModels.find(m => m.id === embeddingModel); if (m) setEmbeddingDim(String(m.dim)); }}
                  className="w-7 h-7 rounded-md border border-border/40 flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
                >
                  <RefreshCw size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/15" />

        {/* ========== Section 4: 检索设置 ========== */}
        <div className="space-y-2.5">
          <SectionHeader icon={SearchIcon} title="检索设置" />

          {/* Top K */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel hint="检索返回的最大文档片段数">请求文档片段数 (Top K)</FieldLabel>
              <span className="text-[11px] text-cherry-primary-dark tabular-nums">{topK}</span>
            </div>
            <GreenSlider value={topK} onChange={v => setTopK(Math.round(v))} min={1} max={50} step={1} />
            <div className="flex items-center justify-between mt-px text-[8px] text-muted-foreground/25">
              <span>1</span><span>50</span>
            </div>
          </div>

          {/* 匹配度阈值 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel hint="低于此分数的结果将被过滤，0 表示不过滤">匹配度阈值</FieldLabel>
              <span className="text-[11px] text-cherry-primary-dark tabular-nums">{scoreThreshold}</span>
            </div>
            <GreenSlider value={parseFloat(scoreThreshold)} onChange={v => setScoreThreshold(v.toFixed(2))} min={0} max={1} step={0.01} />
            <div className="flex items-center justify-between mt-px text-[8px] text-muted-foreground/25">
              <span>0.00</span><span>1.00</span>
            </div>
          </div>

          {/* Rerank */}
          <div>
            <FieldLabel hint="对初步检索结果进行精排，提升 Top-K 质量">重排模型 (Rerank)</FieldLabel>
            <MiniSelect items={rerankModels} selectedId={rerankModel} onSelect={setRerankModel} />
          </div>
        </div>

        {/* ========== Footer ========== */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/15">
          <button
            onClick={handleReset}
            className="h-6 px-2.5 rounded-md text-[11px] text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1"
          >
            <RotateCcw size={9} />
            <span>恢复默认</span>
          </button>
          <button className="h-6 px-3 rounded-md text-[11px] bg-cherry-primary text-white hover:bg-cherry-primary-dark transition-colors">
            保存
          </button>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
}
