import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, X, Check,
  Eye, Brain, Hammer, Globe,
} from 'lucide-react';
import type { ModelCapability } from '@/app/types/chat';
import { ASSISTANT_MODELS, PROVIDER_COLORS, MODEL_CAPABILITY_LABELS } from '@/app/config/models';

const CAP_ICONS: Record<ModelCapability, { icon: typeof Eye; color: string }> = {
  vision: { icon: Eye, color: 'text-foreground/60' },
  tools: { icon: Hammer, color: 'text-amber-500' },
  reasoning: { icon: Brain, color: 'text-violet-500' },
  web: { icon: Globe, color: 'text-blue-500' },
};

const CAP_TAG_ICONS: Record<ModelCapability, typeof Eye> = {
  vision: Eye,
  reasoning: Brain,
  tools: Hammer,
  web: Globe,
};

const ALL_CAPS: ModelCapability[] = ['vision', 'reasoning', 'tools', 'web'];

export interface ModelPickerPanelProps {
  selectedModels: string[];
  onSelectModel: (id: string) => void;
  multiModel: boolean;
  onToggleMultiModel: () => void;
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
  selectedModels,
  onSelectModel,
  multiModel,
  onToggleMultiModel,
  onClose,
  autoFocus = true,
  initialProvider,
  className = '',
}: ModelPickerPanelProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [capFilter, setCapFilter] = useState<ModelCapability | null>(null);

  const allProviders = useMemo(() => {
    const s = new Set<string>();
    ASSISTANT_MODELS.forEach(m => s.add(m.provider));
    return Array.from(s);
  }, []);

  const [activeProvider, setActiveProvider] = useState<string>(
    () => initialProvider || ASSISTANT_MODELS[0].provider
  );

  // Auto-focus
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => searchRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const providerModels = useMemo(() => {
    return ASSISTANT_MODELS.filter(m => {
      if (m.provider !== activeProvider) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (capFilter && !m.capabilities.includes(capFilter)) return false;
      return true;
    });
  }, [activeProvider, search, capFilter]);

  const handleSelect = (id: string) => {
    onSelectModel(id);
    if (!multiModel) onClose?.();
  };

  return (
    <div className={className}>
      {/* Search */}
      <div className="px-2 pt-2 pb-1.5">
        <div className="flex items-center gap-1.5 px-2 py-[5px] rounded-md bg-accent/15 border border-border/20">
          <Search size={10} className="text-muted-foreground/40 flex-shrink-0" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索模型..."
            className="flex-1 bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground/30 outline-none min-w-0"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground/30 hover:text-muted-foreground/60">
              <X size={8} />
            </button>
          )}
        </div>
      </div>

      {/* Capability tag filters */}
      <div className="px-2.5 pb-1 flex items-center gap-1 flex-wrap">
        {ALL_CAPS.map(cap => {
          const Icon = CAP_TAG_ICONS[cap];
          const active = capFilter === cap;
          return (
            <button
              key={cap}
              onClick={() => setCapFilter(active ? null : cap)}
              className={`flex items-center gap-1 px-1.5 py-[2px] rounded-full text-[9px] transition-all border ${
                active
                  ? 'bg-foreground/8 text-foreground/80 border-border/50'
                  : 'bg-accent/15 text-muted-foreground/55 border-transparent hover:bg-accent/30 hover:text-muted-foreground/75'
              }`}
            >
              <Icon size={9} />
              <span>{MODEL_CAPABILITY_LABELS[cap]}</span>
            </button>
          );
        })}
      </div>

      {/* Multi-model switch */}
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <span className="text-[9px] text-muted-foreground/50">多模型并行（与多助手互斥）</span>
        <button
          onClick={onToggleMultiModel}
          className={`relative w-[28px] h-[14px] rounded-full transition-colors duration-150 flex-shrink-0 ${
            multiModel ? 'bg-cherry-primary' : 'bg-accent/40'
          }`}
        >
          <div className={`absolute top-[2px] w-[10px] h-[10px] rounded-full bg-white shadow-sm transition-transform duration-150 ${
            multiModel ? 'left-[16px]' : 'left-[2px]'
          }`} />
        </button>
      </div>

      <div className="h-px bg-border/20" />

      {/* Two-column: providers | models */}
      <div className="flex h-[240px]">
        {/* Left: providers */}
        <div className="w-[110px] border-r border-border/20 py-1 overflow-y-auto flex-shrink-0">
          {allProviders.map(p => {
            const count = ASSISTANT_MODELS.filter(
              m => m.provider === p && (!capFilter || m.capabilities.includes(capFilter))
            ).length;
            const provColor = PROVIDER_COLORS[p] || 'bg-gray-400';
            return (
              <button
                key={p}
                onClick={() => setActiveProvider(p)}
                className={`flex items-center gap-1.5 w-full px-2.5 py-[6px] text-[10px] transition-all duration-75 ${
                  activeProvider === p
                    ? 'bg-accent/30 text-foreground'
                    : 'text-foreground/60 hover:text-foreground hover:bg-accent/15'
                }`}
              >
                <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${provColor}`} />
                <span className="truncate flex-1">{p}</span>
                <span className="text-[8px] text-muted-foreground/40 flex-shrink-0">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Right: models */}
        <div className="flex-1 py-1 px-1.5 overflow-y-auto">
          {providerModels.length === 0 ? (
            <div className="px-2.5 py-3 text-center text-[9px] text-muted-foreground/40">无匹配结果</div>
          ) : (
            providerModels.map(m => {
              const selected = selectedModels.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  className={`flex items-center gap-2 w-full px-2 py-[5px] rounded-lg text-[10px] transition-all duration-75 mb-px ${
                    selected ? 'bg-accent/30 ring-1 ring-border/30' : 'text-foreground/70 hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  {multiModel && (
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                      selected ? 'border-cherry-primary bg-cherry-primary' : 'border-border/50'
                    }`}>
                      {selected && <Check size={8} className="text-white" />}
                    </div>
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
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}