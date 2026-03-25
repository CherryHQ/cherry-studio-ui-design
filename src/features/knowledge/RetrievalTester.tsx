import React, { useState, useCallback } from 'react';
import {
  Search, Zap, Clock, FileText, ChevronDown, ChevronUp,
  Copy, Check, Sparkles, History, X, Trash2,
} from 'lucide-react';
import { copyToClipboard } from '@/app/utils/clipboard';

interface ChunkResult {
  id: string;
  content: string;
  source: string;
  score: number;
  chunkIndex: number;
}

interface HistoryItem {
  id: string;
  query: string;
  resultCount: number;
  elapsed: number;
  topScore: number;
  time: string;
}

const mockResults: ChunkResult[] = [
  { id: 'r1', content: 'RAG（检索增强生成）是一种将信息检索与生成式 AI 模型相结合的技术。它通过从外部知识库中检索相关文档，将检索到的内容作为上下文传递给大语言模型，从而生成更准确、更具参考依据的回答。', source: 'RAG 技术指南.pdf', score: 0.95, chunkIndex: 3 },
  { id: 'r2', content: '向量检索的核心原理是将文本通过 Embedding 模型转换为高维向量，然后通过余弦相似度或欧氏距离等度量方式计算查询向量与文档向量之间的相似性，返回最相关的文档片段。', source: '向量数据库原理.md', score: 0.89, chunkIndex: 7 },
  { id: 'r3', content: '混合检索策略结合了语义检索和关键词检索的优势。语义检索擅长理解语义相似的表达，而关键词检索（如 BM25）在精确匹配方面表现更好。两者结合可以显著提升检索召回率和准确率。', source: '检索策略对比分析.docx', score: 0.84, chunkIndex: 12 },
  { id: 'r4', content: 'Rerank 模型在初步检索完成后对结果进行精排。常见的 Rerank 模型包括 BGE-Reranker 和 Cohere Rerank，它们能够更精确地评估查询与文档片段之间的相关性，有效提升 Top-K 结果的质量。', source: 'RAG 技术指南.pdf', score: 0.78, chunkIndex: 15 },
  { id: 'r5', content: '分块策略对 RAG 系统性能有重要影响。常见的分块方法包括固定大小分块、递归字符分块和语义分块。Chunk Size 通常设置在 256-1024 之间，Overlap 设置为 Chunk Size 的 10%-20%。', source: '知识库最佳实践.md', score: 0.72, chunkIndex: 5 },
];

const initialHistory: HistoryItem[] = [
  { id: 'h1', query: 'RAG 检索增强生成原理', resultCount: 5, elapsed: 823, topScore: 95, time: '10:32' },
  { id: 'h2', query: '向量数据库选型对比', resultCount: 4, elapsed: 612, topScore: 88, time: '10:15' },
  { id: 'h3', query: 'Embedding 模型推荐', resultCount: 5, elapsed: 945, topScore: 91, time: '09:48' },
  { id: 'h4', query: '如何优化检索召回率', resultCount: 3, elapsed: 734, topScore: 82, time: '昨天 18:20' },
  { id: 'h5', query: 'Chunk 分块最佳实践', resultCount: 5, elapsed: 567, topScore: 89, time: '昨天 16:05' },
];

// Regex patterns built via new RegExp to satisfy project constraints
const RE_WHITESPACE = new RegExp(String.fromCharCode(92) + 's+');
const RE_SPECIAL_CHARS = new RegExp('[.*+?^${}()|' + String.fromCharCode(92) + '[' + String.fromCharCode(92) + ']' + String.fromCharCode(92) + String.fromCharCode(92) + ']', 'g');

function highlightQuery(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const keywords = query.split(RE_WHITESPACE).filter(k => k.length > 1);
  if (keywords.length === 0) return text;
  const escaped = keywords.map(k => k.replace(RE_SPECIAL_CHARS, String.fromCharCode(92) + '$&'));
  const regex = new RegExp('(' + escaped.join('|') + ')', 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (keywords.some(k => part.toLowerCase() === k.toLowerCase())) {
      return <mark key={i} className="bg-amber-500/20 text-amber-600 rounded-sm px-0.5">{part}</mark>;
    }
    return part;
  });
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.9 ? 'bg-blue-500' : score >= 0.75 ? 'bg-sky-500' : score >= 0.6 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-[3px] rounded-full bg-border/25 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] text-muted-foreground/50 tabular-nums w-6">{pct}%</span>
    </div>
  );
}

