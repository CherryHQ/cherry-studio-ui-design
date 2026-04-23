import React, { useState, useRef, useCallback } from 'react';
import {
  LayoutGrid, List, ArrowUpDown, Plus,
  MoreHorizontal,
  Pencil, Copy, FolderInput, Download, Trash2,
  Clock, Layers, ChevronDown, Upload, Tag, Plus as PlusIcon,
  Check,
  Filter,
} from 'lucide-react';
import { Button, Input, Popover, PopoverTrigger, PopoverContent, SearchInput, EmptyState, Badge, Switch } from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import type { ResourceItem, ResourceType, ViewMode, SortKey, FolderNode, TagItem } from '@/app/types';
import { RESOURCE_TYPE_CONFIG, RESOURCE_TYPES_LIST, SORT_LABELS, TAG_COLORS, DEFAULT_TAG_COLOR } from '@/app/config/constants';

interface Props {
  resources: ResourceItem[];
  viewMode: ViewMode;
  sortKey: SortKey;
  search: string;
  onSearchChange: (v: string) => void;
  onViewModeChange: (v: ViewMode) => void;
  onSortKeyChange: (k: SortKey) => void;
  onEdit: (r: ResourceItem) => void;
  onDuplicate: (r: ResourceItem) => void;
  onDelete: (r: ResourceItem) => void;
  onToggle: (id: string) => void;
  onCreate: (type: ResourceType) => void;
  folders: FolderNode[];
  onMoveToFolder: (resourceId: string, folderId: string | undefined) => void;
  // Tag filtering
  tags: TagItem[];
  activeTag: string | null;
  onTagFilter: (tagName: string | null) => void;
  onAddTag: (tagName: string) => void;
  onDeleteTag: (tagName: string) => void;
  onUpdateResourceTags: (resourceId: string, tags: string[]) => void;
  allTagNames: string[];
  // Type filtering
  activeType: ResourceType | null;
  onTypeFilter: (type: ResourceType | null) => void;
  typeCounts: Record<string, number>;
}

// ===========================
// Helpers
// ===========================

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return `${Math.floor(days / 30)} 个月前`;
}

function flattenFolders(nodes: FolderNode[], depth = 0): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = [];
  for (const n of nodes) {
    result.push({ id: n.id, name: n.name, depth });
    result.push(...flattenFolders(n.children, depth + 1));
  }
  return result;
}

// ===========================
// Main Grid Component
// ===========================

