import React, { useState } from 'react';
import { Plus, Trash2, Database, AlertCircle } from 'lucide-react';
import { Button, Slider, SearchInput, Popover, PopoverTrigger, PopoverContent, Typography } from '@cherry-studio/ui';
import { MOCK_KNOWLEDGE_BASES } from '@/app/config/constants';

export function KnowledgeSection() {
  const [linkedKBs, setLinkedKBs] = useState<string[]>(['kb-1', 'kb-2']);
  const [topK, setTopK] = useState(5);
  const [scoreThreshold, setScoreThreshold] = useState(0.7);
  const [showKBPicker, setShowKBPicker] = useState(false);
  const [kbSearch, setKbSearch] = useState('');

  const linkedItems = MOCK_KNOWLEDGE_BASES.filter(kb => linkedKBs.includes(kb.id));
  const unlinkedItems = MOCK_KNOWLEDGE_BASES.filter(kb =>
    !linkedKBs.includes(kb.id) && (!kbSearch || kb.name.toLowerCase().includes(kbSearch.toLowerCase()))
  );

  const toggleLink = (id: string) => {
    setLinkedKBs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Typography variant="subtitle" className="mb-1">知识库关联</Typography>
        <p className="text-xs text-muted-foreground/60">选择知识库并配置检索参数</p>
      </div>

      {/* Linked */}
      <div>
        <label className="text-sm text-muted-foreground/60 mb-2 block">已关联知识库</label>
        {linkedItems.length === 0 ? (
          <div className="border border-dashed border-border/20 rounded-xl p-6 flex flex-col items-center">
            <Database size={20} strokeWidth={1.2} className="text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground/40 mb-1">暂未关联知识库</p>
            <p className="text-xs text-muted-foreground/50">关联知识库后，助手可以根据文档内容回答问题</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {linkedItems.map(kb => (
              <div key={kb.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/15 bg-accent/15 group hover:border-border/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center text-sm flex-shrink-0">{kb.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground truncate">{kb.name}</div>
                  <div className="text-xs text-muted-foreground/50">{kb.docCount} 文档 · {kb.size}</div>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => toggleLink(kb.id)} className=" rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={10} /></Button>
              </div>
            ))}
          </div>
        )}
        <Popover open={showKBPicker} onOpenChange={setShowKBPicker}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="xs"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors border border-border/15 hover:border-border/30 mt-2">
              <Plus size={10} /> 添加知识库
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-2 min-w-[240px]">
            <div className="mb-2">
              <SearchInput value={kbSearch} onChange={setKbSearch} placeholder="搜索知识库..." />
            </div>
            {unlinkedItems.length === 0 ? (
              <p className="text-xs text-muted-foreground/40 px-2 py-3 text-center">没有更多可用的知识库</p>
            ) : (
              unlinkedItems.map(kb => (
                <Button variant="ghost" size="sm" key={kb.id} onClick={() => { toggleLink(kb.id); setShowKBPicker(false); }}
                  className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-left hover:bg-accent/50 transition-colors">
                  <span className="text-sm">{kb.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground truncate">{kb.name}</div>
                    <div className="text-xs text-muted-foreground/50">{kb.docCount} 文档</div>
                  </div>
                </Button>
              ))
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-px bg-border/30" />

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground/60 mb-1.5 block">Top-K <span className="text-muted-foreground/50 ml-1">{topK}</span></label>
          <Slider min={1} max={20} step={1} value={[topK]} onValueChange={([v]) => setTopK(v)} />
          <div className="flex justify-between mt-1"><span className="text-xs text-muted-foreground/50">1</span><span className="text-xs text-muted-foreground/50">20</span></div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground/60 mb-1.5 block">相似度阈值 <span className="text-muted-foreground/50 ml-1">{scoreThreshold.toFixed(2)}</span></label>
          <Slider min={0} max={1} step={0.05} value={[scoreThreshold]} onValueChange={([v]) => setScoreThreshold(v)} />
          <div className="flex justify-between mt-1"><span className="text-xs text-muted-foreground/50">0</span><span className="text-xs text-muted-foreground/50">1.0</span></div>
        </div>
      </div>

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-warning/5 border border-warning/15">
        <AlertCircle size={12} className="text-warning/50 flex-shrink-0 mt-px" />
        <div>
          <p className="text-xs text-warning/60">提高 Top-K 可以获取更多上下文，但会增加 Token 消耗。</p>
          <p className="text-xs text-warning/40 mt-0.5">建议值：Top-K 3~8，阈值 0.6~0.8</p>
        </div>
      </div>
    </div>
  );
}
