import React, { useMemo, useState, useRef } from 'react';
import { Plus, MessageSquare, ChevronDown, ListFilter, Search, Check, MoreHorizontal, FolderOpen, Pin, Archive, Loader2, Bot } from 'lucide-react';
import { motion } from 'motion/react';
import {
  Button, SearchInput, Popover, PopoverTrigger, PopoverContent,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent,
  SimpleTooltip,
} from '@cherry-studio/ui';

// 本文件所有菜单（筛选/右键/行内 … /新建下拉）共用的排版：紧凑 13px。
// 行操作类菜单一律纯文字不带图标（Codex 式）；字重沿用组件基线 font-medium。
// 桌面端菜单排版规范（macOS/Codex 式）：菜单字号比列表正文（14px）小一级，
// 用 13px regular——菜单是瞬态控件，不需要 medium 字重强调；行高收紧到
// ~28px（py-[5px]），子菜单箭头随字号缩到 16px。容器内边距 6px、圆角 14px，
// 覆盖组件库偏大的默认（p-2 / 24px 卡片圆角）。
const RAIL_MENU_ITEM = "text-[13px] font-normal px-2 py-[5px] [&>svg:not([class*='size-'])]:size-4";
const RAIL_MENU_CONTENT = 'p-1.5 rounded-[14px]';

// 新会话图标（Codex 式）：气泡描边在右上角断开，加号嵌在缺口里。
// lucide 无现成款，按其 24 网格 / stroke-2 / round 规范手绘。
export const NewSessionIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 气泡缩小偏左下；右边缘从 11.5 才开始——与加号竖臂（同在 x=18 上，
        止于 8.5）留出 3 格空隙，小尺寸下不粘连 */}
    <path d="M12 4H5a2 2 0 0 0-2 2v15l4-4h9a2 2 0 0 0 2-2V11.5" />
    {/* 加号：十字臂 7 格 */}
    <path d="M14.5 5h7" />
    <path d="M18 1.5v7" />
  </svg>
);

// 圆角矩形 + 靠右短竖线的「侧栏预览」图标（lucide 无现成款）。
// 几何与 lucide panel 系图标对齐：18×18 外框、1.6 描边，避免同排图标粗细/高度不一。
// 工作/对话两个模块的内容区头部共用（预览面板 / 产物面板开关）。
export const PanelRightInsetIcon = ({ size = 15, className }: { size?: number; className?: string }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="4.5" />
    <line x1="15.5" y1="8.5" x2="15.5" y2="15.5" />
  </svg>
);

// ===========================
// EntityRail
// ===========================
// The list rail that holds the assistants (chat) / agents (Agent page).
// Selecting a row switches the active assistant/agent. Search + a tag filter
// narrow the list. Topics for the selected entity live in the header
// TopicPanelButton (far-right floating panel) instead.

export interface EntityRailItem {
  id: string;
  name: string;
  avatar: string;
  tags?: string[];
  /** Used by the "按时间" sort (most recent first). */
  updatedAt?: string;
  /** Trailing count shown at the row's right edge (e.g. a 群聊's member count).
   * Private-chat (Agent) rows leave this undefined so only groups show a number. */
  count?: number;
  /** Unread badge count (IM-style). Bumps the row's text to full opacity. */
  unread?: number;
  /** 未读小蓝点（任务行，Codex 式）— 与 unread 数字二选一。 */
  unreadDot?: boolean;
  /** 任务状态指示（行右缘）：running=转圈 / awaiting=橘点（待确认）/
   * error=红点 / done=绿点（已完成且未查看时才传，避免满屏绿点）。 */
  status?: 'running' | 'awaiting' | 'error' | 'done';
  /** 置顶任务 — 行首显示一枚小图钉。 */
  pinned?: boolean;
}

/** Codex 式分段：置顶 / 任务 / 项目（或专家）。段头可折叠、可拖拽重排。 */
export interface EntityRailSection {
  key: string;
  label: string;
  /** 段内是否有未读 — 段折叠时段头右侧亮蓝点。 */
  unread?: boolean;
  /** 段折叠时段头右侧的状态点颜色（按段内最高优先级：红=有失败 >
   * 橘=有待确认 > 绿=有已完成未查看）。提供时优先于 unread 的蓝点。 */
  dot?: 'red' | 'amber' | 'emerald';
  /** 平铺任务行（置顶段、任务段）。 */
  items?: EntityRailItem[];
  /** 树形分组（专家段、项目段）。 */
  groups?: EntityRailTreeGroup[];
  /** false = 段内行不可拖（置顶段）。默认可拖。 */
  rowsDraggable?: boolean;
  /** false = 段内行不做「超过 5 条截断 + 查看更多」（置顶段——置顶即
   * 用户标记的重要任务，全量展示）。默认截断。 */
  limitRows?: boolean;
  /** 段头操作菜单 — hover 时段头右缘出「…」按钮，右键段头出同一份菜单
   * （如标签段的 重命名/删除标签）。不提供则段头无菜单。 */
  menu?: { items: { id: string; label: string; danger?: boolean; onClick: () => void }[] };
}

