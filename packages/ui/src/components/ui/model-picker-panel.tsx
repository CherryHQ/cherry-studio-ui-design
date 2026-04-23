"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, X, Check, Pin, Bolt,
  Eye, Brain, Hammer, Globe, Gift,
} from 'lucide-react';
import { cn } from "../../lib/utils"
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Switch } from './switch';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';
import { BrandLogo } from './brand-logos';

// --- Local types (extracted from app types) ---

export type ModelCapability = 'vision' | 'reasoning' | 'tools' | 'web' | 'free';

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
  web: '\u8054\u7f51',
  free: '\u514d\u8d39',
};

// --- Constants ---

/** Capability badge config: icon + background + text color for circle badges & filter tags */
const CAP_CONFIG: Record<ModelCapability, { icon: typeof Eye; bg: string; text: string }> = {
  vision: { icon: Eye, bg: 'bg-success/15', text: 'text-success' },
  reasoning: { icon: Brain, bg: 'bg-accent-violet/15', text: 'text-accent-violet' },
  tools: { icon: Hammer, bg: 'bg-accent-amber/15', text: 'text-accent-amber' },
  web: { icon: Globe, bg: 'bg-accent-blue/15', text: 'text-accent-blue' },
  free: { icon: Gift, bg: 'bg-success/10', text: 'text-success' },
};

const ALL_CAPS: ModelCapability[] = ['vision', 'reasoning', 'tools', 'web', 'free'];

// --- Component ---

