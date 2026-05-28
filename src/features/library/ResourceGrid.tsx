import React, { useState, useCallback } from 'react';
import {
  Plus,
  MoreHorizontal,
  Pencil, Copy, FolderInput, Download, Trash2,
  Layers, ChevronDown, Upload, Tag,
  Check, X,
  Filter, Sparkles,
} from 'lucide-react';
import { Button, Input, Popover, PopoverTrigger, PopoverContent, SearchInput, EmptyState, Badge } from '@cherry-studio/ui';
import { Separator } from "@cherry-studio/ui";
import { motion, AnimatePresence } from 'motion/react';
import type { ResourceItem, ResourceType, SortKey, FolderNode, TagItem } from '@/app/types';
import { RESOURCE_TYPE_CONFIG, SORT_LABELS, TAG_COLORS, DEFAULT_TAG_COLOR } from '@/app/config/constants';

interface Props {
  resources: ResourceItem[];
  sortKey: SortKey;
  search: string;
  onSearchChange: (v: string) => void;
  onSortKeyChange: (k: SortKey) => void;
  onEdit: (r: ResourceItem) => void;
  onDuplicate: (r: ResourceItem) => void;
  onDelete: (r: ResourceItem) => void;
  onCreate: (type: ResourceType) => void;
  folders: FolderNode[];
  onMoveToFolder: (resourceId: string, folderId: string | undefined) => void;
  // Tag filtering — multi-select
  tags: TagItem[];
  activeTags: Set<string>;
  onToggleTag: (tagName: string) => void;
  onClearTags: () => void;
  onAddTag: (tagName: string) => void;
  onDeleteTag: (tagName: string) => void;
  onUpdateResourceTags: (resourceId: string, tags: string[]) => void;
  allTagNames: string[];
  // Type filtering — optional. Sidebar resource types are the primary entry.
  activeType: ResourceType | null;
  onTypeFilter: (type: ResourceType | null) => void;
  typeCounts: Record<string, number>;
  onBrowseTemplates?: () => void;
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
  resources, sortKey, search,
  onSearchChange, onSortKeyChange,
  onEdit, onDuplicate, onDelete, onCreate,
  folders, onMoveToFolder,
  tags, activeTags, onToggleTag, onClearTags, onAddTag, onDeleteTag, onUpdateResourceTags, allTagNames,
  activeType, onTypeFilter, typeCounts,
  onBrowseTemplates,
}: Props) {
  const [showFilter, setShowFilter] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [menuState, setMenuState] = useState<{ id: string; x: number; y: number } | null>(null);
  const [moveMenuId, setMoveMenuId] = useState<string | null>(null);

  const displayResources = statusFilter === 'all' ? resources
    : statusFilter === 'enabled' ? resources.filter(r => r.enabled)
    : resources.filter(r => !r.enabled);

  const openMenu = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuState({ id, x: rect.left, y: rect.bottom + 4 });
    setMoveMenuId(null);
  }, []);

  const closeMenu = useCallback(() => { setMenuState(null); setMoveMenuId(null); }, []);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Toolbar — search · 筛选 · 浏览模板 · 新建资源 */}
      <div className="flex items-center gap-2 px-5 py-3 flex-shrink-0 border-b border-border/30">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="搜索资源名称、描述..."
          iconSize={13}
          wrapperClassName="flex-1 max-w-[260px] px-2.5 py-1.5 rounded-lg border border-border/40 bg-accent/25 focus-within:border-primary/40 transition-all"
        />

        <UnifiedFilter
          open={showFilter}
          onOpenChange={setShowFilter}
          sortKey={sortKey} onSortKeyChange={onSortKeyChange}
          statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
          tags={tags} activeTags={activeTags} onToggleTag={onToggleTag} onClearTags={onClearTags}
          onAddTag={onAddTag} onDeleteTag={onDeleteTag}
        />

        <div className="flex-1" />

        {onBrowseTemplates && (
          <Button variant="outline" size="xs"
            onClick={onBrowseTemplates}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border-border/40 transition-colors">
            <Sparkles size={10} />
            <span>浏览模板</span>
          </Button>
        )}

        <Separator orientation="vertical" opacity={30} className="!h-4 flex-shrink-0" />

        <Popover open={showCreate} onOpenChange={(v) => { setShowCreate(v); if (v) setShowFilter(false); }}>
          <PopoverTrigger asChild>
            <Button variant="default" size="xs"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors active:scale-[0.97]">
              <Plus size={11} /><span>新建资源</span>
              <ChevronDown size={9} className={`transition-transform ${showCreate ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-1 min-w-[150px] w-auto">
            {(['prompt', 'assistant', 'agent'] as const).map(t => {
              const cfg = RESOURCE_TYPE_CONFIG[t];
              const Icon = cfg.icon;
              return (
                <Button variant="ghost" size="xs" key={t} onClick={() => { onCreate(t); setShowCreate(false); }}
                  className="flex items-center justify-start gap-2.5 w-full px-2.5 py-[6px] rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon size={10} />
                  </div>
                  <span className="text-left">新建{cfg.label}</span>
                </Button>
              );
            })}
            <Separator opacity={30} className="my-0.5 mx-1" />
            <Button variant="ghost" size="xs" onClick={() => { onCreate('skill'); setShowCreate(false); }}
              className="flex items-center justify-start gap-2.5 w-full px-2.5 py-[6px] rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${RESOURCE_TYPE_CONFIG.skill.color}`}>
                <Upload size={10} />
              </div>
              <span className="text-left">导入Skill</span>
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
        {displayResources.length === 0 ? (
          search || statusFilter !== 'all' || activeTags.size > 0 ? (
            <EmptyState preset="no-result" />
          ) : (
            <EmptyState
              preset="no-resource"
              actionLabel="新建 Prompt"
              onAction={() => onCreate('prompt')}
              secondaryLabel="新建助手"
              onSecondary={() => onCreate('assistant')}
            />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
            {displayResources.map((r, i) => (
              <GridCard key={r.id} resource={r} index={i} onEdit={onEdit}
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

    </div>
  );
}

// ===========================
// Unified filter popover — sort + status + tag filter in one entry
// ===========================
interface UnifiedFilterProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sortKey: SortKey;
  onSortKeyChange: (k: SortKey) => void;
  statusFilter: 'all' | 'enabled' | 'disabled';
  onStatusFilterChange: (s: 'all' | 'enabled' | 'disabled') => void;
  tags: TagItem[];
  activeTags: Set<string>;
  onToggleTag: (name: string) => void;
  onClearTags: () => void;
  onAddTag: (name: string) => void;
  onDeleteTag: (name: string) => void;
}

function UnifiedFilter({
  open, onOpenChange,
  sortKey, onSortKeyChange,
  statusFilter, onStatusFilterChange,
  tags, activeTags, onToggleTag, onClearTags, onAddTag, onDeleteTag,
}: UnifiedFilterProps) {
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const activeCount =
    (sortKey !== 'updatedAt' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (activeTags.size > 0 ? 1 : 0);

  const tagSummary = activeTags.size === 1
    ? Array.from(activeTags)[0]
    : `(${activeTags.size})`;

  const handleAddTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    onAddTag(name);
    setNewTagName('');
    setShowAddTag(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="xs"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
            open || activeCount > 0
              ? 'border-primary/30 bg-accent/50 text-foreground'
              : 'border-border/40 text-muted-foreground/60 hover:text-foreground hover:border-border/50'
          }`}>
          <Filter size={10} />
          <span>筛选</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-none tabular-nums">
              {activeCount}
            </span>
          )}
          <ChevronDown size={9} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-0">
        {/* 排序 */}
        <div className="px-3 pt-3 pb-2">
          <div className="text-[11px] text-muted-foreground/55 mb-1.5">排序</div>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
              <button type="button" key={k} onClick={() => onSortKeyChange(k)}
                className={`px-2 py-1 rounded-md text-xs transition-colors ${
                  sortKey === k
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'
                }`}>
                {SORT_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        <Separator opacity={30} />

        {/* 状态 */}
        <div className="px-3 py-2">
          <div className="text-[11px] text-muted-foreground/55 mb-1.5">状态</div>
          <div className="flex gap-1">
            {([
              { key: 'all' as const, label: '全部' },
              { key: 'enabled' as const, label: '已启用' },
              { key: 'disabled' as const, label: '已禁用' },
            ]).map(opt => (
              <button type="button" key={opt.key} onClick={() => onStatusFilterChange(opt.key)}
                className={`px-2 py-1 rounded-md text-xs transition-colors ${
                  statusFilter === opt.key
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Separator opacity={30} />

        {/* 标签 — compact multi-select list (dropdown-style rows) */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-muted-foreground/55">
              标签{activeTags.size > 0 && <span className="ml-1 text-muted-foreground/40 tabular-nums">{tagSummary}</span>}
            </span>
            {activeTags.size > 0 && (
              <button type="button" onClick={onClearTags}
                className="text-[11px] text-muted-foreground/60 hover:text-foreground">
                清除
              </button>
            )}
          </div>
          <div className="max-h-[180px] overflow-y-auto rounded-md border border-border/30 bg-accent/15 scrollbar-thin">
            {tags.length === 0 && !showAddTag ? (
              <div className="text-[11px] text-muted-foreground/40 px-2 py-2 text-center">暂无标签</div>
            ) : (
              tags.map(tag => {
                const checked = activeTags.has(tag.name);
                return (
                  <div key={tag.id}
                    className="group/tag flex items-center gap-1.5 px-2 py-1 text-[11px] hover:bg-accent/40 cursor-pointer"
                    onClick={() => onToggleTag(tag.name)}>
                    <span className={`inline-flex items-center justify-center w-3 h-3 rounded-[3px] border ${
                      checked ? 'bg-primary border-primary text-primary-foreground' : 'border-border/60'
                    }`}>
                      {checked && <Check size={8} strokeWidth={3} />}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${tag.color}`} />
                    <span className="flex-1 truncate text-foreground">{tag.name}</span>
                    <span className="text-muted-foreground/40 tabular-nums">{tag.count}</span>
                    <button type="button"
                      onClick={e => { e.stopPropagation(); onDeleteTag(tag.name); }}
                      title="删除标签"
                      className="text-muted-foreground/30 hover:text-destructive opacity-0 group-hover/tag:opacity-100 transition-opacity">
                      <X size={9} />
                    </button>
                  </div>
                );
              })
            )}
            {showAddTag ? (
              <div className="flex items-center gap-1 px-2 py-1 border-t border-border/20">
                <Input autoFocus value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddTag();
                    if (e.key === 'Escape') { setShowAddTag(false); setNewTagName(''); }
                  }}
                  onBlur={() => { if (!newTagName.trim()) setShowAddTag(false); }}
                  placeholder="标签名"
                  className="flex-1 h-5 px-1.5 rounded text-[11px] outline-none focus:border-primary/40" />
              </div>
            ) : (
              <button type="button" onClick={() => setShowAddTag(true)}
                className="w-full flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground/55 hover:text-foreground hover:bg-accent/40 border-t border-border/20 transition-colors">
                <Plus size={9} /> 新建标签
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ===========================
// Grid Card
// ===========================

interface CardItemProps {
  resource: ResourceItem;
  index: number;
  onEdit: (r: ResourceItem) => void;
  onOpenMenu: (id: string, e: React.MouseEvent) => void;
}

function GridCard({ resource: r, index, onEdit, onOpenMenu }: CardItemProps) {
  const cfg = RESOURCE_TYPE_CONFIG[r.type];
  const isToolType = r.type === 'skill';
  const isPrompt = r.type === 'prompt';
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }} whileHover={{ y: -2 }}
      className="group relative rounded-xl border border-border/30 bg-card hover:border-border/50 hover:shadow-lg hover:shadow-black/[0.04] transition-all duration-200 cursor-pointer"
      onClick={() => onEdit(r)}>
      <div className="p-2.5">
        <div className="flex items-center gap-2">
          {isPrompt ? (
            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
              <Icon size={13} />
            </div>
          ) : (
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 ${!isToolType ? 'bg-accent/50' : cfg.color}`}>{r.avatar}</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm text-foreground truncate leading-tight">{r.name}</h4>
              {r.hasUpdate && <Badge variant="secondary" className="text-xs px-1 py-px rounded-full bg-accent-orange-muted text-accent-orange flex-shrink-0">更新</Badge>}
            </div>
            <p className="text-xs text-muted-foreground/60 line-clamp-1 mt-0.5">{r.description}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon-xs" onClick={e => onOpenMenu(r.id, e)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-colors opacity-0 group-hover:opacity-100">
              <MoreHorizontal size={12} />
            </Button>
          </div>
        </div>
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
              <Separator opacity={30} className="mx-1 mb-0.5" />
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
            className="flex items-center justify-start gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors">
            <FolderInput size={10} /> 移动到...<ChevronDown size={8} className="ml-auto" />
          </Button>
          {moveMenuId === resource.id && (
            <div className={`absolute ${subMenuPos} bg-popover border border-border/30 rounded-xl shadow-xl p-1 min-w-[120px] max-h-[200px] overflow-y-auto`}>
              <Button variant="ghost" size="xs" onClick={() => { onMoveToFolder(resource.id, undefined); setMoveMenuId(null); onClose(); }}
                className="flex items-center justify-start gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors"><Layers size={9} /> 根目录</Button>
              {flat.map(f => (
                <Button variant="ghost" size="xs" key={f.id} onClick={() => { onMoveToFolder(resource.id, f.id); setMoveMenuId(null); onClose(); }}
                  className="flex items-center justify-start gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors"
                  style={{ paddingLeft: 10 + f.depth * 8 }}><FolderInput size={9} /> {f.name}</Button>
              ))}
            </div>
          )}
        </div>
        <Button variant="ghost" size="xs" onClick={() => { onDuplicate(resource); onClose(); }} className="flex items-center justify-start gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"><Copy size={10} /> 创建副本</Button>
        <Button variant="ghost" size="xs" onClick={() => onClose()} className="flex items-center justify-start gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"><Download size={10} /> 导出</Button>
        <Separator opacity={30} className="my-0.5 mx-1" />
        <Button variant="ghost" size="xs" onClick={() => { onDelete(resource); onClose(); }} className="flex items-center justify-start gap-2 w-full px-2.5 py-[5px] rounded-md text-xs text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={10} /> 删除</Button>
      </motion.div>
    </div>
  );
}

// ===========================

