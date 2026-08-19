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
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

/**
 * 模型不可用（额度用完等）时品牌 logo 的处理：logo 本身不动，上面盖一层半透明
 * 白遮罩，做出「褪下去」的效果 —— 底下还是原来的品牌色，认得出是哪家。
 * 遮罩跟着 logo 的圆角走，所以这个 class 要加在**紧贴 logo** 的那层元素上
 * （inline-flex，不带额外内边距），否则遮罩会比 logo 大一圈。
 * 列表和顶栏的模型选择器共用这套。
 */
export const MUTED_LOGO_CLASS =
  "relative inline-flex rounded-[3px] overflow-hidden after:absolute after:inset-0 after:content-[''] after:bg-white/55 after:pointer-events-none";

// --- Local types (extracted from app types) ---

export type ModelCapability = 'vision' | 'reasoning' | 'tools' | 'web' | 'free';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: ModelCapability[];
  group?: string;
  /**
   * 当前不可用的能力标识 —— 徽标仍然出现，但转成中性灰，表示"这个模型有这项
   * 能力，只是现在用不上"。例：免费额度用完后的 free 标识。
   */
  mutedCapabilities?: ModelCapability[];
  /**
   * 以下字段驱动 hover 模型卡：一条都没有时不出卡（例：助手侧还没补详情的模型
   * 列表，行为跟以前一样）。
   */
  /** 服务商侧的模型 ID（展示用，与本地 id 不一定相同） */
  modelId?: string;
  contextWindow?: number;
  maxOutput?: number;
  /** 思维链长度档位，如 "沉思, 极致" */
  thinkingLevels?: string;
  /**
   * 覆盖列表里的品牌图标 id（默认取 provider）。托管类服务商（如 CherryAI）下面
   * 挂的是别家模型，图标该跟模型走，不跟服务商走。
   */
  logoId?: string;
  /**
   * 整条按"当前用不了"渲染：图标去色、名称转灰。模型本身仍可选中（例：免费额度
   * 用完，选中时给提示，不从列表里消失）。
   */
  muted?: boolean;
  /** 模型名下面的一行灰色说明，例：限时免费的使用范围 */
  note?: string;
  /**
   * 引导行（非真模型）：占一个模型行的位置，品牌 logo + 正常字色的名称，
   * 右侧一颗小按钮（如「订阅」「申请」）。按钮点击走 onCtaClick 而不是
   * onSelectModel，不进入选中态；没传 onCtaClick 的选择器不渲染这一行。
   * 搜索 / 标签筛选时也不出现。
   */
  cta?: { actionLabel: string };
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

// --- Hover model card ---

/** 详情字段一条都没有的模型不出卡（避免出一张只有标题的空卡）。 */
function hasModelDetail(m: ModelInfo) {
  return Boolean(m.modelId || m.contextWindow || m.maxOutput || m.thinkingLevels || m.note);
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 text-[13px]">
      <span className="w-[72px] flex-shrink-0 text-muted-foreground/60">{label}</span>
      <span className="flex-1 min-w-0 text-foreground/85">{children}</span>
    </div>
  );
}

