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
import {
  Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Tabs, TabsList, TabsTrigger, TabsContent, EmptyState,
  Popover, PopoverTrigger, PopoverContent,
  ConfirmDialog,
} from '@cherry-studio/ui';
import { MOCK_KNOWLEDGE_BASE_LIST, MOCK_DATA_SOURCES } from '@/app/mock/knowledgeData';


const detailTabs = [
  { id: 'sources', label: '数据源', icon: Database },
  { id: 'settings', label: 'RAG 配置', icon: Settings2 },
  { id: 'test', label: '召回测试', icon: Zap },
] as const;

type DetailTab = typeof detailTabs[number]['id'];


function RenameDialog({ title, value, onConfirm, onCancel }: {
  title: string; value: string; onConfirm: (v: string) => void; onCancel: () => void;
}) {
  const [text, setText] = useState(value);
  return (
    <Dialog open onOpenChange={open => { if (!open) onCancel(); }}>
      <DialogContent className="w-[300px] p-4">
        <DialogHeader>
          <DialogTitle className="text-xs text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && text.trim()) onConfirm(text.trim()); if (e.key === 'Escape') onCancel(); }}
          className="w-full px-2 py-[5px] rounded-md text-xs mb-3"
        />
        <DialogFooter className="flex justify-end gap-1.5">
          <Button variant="ghost" size="xs" onClick={onCancel} className="h-6 px-2.5 text-xs text-muted-foreground hover:text-foreground">取消</Button>
          <Button variant="default" size="xs" onClick={() => { if (text.trim()) onConfirm(text.trim()); }} disabled={!text.trim()} className="h-6 px-2.5 text-xs">确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function KnowledgePage() {
  const [kbs, setKbs] = useState<KnowledgeBase[]>(MOCK_KNOWLEDGE_BASE_LIST);
  const [sourcesMap, setSourcesMap] = useState<Record<string, DataSource[]>>(MOCK_DATA_SOURCES);
  const [selectedKbId, setSelectedKbId] = useState('kb1');
  const [activeTab, setActiveTab] = useState<DetailTab>('sources');
  const [sidebarWidth, setSidebarWidth] = useState(255);
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [headerRenaming, setHeaderRenaming] = useState(false);
  const [headerDeleting, setHeaderDeleting] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const selectedKb = kbs.find(kb => kb.id === selectedKbId);
  const sources = sourcesMap[selectedKbId] || [];
  const genId = () => `kb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const handleCreateKb = useCallback((name: string, group: string, icon: string, colorClass: string) => {
    const newKb: KnowledgeBase = { id: genId(), name, icon, colorClass, docCount: 0, status: 'ready', group, updatedAt: '刚刚' };
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
    const newKb: KnowledgeBase = { id: genId(), name: '新建知识库', icon: '📁', colorClass: 'bg-muted', docCount: 0, status: 'ready', group: name, updatedAt: '刚刚' };
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


  return (
    <div ref={containerRef} className="flex-1 flex min-h-0">
      <div className="flex-shrink-0 h-full bg-muted/[0.15] border-r border-border/30 relative" style={{ width: sidebarWidth }}>
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
                <div className={`w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 ${selectedKb.colorClass}`}>
                  {selectedKb.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-foreground truncate">{selectedKb.name}</span>
                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${selectedKb.status === 'ready' ? 'bg-cherry-primary' : selectedKb.status === 'indexing' ? 'bg-warning animate-pulse' : 'bg-destructive'}`} />
                    <span className="text-xs text-muted-foreground/50">
                      {selectedKb.status === 'ready' ? '就绪' : selectedKb.status === 'indexing' ? '索引中' : '错误'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground/50 flex-shrink-0">
                <span className="flex items-center gap-0.5"><FileText size={9} />{selectedKb.docCount} 文档</span>
                <span className="flex items-center gap-0.5"><Clock size={9} />{selectedKb.updatedAt}</span>
                <Popover open={headerMenuOpen} onOpenChange={setHeaderMenuOpen}>
                  <Tooltip content="更多操作" side="bottom">
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon-xs" className="rounded text-muted-foreground/50 hover:text-foreground">
                        <MoreHorizontal size={11} />
                      </Button>
                    </PopoverTrigger>
                  </Tooltip>
                  <PopoverContent align="end" className="p-1 min-w-[110px] w-auto">
                    <Button variant="ghost" onClick={() => { setHeaderRenaming(true); setHeaderMenuOpen(false); }} size="inline" className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-popover-foreground hover:bg-accent rounded-md text-left justify-start">
                      <Pencil size={9} /> 重命名
                    </Button>
                    <Button variant="ghost" size="inline" onClick={() => { setHeaderDeleting(true); setHeaderMenuOpen(false); }} className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-md text-left justify-start">
                      <Trash2 size={9} /> 删除知识库
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as DetailTab)} className="flex-1 flex flex-col min-h-0">
              <TabsList variant="line" className="px-2.5 flex-shrink-0 border-b border-border/15 h-auto">
                {detailTabs.map(tab => {
                  const TIcon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 px-2.5 py-2 text-xs">
                      <TIcon size={10} strokeWidth={1.6} />
                      <span>{tab.label}</span>
                      {tab.id === 'sources' && <span className="text-xs text-muted-foreground/40 ml-0.5">{sources.length}</span>}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="sources" className="flex-1 min-h-0 flex flex-col mt-0">
                <DataSourceList sources={sources} onAddSources={handleAddSources} onDeleteSource={handleDeleteSource} onReindexSource={handleReindexSource} />
              </TabsContent>
              <TabsContent value="settings" className="flex-1 min-h-0 flex flex-col mt-0">
                <RAGSettings />
              </TabsContent>
              <TabsContent value="test" className="flex-1 min-h-0 flex flex-col mt-0">
                <RetrievalTester />
              </TabsContent>
            </Tabs>
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
        <ConfirmDialog open title="删除知识库" message={`确定要删除「${selectedKb.name}」吗？所有数据源和配置将被永久移除。`} confirmLabel="删除" danger onConfirm={() => { handleDeleteKb(selectedKb.id); setHeaderDeleting(false); }} onCancel={() => setHeaderDeleting(false)} />
      )}
    </div>
  );
}
