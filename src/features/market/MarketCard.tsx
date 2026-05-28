import { Check, Plus } from 'lucide-react';
import { INTEGRATION_LOGO } from './catalog';
import type { MarketItem } from './types';

export function Avatar({ item, size = 36 }: { item: MarketItem; size?: number }) {
  const logoMeta = INTEGRATION_LOGO[item.id];
  if (logoMeta) {
    return (
      <div
        className="rounded-md bg-muted/30 border border-border/20 flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src={`https://cdn.simpleicons.org/${logoMeta.slug}/${logoMeta.color}`}
          alt=""
          width={Math.round(size * 0.6)}
          height={Math.round(size * 0.6)}
          loading="lazy"
          draggable={false}
          className="block"
        />
      </div>
    );
  }
  return (
    <div
      className={`rounded-md ${item.avatarBg} flex items-center justify-center flex-shrink-0`}
      style={{ width: size, height: size }}
    >
      <span className={size >= 40 ? 'text-lg' : 'text-base'}>{item.avatar}</span>
    </div>
  );
}

export function MarketCardGrid({
  items, installed, onSelect, onToggleInstall,
}: {
  items: MarketItem[];
  installed: Set<string>;
  onSelect: (item: MarketItem) => void;
  onToggleInstall: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
      {items.map(it => {
        const isInstalled = installed.has(it.id);
        return (
          <div
            key={it.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(it)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(it); } }}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/20 bg-card/40 hover:bg-accent/40 hover:border-border/30 cursor-pointer transition-colors"
          >
            <Avatar item={it} size={36} />
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">{it.name}</span>
                {it.version && (
                  <span className="flex-shrink-0 text-[10px] tabular-nums text-muted-foreground/60 font-mono">
                    v{it.version}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground/60 truncate mt-0.5">{it.tagline}</div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleInstall(it.id); }}
              aria-label={isInstalled ? '已安装' : '安装'}
              title={isInstalled ? '已安装 — 点击卸载' : '安装'}
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors flex-shrink-0 ${
                isInstalled
                  ? 'text-muted-foreground/50 hover:text-destructive/80 hover:bg-destructive/10'
                  : 'bg-muted/50 text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              {isInstalled ? <Check size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2.2} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
