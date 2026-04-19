import { useState, useMemo } from 'react';
import { X, Search, Heart, ArrowUpDown, Trash2, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input } from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import type { ResourceCategory } from './ExploreData';

export interface FavoriteItem {
  id: string;
  name: string;
  avatar: string;
  category: ResourceCategory;
  categoryLabel: string;
  author: string;
  favoritedAt: number;
}

interface FavoritesDrawerProps {
  open: boolean;
  favorites: FavoriteItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onPreview: (item: FavoriteItem) => void;
}

type SortMode = 'newest' | 'name-asc' | 'name-desc';

const categoryColors: Record<ResourceCategory, string> = {
  agents: 'bg-violet-500/10 text-violet-600',
  assistants: 'bg-foreground/[0.06] text-foreground/70',
  knowledge: 'bg-blue-500/10 text-blue-500',
  mcp: 'bg-orange-500/10 text-orange-600',
  skills: 'bg-amber-500/10 text-amber-600',
  plugins: 'bg-pink-500/10 text-pink-500',
};

const allCategoryFilter: { id: ResourceCategory | 'all'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'agents', label: '智能体' },
  { id: 'assistants', label: '助手' },
  { id: 'knowledge', label: '知识库' },
  { id: 'mcp', label: 'MCP' },
  { id: 'skills', label: '技能' },
  { id: 'plugins', label: '插件' },
];

const sortLabels: Record<SortMode, string> = {
  'newest': '最近收藏',
  'name-asc': '名称 A\u2192Z',
  'name-desc': '名称 Z\u2192A',
};

