import React, { useState } from 'react';
import { Plus, Trash2, Database, Info } from 'lucide-react';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Popover, PopoverTrigger, PopoverContent } from '@cherrystudio/ui/components/primitives/popover';
import { SearchInput, Typography, SimpleTooltip, Switch, EmptyState } from '@cherry-studio/ui';
import { MOCK_KNOWLEDGE_BASES } from '@/app/config/constants';

// ===========================
// Knowledge Base (知识库) section
// ===========================
// Mirrors Cherry Studio source's AssistantKnowledgeBaseSettings:
//   - reference list of available knowledge bases
//   - 意图检索 switch — same row as the section header so the picker
//     stays compact (removed the standalone 检索设置 sub-section).
// The Top-K / similarity-threshold sliders that used to live here
// belong elsewhere per source; they're configured at the KB itself.

export function KnowledgeSection() {
  const [linkedKBs, setLinkedKBs] = useState<string[]>(['kb-1', 'kb-2']);
  const [showKBPicker, setShowKBPicker] = useState(false);
  const [kbSearch, setKbSearch] = useState('');
  // 意图检索 — when ON, the assistant decides per-query whether to
  // search the linked KBs (vs forcing retrieval on every message).
  const [intentRetrieval, setIntentRetrieval] = useState(true);

  const linkedItems = MOCK_KNOWLEDGE_BASES.filter(kb => linkedKBs.includes(kb.id));
  const unlinkedItems = MOCK_KNOWLEDGE_BASES.filter(kb =>
    !linkedKBs.includes(kb.id) && (!kbSearch || kb.name.toLowerCase().includes(kbSearch.toLowerCase()))
  );

  const toggleLink = (id: string) => {
    setLinkedKBs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-3xl space-y-3">
      {/* 意图检索 — section-level behavior toggle. Sits above the
          linked-KB list as a standalone row instead of being squeezed
          next to the section label (which felt cramped). */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <label className="text-sm text-muted-foreground">意图检索</label>
          <SimpleTooltip
            content="开启后助手按意图自动判断是否检索已引用的知识库；关闭则每条消息都强制检索。"
            side="top"
            sideOffset={6}
          >
            <button type="button" tabIndex={-1}
              className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground cursor-help"
              aria-label="什么是意图检索">
              <Info size={12} />
            </button>
          </SimpleTooltip>
        </div>
        <Switch
          checked={intentRetrieval}
          onCheckedChange={setIntentRetrieval}
          className="flex-shrink-0"
        />
      </div>

      {/* Linked KBs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-muted-foreground">已引用知识库</label>
          <Popover open={showKBPicker} onOpenChange={(v) => { setShowKBPicker(v); if (!v) setKbSearch(''); }}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="xs"
                className="flex items-center gap-1 h-7 px-2.5 rounded-md text-xs text-muted-foreground/80 hover:text-foreground hover:bg-accent/40 border border-border/30">
                <Plus size={10} /> 引用知识库
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[280px] p-2">
              <div className="mb-2">
                <SearchInput
                  value={kbSearch}
                  onChange={setKbSearch}
                  placeholder="搜索知识库…"
                  clearable
                  wrapperClassName="flex items-center gap-1.5 px-2 h-7 rounded-md bg-muted/30 border border-border/20"
                />
              </div>
              <div className="max-h-[260px] overflow-y-auto scrollbar-thin space-y-1">
                {unlinkedItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground/40 px-2 py-3 text-center">
                    {kbSearch ? '未找到匹配的知识库' : '资源库中没有更多知识库'}
                  </p>
                ) : (
                  unlinkedItems.map(kb => (
                    <button
                      type="button"
                      key={kb.id}
                      onClick={() => { toggleLink(kb.id); setShowKBPicker(false); setKbSearch(''); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{kb.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-foreground truncate">{kb.name}</div>
                        <div className="text-xs text-muted-foreground/50">{kb.docCount} 文档</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {linkedItems.length === 0 ? (
          <EmptyState preset="no-knowledge" title="尚未引用任何知识库"
            description="引用后助手可以基于文档内容回答问题" compact />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {linkedItems.map(kb => (
              <div key={kb.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border/15 bg-accent/15 group hover:border-border/30 transition-colors min-w-0">
                <div className="w-7 h-7 rounded-md bg-accent/50 flex items-center justify-center text-xs flex-shrink-0">{kb.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate leading-tight">{kb.name}</div>
                  <div className="text-xs text-muted-foreground/50 truncate mt-0.5">{kb.docCount} 文档 · {kb.size}</div>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => toggleLink(kb.id)}
                  title="取消引用"
                  className="rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={11} />
                </Button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
