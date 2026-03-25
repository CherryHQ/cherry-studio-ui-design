import React, { useState, useCallback, useRef } from 'react';
import {
  BookOpen, Database, Settings2, Zap, FileText,
  MoreHorizontal, Clock, Pencil, Trash2,
} from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { KnowledgeSidebar } from '@/features/knowledge/KnowledgeSidebar';
import { DataSourceList } from '@/features/knowledge/DataSourceList';
import { RAGSettings } from '@/features/knowledge/RAGSettings';
import { RetrievalTester } from '@/features/knowledge/RetrievalTester';
import type { KnowledgeBase } from '@/features/knowledge/KnowledgeSidebar';
import type { DataSource } from '@/features/knowledge/DataSourceList';
import { EmptyState } from '@/app/components/ui/EmptyState';

// ===========================
// Initial mock data (complete for all KBs)
// ===========================

const initialKbs: KnowledgeBase[] = [
  { id: 'kb1', name: 'AI 技术文档', icon: '🤖', color: '#8b5cf6', docCount: 10, status: 'ready', group: '工作', updatedAt: '2 小时前' },
  { id: 'kb2', name: '产品设计规范', icon: '🎨', color: '#ec4899', docCount: 5, status: 'ready', group: '工作', updatedAt: '昨天' },
  { id: 'kb3', name: 'API 接口文档', icon: '📡', color: '#3b82f6', docCount: 6, status: 'indexing', group: '工作', updatedAt: '30 分钟前' },
  { id: 'kb4', name: '竞品分析报告', icon: '📊', color: '#f59e0b', docCount: 4, status: 'ready', group: '工作', updatedAt: '3 天前' },
  { id: 'kb5', name: '阅读笔记', icon: '📚', color: '#10b981', docCount: 7, status: 'ready', group: '个人', updatedAt: '1 天前' },
  { id: 'kb6', name: '旅行攻略', icon: '✈️', color: '#06b6d4', docCount: 3, status: 'ready', group: '个人', updatedAt: '1 周前' },
  { id: 'kb7', name: '食谱收藏', icon: '🍳', color: '#f97316', docCount: 4, status: 'error', group: '个人', updatedAt: '5 天前' },
  { id: 'kb8', name: 'Cherry Studio V2', icon: '🍒', color: '#ef4444', docCount: 8, status: 'indexing', group: '项目', updatedAt: '1 小时前' },
  { id: 'kb9', name: '机器学习论文集', icon: '🧠', color: '#a855f7', docCount: 6, status: 'ready', group: '项目', updatedAt: '2 天前' },
];

