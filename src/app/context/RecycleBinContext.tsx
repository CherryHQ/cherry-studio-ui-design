import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// ===========================
// Types
// ===========================

export type RecycleBinItemType =
  // 对话记录
  | 'topic'        // 聊天助手的话题
  | 'session'      // Agent 运行会话
  // 自定义资源（与「新建自定义资源」Dialog 一一对应）
  | 'skill'
  | 'cli'
  | 'assistant'
  | 'agent'
  | 'mcp'
  | 'prompt'
  | 'kb'
  | 'integration';
export type RecycleBinItemSource = 'manual' | 'uninstall';

export interface RecycleBinItem {
  id: string;
  type: RecycleBinItemType;
  name: string;
  icon?: string;
  meta?: string;
  source: RecycleBinItemSource;
  deletedAt: number;
  expiresAt: number;
  /** True if the item was deleted from the 归档管理 page — surfaced as a
      "曾归档" badge in the recycle bin so users can recall the path. */
  fromArchived?: boolean;
  /** Parent bin item id. When a parent (assistant/agent) is deleted, its
      child topics/sessions enter the bin as a group; children cannot be
      independently restored or permanently deleted while the parent is
      in the bin (the parent's action cascades). */
  parentId?: string;
}

interface MoveToBinOptions {
  onUndo?: () => void;
  onRestore?: () => void;
  toast?: boolean;
}

interface RecycleBinContextValue {
  items: RecycleBinItem[];
  retentionDays: number;
  skipTopicConfirm: boolean;
  skipSessionConfirm: boolean;
  setRetentionDays: (days: number) => void;
  setSkipTopicConfirm: (v: boolean) => void;
  setSkipSessionConfirm: (v: boolean) => void;
  moveToBin: (item: Omit<RecycleBinItem, 'deletedAt' | 'expiresAt'>, options?: MoveToBinOptions) => void;
  restore: (id: string) => void;
  permanentDelete: (id: string) => void;
  restoreMany: (ids: string[]) => void;
  permanentDeleteMany: (ids: string[]) => void;
  empty: () => void;
}

const RETENTION_DAYS_DEFAULT = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ===========================
// Mock seed data — pre-populated so the page isn't empty in the prototype
// ===========================
const now = Date.now();
const seedItems: RecycleBinItem[] = [
  {
    id: 'rb-1',
    type: 'topic',
    name: 'Vue 3 Composition API 最佳实践',
    icon: '💬',
    meta: 'Claude 4 Sonnet',
    source: 'manual',
    deletedAt: now - 2 * MS_PER_DAY,
    expiresAt: now + 28 * MS_PER_DAY,
  },
  {
    id: 'rb-2',
    type: 'assistant',
    name: '产品需求评审助手',
    icon: '📋',
    meta: '自定义',
    source: 'manual',
    deletedAt: now - 5 * MS_PER_DAY,
    expiresAt: now + 25 * MS_PER_DAY,
  },
  {
    id: 'rb-3',
    type: 'skill',
    name: '内部文档同步 Skill',
    icon: '🔧',
    meta: '自定义',
    source: 'manual',
    deletedAt: now - 1 * MS_PER_DAY,
    expiresAt: now + 29 * MS_PER_DAY,
  },
  {
    id: 'rb-4',
    type: 'topic',
    name: '后端鉴权方案对比',
    icon: '💬',
    meta: 'GPT-4o',
    source: 'manual',
    deletedAt: now - 27 * MS_PER_DAY,
    expiresAt: now + 3 * MS_PER_DAY,
  },
  {
    id: 'rb-5',
    type: 'agent',
    name: '增长数据周报 Agent',
    icon: '📈',
    meta: '自定义',
    source: 'manual',
    deletedAt: now - 28 * MS_PER_DAY,
    expiresAt: now + 2 * MS_PER_DAY,
  },
  {
    id: 'rb-6',
    type: 'topic',
    name: '为什么我的 useEffect 跑两次',
    icon: '💬',
    meta: 'Claude 4 Sonnet',
    source: 'manual',
    deletedAt: now - 10 * MS_PER_DAY,
    expiresAt: now + 20 * MS_PER_DAY,
  },
  {
    id: 'rb-7',
    type: 'mcp',
    name: '内部 Linear MCP',
    icon: '🔗',
    meta: '自定义',
    source: 'manual',
    deletedAt: now - 4 * MS_PER_DAY,
    expiresAt: now + 26 * MS_PER_DAY,
  },
  {
    id: 'rb-8',
    type: 'kb',
    name: '产品需求文档库 v1',
    icon: '📚',
    meta: '自定义',
    source: 'manual',
    deletedAt: now - 12 * MS_PER_DAY,
    expiresAt: now + 18 * MS_PER_DAY,
  },
  {
    id: 'rb-9',
    type: 'topic',
    name: 'Q1 OKR 制定流程',
    icon: '💬',
    meta: 'Claude 4 Sonnet',
    source: 'manual',
    fromArchived: true,
    deletedAt: now - 6 * MS_PER_DAY,
    expiresAt: now + 24 * MS_PER_DAY,
  },

  // ── Parent-child cascade example: a deleted assistant taking its
  // child topics with it. Demonstrates the group display + locked-child
  // affordances in the recycle bin UI.
  {
    id: 'rb-grp-translator',
    type: 'assistant',
    name: 'Translator',
    icon: '🌐',
    meta: '自定义',
    source: 'manual',
    deletedAt: now - 3 * MS_PER_DAY,
    expiresAt: now + 27 * MS_PER_DAY,
  },
  {
    id: 'rb-grp-translator-c1',
    type: 'topic',
    name: '如何翻译技术文档',
    icon: '💬',
    meta: 'Translator',
    source: 'manual',
    deletedAt: now - 3 * MS_PER_DAY,
    expiresAt: now + 27 * MS_PER_DAY,
    parentId: 'rb-grp-translator',
  },
  {
    id: 'rb-grp-translator-c2',
    type: 'topic',
    name: '中英文术语对照表',
    icon: '💬',
    meta: 'Translator',
    source: 'manual',
    deletedAt: now - 3 * MS_PER_DAY,
    expiresAt: now + 27 * MS_PER_DAY,
    parentId: 'rb-grp-translator',
  },
];

