import type { LibrarySidebarFilter } from '@/app/types';
import { RESOURCE_TYPES_LIST } from '@/app/config/constants';
import { Button } from '@cherry-studio/ui';

interface Props {
  filter: LibrarySidebarFilter;
  onFilterChange: (f: LibrarySidebarFilter) => void;
  typeCounts?: Record<string, number>;
}

export function LibrarySidebar({ filter, onFilterChange, typeCounts }: Props) {
  const isActive = (f: LibrarySidebarFilter) => {
    if (filter.type === 'all' && f.type === 'all') return true;
    if (filter.type === 'resource' && f.type === 'resource') return filter.resourceType === f.resourceType;
    if (filter.type === 'folder' && f.type === 'folder') return filter.folderId === f.folderId;
    if (filter.type === 'tag' && f.type === 'tag') return filter.tagName === f.tagName;
    if (filter.type === 'discover' && f.type === 'discover') return filter.discoverType === f.discoverType;
    return false;
  };

  const itemCls = (f: LibrarySidebarFilter) =>
    `flex items-center gap-2 w-full px-2.5 py-[6px] rounded-lg text-sm transition-all cursor-pointer ${
      isActive(f) ? 'bg-accent/50 text-foreground' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/50'
    }`;

  return (
    <div className="w-[200px] flex-shrink-0 border-r border-border/15 flex flex-col min-h-0 bg-background/50">
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-sm text-foreground tracking-tight">资源库</h2>
        <p className="text-xs text-muted-foreground/50 mt-0.5">管理和发现 AI 资源</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 pb-2 scrollbar-thin">
        <div className="mb-3">
          <p className="px-2.5 pb-1 pt-1 text-xs text-muted-foreground/40">我的资源</p>
          {RESOURCE_TYPES_LIST.map(rt => (
            <Button
              variant="ghost"
              key={rt.id}
              onClick={() => onFilterChange({ type: 'resource', resourceType: rt.id })}
              className={itemCls({ type: 'resource', resourceType: rt.id })}
            >
              <rt.icon size={12} strokeWidth={1.6} />
              <span className="flex-1 text-left">{rt.label}</span>
              {typeCounts?.[rt.id] != null && (
                <span className="text-xs text-muted-foreground/50 tabular-nums">{typeCounts[rt.id]}</span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
