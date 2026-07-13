import { useMemo, useState } from 'react';
import { ChevronLeft, Plus, Tag, Upload, LibraryBig, Pencil } from 'lucide-react';
import { Button, SearchInput, EmptyState } from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import type { AssistantInfo } from '@/app/types/assistant';

// ===========================
// AssistantManagePage — 管理助手
// ===========================
// 对话模块的全量助手管理页，从左栏筛选菜单的「管理助手」进入，接管内容区
// （与工作模块的 HistoryManagePage 同模式）。顶部搜索 + 标签筛选，右上
// 新建/助手库/导入入口，内容为助手卡片网格。

interface Props {
  assistants: AssistantInfo[];
  emojiOf: (name: string) => string;
  onBack: () => void;
  /** 点卡片 — 切到该助手并返回聊天。 */
  onOpen: (id: string) => void;
  /** 卡片 hover 的编辑入口 — 打开助手配置。 */
  onEdit: (id: string) => void;
  onCreate: () => void;
}

// 标签点的颜色按出现顺序循环取色（与真实版的标签色一致性由后端保证，
// 原型里只求稳定可辨）。
const TAG_DOT_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-500'];

// systemPrompt 多为 Markdown，卡片描述取第一行正文（跳过标题/空行）。
function descriptionOf(a: AssistantInfo): string {
  const line = a.systemPrompt
    .split('\n')
    .map(l => l.trim())
    .find(l => l && !l.startsWith('#'));
  return line ?? '';
}

export function AssistantManagePage({ assistants, emojiOf, onBack, onOpen, onEdit, onCreate }: Props) {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<Set<string>>(() => new Set());

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    assistants.forEach(a => a.tags.forEach(t => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return Array.from(counts.entries());
  }, [assistants]);

  const toggleTag = (tag: string) => {
    setActiveTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assistants.filter(a => {
      if (q && !a.name.toLowerCase().includes(q) && !a.systemPrompt.toLowerCase().includes(q)) return false;
      if (activeTags.size > 0 && !a.tags.some(t => activeTags.has(t))) return false;
      return true;
    });
  }, [assistants, query, activeTags]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* ===== 顶栏：返回 + 搜索 + 新建/助手库/导入 ===== */}
      <div className="flex items-center gap-2 px-4 h-[52px] flex-shrink-0">
        <Button variant="ghost" size="icon-xs" onClick={onBack}
          className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50">
          <ChevronLeft size={16} strokeWidth={1.6} />
        </Button>
        <div className="w-[320px]">
          <SearchInput value={query} onChange={setQuery} placeholder="搜索助手名称、描述..." />
        </div>
        <div className="flex-1" />
        <Button size="sm" onClick={onCreate} className="gap-1.5">
          <Plus size={14} />
          新建助手
        </Button>
        <Tooltip content="从助手库挑选模板" side="bottom">
          <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <LibraryBig size={14} />
            助手库
          </Button>
        </Tooltip>
        <Tooltip content="导入助手配置文件" side="bottom">
          <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <Upload size={14} />
            导入助手
          </Button>
        </Tooltip>
      </div>

      {/* ===== 标签筛选 ===== */}
      <div className="flex items-center gap-1.5 px-4 pb-3 flex-shrink-0 flex-wrap">
        <Tag size={13} className="text-muted-foreground/50 mr-0.5" />
        {tags.map(([tag, count], i) => {
          const active = activeTags.has(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`flex items-center gap-1.5 px-2.5 py-[4px] rounded-full border text-xs transition-colors ${
                active
                  ? 'border-cherry-ring bg-cherry-active-bg text-foreground'
                  : 'border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${TAG_DOT_COLORS[i % TAG_DOT_COLORS.length]}`} />
              <span>{tag}</span>
              <span className="tabular-nums text-muted-foreground/50">{count}</span>
            </button>
          );
        })}
        <button
          type="button"
          className="flex items-center gap-1 px-2.5 py-[4px] rounded-full border border-dashed border-border/50 text-xs text-muted-foreground/60 hover:text-foreground hover:border-border transition-colors"
        >
          <Plus size={11} />
          <span>标签</span>
        </button>
      </div>

      {/* ===== 助手卡片网格 ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
        {filtered.length === 0 ? (
          <div className="pt-16">
            <EmptyState preset="no-result" compact />
          </div>
        ) : (
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {filtered.map(a => (
              <div
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpen(a.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') onOpen(a.id); }}
                className="group relative flex items-start gap-3 p-4 rounded-xl border border-border/40 hover:border-border/70 hover:bg-accent/15 cursor-pointer transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-accent/30 flex items-center justify-center flex-shrink-0 text-[22px] leading-none">
                  {emojiOf(a.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{a.name}</div>
                  {descriptionOf(a) && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{descriptionOf(a)}</div>
                  )}
                  {a.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {a.tags.map(t => (
                        <span key={t} className="px-1.5 py-[2px] rounded-md bg-accent/40 text-xs text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Tooltip content="编辑助手" side="top">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => { e.stopPropagation(); onEdit(a.id); }}
                    className="absolute top-2.5 right-2.5 p-1.5 w-auto h-auto opacity-0 group-hover:opacity-100 text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-opacity"
                  >
                    <Pencil size={13} />
                  </Button>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
