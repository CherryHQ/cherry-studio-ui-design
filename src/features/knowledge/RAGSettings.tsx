import React, { useState, useEffect } from 'react';
import {
  ChevronDown, Check, Info, RotateCcw,
  AlertTriangle, RefreshCw, Layers, Search as SearchIcon,
  Cpu, MessageSquare,
} from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Input, Slider, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';

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
  const selected = items.find(i => i.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`w-full justify-between px-2.5 py-[6px] text-xs bg-transparent hover:bg-muted/20 transition-colors ${open ? 'border-cherry-primary/40 ring-1 ring-cherry-primary/15' : 'border-border/40'}`}
        >
          <span className="text-foreground truncate">{selected?.name || '选择...'}</span>
          <ChevronDown size={10} className={`text-muted-foreground/40 transition-transform flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-1 overflow-y-auto max-h-[200px] scrollbar-thin w-[var(--radix-popover-trigger-width)]">
        {items.map(item => (
          <Button size="inline"
            key={item.id}
            variant="ghost"
            onClick={() => { onSelect(item.id); setOpen(false); }}
            className={`w-full justify-start py-[5px] px-2 text-xs rounded-md transition-colors flex items-center gap-1.5 ${selectedId === item.id ? 'bg-cherry-active-bg text-cherry-primary-dark' : 'text-foreground hover:bg-accent/50'}`}
          >
            <span className="truncate flex-1">{item.name}</span>
            {item.provider && <span className="text-xs text-muted-foreground/50 flex-shrink-0">{item.provider}</span>}
            {item.dim && <span className="text-xs text-muted-foreground/50 flex-shrink-0">{item.dim}d</span>}
            {selectedId === item.id && <Check size={10} className="text-cherry-primary flex-shrink-0" />}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}


function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <span className="text-xs text-foreground">{children}</span>
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
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-xs"
      />
      {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 pointer-events-none">{suffix}</span>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-foreground font-medium pt-1 pb-1.5">
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
    <div className="flex-1 overflow-y-auto scrollbar-thin">
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
            <span className="text-xs text-cherry-text-muted leading-relaxed">文档预处理将在文档导入时自动执行，选择合适的处理服务商可提升文档解析质量</span>
          </div>
        </div>

        <div className="border-t border-border/15" />

        {/* ========== Section 2: 分块规则 ========== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <SectionHeader icon={Layers} title="分块规则 (Chunking)" />
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetChunking}
              className="h-5 px-2 text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={8} />
              <span>恢复默认</span>
            </Button>
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

          <div className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-warning/[0.06] border border-warning/12">
            <AlertTriangle size={10} className="text-warning/60 flex-shrink-0 mt-px" />
            <span className="text-xs text-warning/60 leading-relaxed">分段大小和重叠大小修改只针对新添加的内容有效，不会影响已索引的数据</span>
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
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => { const m = embeddingModels.find(m => m.id === embeddingModel); if (m) setEmbeddingDim(String(m.dim)); }}
                  className="w-7 h-7 rounded-md border border-border/40 text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
                >
                  <RefreshCw size={10} />
                </Button>
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
              <span className="text-xs text-cherry-primary-dark tabular-nums">{topK}</span>
            </div>
            <Slider min={1} max={50} step={1} value={[topK]} onValueChange={([v]) => setTopK(Math.round(v))} />
            <div className="flex items-center justify-between mt-px text-xs text-muted-foreground/50">
              <span>1</span><span>50</span>
            </div>
          </div>

          {/* 匹配度阈值 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel hint="低于此分数的结果将被过滤，0 表示不过滤">匹配度阈值</FieldLabel>
              <span className="text-xs text-cherry-primary-dark tabular-nums">{scoreThreshold}</span>
            </div>
            <Slider min={0} max={1} step={0.01} value={[parseFloat(scoreThreshold)]} onValueChange={([v]) => setScoreThreshold(v.toFixed(2))} />
            <div className="flex items-center justify-between mt-px text-xs text-muted-foreground/50">
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
          <Button
            variant="ghost"
            size="xs"
            onClick={handleReset}
            className="h-6 px-2.5 text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1"
          >
            <RotateCcw size={9} />
            <span>恢复默认</span>
          </Button>
          <Button size="sm">
            保存
          </Button>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
}