const initialSources: Record<string, DataSource[]> = {
  kb1: [
    { id: 'd1', name: 'RAG 技术指南', type: 'file', format: 'pdf', size: '2.4 MB', status: 'success', updatedAt: '2 小时前', chunks: 48 },
    { id: 'd2', name: '向量数据库原理', type: 'file', format: 'md', size: '156 KB', status: 'success', updatedAt: '3 小时前', chunks: 12 },
    { id: 'd3', name: '检索策略对比分析', type: 'file', format: 'docx', size: '890 KB', status: 'success', updatedAt: '昨天', chunks: 24 },
    { id: 'd4', name: 'LLM 部署手册', type: 'file', format: 'pdf', size: '5.1 MB', status: 'chunking', updatedAt: '30 分钟前', chunks: 0 },
    { id: 'd5', name: '知识库最佳实践', type: 'note', size: '45 KB', status: 'success', updatedAt: '1 天前', chunks: 8 },
    { id: 'd6', name: 'AI 研究论文目录', type: 'folder', size: '12.3 MB', status: 'success', updatedAt: '2 天前', chunks: 156 },
    { id: 'd7', name: 'https://docs.anthropic.com', type: 'url', status: 'success', updatedAt: '3 天前', chunks: 34, url: 'https://docs.anthropic.com' },
    { id: 'd8', name: 'OpenAI 文档站', type: 'website', status: 'embedding', updatedAt: '10 分钟前', chunks: 0, url: 'https://platform.openai.com/docs' },
    { id: 'd9', name: 'Embedding 模型评测', type: 'file', format: 'xlsx', size: '340 KB', status: 'success', updatedAt: '4 天前', chunks: 6 },
    { id: 'd10', name: '多模态 AI 综述', type: 'file', format: 'pdf', size: '3.8 MB', status: 'error', errorMsg: 'PDF 解析失败：文件已加密或损坏，无法提取文本内容', updatedAt: '1 天前', chunks: 0 },
  ],
  kb2: [
    { id: 'd20', name: '设计系统规范 v3', type: 'file', format: 'pdf', size: '8.2 MB', status: 'success', updatedAt: '昨天', chunks: 92 },
    { id: 'd21', name: 'UI 组件文档', type: 'url', status: 'success', updatedAt: '2 天前', chunks: 45, url: 'https://design.example.com' },
    { id: 'd22', name: '品牌指南', type: 'file', format: 'pdf', size: '4.5 MB', status: 'success', updatedAt: '1 周前', chunks: 38 },
    { id: 'd23', name: '交互设计原则', type: 'note', size: '32 KB', status: 'success', updatedAt: '3 天前', chunks: 6 },
    { id: 'd24', name: '色彩系统参考', type: 'file', format: 'md', size: '78 KB', status: 'success', updatedAt: '5 天前', chunks: 4 },
  ],
  kb3: [
    { id: 'd30', name: 'REST API 规范', type: 'file', format: 'md', size: '245 KB', status: 'success', updatedAt: '1 小时前', chunks: 18 },
    { id: 'd31', name: 'GraphQL Schema', type: 'file', format: 'json', size: '120 KB', status: 'success', updatedAt: '2 小时前', chunks: 8 },
    { id: 'd32', name: 'Swagger 文档', type: 'url', status: 'preprocessing', updatedAt: '30 分钟前', chunks: 0, url: 'https://api.example.com/docs' },
    { id: 'd33', name: '认证授权说明', type: 'file', format: 'pdf', size: '1.1 MB', status: 'success', updatedAt: '3 天前', chunks: 14 },
    { id: 'd34', name: 'WebSocket 协议', type: 'file', format: 'md', size: '89 KB', status: 'success', updatedAt: '4 天前', chunks: 6 },
    { id: 'd35', name: '错误码手册', type: 'file', format: 'xlsx', size: '56 KB', status: 'embedding', updatedAt: '1 小时前', chunks: 0 },
  ],
  kb4: [
    { id: 'd40', name: 'Notion AI 分析', type: 'file', format: 'pdf', size: '3.2 MB', status: 'success', updatedAt: '3 天前', chunks: 28 },
    { id: 'd41', name: 'Obsidian 功能对比', type: 'file', format: 'docx', size: '1.8 MB', status: 'success', updatedAt: '5 天前', chunks: 16 },
    { id: 'd42', name: '市场调研报告 Q4', type: 'file', format: 'pdf', size: '6.7 MB', status: 'success', updatedAt: '1 周前', chunks: 52 },
    { id: 'd43', name: '用户反馈汇总', type: 'note', size: '67 KB', status: 'success', updatedAt: '4 天前', chunks: 10 },
  ],
  kb5: [
    { id: 'd50', name: '深度学习花书笔记', type: 'note', size: '128 KB', status: 'success', updatedAt: '1 天前', chunks: 22 },
    { id: 'd51', name: 'Transformer 论文精读', type: 'note', size: '85 KB', status: 'success', updatedAt: '2 天前', chunks: 14 },
    { id: 'd52', name: '强化学习导论', type: 'file', format: 'pdf', size: '4.2 MB', status: 'success', updatedAt: '3 天前', chunks: 36 },
    { id: 'd53', name: 'Python 设计模式', type: 'file', format: 'md', size: '210 KB', status: 'success', updatedAt: '5 天前', chunks: 18 },
    { id: 'd54', name: '数据结构与算法笔记', type: 'note', size: '95 KB', status: 'success', updatedAt: '1 周前', chunks: 12 },
    { id: 'd55', name: '系统设计面试指南', type: 'file', format: 'pdf', size: '2.8 MB', status: 'success', updatedAt: '1 周前', chunks: 24 },
    { id: 'd56', name: 'LangChain 实战', type: 'url', status: 'success', updatedAt: '2 天前', chunks: 20, url: 'https://langchain.readthedocs.io' },
  ],
  kb6: [
    { id: 'd60', name: '日本关西攻略', type: 'note', size: '45 KB', status: 'success', updatedAt: '1 周前', chunks: 8 },
    { id: 'd61', name: '欧洲自驾路线', type: 'file', format: 'pdf', size: '2.1 MB', status: 'success', updatedAt: '2 周前', chunks: 18 },
    { id: 'd62', name: '东南亚美食地图', type: 'note', size: '32 KB', status: 'success', updatedAt: '3 周前', chunks: 6 },
  ],
  kb7: [
    { id: 'd70', name: '中式家常菜', type: 'note', size: '78 KB', status: 'success', updatedAt: '5 天前', chunks: 14 },
    { id: 'd71', name: '烘焙入门指南', type: 'file', format: 'pdf', size: '3.4 MB', status: 'error', errorMsg: '文件大小超出限制 (max: 2 MB)，请压缩后重新上传', updatedAt: '1 周前', chunks: 0 },
    { id: 'd72', name: '日料制作教程', type: 'url', status: 'success', updatedAt: '2 周前', chunks: 22, url: 'https://cooking.example.com/japanese' },
    { id: 'd73', name: '健康饮食计划', type: 'note', size: '25 KB', status: 'success', updatedAt: '3 天前', chunks: 4 },
  ],
  kb8: [
    { id: 'd80', name: '产品需求文档 PRD', type: 'file', format: 'docx', size: '2.8 MB', status: 'success', updatedAt: '1 小时前', chunks: 32 },
    { id: 'd81', name: '技术方案设计', type: 'file', format: 'md', size: '180 KB', status: 'success', updatedAt: '3 小时前', chunks: 16 },
    { id: 'd82', name: '测试用例集', type: 'file', format: 'xlsx', size: '450 KB', status: 'success', updatedAt: '昨天', chunks: 8 },
    { id: 'd83', name: '发布日志', type: 'note', size: '56 KB', status: 'success', updatedAt: '2 天前', chunks: 10 },
    { id: 'd84', name: '架构设计文档', type: 'file', format: 'pdf', size: '5.6 MB', status: 'chunking', updatedAt: '30 分钟前', chunks: 0 },
    { id: 'd85', name: '用户手册', type: 'website', status: 'success', updatedAt: '3 天前', chunks: 42, url: 'https://docs.cherrystudio.dev' },
    { id: 'd86', name: 'CI/CD 配置', type: 'file', format: 'yaml', size: '12 KB', status: 'success', updatedAt: '4 天前', chunks: 2 },
    { id: 'd87', name: '代码审查指南', type: 'file', format: 'md', size: '95 KB', status: 'preprocessing', updatedAt: '2 小时前', chunks: 0 },
  ],
  kb9: [
    { id: 'd90', name: 'Attention Is All You Need', type: 'file', format: 'pdf', size: '1.2 MB', status: 'success', updatedAt: '2 天前', chunks: 18 },
    { id: 'd91', name: 'BERT 论文精读', type: 'file', format: 'pdf', size: '980 KB', status: 'success', updatedAt: '3 天前', chunks: 14 },
    { id: 'd92', name: 'GPT 系列论文', type: 'folder', size: '8.5 MB', status: 'success', updatedAt: '5 天前', chunks: 86 },
    { id: 'd93', name: 'Diffusion Models 综述', type: 'file', format: 'pdf', size: '4.1 MB', status: 'success', updatedAt: '1 周前', chunks: 32 },
    { id: 'd94', name: 'RL from Human Feedback', type: 'file', format: 'pdf', size: '1.5 MB', status: 'success', updatedAt: '1 周前', chunks: 20 },
    { id: 'd95', name: 'Papers With Code', type: 'website', status: 'success', updatedAt: '4 天前', chunks: 56, url: 'https://paperswithcode.com' },
  ],
};