export interface EntityRailProps {
  title: string;
  items: EntityRailItem[];
  activeId: string | null | undefined;
  onSelect: (id: string) => void;
  onNew?: () => void;
  onConfigure?: (id: string) => void;
  /** "编辑" overflow-menu action — opens the entity's edit page. */
  onEdit?: (id: string) => void;
  /** Show the search box above the list. Defaults to true; set false for short lists. */
  searchable?: boolean;
  /** Show the sort/filter control in the header. Defaults to true. */
  filterable?: boolean;
  /** When set, the "new" button shows this label next to the + icon (V1 style). */
  newLabel?: string;
  /** Render the "new" action as the first row of the list (Codex "New chat"
   * style) instead of a header button, and hide the title/count header. */
  newAsRow?: boolean;
  /** When provided, the "new" (+) action opens a dropdown of these choices
   * instead of calling onNew directly — e.g. 创建 Agent / 创建项目组. */
  newActions?: {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    onClick: () => void;
  }[];
  /** Fixed nav rows pinned directly under the "new" row (e.g. a 定时任务
   * entry on the Agent rail). Rendered above the entity list; never filtered
   * by search. */
  navEntries?: {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    count?: number;
    active?: boolean;
    onClick: () => void;
  }[];
  /** Codex 式三段结构（置顶/任务/项目…）。提供时优先于 items/treeGroups
   * 渲染；空段自动隐藏。段折叠态与顺序按 persistKey 持久化。 */
  sections?: EntityRailSection[];
  /** localStorage 持久化键（段顺序 / 段折叠态）。 */
  persistKey?: string;
  /** Tree view (专家 → 话题 / 工作目录 → 话题): entity headers with nested,
   * collapsible child rows. Overrides `items` rendering when provided. */
  treeGroups?: EntityRailTreeGroup[];
  /** Click on a tree-group header's text area (the chevron only folds). */
  onGroupSelect?: (key: string) => void;
  /** Highlighted tree-group header (e.g. the selected 专家). */
  activeGroupKey?: string | null;
  /** 手动排序 drag: reorder tree-group headers. Dragging enabled when set. */
  onReorderGroups?: (orderedKeys: string[]) => void;
  /** 手动排序 drag: reorder flat list rows. Dragging enabled when set. */
  onReorderItems?: (orderedIds: string[]) => void;
  /** 任务行右键菜单（重命名/置顶/新标签页/新窗口/删除；position 提供时
   * 追加「任务列表位置 ▸ 左侧/右侧」子菜单 — 专家列表视图。position 是
   * 布局级全局开关（任务列表整体在左栏或右侧面板），id 参数仅为接口兼容）。 */
  rowContextMenu?: {
    /** 行实体名（默认「任务」）— 置顶/归档等文案随之变化，如「置顶话题」。 */
    rowLabel?: string;
    /** position 子菜单标题（默认「任务列表位置」）。 */
    positionLabel?: string;
    onRename: (id: string) => void;
    isPinned?: (id: string) => boolean;
    onTogglePin: (id: string) => void;
    /** 归档 — hover 行尾图标 & 右键菜单项。 */
    onArchive?: (id: string) => void;
    onOpenInNewTab: (id: string) => void;
    onOpenInNewWindow: (id: string) => void;
    position?: { get: (id: string) => 'left' | 'right'; set: (id: string, pos: 'left' | 'right') => void };
    onDelete: (id: string) => void;
  };
  /** 组头 hover 操作（Codex 式）：「…」菜单 + 新会话按钮。菜单按组类型
   * 区分：专家组=编辑/置顶/专家图标▸/删除；文件夹组=访达打开/重命名/删除。 */
  groupHoverMenu?: {
    onNewSession: (key: string) => void;
    expert?: {
      /** 组实体名（默认「专家」）— 菜单文案「编辑/置顶/图标/删除 {label}」随之变化。 */
      label?: string;
      onEdit: (key: string) => void;
      onPinTop: (key: string) => void;
      /** 清空该组下所有话题（对话模块）。提供时菜单显示「清空话题」。 */
      onClearTopics?: (key: string) => void;
      /** 组头图标模式切换（工作模块「专家图标 ▸」）。不提供则无此菜单项，
       * 组头恒显 emoji 头像。 */
      iconMode?: { get: (key: string) => 'emoji' | 'model' | 'none'; set: (key: string, mode: 'emoji' | 'model' | 'none') => void };
      /** 标签分组开关（对话模块，仅助手视图提供）。菜单显示「开启/关闭标签分组」。 */
      tagGrouping?: { enabled: boolean; onToggle: () => void };
      /** 助手标签（企业微信式）：「标签 ▸」二级菜单——新建标签 / 标签列表
       * （已打标签左列打钩，点击多选切换、菜单不关）/ 标签管理。 */
      tags?: {
        all: string[];
        get: (key: string) => string[];
        onToggle: (key: string, tag: string) => void;
        /** 打开「新建标签」弹窗；新建的标签随即打给该助手（企微行为）。 */
        onCreate: (key: string) => void;
        onManage: () => void;
      };
      /** 任务/话题列表位置（左栏/右侧面板）— 布局级全局开关。列表在右侧时
       * 左栏没有任务行可右键，组头菜单是切回左侧的常驻入口。 */
      position?: { label?: string; value: 'left' | 'right'; onChange: (pos: 'left' | 'right') => void };
      onDelete: (key: string) => void;
    };
    folder?: {
      onOpenInFinder: (key: string) => void;
      onRename: (key: string) => void;
      onDelete: (key: string) => void;
    };
  };
  /** Rich filter menu at the right edge of the "new" row (newAsRow only).
   * Sections render in order: 展示方式 / 排序方式 / 全部展开收起 / actions.
   * Codex-style single layer: left check column, no icons, closes on select. */
  railMenu?: {
    displayModes?: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };
    sortModes?: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };
    /** 任务列表位置（左栏/右侧面板）。任务列表在右侧时左栏没有任务行可
     * 右键，这里是切回左侧的常驻入口。label 缺省为「任务列表位置」。 */
    taskPosition?: { label?: string; options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };
    /** Show 全部展开 / 全部收起 rows — enabled only when the current view has
     * collapsible groups (treeGroups); greyed out otherwise. */
    /** 展开/收起全部分组。传实体名（'任务'/'话题'）时文案为「展开任务列表/收起任务列表」；
     * true 用默认「全部展开/收起」。列表位置在右侧时应传 false（左栏无行可展开）。 */
    expandCollapse?: boolean | string;
    actions?: { id: string; label: string; onClick: () => void }[];
  };
}

export interface EntityRailTreeGroup {
  key: string;
  name: string;
  /** Full text for the hover tooltip (e.g. the complete 工作目录 path). */
  title?: string;
  avatar?: string;
  /** false = header is fold-only (工作目录); default true (专家/群聊). */
  selectable?: boolean;
  /** 'folder' = 工作目录组头：文件夹图标 + muted 目录名（比任务文字浅一档，
   * 参考 Codex）。默认为实体组头（emoji 头像 + 常规前景色）。 */
  variant?: 'folder';
  unread?: number;
  children: EntityRailItem[];
}

