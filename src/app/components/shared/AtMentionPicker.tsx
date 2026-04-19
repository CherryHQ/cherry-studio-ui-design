import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Bot, Cpu,
} from 'lucide-react';
import { ModelPickerPanel } from './ModelPickerPanel';
import { AssistantPickerPanel } from './AssistantPickerPanel';
import { Button } from '@cherry-studio/ui';

type ActiveCategory = 'assistant' | 'model' | null;

interface AtMentionPickerProps {
  selectedAssistants: string[];
  selectedModels: string[];
  onSelectAssistant: (id: string) => void;
  onSelectModel: (id: string) => void;
  multiAssistant: boolean;
  multiModel: boolean;
  onToggleMultiAssistant: () => void;
  onToggleMultiModel: () => void;
  onCreateAssistant?: () => void;
  onClose: () => void;
}

export function AtMentionPicker({
  selectedAssistants,
  selectedModels,
  onSelectAssistant,
  onSelectModel,
  multiAssistant,
  multiModel,
  onToggleMultiAssistant,
  onToggleMultiModel,
  onCreateAssistant,
  onClose,
}: AtMentionPickerProps) {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);

  // Focus search when sub-panel opens
  useEffect(() => {
    if (activeCategory) {
      const t = setTimeout(() => panelRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [activeCategory]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    return () => { if (hoverTimer.current != null) clearTimeout(hoverTimer.current); };
  }, []);

  const switchCategory = (cat: ActiveCategory) => {
    if (cat !== activeCategory) {
      setActiveCategory(cat);
    }
  };

  const clearTimer = () => {
    if (hoverTimer.current != null) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const handleCategoryEnter = (cat: ActiveCategory) => {
    clearTimer();
    switchCategory(cat);
  };

  const handleCategoryLeave = () => {
    clearTimer();
    hoverTimer.current = window.setTimeout(() => {
      setActiveCategory(null);
    }, 200);
  };

  const handleSubpanelEnter = () => { clearTimer(); };
  const handleSubpanelLeave = () => {
    clearTimer();
    hoverTimer.current = window.setTimeout(() => {
      setActiveCategory(null);
    }, 200);
  };

  return (
    <div ref={panelRef} className="absolute bottom-full left-0 mb-2 z-50 flex items-end">
      {/* ════════ Level 1: Category selector ════════ */}
      <div className="w-[120px] bg-popover border border-border rounded-xl shadow-lg py-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="px-1 flex flex-col">
          {/* Assistant option */}
          <div
            className="relative"
            onMouseEnter={() => handleCategoryEnter('assistant')}
            onMouseLeave={handleCategoryLeave}
          >
            <Button variant="ghost" size="xs"
              className={`w-full justify-start gap-2 ${
                activeCategory === 'assistant'
                  ? 'bg-accent/50 text-popover-foreground'
                  : 'text-muted-foreground hover:text-popover-foreground hover:bg-accent/50'
              }`}
            >
              <Bot size={14} strokeWidth={1.5} className="flex-shrink-0" />
              <span className="flex-1 text-left">助手</span>
              <ChevronRight size={12} className="flex-shrink-0 text-muted-foreground/50" />
            </Button>
          </div>

          {/* Model option */}
          <div
            className="relative"
            onMouseEnter={() => handleCategoryEnter('model')}
            onMouseLeave={handleCategoryLeave}
          >
            <Button variant="ghost" size="xs"
              className={`w-full justify-start gap-2 ${
                activeCategory === 'model'
                  ? 'bg-accent/50 text-popover-foreground'
                  : 'text-muted-foreground hover:text-popover-foreground hover:bg-accent/50'
              }`}
            >
              <Cpu size={14} strokeWidth={1.5} className="flex-shrink-0" />
              <span className="flex-1 text-left">模型</span>
              <ChevronRight size={12} className="flex-shrink-0 text-muted-foreground/50" />
            </Button>
          </div>
        </div>
      </div>

      {/* ════════ Level 2: Assistant sub-panel ════════ */}
      {activeCategory === 'assistant' && (
        <div
          onMouseEnter={handleSubpanelEnter}
          onMouseLeave={handleSubpanelLeave}
          className="ml-1.5 bg-popover border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-left-1 duration-100 overflow-hidden max-h-[340px]"
        >
          <AssistantPickerPanel
            selectedAssistants={selectedAssistants}
            onSelectAssistant={onSelectAssistant}
            multiAssistant={multiAssistant}
            onToggleMultiAssistant={onToggleMultiAssistant}
            onClose={onClose}
            onCreateAssistant={onCreateAssistant}
            autoFocus={true}
          />
        </div>
      )}

      {/* ════════ Level 2: Model sub-panel (shared component) ════════ */}
      {activeCategory === 'model' && (
        <div
          onMouseEnter={handleSubpanelEnter}
          onMouseLeave={handleSubpanelLeave}
          className="ml-1.5 bg-popover border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-left-1 duration-100 overflow-hidden w-[380px]"
        >
          <ModelPickerPanel
            selectedModels={selectedModels}
            onSelectModel={onSelectModel}
            multiModel={multiModel}
            onToggleMultiModel={onToggleMultiModel}
            onClose={onClose}
            autoFocus={true}
          />
        </div>
      )}
    </div>
  );
}