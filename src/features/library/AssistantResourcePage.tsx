import { useMemo, useState } from 'react';
import { Plus, Upload, Star, Briefcase, Building2, Wrench, Languages, ClipboardList, Sparkles, User } from 'lucide-react';
import { Button, SearchInput, EmptyState } from '@cherry-studio/ui';
import {
  ASSISTANT_PRESETS, CATEGORY_LABEL, CATEGORY_COUNTS, MY_PRESET_IDS,
  type AssistantPreset, type PresetCategory,
} from './assistantPresets';
import { AssistantPresetPreviewDialog } from './AssistantPresetPreviewDialog';

type Tab = 'mine' | 'featured' | PresetCategory;

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'mine',     label: '我的', icon: User },
  { id: 'featured', label: '精选', icon: Star },
  { id: 'career',   label: '职业', icon: Briefcase },
  { id: 'business', label: '商业', icon: Building2 },
  { id: 'tools',    label: '工具', icon: Wrench },
  { id: 'language', label: '语言', icon: Languages },
  { id: 'office',   label: '办公', icon: ClipboardList },
  { id: 'other',    label: '其他', icon: Sparkles },
];

/**
 * 资源 → 助手页面。对齐 production 截图：
 * 顶部 search + 新建/导入；横向 tab（我的/精选/分类...）；极简卡片网格 + 极简预览弹窗。
 */
export function AssistantResourcePage() {
  const [tab, setTab] = useState<Tab>('featured');
  const [search, setSearch] = useState('');
  const [previewing, setPreviewing] = useState<AssistantPreset | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(() => new Set(MY_PRESET_IDS));

  const filtered = useMemo<AssistantPreset[]>(() => {
    let list = ASSISTANT_PRESETS;
    if (tab === 'mine') list = list.filter(p => installed.has(p.id));
    else if (tab === 'featured') list = list.filter(p => p.featured);
    else list = list.filter(p => p.category === tab);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [tab, search, installed]);

  const counts: Record<Tab, number> = {
    mine:     installed.size,
    featured: ASSISTANT_PRESETS.filter(p => p.featured).length,
    career:   CATEGORY_COUNTS.career,
    business: CATEGORY_COUNTS.business,
    tools:    CATEGORY_COUNTS.tools,
    language: CATEGORY_COUNTS.language,
    office:   CATEGORY_COUNTS.office,
    other:    CATEGORY_COUNTS.other,
  };

  const addPreset = (p: AssistantPreset) => {
    setInstalled(prev => new Set(prev).add(p.id));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Top bar — search + actions */}
      <div className="flex items-center gap-3 px-6 pt-4 pb-3 flex-shrink-0">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="搜索资源名称、描述..."
          iconSize={12}
          wrapperClassName="flex items-center gap-1.5 px-2.5 py-[6px] rounded-lg bg-muted/40 border border-border/30 flex-1 max-w-[460px]"
        />
        <div className="flex-1" />
        <Button size="sm" className="gap-1.5">
          <Plus size={12} />
          新建助手
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Upload size={12} />
          导入助手
        </Button>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-0.5 px-6 pb-3 overflow-x-auto scrollbar-thin flex-shrink-0">
        {TABS.map(t => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted-foreground/60 hover:text-foreground border-b-2 border-transparent'
              }`}
            >
              <Icon size={11} strokeWidth={1.6} />
              <span>{t.label}</span>
              <span className={`tabular-nums text-xs ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState preset={search ? 'no-result' : 'no-resource'} compact />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
            {filtered.map(p => (
              <PresetCard
                key={p.id}
                preset={p}
                installed={installed.has(p.id)}
                onPreview={() => setPreviewing(p)}
                onAdd={() => addPreset(p)}
              />
            ))}
          </div>
        )}
      </div>

      <AssistantPresetPreviewDialog
        preset={previewing}
        installed={previewing ? installed.has(previewing.id) : false}
        hasAnyInstalled={installed.size > 0}
        onClose={() => setPreviewing(null)}
        onAdd={(p) => { addPreset(p); setPreviewing(null); }}
      />
    </div>
  );
}

function PresetCard({ preset, installed, onPreview, onAdd }: {
  preset: AssistantPreset;
  installed: boolean;
  onPreview: () => void;
  onAdd: () => void;
}) {
  return (
    <div
      onClick={onPreview}
      className="group relative rounded-xl border border-border/25 bg-card hover:border-border/50 hover:shadow-sm transition-all cursor-pointer p-4 flex flex-col gap-3 min-h-[128px]"
    >
      <div className="flex items-start gap-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${preset.avatarBg}`}>
          {preset.emoji}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-sm font-medium text-foreground truncate">{preset.name}</div>
          {preset.featured && (
            <div className="text-xs text-muted-foreground/60 mt-0.5">精选</div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 flex-1">
        {preset.description}
      </p>

      <div className="flex justify-end -mt-1">
        <Button
          size="xs"
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          disabled={installed}
          className="h-7 px-3 rounded-md text-xs"
        >
          {installed ? '已添加' : '添加'}
        </Button>
      </div>
    </div>
  );
}
