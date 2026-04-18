"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, X, Check,
  Eye, Brain, Hammer, Globe,
} from 'lucide-react';
import { cn } from "../../lib/utils"
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Switch } from './switch';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';

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
  vision: { icon: Eye, color: 'text-muted-foreground/60' },
  tools: { icon: Hammer, color: 'text-accent-amber/60' },
  reasoning: { icon: Brain, color: 'text-accent-violet/60' },
  web: { icon: Globe, color: 'text-accent-blue/60' },
};

const CAP_TAG_ICONS: Record<ModelCapability, typeof Eye> = {
  vision: Eye,
  reasoning: Brain,
  tools: Hammer,
  web: Globe,
};

const ALL_CAPS: ModelCapability[] = ['vision', 'reasoning', 'tools', 'web'];

// --- Component ---

export interface ModelPickerPanelLabels {
  searchPlaceholder?: string
  multiModelLabel?: string
  noResults?: string
}

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
  /** UI text overrides for i18n */
  labels?: ModelPickerPanelLabels;
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
  labels: labelsProp,
}: ModelPickerPanelProps) {
  const uiLabels = {
    searchPlaceholder: "搜索模型...",
    multiModelLabel: "多模型并行（与多助手互斥）",
    noResults: "无匹配结果",
    ...labelsProp,
  };
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
    <div data-slot="model-picker-panel" className={cn('tracking-[-0.14px]', className)}>
      {/* Search */}
      <div className="px-2 pt-2 pb-1.5">
        <div className="flex items-center gap-1.5 px-2 py-[5px] rounded-[var(--radius-button)] bg-muted/30 border-[1.5px] border-input">
          <Search size={10} className="text-muted-foreground/60 flex-shrink-0" />
          <Input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={uiLabels.searchPlaceholder}
            aria-label="Search models"
            className="flex-1 h-auto border-0 bg-transparent text-xs shadow-none px-0 py-0 rounded-none focus-visible:ring-0 focus-visible:border-transparent min-w-0"
          />
          {search && (
            <Button variant="ghost" size="icon-xs" onClick={() => setSearch('')} aria-label="Clear search" className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground/60">
              <X size={12} />
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
                  : 'bg-accent/25 text-muted-foreground/55 border-transparent hover:bg-accent/30 hover:text-muted-foreground/75'
              )}
            >
              <Icon size={12} />
              <span>{labels[cap]}</span>
            </Button>
          );
        })}
      </div>

      {/* Multi-model switch */}
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <span className="text-xs text-muted-foreground/50">{uiLabels.multiModelLabel}</span>
        <Switch checked={multiModel} onCheckedChange={() => onToggleMultiModel()} className="scale-75" />
      </div>

      <Separator className="bg-border/20" />

      {/* Two-column: providers | models */}
      <div className="flex h-[240px]">
        {/* Left: providers */}
        <ScrollArea className="w-[110px] border-r border-border/30 flex-shrink-0">
          <div className="py-1">
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
                    "w-full justify-start gap-1.5 px-2.5 py-[6px] h-auto rounded-[var(--radius-button)] text-xs transition-all duration-[var(--duration-fast)]",
                    activeProvider === p
                      ? 'bg-accent/30 text-foreground'
                      : 'text-foreground/60 hover:text-foreground hover:bg-accent/25'
                  )}
                >
                  <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${provColor}`} />
                  <span className="truncate flex-1">{p}</span>
                  <span className="text-xs text-muted-foreground/60 flex-shrink-0">{count}</span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Right: models */}
        <ScrollArea className="flex-1">
          <div className="py-1 px-1.5">
          {providerModels.length === 0 ? (
            <div className="px-2.5 py-3 text-center text-xs text-muted-foreground/60">{uiLabels.noResults}</div>
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
                    "w-full justify-start gap-2 px-2 py-[5px] h-auto text-xs transition-all duration-[var(--duration-fast)] mb-px",
                    selected ? 'bg-accent/30 ring-[1px] ring-border/30' : 'text-foreground/70 hover:text-foreground hover:bg-accent/25'
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
                      return <CapIcon key={cap} size={10} className={ci.color} />;
                    })}
                  </div>
                  {!multiModel && selected && <Check size={12} className="text-cherry-primary flex-shrink-0 ml-0.5" />}
                </Button>
              );
            })
          )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