export function FavoritesDrawer({ open, favorites, onClose, onRemove, onPreview }: FavoritesDrawerProps) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<ResourceCategory | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let list = favorites;
    if (catFilter !== 'all') {
      list = list.filter(f => f.category === catFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.author.toLowerCase().includes(q));
    }
    if (sortMode === 'name-asc') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh'));
    } else if (sortMode === 'name-desc') {
      list = [...list].sort((a, b) => b.name.localeCompare(a.name, 'zh'));
    } else {
      list = [...list].sort((a, b) => b.favoritedAt - a.favoritedAt);
    }
    return list;
  }, [favorites, catFilter, search, sortMode]);

  const catCounts = useMemo(() => {
    const map: Record<string, number> = { all: favorites.length };
    favorites.forEach(f => { map[f.category] = (map[f.category] || 0) + 1; });
    return map;
  }, [favorites]);

  return (
    <AnimatePresence>
      {open && (
        <div className="contents">
          {/* Overlay — scoped to parent (absolute) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[400] bg-black/20 backdrop-blur-[1px] rounded-xl"
            onClick={onClose}
          />
          {/* Drawer panel — inside content area */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute top-1.5 right-1.5 bottom-1.5 w-[340px] z-[401] bg-popover border border-border/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/15 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Heart size={11} className="text-red-500/70" fill="currentColor" />
                </div>
                <span className="text-sm text-foreground">我的收藏</span>
                <span className="text-xs text-muted-foreground/30 tabular-nums">{favorites.length}</span>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={onClose}
                className="w-6 h-6 rounded-lg text-muted-foreground/40 hover:text-foreground">
                <X size={13} />
              </Button>
            </div>

            {/* Search + Sort + Category filter */}
            {favorites.length > 0 && (
              <div className="px-3 pt-3 pb-0 flex-shrink-0 space-y-2">
                {/* Search bar + Sort trigger (same row) */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/25" />
                    <Input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="搜索收藏..."
                      className="w-full pl-7 pr-7 py-1.5 rounded-lg border border-border/20 bg-accent/15 text-xs text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-border/40 focus:bg-accent/25 transition-all"
                    />
                    {search && (
                      <Button variant="ghost" size="icon-xs" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/20 hover:text-foreground">
                        <X size={9} />
                      </Button>
                    )}
                  </div>
                  {/* Sort dropdown */}
                  <div className="relative flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setShowSort(!showSort)}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border transition-all ${
                        showSort
                          ? 'border-primary/30 bg-accent/50 text-foreground'
                          : 'border-border/20 text-muted-foreground/35 hover:text-foreground hover:border-border/40'
                      }`}
                      title={sortLabels[sortMode]}
                    >
                      <ArrowUpDown size={10} />
                    </Button>
                    <AnimatePresence>
                      {showSort && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ duration: 0.12 }}
                          className="absolute top-full right-0 mt-1 z-50 bg-popover border border-border/30 rounded-xl shadow-xl p-1 min-w-[110px]"
                        >
                          {(Object.keys(sortLabels) as SortMode[]).map(mode => (
                            <Button
                              key={mode}
                              variant="ghost"
                              size="xs"
                              onClick={() => { setSortMode(mode); setShowSort(false); }}
                              className={`w-full text-left px-2.5 py-[5px] rounded-md text-xs transition-colors ${
                                sortMode === mode ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground'
                              }`}
                            >
                              {sortLabels[mode]}
                            </Button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Category filter pills */}
                <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-0.5">
                  {allCategoryFilter.map(cat => {
                    const count = catCounts[cat.id] || 0;
                    if (cat.id !== 'all' && count === 0) return null;
                    const isActive = catFilter === cat.id;
                    return (
                      <Button
                        key={cat.id}
                        variant="ghost"
                        size="xs"
                        onClick={() => setCatFilter(cat.id)}
                        className={`flex items-center gap-1 px-2 py-[3px] rounded-full text-[9px] whitespace-nowrap transition-all border ${
                          isActive
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-transparent text-muted-foreground/40 border-border/20 hover:border-border/40 hover:text-foreground'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className={`tabular-nums ${isActive ? 'text-background/60' : 'text-muted-foreground/20'}`}>{count}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="w-12 h-12 rounded-2xl bg-accent/30 flex items-center justify-center mb-3">
                    <Heart size={20} strokeWidth={1.2} className="text-muted-foreground/12" />
                  </div>
                  <p className="text-sm text-muted-foreground/30 mb-0.5">暂无收藏</p>
                  <p className="text-xs text-muted-foreground/20">点击资源卡片可以收藏</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search size={20} strokeWidth={1.2} className="text-muted-foreground/12 mb-2" />
                  <p className="text-xs text-muted-foreground/30 mb-0.5">未找到匹配的收藏</p>
                  <p className="text-xs text-muted-foreground/18">尝试其他关键词或分类</p>
                </div>
              ) : (
                <div className="p-2 pt-1.5">
                  <AnimatePresence>
                    {filtered.map((item, i) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2, delay: i * 0.015 }}
                        className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-accent/30 transition-colors cursor-pointer mb-0.5"
                        onClick={() => onPreview(item)}
                      >
                        <div className="w-8 h-8 rounded-xl bg-accent/50 flex items-center justify-center text-sm flex-shrink-0">
                          {item.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-foreground truncate">{item.name}</span>
                            <span className={`text-[8px] px-1.5 py-px rounded-full flex-shrink-0 ${categoryColors[item.category]}`}>
                              {item.categoryLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-px">
                            <span className="text-[9px] text-muted-foreground/30">{item.author}</span>
                            <span className="text-[9px] text-muted-foreground/15">{'\u00B7'}</span>
                            <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground/20">
                              <Clock size={7} />
                              {formatRelativeTime(item.favoritedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Tooltip content="取消收藏" side="left"><Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={e => { e.stopPropagation(); onRemove(item.id); }}
                            className="w-5 h-5 rounded-md text-muted-foreground/25 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 size={10} />
                          </Button></Tooltip>
                          <ChevronRight size={10} className="text-muted-foreground/20" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer count */}
            {favorites.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border/10 flex-shrink-0">
                <p className="text-[9px] text-muted-foreground/20 text-center">
                  {catFilter !== 'all' || search
                    ? `显示 ${filtered.length} / ${favorites.length} 项`
                    : `共 ${favorites.length} 项收藏`
                  }
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ===========================
// Relative Time Helper
// ===========================

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return '刚刚';
  if (seconds < 60) return `${seconds}秒前`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  return `${months}个月前`;
}