export interface ModelPickerPanelLabels {
  searchPlaceholder?: string
  multiModelLabel?: string
  noResults?: string
  filterLabel?: string
  pinnedLabel?: string
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
  /** @deprecated No longer used in single-column layout */
  initialProvider?: string;
  /** Optional className for root container */
  className?: string;
  /** UI text overrides for i18n */
  labels?: ModelPickerPanelLabels;
  /** Controlled list of pinned/starred model IDs */
  pinnedModelIds?: string[];
  /** Callback when user clicks star icon to pin/unpin a model */
  onTogglePin?: (id: string) => void;
  /** Show multi-model toggle switch (default: true) */
  showMultiModelToggle?: boolean;
  /** Callback when user clicks manage icon on a provider group header */
  onManageProvider?: (provider: string) => void;
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
  className,
  labels: labelsProp,
  pinnedModelIds = [],
  onTogglePin,
  showMultiModelToggle = true,
  onManageProvider,
}: ModelPickerPanelProps) {
  const uiLabels = {
    searchPlaceholder: "搜索模型...",
    multiModelLabel: "多模型并行（与多助手互斥）",
    noResults: "无匹配结果",
    filterLabel: "按标签筛选",
    pinnedLabel: "已固定",
    ...labelsProp,
  };
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [capFilter, setCapFilter] = useState<ModelCapability | null>(null);

  const labels = capabilityLabels || MODEL_CAPABILITY_LABELS;

  const pinnedSet = useMemo(() => new Set(pinnedModelIds), [pinnedModelIds]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => searchRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  // Filter and group models
  const { pinnedModels, providerGroups, totalFiltered } = useMemo(() => {
    const filtered = models.filter(m => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (capFilter && !m.capabilities.includes(capFilter)) return false;
      return true;
    });

    const pinned = filtered.filter(m => pinnedSet.has(m.id));
    const unpinned = filtered.filter(m => !pinnedSet.has(m.id));

    const groups = new Map<string, ModelInfo[]>();
    for (const m of unpinned) {
      const list = groups.get(m.provider) ?? [];
      list.push(m);
      groups.set(m.provider, list);
    }

    return {
      pinnedModels: pinned,
      providerGroups: Array.from(groups.entries()),
      totalFiltered: filtered.length,
    };
  }, [models, search, capFilter, pinnedSet]);

  const handleSelect = (id: string) => {
    onSelectModel(id);
    if (!multiModel) onClose?.();
  };

  const renderModelRow = (m: ModelInfo) => {
    const isSelected = selectedModels.includes(m.id);
    const isPinned = pinnedSet.has(m.id);
    const provColor = providerColors[m.provider] || 'bg-muted-foreground/40';

    return (
      <button
        key={m.id}
        onClick={() => handleSelect(m.id)}
        className={cn(
          "group w-full flex items-center gap-2.5 px-3 py-[5px] mb-0.5 text-left transition-all duration-[var(--duration-fast)] rounded-lg cursor-pointer",
          isSelected
            ? 'bg-accent/40 text-foreground'
            : 'text-foreground/80 hover:bg-accent/20'
        )}
      >
        {multiModel && (
          <Checkbox checked={isSelected} className="size-3.5 pointer-events-none data-[state=checked]:border-cherry-primary data-[state=checked]:bg-cherry-primary flex-shrink-0" tabIndex={-1} />
        )}
        {/* Provider icon */}
        <BrandLogo id={m.provider.toLowerCase()} fallbackLetter={m.provider[0]} size={16} className="flex-shrink-0" />
        {/* Model name */}
        <span className={cn("text-sm truncate flex-1 min-w-0", isSelected && 'font-medium')}>{m.name}</span>
        {/* Capability circle badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {m.capabilities.filter(cap => cap in CAP_CONFIG).map(cap => {
            const cfg = CAP_CONFIG[cap as ModelCapability];
            const CapIcon = cfg.icon;
            return (
              <span key={cap} className={cn("w-5 h-5 rounded-full flex items-center justify-center", cfg.bg)}>
                <CapIcon size={11} className={cfg.text} />
              </span>
            );
          })}
        </div>
        {/* Shared trailing icon: check (selected) / pin (hover or pinned) */}
        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          {!multiModel && isSelected ? (
            <Check size={14} className="text-foreground/50" />
          ) : isPinned ? (
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin?.(m.id); }}
              className="text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
              aria-label="Unpin model"
            >
              <Pin size={13} className="rotate-45" />
            </button>
          ) : onTogglePin ? (
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(m.id); }}
              className="text-muted-foreground/15 opacity-0 group-hover:opacity-100 hover:text-muted-foreground/40 transition-all"
              aria-label="Pin model"
            >
              <Pin size={13} />
            </button>
          ) : null}
        </span>
      </button>
    );
  };

  return (
    <div data-slot="model-picker-panel" className={cn('tracking-[-0.14px]', className)}>
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 px-2.5 py-[7px] rounded-xl bg-muted/40">
          <Search size={14} className="text-muted-foreground/40 flex-shrink-0" />
          <Input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={uiLabels.searchPlaceholder}
            aria-label="Search models"
            className="flex-1 h-auto border-0 bg-transparent text-sm shadow-none px-0 py-0 rounded-none focus-visible:ring-0 focus-visible:border-transparent min-w-0 placeholder:text-muted-foreground/30"
          />
          {search && (
            <Button variant="ghost" size="icon-xs" onClick={() => setSearch('')} aria-label="Clear search" className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground/60">
              <X size={12} />
            </Button>
          )}
        </div>
      </div>

      {/* Tag filter row */}
      <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-foreground/40">{uiLabels.filterLabel}</span>
        {ALL_CAPS.map(cap => {
          const active = capFilter === cap;
          const cfg = CAP_CONFIG[cap];
          const Icon = cfg.icon;
          return (
            <button
              key={cap}
              onClick={() => setCapFilter(active ? null : cap)}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-xs border transition-colors cursor-pointer",
                active
                  ? cn('border-current/30', cfg.bg, cfg.text)
                  : cn('border-border/40 hover:border-current/20', cfg.text, 'opacity-60 hover:opacity-80')
              )}
            >
              <Icon size={12} />
              <span>{labels[cap]}</span>
            </button>
          );
        })}
      </div>

      {/* Multi-model switch (optional) */}
      {showMultiModelToggle && (
        <>
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs text-muted-foreground/50">{uiLabels.multiModelLabel}</span>
            <Switch checked={multiModel} onCheckedChange={() => onToggleMultiModel()} className="scale-75" />
          </div>
          <Separator className="bg-border/20" />
        </>
      )}

      {!showMultiModelToggle && <Separator className="bg-border/15 mx-3" />}

      {/* Single-column grouped model list */}
      <ScrollArea className="h-[320px]">
        <div className="py-1 px-1.5">
          {totalFiltered === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground/40">{uiLabels.noResults}</div>
          ) : (
            <>
              {/* Pinned section */}
              {pinnedModels.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground/35 px-3 pt-2 pb-1">{uiLabels.pinnedLabel}</div>
                  {pinnedModels.map(renderModelRow)}
                </>
              )}

              {/* Provider-grouped sections */}
              {providerGroups.map(([provider, groupModels]) => (
                <React.Fragment key={provider}>
                  <div className="flex items-center gap-1 px-3 pt-2 pb-1 group/header">
                    <span className="text-xs text-muted-foreground/35">{provider}</span>
                    {onManageProvider && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onManageProvider(provider); }}
                        className="text-muted-foreground/20 opacity-0 group-hover/header:opacity-100 hover:text-muted-foreground/50 transition-all p-0.5 rounded"
                        aria-label={`Manage ${provider}`}
                      >
                        <Bolt size={11} />
                      </button>
                    )}
                  </div>
                  {groupModels.map(renderModelRow)}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
