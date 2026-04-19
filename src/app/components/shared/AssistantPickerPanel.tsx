import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, X, Check, Plus, ChevronRight,
} from 'lucide-react';
import { MOCK_ASSISTANTS, ASSISTANT_EMOJI_MAP } from '@/app/mock';

export interface AssistantPickerPanelProps {
  selectedAssistants: string[];
  onSelectAssistant: (id: string) => void;
  multiAssistant: boolean;
  onToggleMultiAssistant: () => void;
  /** Called after selecting in single-select mode, or when "create" is clicked */
  onClose?: () => void;
  onCreateAssistant?: () => void;
  /** Auto-focus search input on mount */
  autoFocus?: boolean;
  /** Optional className for root container */
  className?: string;
  /** Label for the create button at the bottom */
  createLabel?: string;
}

export function AssistantPickerPanel({
  selectedAssistants,
  onSelectAssistant,
  multiAssistant,
  onToggleMultiAssistant,
  onClose,
  onCreateAssistant,
  autoFocus = true,
  className = '',
  createLabel = '新建助手',
}: AssistantPickerPanelProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  // Auto-focus
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => searchRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const filteredAssistants = useMemo(() => {
    return MOCK_ASSISTANTS.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search]);

  const handleSelect = (id: string) => {
    onSelectAssistant(id);
    if (!multiAssistant) onClose?.();
  };

  return (
    <div className={`flex flex-col overflow-hidden min-w-[260px] ${className}`}>
      {/* Search */}
      <div className="px-2 pt-1.5 pb-1.5">
        <div className="flex items-center gap-1.5 px-2 py-[4px] rounded-lg bg-accent/15 border border-border/20">
          <Search size={11} strokeWidth={1.5} className="text-muted-foreground/40 flex-shrink-0" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索助手..."
            className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/30 outline-none min-w-0"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground/30 hover:text-muted-foreground/60">
              <X size={9} />
            </button>
          )}
        </div>
      </div>

      {/* Multi-assistant switch */}
      {multiAssistant && (
        <div className="px-3 pb-1 flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground/50">多助手并行（与多模型互斥）</span>
          <button
            onClick={onToggleMultiAssistant}
            className={`relative w-[28px] h-[14px] rounded-full transition-colors duration-150 flex-shrink-0 ${
              multiAssistant ? 'bg-cherry-primary' : 'bg-accent/40'
            }`}
          >
            <div className={`absolute top-[2px] w-[10px] h-[10px] rounded-full bg-white shadow-sm transition-transform duration-150 ${
              multiAssistant ? 'left-[16px]' : 'left-[2px]'
            }`} />
          </button>
        </div>
      )}

      <div className="mx-2 border-t border-border/40 mb-0.5" />

      {/* Assistant list */}
      <div className="px-1 flex flex-col flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
        {filteredAssistants.length === 0 ? (
          <div className="px-3 py-4 text-center text-[10px] text-muted-foreground/40">无匹配结果</div>
        ) : (
          filteredAssistants.map(a => {
            const selected = selectedAssistants.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => handleSelect(a.id)}
                className={`w-full flex items-center gap-2 px-2 py-[5px] text-[11px] rounded-lg transition-colors mb-px ${
                  selected
                    ? 'bg-accent/40 text-popover-foreground'
                    : 'text-popover-foreground hover:bg-accent/50'
                }`}
              >
                {multiAssistant && (
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                    selected ? 'border-cherry-primary bg-cherry-primary' : 'border-border/50'
                  }`}>
                    {selected && <Check size={8} className="text-white" />}
                  </div>
                )}
                <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center flex-shrink-0 ${
                  selected ? 'bg-foreground/10' : 'bg-accent/30'
                }`}>
                  <span className="text-[11px] leading-none">{ASSISTANT_EMOJI_MAP[a.name] || '\uD83E\uDD16'}</span>
                </div>
                <span className="flex-1 truncate text-left">{a.name}</span>
                {!multiAssistant && selected && <Check size={10} className="text-cherry-primary flex-shrink-0" />}
                {multiAssistant && <span className="text-[9px] text-muted-foreground/40 flex-shrink-0">{a.modelProvider}</span>}
              </button>
            );
          })
        )}
      </div>

      {/* Create link */}
      <div className="mx-2 border-t border-border/40 mt-0.5" />
      <div className="px-1 py-0.5">
        <button
          onClick={() => { onClose?.(); onCreateAssistant?.(); }}
          className="w-full flex items-center gap-2 px-2 py-[5px] text-[11px] text-muted-foreground hover:text-popover-foreground hover:bg-accent/50 rounded-lg transition-colors"
        >
          <Plus size={13} strokeWidth={1.5} className="flex-shrink-0" />
          <span className="flex-1 text-left">{createLabel}</span>
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}