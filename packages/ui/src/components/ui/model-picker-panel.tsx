"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, X, Check,
  Eye, Brain, Hammer, Globe,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';

// --- Local types (extracted from app types) ---

export type ModelCapability = 'vision' | 'reasoning' | 'tools' | 'web';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: ModelCapability[];
  group?: string;
}

export const MODEL_CAPABILITY_LABELS: Record<ModelCapability, string> = {
  vision: '\u89c6\u89c9',
  reasoning: '\u63a8\u7406',
  tools: '\u5de5\u5177',
  web: '\u7f51\u7edc',
};

// --- Constants ---

const CAP_ICONS: Record<ModelCapability, { icon: typeof Eye; color: string }> = {
  vision: { icon: Eye, color: 'text-foreground/60' },
  tools: { icon: Hammer, color: 'text-accent-amber' },
  reasoning: { icon: Brain, color: 'text-accent-violet' },
  web: { icon: Globe, color: 'text-accent-blue' },
};

const CAP_TAG_ICONS: Record<ModelCapability, typeof Eye> = {
  vision: Eye,
  reasoning: Brain,
  tools: Hammer,
  web: Globe,
};

const ALL_CAPS: ModelCapability[] = ['vision', 'reasoning', 'tools', 'web'];

// --- Component ---

export interface ModelPickerPanelProps {
  /** All available models */
  models: ModelInfo[];
  selectedModels: string[];
  onSelectModel: (id: string) => void;
  multiModel: boolean;
  onToggleMultiModel: () => void;
  /** Provider color map, e.g. { Anthropic: 'bg-accent-orange' } */
  providerColors?: Record<string, string>;
  /** Capability label overrides */
  capabilityLabels?: Record<ModelCapability, string>;
  /** Called after selecting in single-select mode */
  onClose?: () => void;
  /** Auto-focus search input on mount */
  autoFocus?: boolean;
  /** Override initial active provider */
  initialProvider?: string;
  /** Optional className for root container */
  className?: string;
}