export function RetrievalTester() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChunkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [showHistory, setShowHistory] = useState(false);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setElapsed(null);
    setShowHistory(false);

    const startTime = Date.now();
    setTimeout(() => {
      setResults(mockResults);
      const el = Date.now() - startTime;
      setElapsed(el);
      setLoading(false);
      // Add to history
      setHistory(prev => [{
        id: `h-${Date.now()}`,
        query: query.trim(),
        resultCount: mockResults.length,
        elapsed: el,
        topScore: Math.round(mockResults[0].score * 100),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev].slice(0, 20));
    }, 600 + Math.random() * 400);
  }, [query]);

  const handleCopy = (id: string, content: string) => {
    copyToClipboard(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleHistorySelect = (h: HistoryItem) => {
    setQuery(h.query);
    setShowHistory(false);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border border-border/40 bg-muted/20 focus-within:border-cherry-primary/40 focus-within:ring-1 focus-within:ring-cherry-primary/15 transition-all relative">
            <Search size={11} className="text-muted-foreground/35 flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              onFocus={() => { if (history.length > 0 && !results.length) setShowHistory(true); }}
              placeholder="输入测试 Query..."
              className="flex-1 bg-transparent outline-none text-[11px] text-foreground placeholder:text-muted-foreground/30"
            />
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`text-muted-foreground/30 hover:text-foreground transition-colors ${showHistory ? 'text-cherry-primary' : ''}`}
              >
                <History size={11} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className={`h-7 px-3 rounded-lg text-[11px] flex items-center gap-1 transition-all flex-shrink-0 ${
              loading ? 'bg-cherry-primary/60 text-white/60 cursor-wait' : 'bg-cherry-primary text-white hover:bg-cherry-primary-dark active:scale-[0.97]'
            } disabled:opacity-40`}
          >
            {loading ? (
              <div className="w-2.5 h-2.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Zap size={10} />
            )}
            <span>检索</span>
          </button>
        </div>

        {/* History dropdown */}
        {showHistory && history.length > 0 && (
          <div className="mt-1 bg-popover border border-border/40 rounded-lg shadow-lg p-1 max-h-[180px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="flex items-center justify-between px-2 py-0.5 mb-0.5">
              <span className="text-[9px] text-muted-foreground/30">搜索历史</span>
              <button
                onClick={() => { setHistory([]); setShowHistory(false); }}
                className="text-[9px] text-muted-foreground/25 hover:text-red-500 transition-colors"
              >清空</button>
            </div>
            {history.map(h => (
              <div
                key={h.id}
                onClick={() => handleHistorySelect(h)}
                className="w-full flex items-center gap-2 px-2 py-[4px] rounded-md text-left hover:bg-accent/50 transition-colors group/hist cursor-pointer"
              >
                <History size={9} className="text-muted-foreground/25 flex-shrink-0" />
                <span className="text-[11px] text-foreground truncate flex-1">{h.query}</span>
                <span className="text-[9px] text-muted-foreground/25 flex-shrink-0">{h.resultCount}条 · {h.elapsed}ms</span>
                <span className="text-[9px] text-muted-foreground/20 flex-shrink-0">{h.time}</span>
                <button
                  onClick={e => handleDeleteHistory(h.id, e)}
                  className="opacity-0 group-hover/hist:opacity-100 text-muted-foreground/20 hover:text-red-500 transition-all flex-shrink-0"
                >
                  <X size={8} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {elapsed !== null && results.length > 0 && (
          <div className="flex items-center gap-2.5 mt-1.5 text-[9px] text-muted-foreground/35">
            <span className="flex items-center gap-0.5">
              <Sparkles size={8} />
              {results.length} 个结果
            </span>
            <span className="flex items-center gap-0.5">
              <Clock size={8} />
              {elapsed}ms
            </span>
            <span>最高: {(results[0]?.score * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {results.length === 0 && !loading && !showHistory && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/25 py-12">
            <Search size={22} strokeWidth={1.2} className="mb-1.5" />
            <p className="text-[11px]">输入查询语句开始检索测试</p>
            <p className="text-[9px] mt-0.5">结果将展示匹配的文档片段和分数</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-cherry-primary/20 border-t-cherry-primary rounded-full animate-spin mb-2" />
            <p className="text-[11px] text-muted-foreground/35">正在检索...</p>
          </div>
        )}

        {results.map((chunk, idx) => {
          const isExpanded = expandedId === chunk.id;
          const isCopied = copiedId === chunk.id;
          return (
            <div
              key={chunk.id}
              className="rounded-lg border border-border/20 hover:border-border/40 bg-muted/[0.03] transition-all group/chunk"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                <span className="w-4 h-4 rounded bg-accent/50 flex items-center justify-center text-[9px] text-muted-foreground/50 flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <FileText size={9} className="text-muted-foreground/35 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground/50 truncate">{chunk.source}</span>
                  <span className="text-[8px] text-muted-foreground/20 flex-shrink-0">#{chunk.chunkIndex}</span>
                </div>
                <ScoreBar score={chunk.score} />
                <button
                  onClick={() => handleCopy(chunk.id, chunk.content)}
                  className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground/20 hover:text-foreground hover:bg-accent opacity-0 group-hover/chunk:opacity-100 transition-all flex-shrink-0"
                >
                  {isCopied ? <Check size={8} className="text-cherry-primary" /> : <Copy size={8} />}
                </button>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : chunk.id)}
                  className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground/20 hover:text-foreground hover:bg-accent transition-all flex-shrink-0"
                >
                  {isExpanded ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                </button>
              </div>
              <div className={`px-2.5 pb-2 ${isExpanded ? '' : 'line-clamp-2'}`}>
                <p className="text-[11px] text-foreground/75 leading-relaxed">
                  {highlightQuery(chunk.content, query)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