export function EntityRail({ title, items, activeId, onSelect, onNew, onEdit, searchable = true, filterable = true, newLabel, newAsRow, newActions, navEntries, sections, persistKey, treeGroups, onGroupSelect, activeGroupKey, onReorderGroups, onReorderItems, rowContextMenu, groupHoverMenu, railMenu }: EntityRailProps) {
  const [query, setQuery] = useState('');
  // newAsRow 头部的搜索框（点放大镜拉起/收起）。收起时清空关键词。
  const [searchOpen, setSearchOpen] = useState(false);
  // 搜索进行中：分组/段忽略折叠态全部铺开，行数截断（查看更多）也失效，
  // 保证命中的行都可见。
  const searching = query.trim().length > 0;
  const [groupByTag, setGroupByTag] = useState(false);
  const [sort, setSort] = useState<'default' | 'time' | 'name'>('default');
  // Collapsed headers in the tree view. 全部展开/收起 in the railMenu act on
  // this set. 按 persistKey 持久化——点过「全部展开/收起」或手动折叠某组后，
  // 下次进来保持原状（菜单文案也随之正确切换）。
  const groupStoreKey = `cherry-rail-${persistKey}-groups-folded`;
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    if (!persistKey) return new Set();
    try { return new Set<string>(JSON.parse(localStorage.getItem(groupStoreKey) || '[]')); } catch { return new Set(); }
  });
  const persistCollapsedGroups = (next: Set<string>) => {
    setCollapsedGroups(next);
    if (persistKey) try { localStorage.setItem(groupStoreKey, JSON.stringify(Array.from(next))); } catch { /* 忽略 */ }
  };
  // 手动排序 drag state — group headers and rows share the indicator style
  // (a top border on the current drop target). kind 区分拖的是组头还是行，
  // group 记录被拖行所属的组（树形子行只允许同组内重排）。
  // 右击组头也能打开「…」菜单（受控 open；菜单仍锚在行尾按钮上）。
  const [groupMenuKey, setGroupMenuKey] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragKind, setDragKind] = useState<'section' | 'group' | 'row' | null>(null);
  const [dragGroup, setDragGroup] = useState<string | undefined>(undefined);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const clearDrag = () => { setDragKey(null); setDragKind(null); setDragGroup(undefined); setDropKey(null); };

  // ===== Codex 式分段：折叠态与段顺序（按 persistKey 持久化） =====
  const sectionStore = (suffix: string) => `cherry-rail-${persistKey}-${suffix}`;
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    if (!persistKey) return new Set();
    try { return new Set<string>(JSON.parse(localStorage.getItem(sectionStore('folded')) || '[]')); } catch { return new Set(); }
  });
  const persistCollapsedSections = (next: Set<string>) => {
    setCollapsedSections(next);
    if (persistKey) try { localStorage.setItem(sectionStore('folded'), JSON.stringify(Array.from(next))); } catch { /* 忽略 */ }
  };
  const toggleSection = (key: string) => {
    const next = new Set(collapsedSections);
    if (next.has(key)) next.delete(key); else next.add(key);
    persistCollapsedSections(next);
  };
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    if (!persistKey) return [];
    try { return JSON.parse(localStorage.getItem(sectionStore('order')) || '[]'); } catch { return []; }
  });
  const persistSectionOrder = (keys: string[]) => {
    setSectionOrder(keys);
    if (persistKey) try { localStorage.setItem(sectionStore('order'), JSON.stringify(keys)); } catch { /* 忽略 */ }
  };
  // 搜索过滤（树形分组）：组名命中保留整组；否则只留命中的子行；空组丢弃。
  const searchGroups = (gs: EntityRailTreeGroup[], q: string) => gs
    .map(g => (g.name.toLowerCase().includes(q) ? g : { ...g, children: g.children.filter(c => c.name.toLowerCase().includes(q)) }))
    .filter(g => g.name.toLowerCase().includes(q) || g.children.length > 0);

  // 空段自动隐藏；按持久化顺序排列（未登记的段保持传入顺序排在其后）。
  // 搜索时先按关键词过滤段内行/分组，再隐藏空段。
  const orderedSections = useMemo(() => {
    if (!sections) return null;
    const q = query.trim().toLowerCase();
    const searched = q
      ? sections.map(s => ({
          ...s,
          items: s.items?.filter(i => i.name.toLowerCase().includes(q)),
          groups: s.groups ? searchGroups(s.groups, q) : undefined,
        }))
      : sections;
    const visible = searched.filter(s => (s.items?.length ?? 0) > 0 || (s.groups?.length ?? 0) > 0);
    if (sectionOrder.length === 0) return visible;
    const pos = new Map(sectionOrder.map((k, i) => [k, i]));
    return visible
      .map((s, i) => [s, pos.has(s.key) ? (pos.get(s.key) as number) : sectionOrder.length + i] as const)
      .sort((a, b) => a[1] - b[1])
      .map(([s]) => s);
  }, [sections, sectionOrder, query]);

  // 旧 treeGroups 模式的搜索过滤（重排作用域仍用原始 treeGroups）。
  const displayTreeGroups = useMemo(() => {
    if (!treeGroups) return null;
    const q = query.trim().toLowerCase();
    return q ? searchGroups(treeGroups, q) : treeGroups;
  }, [treeGroups, query]);

  const hasTags = useMemo(() => items.some((i) => i.tags && i.tags.length > 0), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((i) => !q || i.name.toLowerCase().includes(q));
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
    if (sort === 'time') return [...list].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
    return list;
  }, [items, query, sort]);

  // When grouping by tag, an entity shows under each of its tags.
  const groups = useMemo(() => {
    if (!groupByTag) return null;
    const map = new Map<string, EntityRailItem[]>();
    filtered.forEach((item) => {
      const tags = item.tags && item.tags.length > 0 ? item.tags : ['未分类'];
      tags.forEach((tag) => {
        if (!map.has(tag)) map.set(tag, []);
        map.get(tag)!.push(item);
      });
    });
    return Array.from(map.entries());
  }, [filtered, groupByTag]);

  const allGroups = useMemo<EntityRailTreeGroup[]>(
    () => sections ? sections.flatMap(s => s.groups ?? []) : (treeGroups ?? []),
    [sections, treeGroups],
  );
  const toggleGroup = (key: string) => {
    const next = new Set(collapsedGroups);
    if (next.has(key)) next.delete(key); else next.add(key);
    persistCollapsedGroups(next);
  };
  const expandAllGroups = () => {
    persistCollapsedGroups(new Set());
    if (sections) persistCollapsedSections(new Set());
  };
  const collapseAllGroups = () => {
    // 只收「最深一层可折叠物」：树形组折叠子行（组头仍可见——助手/专家
    // 列表不消失），纯行段（置顶/话题）整段收起。带分组的段头保持展开，
    // 否则「全部收起」后只剩标签/段名，列表主体消失。
    persistCollapsedGroups(new Set(allGroups.map(g => g.key)));
    if (sections) persistCollapsedSections(new Set(sections.filter(s => (s.groups?.length ?? 0) === 0).map(s => s.key)));
  };

  // Reorder helper: move `from` right before `to` in the given key order.
  const reorder = (keys: string[], from: string, to: string) => {
    const next = keys.filter(k => k !== from);
    const idx = next.indexOf(to);
    next.splice(idx < 0 ? next.length : idx, 0, from);
    return next;
  };

  const menuActive = sort !== 'default' || groupByTag;

  const renderRow = (item: EntityRailItem, opts?: { indent?: boolean; groupKey?: string; noDrag?: boolean; scopeIds?: string[] }) => {
    const active = item.id === activeId;
    // 平铺行可拖；树形子行也可拖，但只允许在同一组内落下。置顶条不可拖。
    const draggable = !!onReorderItems && !opts?.noDrag && (!!opts?.groupKey || !opts?.indent);
    const canDropHere = dragKind === 'row' && dragKey && dragKey !== item.id && dragGroup === opts?.groupKey;
    const pinned = rowContextMenu?.isPinned?.(item.id) ?? false;
    const rowLabel = rowContextMenu?.rowLabel ?? '任务';
    const row = (
      <div
        className={`group/row relative ${dropKey === item.id ? 'border-t-2 border-cherry-primary/60' : ''}`}
        draggable={draggable}
        onDragStart={draggable ? (e) => { e.stopPropagation(); setDragKey(item.id); setDragKind('row'); setDragGroup(opts?.groupKey); } : undefined}
        onDragOver={draggable ? (e) => { if (canDropHere) { e.preventDefault(); setDropKey(item.id); } } : undefined}
        onDragLeave={draggable ? () => setDropKey(k => (k === item.id ? null : k)) : undefined}
        onDrop={draggable ? () => {
          if (canDropHere) {
            // 重排作用域：段/树形传入的扁平 id 列表（同组内移动不打散分组），
            // 否则用平铺列表。
            const ids = opts?.scopeIds
              ?? (treeGroups ? treeGroups.flatMap(g => g.children.map(c => c.id)) : filtered.map(i => i.id));
            onReorderItems!(reorder(ids, dragKey!, item.id));
          }
          clearDrag();
        } : undefined}
        onDragEnd={draggable ? clearDrag : undefined}
      >
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          className={`w-full min-w-0 flex items-center gap-2 py-[6px] pr-2 rounded-md text-left transition-colors ${opts?.indent ? 'pl-8' : 'pl-2.5'} ${
            active ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/40'
          }`}
        >
          {item.pinned && <Pin size={9} className="-rotate-45 text-muted-foreground/50 flex-shrink-0" />}
          {item.avatar ? <span className="text-base leading-none flex-shrink-0">{item.avatar}</span> : null}
          {/* 标题尽量占满整行，右端渐变淡出（Codex 式）而不是提前打省略号；
              状态点/hover 图标浮在淡出区上。hover 时淡出区加宽给图标让位。 */}
          <span
            className={`text-sm overflow-hidden whitespace-nowrap flex-1 min-w-0 [mask-image:linear-gradient(to_right,#000_calc(100%_-_28px),transparent)] ${
              rowContextMenu
                ? 'group-hover/row:[mask-image:linear-gradient(to_right,#000_calc(100%_-_72px),transparent_calc(100%_-_46px))]'
                : 'group-hover/row:[mask-image:linear-gradient(to_right,#000_calc(100%_-_40px),transparent_calc(100%_-_16px))]'
            } ${active ? 'font-medium' : (item.unread ? 'text-foreground' : '')}`}
          >{item.name}</span>
        </button>
        {/* 状态/未读指示贴行右缘（Codex 式），hover 时让位给操作图标。
            进行中=转圈；待确认=橘点；失败=红点；已完成且未查看=绿点。 */}
        {(item.status || item.unread || item.unreadDot) && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center group-hover/row:opacity-0 transition-opacity pointer-events-none">
            {item.status === 'running' ? (
              <Loader2 size={12} className="animate-spin text-muted-foreground/60" />
            ) : item.status === 'awaiting' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            ) : item.status === 'error' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            ) : item.status === 'done' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ) : item.unread ? (
              <span className="min-w-[14px] h-[14px] px-1 rounded-full bg-primary/12 text-primary/80 text-[9px] leading-[14px] text-center font-medium tabular-nums">{item.unread}</span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-cherry-primary" />
            )}
          </span>
        )}
        {/* Hover actions：任务行 = 置顶/归档（Codex 式）；旧列表 = "…" 菜单。 */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 has-[[data-state=open]]:opacity-100 transition-opacity">
          {rowContextMenu ? (
            <>
              <SimpleTooltip content={pinned ? `取消置顶${rowLabel}` : `置顶${rowLabel}`} side="top" delayDuration={300}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); rowContextMenu.onTogglePin(item.id); }}
                  className={`p-1 rounded hover:bg-accent/70 transition-colors ${pinned ? 'text-foreground' : 'text-muted-foreground/50 hover:text-foreground'}`}
                >
                  <Pin size={13} className={pinned ? 'fill-current' : '-rotate-45'} />
                </button>
              </SimpleTooltip>
              {rowContextMenu.onArchive && (
                <SimpleTooltip content={`归档${rowLabel}`} side="top" delayDuration={300}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); rowContextMenu.onArchive!(item.id); }}
                    className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-accent/70 transition-colors"
                  >
                    <Archive size={13} />
                  </button>
                </SimpleTooltip>
              )}
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  title="更多"
                  className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-accent/70 transition-colors"
                >
                  <MoreHorizontal size={12} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-32 ${RAIL_MENU_CONTENT}`}>
                <DropdownMenuItem className={RAIL_MENU_ITEM} onClick={() => onEdit?.(item.id)}>编辑</DropdownMenuItem>
                <DropdownMenuItem className={RAIL_MENU_ITEM}>复制</DropdownMenuItem>
                <DropdownMenuItem className={RAIL_MENU_ITEM} variant="destructive">删除</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
    if (!rowContextMenu) return <React.Fragment key={item.id}>{row}</React.Fragment>;
    const pos = rowContextMenu.position?.get(item.id) ?? 'left';
    return (
      <ContextMenu key={item.id}>
        <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
        <ContextMenuContent className={`w-40 ${RAIL_MENU_CONTENT}`}>
          <ContextMenuItem className={RAIL_MENU_ITEM} onClick={() => rowContextMenu.onRename(item.id)}>重命名</ContextMenuItem>
          <ContextMenuItem className={RAIL_MENU_ITEM} onClick={() => rowContextMenu.onTogglePin(item.id)}>{pinned ? '取消置顶' : `置顶${rowLabel}`}</ContextMenuItem>
          {rowContextMenu.onArchive && (
            <ContextMenuItem className={RAIL_MENU_ITEM} onClick={() => rowContextMenu.onArchive!(item.id)}>{`归档${rowLabel}`}</ContextMenuItem>
          )}
          <ContextMenuItem className={RAIL_MENU_ITEM} onClick={() => rowContextMenu.onOpenInNewTab(item.id)}>在新标签页打开</ContextMenuItem>
          <ContextMenuItem className={RAIL_MENU_ITEM} onClick={() => rowContextMenu.onOpenInNewWindow(item.id)}>从新窗口打开</ContextMenuItem>
          {rowContextMenu.position && (
            <ContextMenuSub>
              <ContextMenuSubTrigger className={RAIL_MENU_ITEM}>{rowContextMenu.positionLabel ?? '任务列表位置'}</ContextMenuSubTrigger>
              {/* 当前值用左列打钩表示（与筛选菜单一致），不置灰——置灰读作"不可用"。 */}
              <ContextMenuSubContent className={`w-28 ${RAIL_MENU_CONTENT}`}>
                {(['left', 'right'] as const).map((side) => (
                  <ContextMenuItem key={side} className={`gap-0 ${RAIL_MENU_ITEM}`} onClick={() => rowContextMenu.position!.set(item.id, side)}>
                    <span className="w-6 flex-shrink-0 flex items-center">{pos === side && <Check size={13} className="text-foreground" />}</span>
                    {side === 'left' ? '左侧' : '右侧'}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem className={RAIL_MENU_ITEM} variant="destructive" onClick={() => rowContextMenu.onDelete(item.id)}>删除</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  // 超过 5 条的任务列表默认截断，尾部一行浅灰「展开显示」点开看全部
  // （Codex 式）。按段 key / 组 key 记忆展开态，仅本次会话有效。
  const ROW_LIMIT = 5;
  const [expandedMore, setExpandedMore] = useState<Set<string>>(() => new Set());
  const renderLimitedRows = (
    key: string,
    rows: EntityRailItem[],
    render: (i: EntityRailItem) => React.ReactNode,
    indent?: boolean,
  ) => {
    const expanded = searching || expandedMore.has(key);
    const visible = expanded ? rows : rows.slice(0, ROW_LIMIT);
    return (
      <>
        {visible.map(render)}
        {rows.length > ROW_LIMIT && !expanded && (
          <button
            type="button"
            onClick={() => setExpandedMore(prev => new Set(prev).add(key))}
            className={`w-full text-left py-[6px] text-sm text-muted-foreground hover:text-foreground/80 transition-colors ${indent ? 'pl-8' : 'pl-2.5'}`}
          >
            查看更多
          </button>
        )}
      </>
    );
  };

  // 树形分组（专家/项目文件夹）— 段模式与旧 treeGroups 模式共用。
  // scopeGroups 决定组头拖拽与子行重排的作用范围（同段/同视图内）。
  const renderTreeGroup = (g: EntityRailTreeGroup, scopeGroups: EntityRailTreeGroup[], menuScope = '') => {
    const isCollapsed = !searching && collapsedGroups.has(g.key);
    const headerActive = g.key === activeGroupKey;
    const groupDraggable = !!onReorderGroups;
    const canDropGroup = dragKind === 'group' && dragKey && dragKey !== g.key;
    const foldable = g.children.length > 0;
    const scopeIds = scopeGroups.flatMap(t => t.children.map(c => c.id));
    // 标签分组下同一助手会出现在多个段里（g.key 相同）——菜单受控 key
    // 必须带段前缀，否则右键会同时打开多份菜单。
    const menuKey = `${menuScope}:${g.key}`;
    return (
      <div key={g.key} className="mb-px">
        {/* 只有组头可拖（重排专家顺序）——子行有自己的同组内拖拽。 */}
        <div
          className={`group/ghdr flex items-center rounded-md transition-colors ${headerActive ? 'bg-accent/40' : 'hover:bg-accent/40'} ${dropKey === g.key ? 'border-t-2 border-cherry-primary/60' : ''}`}
          onContextMenu={groupHoverMenu ? (e) => { e.preventDefault(); setGroupMenuKey(menuKey); } : undefined}
          draggable={groupDraggable}
          onDragStart={groupDraggable ? () => { setDragKey(g.key); setDragKind('group'); setDragGroup(undefined); } : undefined}
          onDragOver={groupDraggable ? (e) => { if (canDropGroup) { e.preventDefault(); setDropKey(g.key); } } : undefined}
          onDragLeave={groupDraggable ? () => setDropKey(k => (k === g.key ? null : k)) : undefined}
          onDrop={groupDraggable ? () => {
            if (canDropGroup) onReorderGroups!(reorder(scopeGroups.map(t => t.key), dragKey!, g.key));
            clearDrag();
          } : undefined}
          onDragEnd={groupDraggable ? clearDrag : undefined}
        >
          {/* 点组头（图标/名字/空白区）直接锚定到该助手/专家的对话框，
              方便立刻开聊；展开/收起话题列表只由右侧小箭头负责。 */}
          <button
            type="button"
            onClick={() => {
              if (g.selectable !== false && onGroupSelect) onGroupSelect(g.key);
              else if (foldable) toggleGroup(g.key);
            }}
            className="flex-1 min-w-0 flex items-center gap-2 py-[6px] pl-2.5 pr-1 text-left"
            title={g.title}
          >
            {g.variant === 'folder' ? (
              <FolderOpen size={14} strokeWidth={1.75} className="flex-shrink-0 text-muted-foreground/60" />
            ) : (() => {
              // 专家图标显示模式（… 菜单里可切）：Emoji / 模型图标 / 不显示。
              const iconMode = groupHoverMenu?.expert?.iconMode?.get(g.key) ?? 'emoji';
              if (iconMode === 'none') return null;
              if (iconMode === 'model') return <Bot size={15} className="flex-shrink-0 text-muted-foreground/70" />;
              return g.avatar ? <span className="text-base leading-none flex-shrink-0">{g.avatar}</span> : null;
            })()}
            <span className={`text-sm truncate min-w-0 ${headerActive ? 'font-medium text-foreground' : g.variant === 'folder' ? 'text-foreground/70' : 'text-foreground/85'}`}>{g.name}</span>
            {/* 折叠箭头贴在名字右侧（Codex 式）；只有点箭头才展开/收起，
                点行其余部分是锚定对话框。仅 hover 时可见（opacity 占位不回流）。 */}
            {foldable && (
              <span
                role="button"
                title={isCollapsed ? '展开话题' : '收起话题'}
                onClick={(e) => { e.stopPropagation(); toggleGroup(g.key); }}
                className="flex-shrink-0 p-1 -m-1 rounded text-muted-foreground/40 hover:text-foreground/70 opacity-0 group-hover/ghdr:opacity-100 transition-all"
              >
                <ChevronDown size={11} className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
              </span>
            )}
            <span className="flex-1" />
            {g.unread ? (
              <span className="min-w-[14px] h-[14px] px-1 rounded-full bg-primary/12 text-primary/80 text-[9px] leading-[14px] text-center font-medium tabular-nums flex-shrink-0">{g.unread}</span>
            ) : null}
          </button>
          {/* Hover 操作：「…」菜单 + 新会话（Codex 式，hover 或菜单打开时可见）。 */}
          {groupHoverMenu && (
            <div
              className="flex items-center gap-0.5 mr-0.5 flex-shrink-0 opacity-0 group-hover/ghdr:opacity-100 has-[[data-state=open]]:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu open={groupMenuKey === menuKey} onOpenChange={(o) => setGroupMenuKey(k => (o ? menuKey : (k === menuKey ? null : k)))}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    title="更多"
                    className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-accent/70 transition-colors"
                  >
                    <MoreHorizontal size={13} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className={`w-36 ${RAIL_MENU_CONTENT}`}>
                  {g.variant === 'folder' && groupHoverMenu.folder ? (
                    <>
                      <DropdownMenuItem className={RAIL_MENU_ITEM} onClick={() => groupHoverMenu.folder!.onOpenInFinder(g.key)}>在 访达 中打开</DropdownMenuItem>
                      <DropdownMenuItem className={RAIL_MENU_ITEM} onClick={() => groupHoverMenu.folder!.onRename(g.key)}>重命名工作目录</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className={RAIL_MENU_ITEM} variant="destructive" onClick={() => groupHoverMenu.folder!.onDelete(g.key)}>删除工作目录</DropdownMenuItem>
                    </>
                  ) : groupHoverMenu.expert ? (
                    <>
                      <DropdownMenuItem className={RAIL_MENU_ITEM} onClick={() => groupHoverMenu.expert!.onEdit(g.key)}>{`编辑${groupHoverMenu.expert.label ?? '专家'}`}</DropdownMenuItem>
                      <DropdownMenuItem className={RAIL_MENU_ITEM} onClick={() => groupHoverMenu.expert!.onPinTop(g.key)}>{`置顶${groupHoverMenu.expert.label ?? '专家'}`}</DropdownMenuItem>
                      {groupHoverMenu.expert.onClearTopics && (
                        <DropdownMenuItem className={RAIL_MENU_ITEM} onClick={() => groupHoverMenu.expert!.onClearTopics!(g.key)}>清空话题</DropdownMenuItem>
                      )}
                      {groupHoverMenu.expert.iconMode && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className={RAIL_MENU_ITEM}>{`${groupHoverMenu.expert.label ?? '专家'}图标`}</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className={`w-32 ${RAIL_MENU_CONTENT}`} sideOffset={4}>
                            {([['emoji', 'Emoji 表情'], ['model', '模型图标'], ['none', '不显示']] as const).map(([mode, label]) => (
                              <DropdownMenuItem
                                key={mode}
                                className={`gap-0 ${RAIL_MENU_ITEM}`}
                                onClick={() => groupHoverMenu.expert!.iconMode!.set(g.key, mode)}
                              >
                                <span className="w-6 flex-shrink-0 flex items-center">
                                  {groupHoverMenu.expert!.iconMode!.get(g.key) === mode && <Check size={13} className="text-foreground" />}
                                </span>
                                {label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}
                      {groupHoverMenu.expert.tags && (() => {
                        const t = groupHoverMenu.expert!.tags!;
                        const applied = new Set(t.get(g.key));
                        return (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className={RAIL_MENU_ITEM}>标签</DropdownMenuSubTrigger>
                            {/* 结构：上半 = 具体标签（勾选多选）；下半 = 新建标签 /
                                标签管理 / 展示·隐藏标签（标签分组开关挪到这里，
                                不再占一级菜单）。 */}
                            <DropdownMenuSubContent className={`w-36 ${RAIL_MENU_CONTENT}`} sideOffset={4}>
                              {t.all.length > 0 && (
                                <>
                                  {t.all.map(tag => (
                                    <DropdownMenuItem
                                      key={tag}
                                      className={`gap-0 ${RAIL_MENU_ITEM}`}
                                      // preventDefault 保持菜单打开——标签是多选，方便连续勾选。
                                      onSelect={(e) => { e.preventDefault(); t.onToggle(g.key, tag); }}
                                    >
                                      <span className="w-6 flex-shrink-0 flex items-center">{applied.has(tag) && <Check size={13} className="text-foreground" />}</span>
                                      <span className="truncate">{tag}</span>
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem className={RAIL_MENU_ITEM} onClick={() => t.onCreate(g.key)}>新建标签</DropdownMenuItem>
                              <DropdownMenuItem className={RAIL_MENU_ITEM} onClick={() => t.onManage()}>标签管理</DropdownMenuItem>
                              {groupHoverMenu.expert!.tagGrouping && (
                                <DropdownMenuItem className={RAIL_MENU_ITEM} onClick={() => groupHoverMenu.expert!.tagGrouping!.onToggle()}>
                                  {groupHoverMenu.expert!.tagGrouping.enabled ? '隐藏标签' : '展示标签'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        );
                      })()}
                      {groupHoverMenu.expert.position && (() => {
                        const p = groupHoverMenu.expert!.position!;
                        return (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className={RAIL_MENU_ITEM}>{p.label ?? '任务列表位置'}</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className={`w-24 ${RAIL_MENU_CONTENT}`} sideOffset={4}>
                              {([['left', '左侧'], ['right', '右侧']] as const).map(([pos, label]) => (
                                <DropdownMenuItem key={pos} className={`gap-0 ${RAIL_MENU_ITEM}`} onClick={() => p.onChange(pos)}>
                                  <span className="w-6 flex-shrink-0 flex items-center">
                                    {p.value === pos && <Check size={13} className="text-foreground" />}
                                  </span>
                                  {label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        );
                      })()}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className={RAIL_MENU_ITEM} variant="destructive" onClick={() => groupHoverMenu.expert!.onDelete(g.key)}>{`删除${groupHoverMenu.expert.label ?? '专家'}`}</DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                title="新会话"
                onClick={() => groupHoverMenu.onNewSession(g.key)}
                className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-accent/70 transition-colors"
              >
                <NewSessionIcon size={14} />
              </button>
            </div>
          )}
        </div>
        {foldable && !isCollapsed && (
          <div className="space-y-px">{renderLimitedRows(g.key, g.children, (c) => renderRow(c, { indent: true, groupKey: g.key, scopeIds }), true)}</div>
        )}
      </div>
    );
  };

  // Codex 式段头：muted 标签 + 折叠箭头；可拖拽重排段顺序；折叠且段内
  // 有未读时右侧亮蓝点。
  const renderSection = (sec: EntityRailSection) => {
    const collapsed = !searching && collapsedSections.has(sec.key);
    const canDropSection = dragKind === 'section' && dragKey && dragKey !== sec.key;
    const scopeIds = (sec.items ?? []).map(i => i.id);
    const sectionHeader = (
        <div
          className={`group/sec flex items-center gap-1 pl-2.5 pr-2 py-1 rounded-md cursor-pointer hover:bg-accent/30 transition-colors ${dropKey === sec.key ? 'border-t-2 border-cherry-primary/60' : ''}`}
          draggable
          onClick={() => toggleSection(sec.key)}
          onDragStart={() => { setDragKey(sec.key); setDragKind('section'); setDragGroup(undefined); }}
          onDragOver={(e) => { if (canDropSection) { e.preventDefault(); setDropKey(sec.key); } }}
          onDragLeave={() => setDropKey(k => (k === sec.key ? null : k))}
          onDrop={() => {
            if (canDropSection && orderedSections) persistSectionOrder(reorder(orderedSections.map(s => s.key), dragKey!, sec.key));
            clearDrag();
          }}
          onDragEnd={clearDrag}
        >
          <span className="text-sm text-muted-foreground">{sec.label}</span>
          {/* 折叠箭头仅 hover 时可见（opacity 占位不回流）。 */}
          <ChevronDown size={11} className={`flex-shrink-0 text-muted-foreground/60 opacity-0 group-hover/sec:opacity-100 transition-all ${collapsed ? '-rotate-90' : ''}`} />
          <span className="flex-1" />
          {collapsed && sec.dot ? (
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              sec.dot === 'red' ? 'bg-red-500' : sec.dot === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
          ) : collapsed && sec.unread ? (
            <span className="w-1.5 h-1.5 rounded-full bg-cherry-primary flex-shrink-0" />
          ) : null}
          {/* 段头「…」菜单 — hover 出现（菜单打开期间保持可见），与右键菜单同一份。 */}
          {sec.menu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => e.stopPropagation()}
                  className="p-0.5 w-auto h-auto text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 opacity-0 group-hover/sec:opacity-100 data-[state=open]:opacity-100 data-[state=open]:text-foreground data-[state=open]:bg-accent/50"
                >
                  <MoreHorizontal size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={RAIL_MENU_CONTENT}>
                {sec.menu.items.map(mi => (
                  <DropdownMenuItem key={mi.id} className={RAIL_MENU_ITEM} variant={mi.danger ? 'destructive' : undefined} onClick={mi.onClick}>{mi.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
    );
    return (
      <div key={sec.key} className="mb-1.5">
        {sec.menu ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>{sectionHeader}</ContextMenuTrigger>
            <ContextMenuContent className={RAIL_MENU_CONTENT}>
              {sec.menu.items.map(mi => (
                <ContextMenuItem key={mi.id} className={RAIL_MENU_ITEM} variant={mi.danger ? 'destructive' : undefined} onClick={mi.onClick}>{mi.label}</ContextMenuItem>
              ))}
            </ContextMenuContent>
          </ContextMenu>
        ) : sectionHeader}
        {!collapsed && (
          <div className="space-y-px">
            {sec.items && (sec.limitRows === false
              ? sec.items.map(i => renderRow(i, sec.rowsDraggable === false ? { noDrag: true } : { scopeIds }))
              : renderLimitedRows(sec.key, sec.items, i => renderRow(i, sec.rowsDraggable === false ? { noDrag: true } : { scopeIds })))}
            {sec.groups?.map(g => renderTreeGroup(g, sec.groups!, sec.key))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full select-none border-r border-border/15">
      {/* Header — hidden when the "new" action lives in the list (newAsRow). */}
      {!newAsRow && (
      <div className="px-3 py-2.5 border-b border-border/15 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground/60">{title}</span>
          <span className="text-xs text-muted-foreground/40 tabular-nums">{items.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {filterable && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                title="筛选与排序"
                className={`p-1 w-auto h-auto hover:bg-accent/40 ${menuActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ListFilter size={11} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[160px] p-1">
              {([
                { key: 'time' as const, label: '按时间' },
                { key: 'name' as const, label: 'A 到 Z' },
              ]).map((opt) => (
                <Button
                  key={opt.key}
                  variant="ghost"
                  size="xs"
                  onClick={() => setSort((cur) => (cur === opt.key ? 'default' : opt.key))}
                  className={`w-full justify-start gap-2 px-2 ${sort === opt.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <span className="flex-1 text-left">{opt.label}</span>
                  {sort === opt.key && <Check size={10} className="text-primary flex-shrink-0" />}
                </Button>
              ))}
              {hasTags && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setGroupByTag((v) => !v)}
                  className={`w-full justify-start gap-2 px-2 ${groupByTag ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <span className="flex-1 text-left">按标签</span>
                  {groupByTag && <Check size={10} className="text-primary flex-shrink-0" />}
                </Button>
              )}
            </PopoverContent>
          </Popover>
          )}
          {onNew && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onNew}
              title={`新建${title}`}
              className={`w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/40 ${newLabel ? 'gap-1 px-1.5 py-1 text-xs' : 'p-1'}`}
            >
              <Plus size={11} />
              {newLabel && <span>{newLabel}</span>}
            </Button>
          )}
        </div>
      </div>
      )}

      {/* Search */}
      {searchable && (
        <div className="px-2.5 py-1.5 flex-shrink-0">
          <SearchInput value={query} onChange={setQuery} placeholder={`搜索${title}...`} />
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-foreground/10">
        {/* Codex-style "new" row pinned above the list. Multiple newActions
            open a dropdown; a single action (or onNew) fires directly. The
            railMenu filter icon docks at the row's right edge. */}
        {newAsRow && (newActions?.length || onNew || railMenu) && (
          <div className="flex items-center gap-0.5 mb-0.5">
            {newActions && newActions.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex-1 min-w-0 flex items-center gap-2 px-2.5 py-[6px] rounded-md text-left text-foreground/80 hover:bg-accent/40 transition-colors"
                  >
                    <Plus size={16} strokeWidth={1.75} className="flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate flex-1 min-w-0">{newLabel ?? `新建${title}`}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className={`w-40 ${RAIL_MENU_CONTENT}`}>
                  {newActions.map((a) => (
                    <DropdownMenuItem key={a.id} className={RAIL_MENU_ITEM} onClick={a.onClick}>
                      {a.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (newActions?.length || onNew) ? (
              <button
                type="button"
                onClick={newActions?.length === 1 ? newActions[0].onClick : onNew}
                className="flex-1 min-w-0 flex items-center gap-2 px-2.5 py-[6px] rounded-md text-left text-foreground/80 hover:bg-accent/40 transition-colors"
              >
                <Plus size={16} strokeWidth={1.75} className="flex-shrink-0 text-muted-foreground" />
                <span className="text-sm truncate flex-1 min-w-0">{newLabel ?? `新建${title}`}</span>
              </button>
            ) : <div className="flex-1" />}
            {/* 搜索图标（筛选左侧）——点击拉起/收起搜索框，收起时清空关键词。 */}
            <button
              type="button"
              title="搜索"
              onClick={() => setSearchOpen(v => { if (v) setQuery(''); return !v; })}
              className={`p-1.5 rounded-md flex-shrink-0 transition-colors ${
                searchOpen ? 'text-foreground bg-accent/40' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'
              }`}
            >
              <Search size={14} />
            </button>
            {railMenu && (() => {
              // 二级菜单（Codex 式）：顶层只放「展示方式 ▸ / 排序方式 ▸」和
              // 动作项，选项收进子菜单；子菜单里当前值左侧打勾，顶层触发行
              // 右侧回显当前值。DropdownMenu 选中任意项后整个菜单自动关闭。
              const optionItem = (opt: { id: string; label: string }, active: boolean, onChange: (id: string) => void) => (
                <DropdownMenuItem key={opt.id} className={`gap-0 ${RAIL_MENU_ITEM}`} onClick={() => onChange(opt.id)}>
                  <span className="w-6 flex-shrink-0 flex items-center">{active && <Check size={13} className="text-foreground" />}</span>
                  {opt.label}
                </DropdownMenuItem>
              );
              const subMenu = (label: string, modes: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) => (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className={RAIL_MENU_ITEM}>
                    <span className="flex-1">{label}</span>
                    <span className="text-xs font-normal text-muted-foreground/70">
                      {modes.options.find(o => o.id === modes.value)?.label}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className={`w-32 ${RAIL_MENU_CONTENT}`} sideOffset={4}>
                    {modes.options.map((opt) => optionItem(opt, modes.value === opt.id, modes.onChange))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      title="筛选"
                      className="p-1.5 rounded-md flex-shrink-0 text-muted-foreground/60 hover:text-foreground hover:bg-accent/40 transition-colors"
                    >
                      <ListFilter size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={4} className={`w-48 ${RAIL_MENU_CONTENT}`}>
                    {railMenu.displayModes && subMenu('展示方式', railMenu.displayModes)}
                    {railMenu.sortModes && subMenu('排序方式', railMenu.sortModes)}
                    {railMenu.taskPosition && subMenu(railMenu.taskPosition.label ?? '任务列表位置', railMenu.taskPosition)}
                    {railMenu.expandCollapse && (() => {
                      // 只有当前视图存在分组（专家组/文件夹组）才提供此项——
                      // 平铺视图（话题列表/任务列表）直接不出现。
                      const hasGroupContent = sections
                        ? sections.some(s => (s.groups?.length ?? 0) > 0)
                        : (treeGroups ?? []).some(g => g.children.length > 0);
                      if (!hasGroupContent) return null;
                      // 单按钮切换：只要还有展开的段或分组就提供「全部收起」，
                      // 全收起后变为「全部展开」。分段模式下纯行段和组都要算；
                      // 带分组的段头不参与（全部收起时它保持展开）。
                      const anyExpanded = sections
                        ? (sections.some(s => (s.groups?.length ?? 0) === 0 && !collapsedSections.has(s.key)) || allGroups.some(g => g.children.length > 0 && !collapsedGroups.has(g.key)))
                        : (treeGroups ?? []).some(g => g.children.length > 0 && !collapsedGroups.has(g.key));
                      const entity = typeof railMenu.expandCollapse === 'string' ? railMenu.expandCollapse : null;
                      return (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={RAIL_MENU_ITEM}
                            onClick={anyExpanded ? collapseAllGroups : expandAllGroups}
                          >
                            {entity
                              ? (anyExpanded ? `收起${entity}列表` : `展开${entity}列表`)
                              : (anyExpanded ? '全部收起' : '全部展开')}
                          </DropdownMenuItem>
                        </>
                      );
                    })()}
                    {railMenu.actions && railMenu.actions.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        {railMenu.actions.map((a) => (
                          <DropdownMenuItem key={a.id} className={RAIL_MENU_ITEM} onClick={a.onClick}>{a.label}</DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </div>
        )}
        {/* 拉起的搜索框 — 贴在「新建」行下方；Esc 收起并清空。
            默认 SearchInput 的 accent/15 底在左栏近白底色上几乎隐形，
            这里改用 Input 组件的设计 token：实底 input-background + 全
            透明度 input 描边，聚焦时描边升为 ring 色。字号与列表正文
            对齐（13px），占位符/图标加深一档保证可读。 */}
        {newAsRow && searchOpen && (
          <div className="px-1 pb-1 mb-0.5">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="搜索..."
              autoFocus
              iconSize={13}
              wrapperClassName="px-2.5 py-[6px] rounded-lg bg-input-background border-input shadow-xs focus-within:border-ring transition-colors [&>svg]:text-muted-foreground"
              className="text-[13px] placeholder:text-muted-foreground"
              onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); setSearchOpen(false); } }}
            />
          </div>
        )}
        {/* Fixed nav entries (e.g. 定时任务) — pinned right under the "new" row. */}
        {navEntries && navEntries.length > 0 && (
          <div className="mb-0.5 space-y-px">
            {navEntries.map((entry) => {
              const Icon = entry.icon;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={entry.onClick}
                  className={`w-full min-w-0 flex items-center gap-2 px-2.5 py-[6px] rounded-md text-left transition-colors ${
                    entry.active ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/40'
                  }`}
                >
                  <Icon size={15} className={entry.active ? 'text-cherry-primary flex-shrink-0' : 'text-muted-foreground flex-shrink-0'} />
                  <span className="text-sm truncate flex-1 min-w-0">{entry.label}</span>
                  {typeof entry.count === 'number' && (
                    <span className="text-xs text-muted-foreground/40 tabular-nums">{entry.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {orderedSections ? (
          orderedSections.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground/40">{searching ? '无匹配结果' : '暂无内容'}</div>
          ) : (
            orderedSections.map(renderSection)
          )
        ) : displayTreeGroups ? (
          <>
            {/* 置顶任务悬浮在所有分组之上（IM 惯例），带所属实体图标保留上下文。 */}
            {filtered.length > 0 && (
              <div className="space-y-px mb-0.5">{filtered.map((i) => renderRow(i, { noDrag: true }))}</div>
            )}
            {displayTreeGroups.length === 0 && filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground/40">{searching ? '无匹配结果' : '暂无内容'}</div>
            ) : (
              displayTreeGroups.map((g) => renderTreeGroup(g, treeGroups!))
            )}
          </>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground/40">无匹配结果</div>
        ) : groups ? (
          groups.map(([tag, rows]) => {
            const isCollapsed = collapsedGroups.has(tag);
            return (
              <div key={tag} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(tag)}
                  className="w-full min-w-0 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-accent/30 transition-colors group/hdr"
                >
                  <ChevronDown size={10} className={`flex-shrink-0 text-muted-foreground/40 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                  <span className="text-xs text-muted-foreground/40 truncate">{tag}</span>
                  <span className="text-xs text-muted-foreground/30 tabular-nums">{rows.length}</span>
                </button>
                {!isCollapsed && rows.map(renderRow)}
              </div>
            );
          })
        ) : (
          <div className="space-y-px">{filtered.map(renderRow)}</div>
        )}
      </div>
    </div>
  );
}

// ===========================
// TopicPanelButton
// ===========================
// A header button that toggles a floating panel docked to the far-right edge
// (浮窗) of the page content holding the topic/session list (HistorySidebar)
// for the selected entity. The panel is positioned `absolute` so it stays
// inside the app window (the nearest `relative` ancestor — the content
// column — not the viewport). It can be pinned (固定) to the right side so it
// stays put instead of closing on click-away. The child is a render-prop
// receiving `{ close, pinned, togglePin }`.

export interface TopicPanelButtonProps {
  label: string;
  count: number;
  /** Controlled pin: lift the pinned (固定) state to the parent so it can dock
   * the panel into a shared module (e.g. tabbed with artifacts). When provided,
   * this component renders only the floating popover; the parent renders the
   * pinned/docked panel itself. */
  pinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  /** Leading icon — defaults to a chat bubble; pass e.g. <History/> for the
   * agent session list. */
  icon?: React.ReactNode;
  children: (api: { close: () => void; pinned: boolean; togglePin: () => void }) => React.ReactNode;
}

export function TopicPanelButton({ label, count, pinned: pinnedProp, onPinnedChange, icon, children }: TopicPanelButtonProps) {
  const controlled = onPinnedChange !== undefined;
  const [open, setOpen] = useState(false);
  const [internalPinned, setInternalPinned] = useState(false);
  const pinned = controlled ? !!pinnedProp : internalPinned;

  // Selecting an item / pressing close only dismisses the panel when unpinned.
  const close = () => { if (!pinned) setOpen(false); };
  const togglePin = () => {
    if (controlled) { onPinnedChange!(!pinned); setOpen(false); }
    else setInternalPinned((v) => !v);
  };
  // In controlled mode the parent renders the pinned panel, so here we only
  // render the floating popover.
  const showPanel = controlled ? (open && !pinned) : (open || internalPinned);
  const active = open || pinned;
  // Controlled (docked) mode: clicking the button toggles the docked side panel
  // directly — content shifts to make room — instead of opening a transient
  // floating popover. The panel then stays put until the user closes it.
  const handleTrigger = () => {
    if (controlled) onPinnedChange!(!pinned);
    else setOpen((v) => !v);
  };

  // The floating panel is freely resizable from its bottom-left corner. It is
  // anchored top-right, so dragging the corner left widens it and dragging it
  // down makes it taller. Defaults to a compact size so it doesn't cover the
  // chat; capped to the column height via maxHeight.
  const [panelWidth, setPanelWidth] = useState(300);
  const [panelHeight, setPanelHeight] = useState(500);
  const resizing = useRef(false);
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelWidth;
    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    const startH = rect ? rect.height : 600;
    const top = rect ? rect.top : 46;
    const maxH = window.innerHeight - top - 8;
    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      setPanelWidth(Math.max(260, Math.min(720, startW - (ev.clientX - startX))));
      setPanelHeight(Math.max(240, Math.min(maxH, startH + (ev.clientY - startY))));
    };
    const onUp = () => {
      resizing.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'nesw-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="xs"
        onClick={handleTrigger}
        className={`gap-1.5 px-2 py-[4px] text-xs ${
          active ? 'bg-accent/25 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
        }`}
      >
        {icon ?? <MessageSquare size={13} strokeWidth={1.6} />}
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground/50">{count}</span>
        <ChevronDown size={11} />
      </Button>
      {showPanel && (
        <>
          {/* click-away layer — only when floating (unpinned) */}
          {!pinned && <div className="absolute inset-0 z-[var(--z-modal)]" onClick={() => setOpen(false)} />}
          {/* Far-right floating/pinned panel, docked to the content column's right edge */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: panelWidth, height: panelHeight, maxHeight: 'calc(100% - 54px)' }}
            className="absolute right-2 top-[46px] z-[var(--z-modal)] rounded-xl border border-border/40 bg-popover shadow-xl shadow-black/10 overflow-hidden flex flex-col"
          >
            {children({ close, pinned, togglePin })}
            {/* Bottom-left corner drag handle — resize width + height. No
                visible mark; the resize cursor on hover is the affordance. */}
            <div
              onMouseDown={handleResizeStart}
              title="拖拽调整大小"
              className="absolute left-0 bottom-0 w-4 h-4 cursor-nesw-resize z-20"
            />
          </motion.div>
        </>
      )}
    </>
  );
}