export function ModelPickerPanel({
  models,
  selectedModels,
  onSelectModel,
  multiModel,
  onToggleMultiModel,
  providerColors = {},
  capabilityLabels,
  onClose,
  autoFocus = true,
  initialProvider,
  className,
}: ModelPickerPanelProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [capFilter, setCapFilter] = useState<ModelCapability | null>(null);

  const labels = capabilityLabels || MODEL_CAPABILITY_LABELS;

  const allProviders = useMemo(() => {
    const s = new Set<string>();
    models.forEach(m => s.add(m.provider));
    return Array.from(s);
  }, [models]);

  const [activeProvider, setActiveProvider] = useState<string>(
    () => initialProvider || models[0]?.provider || ''
  );

  // Auto-focus
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => searchRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const providerModels = useMemo(() => {
    return models.filter(m => {
      if (m.provider !== activeProvider) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (capFilter && !m.capabilities.includes(capFilter)) return false;
      return true;
    });
  }, [models, activeProvider, search, capFilter]);

  const handleSelect = (id: string) => {
    onSelectModel(id);
    if (!multiModel) onClose?.();
  };

  return (
    <div data-slot="model-picker-panel" className={cn('tracking-tight', className)}>
      {/* Search */}
      <div className="px-2 pt-2 pb-1.5">
        <div className="flex items-center gap-1.5 px-2 py-[5px] rounded-[var(--radius-button)] bg-accent/15 border border-border/20">
          <Search size={10} className="text-muted-foreground/40 flex-shrink-0" />
          <Input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索模型..."
            className="flex-1 h-auto border-0 bg-transparent text-xs shadow-none px-0 py-0 rounded-none focus-visible:ring-0 focus-visible:border-transparent min-w-0"
          />
          {search && (
            <Button variant="ghost" size="icon-xs" onClick={() => setSearch('')} className="w-4 h-4 text-muted-foreground/30 hover:text-muted-foreground/60">
              <X size={8} />
            </Button>
          )}
        </div>
      </div>

      {/* Capability tag filters */}
      <div className="px-2.5 pb-1 flex items-center gap-1 flex-wrap">
        {ALL_CAPS.map(cap => {
          const Icon = CAP_TAG_ICONS[cap];
          const active = capFilter === cap;
          return (
            <Button
              key={cap}
              variant="ghost"
              size="xs"
              onClick={() => setCapFilter(active ? null : cap)}
              className={cn(
                "gap-1 px-1.5 py-[2px] h-auto rounded-full text-xs border",
                active
                  ? 'bg-foreground/8 text-foreground/80 border-border/50'
                  : 'bg-accent/15 text-muted-foreground/55 border-transparent hover:bg-accent/30 hover:text-muted-foreground/75'
              )}
            >
              <Icon size={9} />
              <span>{labels[cap]}</span>
            </Button>
          );
        })}
      </div>

      {/* Multi-model switch */}
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <span className="text-xs text-muted-foreground/50">多模型并行（与多助手互斥）</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={onToggleMultiModel}
          className={cn(
            "relative w-[28px] h-[14px] p-0 rounded-full transition-colors duration-150 flex-shrink-0",
            multiModel ? 'bg-cherry-primary hover:bg-cherry-primary/90' : 'bg-accent/40'
          )}
        >
          <div className={`absolute top-[2px] w-[10px] h-[10px] rounded-full bg-background shadow-sm transition-transform duration-150 ${
            multiModel ? 'left-[16px]' : 'left-[2px]'
          }`} />
        </Button>
      </div>

      <div className="h-px bg-border/20" />

      {/* Two-column: providers | models */}
      <div className="flex h-[240px]">
        {/* Left: providers */}
        <div className="w-[110px] border-r border-border/20 py-1 overflow-y-auto flex-shrink-0">
          {allProviders.map(p => {
            const count = models.filter(
              m => m.provider === p && (!capFilter || m.capabilities.includes(capFilter))
            ).length;
            const provColor = providerColors[p] || 'bg-muted-foreground/40';
            return (
              <Button
                key={p}
                variant="ghost"
                size="xs"
                onClick={() => setActiveProvider(p)}
                className={cn(
                  "w-full justify-start gap-1.5 px-2.5 py-[6px] h-auto rounded-none text-xs transition-all duration-75",
                  activeProvider === p
                    ? 'bg-accent/30 text-foreground'
                    : 'text-foreground/60 hover:text-foreground hover:bg-accent/15'
                )}
              >
                <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${provColor}`} />
                <span className="truncate flex-1">{p}</span>
                <span className="text-[11px] text-muted-foreground/40 flex-shrink-0">{count}</span>
              </Button>
            );
          })}
        </div>

        {/* Right: models */}
        <div className="flex-1 py-1 px-1.5 overflow-y-auto">
          {providerModels.length === 0 ? (
            <div className="px-2.5 py-3 text-center text-xs text-muted-foreground/40">无匹配结果</div>
          ) : (
            providerModels.map(m => {
              const selected = selectedModels.includes(m.id);
              return (
                <Button
                  key={m.id}
                  variant="ghost"
                  size="xs"
                  onClick={() => handleSelect(m.id)}
                  className={cn(
                    "w-full justify-start gap-2 px-2 py-[5px] h-auto text-xs transition-all duration-75 mb-px",
                    selected ? 'bg-accent/30 ring-[1px] ring-border/30' : 'text-foreground/70 hover:text-foreground hover:bg-accent/15'
                  )}
                >
                  {multiModel && (
                    <Checkbox checked={selected} className="size-3.5 pointer-events-none data-[state=checked]:border-cherry-primary data-[state=checked]:bg-cherry-primary" tabIndex={-1} />
                  )}
                  <span className={`flex-1 text-left truncate ${selected ? 'text-foreground' : ''}`}>{m.name}</span>
                  <div className="flex items-center gap-[3px] flex-shrink-0">
                    {m.capabilities.map(cap => {
                      const ci = CAP_ICONS[cap];
                      const CapIcon = ci.icon;
                      return <CapIcon key={cap} size={10} className={`${ci.color}/40`} />;
                    })}
                  </div>
                  {!multiModel && selected && <Check size={9} className="text-cherry-primary flex-shrink-0 ml-0.5" />}
                </Button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