function ModelDetailCard({
  model,
  capabilityLabels,
}: {
  model: ModelInfo;
  capabilityLabels: Record<ModelCapability, string>;
}) {
  const caps = model.capabilities.filter(cap => cap in CAP_CONFIG);
  return (
    <div className="tracking-[-0.14px]">
      <div className="px-4 py-3">
        <div className="text-[15px] font-medium text-foreground truncate">{model.name}</div>
        {model.note && (
          <div className="mt-1 text-[12.5px] text-muted-foreground/60">{model.note}</div>
        )}
      </div>
      <Separator className="bg-border/30" />
      <div className="px-4 py-3 flex flex-col gap-2.5">
        <DetailRow label="服务商">{model.provider}</DetailRow>
        {model.modelId && (
          <DetailRow label="模型 ID">
            <span className="font-mono text-[12.5px] break-all">{model.modelId}</span>
          </DetailRow>
        )}
        {caps.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {caps.map(cap => {
              const cfg = CAP_CONFIG[cap];
              const Icon = cfg.icon;
              const muted = model.mutedCapabilities?.includes(cap);
              return (
                <span
                  key={cap}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-xs',
                    muted ? 'bg-muted-foreground/10 text-muted-foreground/50' : cn(cfg.bg, cfg.text)
                  )}
                >
                  <Icon size={12} />
                  <span>{capabilityLabels[cap]}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
      {(model.contextWindow || model.maxOutput) && (
        <>
          <Separator className="bg-border/30" />
          <div className="px-4 py-3 flex flex-col gap-2.5">
            {model.contextWindow && (
              <DetailRow label="上下文窗口">{model.contextWindow.toLocaleString('en-US')}</DetailRow>
            )}
            {model.maxOutput && (
              <DetailRow label="最大输出">{model.maxOutput.toLocaleString('en-US')}</DetailRow>
            )}
          </div>
        </>
      )}
      {model.thinkingLevels && (
        <>
          <Separator className="bg-border/30" />
          <div className="px-4 py-3">
            <DetailRow label="思维链长度">{model.thinkingLevels}</DetailRow>
          </div>
        </>
      )}
    </div>
  );
}

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
  /** Hover 出模型详情卡（默认开；仅对填了详情字段的模型生效） */
  showModelCard?: boolean;
  /** 引导行（ModelInfo.cta）被点击时的回调；不传则整行不渲染 */
  onCtaClick?: (id: string) => void;
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
  showModelCard = true,
  onCtaClick,
}: ModelPickerPanelProps) {
  const uiLabels = {
    searchPlaceholder: "搜索模型...",
    multiModelLabel: "多模型同时回答",
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
      // 引导行只在「完整列表」形态下出现：搜索 / 筛选是在找具体模型，引导行帮不上忙
      if (m.cta) return Boolean(onCtaClick) && !search && !capFilter;
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
  }, [models, search, capFilter, pinnedSet, onCtaClick]);

  const handleSelect = (id: string) => {
    onSelectModel(id);
    if (!multiModel) onClose?.();
  };

  const renderModelRow = (m: ModelInfo) => {
    // 引导行：样式与普通模型行一致（品牌 logo + 正常字色）—— 这一行就是希望
    // 用户点的，不置灰。右侧是一颗真按钮，右缘与上下行能力徽标列对齐
    // （尾随留出与普通行相同的 w-5 槽位）。
    if (m.cta) {
      return (
        <div
          key={m.id}
          className="w-full flex items-center gap-2.5 px-3 py-[5px] mb-0.5 rounded-lg"
        >
          <span className="flex-shrink-0 flex items-center">
            <BrandLogo id={m.logoId ?? m.provider.toLowerCase()} fallbackLetter={m.provider[0]} size={16} />
          </span>
          <span className="text-sm font-normal truncate flex-1 min-w-0 text-foreground/80">{m.name}</span>
          {/* 白底细线框、无阴影 —— 对齐现网的小按钮样式，黑色实心在列表里太突兀 */}
          <Button
            variant="outline"
            size="xs"
            onClick={() => { onCtaClick?.(m.id); onClose?.(); }}
            className="flex-shrink-0 h-[22px] px-2.5 shadow-none border-border"
          >
            {m.cta.actionLabel}
          </Button>
          <span className="w-5 h-5 flex-shrink-0" />
        </div>
      );
    }

    const isSelected = selectedModels.includes(m.id);
    const isPinned = pinnedSet.has(m.id);
    const provColor = providerColors[m.provider] || 'bg-muted-foreground/40';

    const row = (
      <button
        onClick={() => handleSelect(m.id)}
        className={cn(
          "group w-full flex items-center gap-2.5 px-3 py-[5px] mb-0.5 text-left transition-all duration-[var(--duration-fast)] rounded-lg cursor-pointer",
          isSelected
            ? 'bg-accent/40 text-foreground'
            : 'text-foreground/80 hover:bg-accent/20'
        )}
      >
        {multiModel && (
          <Checkbox checked={isSelected} className="size-3.5 rounded-[3px] pointer-events-none data-[state=checked]:border-cherry-primary data-[state=checked]:bg-cherry-primary flex-shrink-0" tabIndex={-1} />
        )}
        {/* Provider icon —— 不可用时 logo 不变，只在上面盖一层半透明白遮罩 */}
        <span className={cn("flex-shrink-0 flex items-center", m.muted && MUTED_LOGO_CLASS)}>
          <BrandLogo id={m.logoId ?? m.provider.toLowerCase()} fallbackLetter={m.provider[0]} size={16} />
        </span>
        {/* Model name —— theme.css 给 button 元素兜了 font-weight: 500，
            不加 font-normal 模型名会整列变粗；选中态仍用 font-medium 区分 */}
        <span className={cn(
          "text-sm truncate flex-1 min-w-0 font-normal",
          isSelected && 'font-medium',
          m.muted && 'text-muted-foreground/50'
        )}>{m.name}</span>
        {/* Capability circle badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {m.capabilities.filter(cap => cap in CAP_CONFIG).map(cap => {
            const cfg = CAP_CONFIG[cap as ModelCapability];
            const CapIcon = cfg.icon;
            const muted = m.mutedCapabilities?.includes(cap as ModelCapability);
            return (
              <span key={cap} className={cn("w-5 h-5 rounded-full flex items-center justify-center", muted ? 'bg-muted-foreground/10' : cfg.bg)}>
                <CapIcon size={11} className={muted ? 'text-muted-foreground/40' : cfg.text} />
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

    if (!showModelCard || !hasModelDetail(m)) return React.cloneElement(row, { key: m.id });

    return (
      <HoverCard key={m.id} openDelay={260} closeDelay={80}>
        <HoverCardTrigger asChild>{row}</HoverCardTrigger>
        <HoverCardContent
          // 选择器现在从内容区顶栏往下展开、贴左边，所以卡片默认放右侧；
          // 右边放不下时 Radix 自己翻到左边。
          side="right"
          align="start"
          sideOffset={12}
          className="w-[300px] p-0 overflow-hidden"
        >
          <ModelDetailCard model={m} capabilityLabels={labels} />
        </HoverCardContent>
      </HoverCard>
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
