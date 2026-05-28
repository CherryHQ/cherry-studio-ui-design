import React, { useMemo, useState } from 'react';
import { Plus, Trash2, FileText, Copy, Check, Eye } from 'lucide-react';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Popover, PopoverTrigger, PopoverContent } from '@cherrystudio/ui/components/primitives/popover';
import { SearchInput, Typography, EmptyState } from '@cherry-studio/ui';
import { MOCK_RESOURCES } from '@/app/config/constants';
import type { ResourceItem } from '@/app/types';

// ===========================
// Quick Phrases (快捷短语)
// ===========================
// This section is a *reference* view — it doesn't author phrases of its
// own. The library (资源库) owns the Prompt resources; here the user
// just links the ones they want this assistant to surface in chat.
// Pattern mirrors KnowledgeSection / ToolSection: linked list at top,
// link more via a Popover picker, click chip for full content preview.

const ALL_PROMPTS: ResourceItem[] = MOCK_RESOURCES.filter(r => r.type === 'prompt');

const TAG_COLOR_MAP: Record<string, string> = {
  生产力: 'bg-accent-emerald-muted text-accent-emerald border-accent-emerald/20',
  写作:   'bg-accent-amber-muted   text-accent-amber   border-accent-amber/20',
  编程:   'bg-accent-cyan-muted    text-accent-cyan    border-accent-cyan/20',
  翻译:   'bg-accent-violet-muted  text-accent-violet  border-accent-violet/20',
  创意:   'bg-accent-pink-muted    text-accent-pink    border-accent-pink/20',
};

function tagClass(tag: string) {
  return TAG_COLOR_MAP[tag] || 'bg-muted text-muted-foreground border-border/40';
}

export function PhrasesSection() {
  // Pre-seed with the first two enabled prompts so the section renders
  // with content out of the box.
  const [linkedIds, setLinkedIds] = useState<string[]>(() =>
    ALL_PROMPTS.filter(p => p.enabled).slice(0, 2).map(p => p.id),
  );
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const linkedItems = useMemo(
    () => ALL_PROMPTS.filter(p => linkedIds.includes(p.id)),
    [linkedIds],
  );

  const unlinkedItems = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return ALL_PROMPTS.filter(p => !linkedIds.includes(p.id))
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [linkedIds, pickerSearch]);

  const toggleLink = (id: string) => {
    setLinkedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCopy = (id: string, body: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(body).catch(() => {});
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  return (
    <div className="max-w-3xl space-y-5">

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-muted-foreground">已引用 Prompt</label>
          <Popover open={showPicker} onOpenChange={(v) => { setShowPicker(v); if (!v) setPickerSearch(''); }}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="xs"
                className="flex items-center gap-1 h-7 px-2.5 rounded-md text-xs text-muted-foreground/80 hover:text-foreground hover:bg-accent/40 border border-border/30">
                <Plus size={10} /> 引用 Prompt
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[300px] p-2">
              <div className="mb-2">
                <SearchInput
                  value={pickerSearch}
                  onChange={setPickerSearch}
                  placeholder="搜索 Prompt…"
                  clearable
                  wrapperClassName="flex items-center gap-1.5 px-2 h-7 rounded-md bg-muted/30 border border-border/20"
                />
              </div>
              <div className="max-h-[260px] overflow-y-auto scrollbar-thin space-y-1">
                {unlinkedItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground/40 px-2 py-3 text-center">
                    {pickerSearch ? '未找到匹配的 Prompt' : '资源库中没有更多 Prompt'}
                  </p>
                ) : (
                  unlinkedItems.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => { toggleLink(p.id); setShowPicker(false); setPickerSearch(''); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{p.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground/50 truncate">{p.description}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {linkedItems.length === 0 ? (
          <EmptyState preset="no-phrase" title="尚未引用任何 Prompt"
            description="从资源库挑选模板，让用户在对话中一键调用" compact />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {linkedItems.map(p => (
              <div key={p.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 bg-accent/15 group hover:border-border hover:bg-accent/40 transition-colors min-w-0">
                <FileText size={11} className="text-muted-foreground/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground truncate">{p.name}</span>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => toggleLink(p.id)} title="取消引用"
                  className="rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
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