const detailTabs = [
  { id: 'sources', label: '数据源', icon: Database },
  { id: 'settings', label: 'RAG 配置', icon: Settings2 },
  { id: 'test', label: '召回测试', icon: Zap },
] as const;

type DetailTab = typeof detailTabs[number]['id'];

function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40" onClick={e => { if (e.target === ref.current) onCancel(); }}>
      <div className="bg-popover border border-border rounded-xl shadow-2xl w-[300px] p-4 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
        <p className="text-xs text-foreground mb-1">{title}</p>
        <p className="text-[11px] text-muted-foreground/50 mb-3">{message}</p>
        <div className="flex justify-end gap-1.5">
          <button onClick={onCancel} className="h-6 px-2.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">取消</button>
          <button onClick={onConfirm} className={`h-6 px-2.5 rounded-md text-[11px] transition-colors ${danger ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function RenameDialog({ title, value, onConfirm, onCancel }: {
  title: string; value: string; onConfirm: (v: string) => void; onCancel: () => void;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40" onClick={e => { if (e.target === ref.current) onCancel(); }}>
      <div className="bg-popover border border-border rounded-xl shadow-2xl w-[300px] p-4 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
        <p className="text-xs text-foreground mb-2.5">{title}</p>
        <input
          autoFocus value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && text.trim()) onConfirm(text.trim()); if (e.key === 'Escape') onCancel(); }}
          className="w-full px-2 py-[5px] rounded-md border border-border/40 bg-transparent text-[11px] text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/15 transition-all mb-3"
        />
        <div className="flex justify-end gap-1.5">
          <button onClick={onCancel} className="h-6 px-2.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">取消</button>
          <button onClick={() => { if (text.trim()) onConfirm(text.trim()); }} disabled={!text.trim()} className="h-6 px-2.5 rounded-md text-[11px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">确认</button>
        </div>
      </div>
    </div>
  );
}

export function KnowledgePage() {
  const [kbs, setKbs] = useState<KnowledgeBase[]>(initialKbs);
  const [sourcesMap, setSourcesMap] = useState<Record<string, DataSource[]>>(initialSources);
  const [selectedKbId, setSelectedKbId] = useState('kb1');
  const [activeTab, setActiveTab] = useState<DetailTab>('sources');
  const [sidebarWidth, setSidebarWidth] = useState(255);
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [headerRenaming, setHeaderRenaming] = useState(false);
  const [headerDeleting, setHeaderDeleting] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const selectedKb = kbs.find(kb => kb.id === selectedKbId);
  const sources = sourcesMap[selectedKbId] || [];
  const genId = () => `kb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const handleCreateKb = useCallback((name: string, group: string, icon: string, color: string) => {
    const newKb: KnowledgeBase = { id: genId(), name, icon, color, docCount: 0, status: 'ready', group, updatedAt: '刚刚' };
    setKbs(prev => [...prev, newKb]);
    setSourcesMap(prev => ({ ...prev, [newKb.id]: [] }));
    setSelectedKbId(newKb.id);
    setActiveTab('settings');
  }, []);

  const handleRenameKb = useCallback((id: string, name: string) => {
    setKbs(prev => prev.map(kb => kb.id === id ? { ...kb, name } : kb));
  }, []);

  const handleDeleteKb = useCallback((id: string) => {
    setKbs(prev => {
      const next = prev.filter(kb => kb.id !== id);
      if (selectedKbId === id && next.length > 0) setSelectedKbId(next[0].id);
      return next;
    });
    setSourcesMap(prev => { const n = { ...prev }; delete n[id]; return n; });
  }, [selectedKbId]);

  const handleMoveKb = useCallback((id: string, toGroup: string) => {
    setKbs(prev => prev.map(kb => kb.id === id ? { ...kb, group: toGroup } : kb));
  }, []);

  const handleCreateGroup = useCallback((name: string) => {
    const newKb: KnowledgeBase = { id: genId(), name: '新建知识库', icon: '📁', color: '#6b7280', docCount: 0, status: 'ready', group: name, updatedAt: '刚刚' };
    setKbs(prev => [...prev, newKb]);
    setSourcesMap(prev => ({ ...prev, [newKb.id]: [] }));
    setSelectedKbId(newKb.id);
    setActiveTab('settings');
  }, []);

  const handleRenameGroup = useCallback((oldName: string, newName: string) => {
    if (oldName === newName) return;
    setKbs(prev => prev.map(kb => kb.group === oldName ? { ...kb, group: newName } : kb));
  }, []);

  const handleDeleteGroup = useCallback((name: string) => {
    setKbs(prev => {
      const other = Array.from(new Set(prev.filter(kb => kb.group !== name).map(kb => kb.group)));
      const fallback = other[0] || '默认';
      return prev.map(kb => kb.group === name ? { ...kb, group: fallback } : kb);
    });
  }, []);

  const handleAddSources = useCallback((newSources: DataSource[]) => {
    setSourcesMap(prev => ({ ...prev, [selectedKbId]: [...(prev[selectedKbId] || []), ...newSources] }));
    setKbs(prev => prev.map(kb => kb.id === selectedKbId ? { ...kb, docCount: kb.docCount + newSources.length, updatedAt: '刚刚' } : kb));
    // 3-stage processing simulation: preprocessing -> chunking -> embedding -> success
    const kbId = selectedKbId;
    newSources.forEach(src => {
      if (src.status === 'preprocessing') {
        const t1 = 800 + Math.random() * 600;
        const t2 = t1 + 800 + Math.random() * 600;
        const t3 = t2 + 800 + Math.random() * 800;
        setTimeout(() => {
          setSourcesMap(prev => ({ ...prev, [kbId]: (prev[kbId] || []).map(s => s.id === src.id ? { ...s, status: 'chunking' } : s) }));
        }, t1);
        setTimeout(() => {
          setSourcesMap(prev => ({ ...prev, [kbId]: (prev[kbId] || []).map(s => s.id === src.id ? { ...s, status: 'embedding' } : s) }));
        }, t2);
        setTimeout(() => {
          setSourcesMap(prev => ({ ...prev, [kbId]: (prev[kbId] || []).map(s => s.id === src.id ? { ...s, status: 'success', chunks: Math.floor(Math.random() * 40 + 5), updatedAt: '刚刚' } : s) }));
        }, t3);
      }
    });
  }, [selectedKbId]);

  const handleDeleteSource = useCallback((id: string) => {
    setSourcesMap(prev => ({ ...prev, [selectedKbId]: (prev[selectedKbId] || []).filter(s => s.id !== id) }));
    setKbs(prev => prev.map(kb => kb.id === selectedKbId ? { ...kb, docCount: Math.max(0, kb.docCount - 1) } : kb));
  }, [selectedKbId]);

  const handleReindexSource = useCallback((id: string) => {
    const kbId = selectedKbId;
    setSourcesMap(prev => ({ ...prev, [kbId]: (prev[kbId] || []).map(s => s.id === id ? { ...s, status: 'preprocessing', errorMsg: undefined, updatedAt: '刚刚' } : s) }));
    const t1 = 700 + Math.random() * 500;
    const t2 = t1 + 700 + Math.random() * 500;
    const t3 = t2 + 700 + Math.random() * 700;
    setTimeout(() => {
      setSourcesMap(prev => ({ ...prev, [kbId]: (prev[kbId] || []).map(s => s.id === id ? { ...s, status: 'chunking' } : s) }));
    }, t1);
    setTimeout(() => {
      setSourcesMap(prev => ({ ...prev, [kbId]: (prev[kbId] || []).map(s => s.id === id ? { ...s, status: 'embedding' } : s) }));
    }, t2);
    setTimeout(() => {
      setSourcesMap(prev => ({ ...prev, [kbId]: (prev[kbId] || []).map(s => s.id === id ? { ...s, status: 'success', chunks: Math.floor(Math.random() * 50 + 5), updatedAt: '刚刚' } : s) }));
    }, t3);
  }, [selectedKbId]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current || !containerRef.current) return;
      setSidebarWidth(Math.min(360, Math.max(180, ev.clientX - containerRef.current.getBoundingClientRect().left)));
    };
    const onUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  React.useEffect(() => {
    if (!headerMenuOpen) return;
    const h = (e: MouseEvent) => { if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) setHeaderMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [headerMenuOpen]);

  return (
    <div ref={containerRef} className="flex-1 flex min-h-0">
      <div className="flex-shrink-0 h-full bg-muted/[0.15] border-r border-border/20 relative" style={{ width: sidebarWidth }}>
        <KnowledgeSidebar
          items={kbs} selectedId={selectedKbId} onSelect={setSelectedKbId}
          onCreateKb={handleCreateKb} onRenameKb={handleRenameKb} onDeleteKb={handleDeleteKb} onMoveKb={handleMoveKb}
          onCreateGroup={handleCreateGroup} onRenameGroup={handleRenameGroup} onDeleteGroup={handleDeleteGroup}
        />
        <div onMouseDown={startResize} className="absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize z-10 group/handle">
          <div className="w-full h-full opacity-0 group-hover/handle:opacity-100 bg-primary/20 transition-opacity" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {selectedKb ? (
          <div className="contents">
            <div className="h-11 flex items-center justify-between px-3.5 flex-shrink-0 border-b border-border/15">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0" style={{ background: `${selectedKb.color}20` }}>
                  {selectedKb.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-foreground truncate">{selectedKb.name}</span>
                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${selectedKb.status === 'ready' ? 'bg-cherry-primary' : selectedKb.status === 'indexing' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-[9px] text-muted-foreground/35">
                      {selectedKb.status === 'ready' ? '就绪' : selectedKb.status === 'indexing' ? '索引中' : '错误'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-[9px] text-muted-foreground/50 flex-shrink-0">
                <span className="flex items-center gap-0.5"><FileText size={9} />{selectedKb.docCount} 文档</span>
                <span className="flex items-center gap-0.5"><Clock size={9} />{selectedKb.updatedAt}</span>
                <div className="relative" ref={headerMenuRef}>
                  <Tooltip content="更多操作" side="bottom">
                    <button onClick={() => setHeaderMenuOpen(!headerMenuOpen)} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors">
                      <MoreHorizontal size={11} />
                    </button>
                  </Tooltip>
                  {headerMenuOpen && (
                    <div className="absolute right-0 top-6 z-30 bg-popover border border-border rounded-lg shadow-xl p-1 min-w-[110px] animate-in fade-in zoom-in-95 duration-100">
                      <button onClick={() => { setHeaderRenaming(true); setHeaderMenuOpen(false); }} className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] text-popover-foreground hover:bg-accent rounded-md transition-colors text-left">
                        <Pencil size={9} /> 重命名
                      </button>
                      <button onClick={() => { setHeaderDeleting(true); setHeaderMenuOpen(false); }} className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] text-red-500 hover:bg-red-500/10 rounded-md transition-colors text-left">
                        <Trash2 size={9} /> 删除知识库
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0 px-2.5 flex-shrink-0 border-b border-border/15">
              {detailTabs.map(tab => {
                const isActive = activeTab === tab.id;
                const TIcon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1 px-2.5 py-2 text-[10px] border-b-[1.5px] transition-colors ${isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground/60 hover:text-foreground'}`}>
                    <TIcon size={10} strokeWidth={1.6} />
                    <span>{tab.label}</span>
                    {tab.id === 'sources' && <span className="text-[8px] text-muted-foreground/40 ml-0.5">{sources.length}</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              {activeTab === 'sources' && <DataSourceList sources={sources} onAddSources={handleAddSources} onDeleteSource={handleDeleteSource} onReindexSource={handleReindexSource} />}
              {activeTab === 'settings' && <RAGSettings />}
              {activeTab === 'test' && <RetrievalTester />}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              preset="no-knowledge"
              title="选择一个知识库开始"
              description="从左侧列表选择一个知识库，或创建一个新的知识库"
            />
          </div>
        )}
      </div>

      {headerRenaming && selectedKb && (
        <RenameDialog title="重命名知识库" value={selectedKb.name} onConfirm={v => { handleRenameKb(selectedKb.id, v); setHeaderRenaming(false); }} onCancel={() => setHeaderRenaming(false)} />
      )}
      {headerDeleting && selectedKb && (
        <ConfirmDialog title="删除知识库" message={`确定要删除「${selectedKb.name}」吗？所有数据源和配置将被永久移除。`} confirmLabel="删除" danger onConfirm={() => { handleDeleteKb(selectedKb.id); setHeaderDeleting(false); }} onCancel={() => setHeaderDeleting(false)} />
      )}
    </div>
  );
}