// ===========================
// Context
// ===========================
const RecycleBinContext = createContext<RecycleBinContextValue | null>(null);

export function RecycleBinProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RecycleBinItem[]>(seedItems);
  const [retentionDays, setRetentionDays] = useState(RETENTION_DAYS_DEFAULT);
  const [skipTopicConfirm, setSkipTopicConfirm] = useState(false);
  const [skipSessionConfirm, setSkipSessionConfirm] = useState(false);

  // Stored undo / restore callbacks keyed by item id; kept in a ref so the
  // bin doesn't re-render every time a callback is registered.
  const callbacksRef = useRef<Map<string, MoveToBinOptions>>(new Map());

  const removeFromBin = useCallback((id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
    callbacksRef.current.delete(id);
  }, []);

  // Cascade helper: given an item id, returns the set of ids that should
  // be acted on together — the item itself, plus any direct children
  // (items whose parentId === id). Children of children are not supported
  // (the model is single-level: parent has children, children are leaves).
  const expandCascade = useCallback((id: string, allItems: RecycleBinItem[]): string[] => {
    const children = allItems.filter(it => it.parentId === id).map(it => it.id);
    return [id, ...children];
  }, []);

  const moveToBin = useCallback<RecycleBinContextValue['moveToBin']>((item, options) => {
    const deletedAt = Date.now();
    const expiresAt = deletedAt + retentionDays * MS_PER_DAY;
    const full: RecycleBinItem = { ...item, deletedAt, expiresAt };
    setItems(prev => [full, ...prev]);
    if (options) callbacksRef.current.set(item.id, options);

    if (options?.toast !== false) {
      toast(`${item.icon ?? ''} ${item.name} 已移到回收站`.trim(), {
        description: `${retentionDays} 天内可在「设置 → 回收站」恢复`,
        duration: 5000,
        action: options?.onUndo
          ? {
              label: '撤销',
              onClick: () => {
                // Run the parent's onUndo (restores source state).
                const cb = callbacksRef.current.get(item.id);
                cb?.onUndo?.();
                // Cascade-remove from bin: parent + any children that
                // were seeded with parentId = item.id. Children are a
                // group — undoing the parent should also pull them out
                // of the bin (they were never independent entities).
                setItems(prev => {
                  const removeIds = new Set<string>([item.id]);
                  prev.forEach(it => { if (it.parentId === item.id) removeIds.add(it.id); });
                  removeIds.forEach(id => callbacksRef.current.delete(id));
                  return prev.filter(it => !removeIds.has(it.id));
                });
              },
            }
          : undefined,
      });
    }
  }, [retentionDays]);

  // Recycle-bin "restore":
  // - If a call site registered an explicit onRestore, it owns the user
  //   feedback (custom toast / navigation hint) — we skip the generic
  //   "已恢复" success toast to avoid duplication.
  // - Otherwise fall back to onUndo (most call sites only register that)
  //   and show the generic toast since the callback is silent.
  const restore = useCallback((id: string) => {
    // Cascade: restoring a parent also restores all its children.
    const cascadeIds = expandCascade(id, items);
    let usedFallback = 0;
    cascadeIds.forEach(cid => {
      const cb = callbacksRef.current.get(cid);
      if (cb?.onRestore) {
        cb.onRestore();
      } else {
        cb?.onUndo?.();
        usedFallback++;
      }
      callbacksRef.current.delete(cid);
    });
    setItems(prev => prev.filter(it => !cascadeIds.includes(it.id)));
    if (usedFallback > 0) {
      const childCount = cascadeIds.length - 1;
      toast.success(childCount > 0 ? `已恢复（含 ${childCount} 个子项）` : '已恢复');
    }
  }, [items, expandCascade]);

  const permanentDelete = useCallback((id: string) => {
    const cascadeIds = expandCascade(id, items);
    cascadeIds.forEach(cid => callbacksRef.current.delete(cid));
    setItems(prev => prev.filter(it => !cascadeIds.includes(it.id)));
    const childCount = cascadeIds.length - 1;
    toast.success(childCount > 0 ? `已永久删除（含 ${childCount} 个子项）` : '已永久删除');
  }, [items, expandCascade]);

  const restoreMany = useCallback((ids: string[]) => {
    // Expand each id to include its children, then de-dup.
    const allIds = new Set<string>();
    ids.forEach(id => expandCascade(id, items).forEach(cid => allIds.add(cid)));
    const expandedIds = Array.from(allIds);

    let usedFallback = 0;
    expandedIds.forEach(id => {
      const cb = callbacksRef.current.get(id);
      if (cb?.onRestore) {
        cb.onRestore();
      } else {
        cb?.onUndo?.();
        usedFallback++;
      }
      callbacksRef.current.delete(id);
    });
    setItems(prev => prev.filter(it => !expandedIds.includes(it.id)));
    if (usedFallback > 0) {
      toast.success(`已恢复 ${expandedIds.length} 项`);
    }
  }, [items, expandCascade]);

  const permanentDeleteMany = useCallback((ids: string[]) => {
    const allIds = new Set<string>();
    ids.forEach(id => expandCascade(id, items).forEach(cid => allIds.add(cid)));
    const expandedIds = Array.from(allIds);
    expandedIds.forEach(id => callbacksRef.current.delete(id));
    setItems(prev => prev.filter(it => !expandedIds.includes(it.id)));
    toast.success(`已永久删除 ${expandedIds.length} 项`);
  }, [items, expandCascade]);

  const empty = useCallback(() => {
    const count = items.length;
    callbacksRef.current.clear();
    setItems([]);
    toast.success(`已清空回收站（${count} 项）`);
  }, [items.length]);

  const value = useMemo<RecycleBinContextValue>(() => ({
    items,
    retentionDays,
    skipTopicConfirm,
    skipSessionConfirm,
    setRetentionDays,
    setSkipTopicConfirm,
    setSkipSessionConfirm,
    moveToBin,
    restore,
    permanentDelete,
    restoreMany,
    permanentDeleteMany,
    empty,
  }), [items, retentionDays, skipTopicConfirm, skipSessionConfirm, moveToBin, restore, permanentDelete, restoreMany, permanentDeleteMany, empty]);

  return <RecycleBinContext.Provider value={value}>{children}</RecycleBinContext.Provider>;
}

export function useRecycleBin() {
  const ctx = useContext(RecycleBinContext);
  if (!ctx) throw new Error('useRecycleBin must be used inside <RecycleBinProvider>');
  return ctx;
}
