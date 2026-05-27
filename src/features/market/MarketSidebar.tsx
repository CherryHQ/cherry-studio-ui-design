import { Sparkles } from 'lucide-react';
import { CATALOG, SIDEBAR_KINDS } from './catalog';
import { KIND_ICON, KIND_LABEL } from './types';
import type { ResourceKind } from './types';

export function MarketSidebar({
  kind, onKindChange,
}: {
  kind: ResourceKind | 'all';
  onKindChange: (k: ResourceKind | 'all') => void;
}) {
  return (
    <aside className="hidden md:flex flex-shrink-0 w-[176px] flex-col">
      <div className="sticky top-0 pt-2">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground/40 px-2 pb-2">
          资源类型
        </div>
        <div className="space-y-0.5">
          {SIDEBAR_KINDS.map(k => {
            const active = kind === k;
            const isAll = k === 'all';
            const Icon = isAll ? Sparkles : KIND_ICON[k];
            const label = isAll ? '全部' : KIND_LABEL[k];
            const count = isAll
              ? CATALOG.length
              : CATALOG.filter(it => it.kind === k).length;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onKindChange(k)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-accent/50 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                <Icon size={13} strokeWidth={1.6} className="flex-shrink-0" />
                <span className="flex-1 text-left truncate">{label}</span>
                <span className={`text-[10px] tabular-nums flex-shrink-0 ${active ? 'text-muted-foreground/80' : 'text-muted-foreground/40'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