export function ResourceGrid({
  resources, viewMode, sortKey, search,
  onSearchChange, onViewModeChange, onSortKeyChange,
  onEdit, onDuplicate, onDelete, onToggle, onCreate,
  folders, onMoveToFolder,
  tags, activeTag, onTagFilter, onAddTag, onDeleteTag, onUpdateResourceTags, allTagNames,
  activeType, onTypeFilter, typeCounts,
}: Props) {
  const [showSort, setShowSort] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [menuState, setMenuState] = useState<{ id: string; x: number; y: number } | null>(null);
  const [moveMenuId, setMoveMenuId] = useState<string | null>(null);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [tagCtx, setTagCtx] = useState<{ name: string; x: number; y: number } | null>(null);

  const openMenu = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Position menu to the left of the button, aligned to its bottom
    setMenuState({ id, x: rect.left, y: rect.bottom + 4 });
    setMoveMenuId(null);
  }, []);

  const closeMenu = useCallback(() => { setMenuState(null); setMoveMenuId(null); }, []);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onAddTag(newTagName.trim());
      setNewTagName('');
      setShowAddTag(false);
    }
  };

  const handleTagCtx = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTagCtx({ name, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Toolbar */}
      <div className="flex flex-col flex-shrink-0 border-b border-border/30">
        {/* Row 1: Search + Sort + View + Create */}
        <div className="flex items-center gap-2 px-5 py-3">
          {/* Search */}
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="搜索资源名称、描述..."
            iconSize={13}
            wrapperClassName="flex-1 max-w-[260px] px-2.5 py-1.5 rounded-lg border border-border/40 bg-accent/25 focus-within:border-primary/40 transition-all"
          />

          {/* Sort */}
          <Popover open={showSort} onOpenChange={(v) => { setShowSort(v); if (v) { setShowCreate(false); setShowTypeFilter(false); } }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="xs"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${showSort ? 'border-primary/30 bg-accent/50 text-foreground' : 'border-border/40 text-muted-foreground/60 hover:text-foreground hover:border-border/60'}`}>
                <ArrowUpDown size={10} /><span>{SORT_LABELS[sortKey]}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-1 min-w-[110px] w-auto">
              {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
                <Button variant="ghost" size="xs" key={k} onClick={() => { onSortKeyChange(k); setShowSort(false); }}
                  className={`w-full text-left px-2.5 py-[5px] rounded-md text-xs transition-colors ${sortKey === k ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground'}`}>
                  {SORT_LABELS[k]}
                </Button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Type filter dropdown */}
          <Popover open={showTypeFilter} onOpenChange={(v) => { setShowTypeFilter(v); if (v) { setShowSort(false); setShowCreate(false); } }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="xs"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${showTypeFilter ? 'border-primary/30 bg-accent/50 text-foreground' : 'border-border/40 text-muted-foreground/60 hover:text-foreground hover:border-border/60'}`}>
                <Filter size={10} />
                <span>{activeType ? RESOURCE_TYPE_CONFIG[activeType].label : '全部分类'}</span>
                <ChevronDown size={9} className={`transition-transform ${showTypeFilter ? 'rotate-180' : ''}`} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-1 min-w-[120px] w-auto">
              <Button variant="ghost" size="xs" onClick={() => { onTypeFilter(null); setShowTypeFilter(false); }}
                className={`flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs transition-colors ${activeType === null ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground'}`}>
                <Layers size={10} />
                <span>全部</span>
                <span className="ml-auto text-xs text-muted-foreground/40 tabular-nums">{Object.values(typeCounts).reduce((a, b) => a + b, 0)}</span>
              </Button>
              <div className="h-px bg-border/30 my-0.5 mx-1" />
              {RESOURCE_TYPES_LIST.map(rt => {
                const Icon = rt.icon;
                const count = typeCounts[rt.id] || 0;
                return (
                  <Button variant="ghost" size="xs" key={rt.id} onClick={() => { onTypeFilter(activeType === rt.id ? null : rt.id); setShowTypeFilter(false); }}
                    className={`flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs transition-colors ${activeType === rt.id ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground'}`}>
                    <Icon size={10} />
                    <span>{rt.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground/40 tabular-nums">{count}</span>
                  </Button>
                );
              })}
            </PopoverContent>
          </Popover>

          {/* View toggle */}
          <div className="flex items-center border border-border/40 rounded-lg overflow-hidden">
            <Button variant="ghost" size="icon-xs" onClick={() => onViewModeChange('grid')} className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/50'}`}><LayoutGrid size={11} /></Button>
            <Button variant="ghost" size="icon-xs" onClick={() => onViewModeChange('list')} className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/50'}`}><List size={11} /></Button>
          </div>

          <div className="flex-1" />

          {/* Separator */}
          <div className="w-px h-4 bg-border/30 flex-shrink-0" />

          {/* Create */}
          <Popover open={showCreate} onOpenChange={(v) => { setShowCreate(v); if (v) { setShowSort(false); setShowTypeFilter(false); } }}>
            <PopoverTrigger asChild>
              <Button variant="default" size="xs"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors active:scale-[0.97]">
                <Plus size={11} /><span>新建资源</span>
                <ChevronDown size={9} className={`transition-transform ${showCreate ? 'rotate-180' : ''}`} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-1 min-w-[140px] w-auto">
              {(['agent', 'assistant', 'skill', 'plugin'] as const).map(t => {
                const cfg = RESOURCE_TYPE_CONFIG[t];
                const Icon = cfg.icon;
                const isFileType = t === 'skill' || t === 'plugin';
                return (
                  <div key={t}>
                    {t === 'skill' && <div className="h-px bg-border/30 my-0.5 mx-1" />}
                    <Button variant="ghost" size="xs" onClick={() => { onCreate(t); setShowCreate(false); }}
                      className="flex items-center gap-2 w-full px-2.5 py-[6px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${cfg.color}`}>
                        {isFileType ? <Upload size={10} /> : <Icon size={10} />}
                      </div>
                      <span>{isFileType ? `导入${cfg.label}` : `新建${cfg.label}`}</span>
                    </Button>
                  </div>
                );
              })}
            </PopoverContent>
          </Popover>
        </div>

        {/* Row 2: Tag chips */}
        <div className="flex items-center gap-1.5 px-5 pb-3 overflow-x-auto scrollbar-hide">
          {/* Tag filter */}
          <Tag size={11} className="text-muted-foreground/40 flex-shrink-0 mr-0.5" />
          {tags.map(tag => (
            <Button
              variant="ghost" size="xs"
              key={tag.id}
              onClick={() => onTagFilter(activeTag === tag.name ? null : tag.name)}
              onContextMenu={e => handleTagCtx(e, tag.name)}
              className={`flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-xs border transition-all flex-shrink-0 ${
                activeTag === tag.name
                  ? 'border-primary/40 bg-primary/10 text-foreground'
                  : 'border-border/30 text-muted-foreground/50 hover:text-foreground hover:border-border/50 hover:bg-accent/50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tag.color}`} />
              <span>{tag.name}</span>
              <span className="text-xs text-muted-foreground/40 tabular-nums">{tag.count}</span>
            </Button>
          ))}
          {/* Add tag */}
          {showAddTag ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Input autoFocus value={newTagName} onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') { setShowAddTag(false); setNewTagName(''); } }}
                onBlur={() => { if (!newTagName.trim()) setShowAddTag(false); }}
                placeholder="标签名..."
                className="w-[70px] px-2 py-[3px] rounded-full border border-border/40 bg-accent/25 text-xs text-foreground outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground/60" />
              <Button variant="ghost" size="icon-xs" onClick={handleAddTag} className="text-muted-foreground/40 hover:text-foreground transition-colors"><Plus size={10} /></Button>
            </div>
          ) : (
            <Button variant="ghost" size="xs" onClick={() => setShowAddTag(true)} className="flex items-center gap-0.5 px-2 py-[3px] rounded-full text-xs text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 border border-dashed border-border/40 hover:border-border/60 transition-all flex-shrink-0">
              <Plus size={9} /> 标签
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
        {resources.length === 0 ? (
          search ? (
            <EmptyState preset="no-result" />
          ) : (
            <EmptyState
              preset="no-resource"
              actionLabel="新建智能体"
              onAction={() => onCreate('agent')}
              secondaryLabel="新建助手"
              onSecondary={() => onCreate('assistant')}
            />
          )
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {resources.map((r, i) => (
              <GridCard key={r.id} resource={r} index={i} onEdit={onEdit} onToggle={onToggle}
                onOpenMenu={openMenu} />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {resources.map((r, i) => (
              <ListRow key={r.id} resource={r} index={i} onEdit={onEdit} onToggle={onToggle}
                onOpenMenu={openMenu} />
            ))}
          </div>
        )}
      </div>

      {/* Fixed context menu portal */}
      <AnimatePresence>
        {menuState && (() => {
          const r = resources.find(x => x.id === menuState.id);
          if (!r) return null;
          return (
            <FixedCardMenu
              key={menuState.id}
              x={menuState.x} y={menuState.y}
              resource={r}
              onClose={closeMenu}
              onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete}
              moveMenuId={moveMenuId} setMoveMenuId={setMoveMenuId}
              folders={folders} onMoveToFolder={onMoveToFolder}
              onUpdateResourceTags={onUpdateResourceTags} allTagNames={allTagNames}
            />
          );
        })()}
      </AnimatePresence>

      {/* Tag context menu */}
      <AnimatePresence>
        {tagCtx && (
          <div>
            <div className="fixed inset-0 z-[var(--z-popover)]" onClick={() => setTagCtx(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-[var(--z-popover)] bg-popover border border-border/30 rounded-xl shadow-xl p-1 min-w-[100px]"
              style={{ left: tagCtx.x, top: tagCtx.y }}>
              <Button variant="destructive" size="xs" onClick={() => { onDeleteTag(tagCtx.name); setTagCtx(null); }}
                className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 size={10} /> 删除标签
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// Grid Card
// ===========================

interface CardItemProps {
  resource: ResourceItem;
  index: number;
  onEdit: (r: ResourceItem) => void;
  onToggle: (id: string) => void;
  onOpenMenu: (id: string, e: React.MouseEvent) => void;
}

function GridCard({ resource: r, index, onEdit, onToggle, onOpenMenu }: CardItemProps) {
  const cfg = RESOURCE_TYPE_CONFIG[r.type];
  const isToolType = r.type === 'skill' || r.type === 'plugin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }} whileHover={{ y: -2 }}
      className="group relative rounded-xl border border-border/30 bg-card hover:border-border/50 hover:shadow-lg hover:shadow-black/[0.04] transition-all duration-200 cursor-pointer"
      onClick={() => onEdit(r)}>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${!isToolType ? 'bg-accent/50' : cfg.color}`}>{r.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm text-foreground truncate">{r.name}</h4>
              {r.hasUpdate && <Badge variant="secondary" className="text-xs px-1 py-px rounded-full bg-accent-orange-muted text-accent-orange flex-shrink-0">更新</Badge>}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="secondary" className={`text-xs px-1.5 py-px rounded-full ${cfg.color}`}>{cfg.label}</Badge>
              {r.model && <span className="text-xs text-muted-foreground/40">{r.model}</span>}
              {r.version && <span className="text-xs text-muted-foreground/40">v{r.version}</span>}
            </div>
          </div>
          <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon-xs" onClick={e => onOpenMenu(r.id, e)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-colors opacity-0 group-hover:opacity-100">
              <MoreHorizontal size={12} />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 mb-3">{r.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50"><Clock size={8} /><span>{timeAgo(r.updatedAt)}</span></div>
          <div className="flex items-center gap-1.5">
            {r.tags.slice(0, 2).map((t, i) => <span key={`${t}-${i}`} className="text-xs px-1.5 py-px rounded-full bg-accent/50 text-muted-foreground/50">{t}</span>)}
            {r.tags.length > 2 && <span className="text-xs text-muted-foreground/40">+{r.tags.length - 2}</span>}
            {isToolType && <div onClick={e => e.stopPropagation()}><Switch size="sm" checked={r.enabled} onCheckedChange={() => onToggle(r.id)} /></div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===========================
// List Row
// ===========================

function ListRow({ resource: r, index, onEdit, onToggle, onOpenMenu }: CardItemProps) {
  const cfg = RESOURCE_TYPE_CONFIG[r.type];
  const isToolType = r.type === 'skill' || r.type === 'plugin';

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: index * 0.015 }}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => onEdit(r)}>
      <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center text-sm flex-shrink-0">{r.avatar}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-foreground truncate">{r.name}</span>
          <span className={`text-xs px-1.5 py-px rounded-full flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
          {r.hasUpdate && <Badge variant="secondary" className="text-xs px-1 py-px rounded-full bg-accent-orange-muted text-accent-orange flex-shrink-0">更新</Badge>}
        </div>
        <p className="text-xs text-muted-foreground/60 truncate mt-px">{r.description}</p>
      </div>
      {r.model && <span className="text-xs text-muted-foreground/50 flex-shrink-0 hidden sm:block">{r.model}</span>}
      {r.version && <span className="text-xs text-muted-foreground/50 flex-shrink-0 hidden sm:block">v{r.version}</span>}
      {r.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-shrink-0 hidden lg:flex">
          {r.tags.slice(0, 2).map(t => <span key={t} className="text-xs px-1.5 py-px rounded-full bg-accent/50 text-muted-foreground/50">{t}</span>)}
          {r.tags.length > 2 && <span className="text-xs text-muted-foreground/50">+{r.tags.length - 2}</span>}
        </div>
      )}
      <div className="flex items-center gap-1 flex-shrink-0 text-xs text-muted-foreground/40 hidden md:flex"><Clock size={8} /><span>{timeAgo(r.updatedAt)}</span></div>
      {isToolType && <div onClick={e => e.stopPropagation()} className="flex-shrink-0"><Switch size="sm" checked={r.enabled} onCheckedChange={() => onToggle(r.id)} /></div>}
      <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="icon-xs" onClick={e => onOpenMenu(r.id, e)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal size={12} />
        </Button>
      </div>
    </motion.div>
  );
}

// ===========================
// Fixed Card Context Menu (portal-style)
// ===========================

function FixedCardMenu({ x, y, resource, onClose, onEdit, onDuplicate, onDelete, moveMenuId, setMoveMenuId, folders, onMoveToFolder, onUpdateResourceTags, allTagNames }: {
  x: number; y: number; resource: ResourceItem;
  onClose: () => void;
  onEdit: (r: ResourceItem) => void; onDuplicate: (r: ResourceItem) => void; onDelete: (r: ResourceItem) => void;
  moveMenuId: string | null; setMoveMenuId: (id: string | null) => void;
  folders: FolderNode[]; onMoveToFolder: (resourceId: string, folderId: string | undefined) => void;
  onUpdateResourceTags: (resourceId: string, tags: string[]) => void;
  allTagNames: string[];
}) {
  const flat = flattenFolders(folders);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [localTags, setLocalTags] = useState<string[]>(resource.tags);
  const [tagInput, setTagInput] = useState('');

  // Clamp position to viewport
  const menuW = 150;
  const menuH = 220;
  const subMenuW = 170;
  const clampX = Math.max(8, Math.min(x - menuW, window.innerWidth - menuW - 8));
  const clampY = Math.min(y, window.innerHeight - menuH - 8);
  // Determine if sub-menus should open to the left
  const openLeft = clampX + menuW + subMenuW + 8 > window.innerWidth;

  const toggleTag = (tag: string) => {
    const next = localTags.includes(tag) ? localTags.filter(t => t !== tag) : [...localTags, tag];
    setLocalTags(next);
    onUpdateResourceTags(resource.id, next);
  };

  const addNewTag = () => {
    const t = tagInput.trim();
    if (t && !localTags.includes(t)) {
      const next = [...localTags, t];
      setLocalTags(next);
      onUpdateResourceTags(resource.id, next);
    }
    setTagInput('');
  };

  const subMenuPos = openLeft
    ? 'right-full top-0 mr-1'
    : 'left-full top-0 ml-1';

  return (
    <div>
      <div className="fixed inset-0 z-[var(--z-modal)]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-[var(--z-modal)] bg-popover border border-border/30 rounded-xl shadow-xl p-1 min-w-[140px]"
        style={{ left: clampX, top: clampY }}
      >
        <Button variant="ghost" size="xs" onClick={() => { onEdit(resource); onClose(); }} className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"><Pencil size={10} /> 编辑</Button>

        {/* Tag picker */}
        <div className="relative">
          <Button variant="ghost" size="xs" onClick={() => { setShowTagPicker(!showTagPicker); setMoveMenuId(null); }}
            className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors">
            <Tag size={10} /> 管理标签
            {localTags.length > 0 && <span className="ml-auto text-xs text-muted-foreground/50 tabular-nums">{localTags.length}</span>}
            <ChevronDown size={8} className={`transition-transform ${showTagPicker ? 'rotate-180' : ''}`} />
          </Button>
          {showTagPicker && (
            <div className={`absolute ${subMenuPos} bg-popover border border-border/30 rounded-xl shadow-xl p-1 min-w-[160px] max-h-[260px] flex flex-col`}>
              {/* New tag input */}
              <div className="flex items-center gap-1 px-2 py-1 mb-0.5">
                <Input autoFocus value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addNewTag(); }}
                  placeholder="新标签名..."
                  className="flex-1 min-w-0 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60" />
                {tagInput.trim() && (
                  <Button variant="ghost" size="icon-xs" onClick={addNewTag} className="text-muted-foreground/40 hover:text-foreground transition-colors"><Plus size={10} /></Button>
                )}
              </div>
              <div className="h-px bg-border/30 mx-1 mb-0.5" />
              {/* Existing tags */}
              <div className="overflow-y-auto flex-1 scrollbar-thin-xs">
                {allTagNames.length === 0 && !tagInput.trim() && (
                  <p className="text-xs text-muted-foreground/50 px-2.5 py-2 text-center">暂无标签</p>
                )}
                {allTagNames.map(tag => {
                  const checked = localTags.includes(tag);
                  return (
                    <Button variant="ghost" size="xs" key={tag} onClick={() => toggleTag(tag)}
                      className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors">
                      <div className={`w-3.5 h-3.5 rounded-[var(--radius-dot)] border flex items-center justify-center transition-colors ${
                        checked ? 'bg-foreground border-foreground' : 'border-border/30'
                      }`}>
                        {checked && <Check size={8} className="text-background" />}
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${(TAG_COLORS[tag] || DEFAULT_TAG_COLOR).dot}`} />
                      <span className="flex-1 text-left truncate">{tag}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Move to folder */}
        <div className="relative">
          <Button variant="ghost" size="xs" onClick={() => { setMoveMenuId(moveMenuId === resource.id ? null : resource.id); setShowTagPicker(false); }}
            className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors">
            <FolderInput size={10} /> 移动到...<ChevronDown size={8} className="ml-auto" />
          </Button>
          {moveMenuId === resource.id && (
            <div className={`absolute ${subMenuPos} bg-popover border border-border/30 rounded-xl shadow-xl p-1 min-w-[120px] max-h-[200px] overflow-y-auto`}>
              <Button variant="ghost" size="xs" onClick={() => { onMoveToFolder(resource.id, undefined); setMoveMenuId(null); onClose(); }}
                className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors"><Layers size={9} /> 根目录</Button>
              {flat.map(f => (
                <Button variant="ghost" size="xs" key={f.id} onClick={() => { onMoveToFolder(resource.id, f.id); setMoveMenuId(null); onClose(); }}
                  className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors"
                  style={{ paddingLeft: 10 + f.depth * 8 }}><FolderInput size={9} /> {f.name}</Button>
              ))}
            </div>
          )}
        </div>
        <Button variant="ghost" size="xs" onClick={() => { onDuplicate(resource); onClose(); }} className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"><Copy size={10} /> 创建副本</Button>
        <Button variant="ghost" size="xs" onClick={() => onClose()} className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"><Download size={10} /> 导出</Button>
        <div className="h-px bg-border/30 my-0.5 mx-1" />
        <Button variant="destructive" size="xs" onClick={() => { onDelete(resource); onClose(); }} className="flex items-center gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={10} /> 删除</Button>
      </motion.div>
    </div>
  );
}

// ===========================

