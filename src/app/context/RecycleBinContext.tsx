import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// ===========================
// Types
// ===========================

export type RecycleBinItemType =
  // 历史记录（用户的活动产出）
  | 'topic'        // 聊天助手的话题
  | 'session'      // Agent 运行会话
  | 'painting'     // 绘图（在「创作」里生成的图）
  // 自定义资源（与「新建自定义资源」Dialog 一一对应）
  | 'skill'
  | 'assistant'
  | 'agent'
  | 'mcp'
  | 'prompt'
  | 'kb';
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
  /** Display name of the assistant/agent this item originally belonged to.
      In the decoupled model, topics/sessions are no longer tightly bound
      to a parent — this is just informational context shown in the meta
      line, and used by the orphan-recovery flow to decide whether to
      show the fallback-parent picker. */
  originalParentName?: string;
  /** True when the original parent (assistant/agent) no longer exists in
      any state. On restore, the user is offered a small picker to choose
      a fallback parent instead of being blocked. */
  originalParentMissing?: boolean;
}

interface MoveToBinOptions {
  onUndo?: () => void;
  onRestore?: () => void;
  toast?: boolean;
}

interface RecycleBinContextValue {
  items: RecycleBinItem[];
  retentionDays: number;
  setRetentionDays: (days: number) => void;
  moveToBin: (item: Omit<RecycleBinItem, 'deletedAt' | 'expiresAt'>, options?: MoveToBinOptions) => void;
  /** Restore an item from the bin. `silent` skips the generic "已恢复"
      toast — callers that want to show their own (e.g. orphan-recovery
      with the picked fallback parent name) should pass silent: true. */
  restore: (id: string, options?: { silent?: boolean }) => void;
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

  // ── Decoupled flat items. Topics and sessions no longer cascade with
  // their parent; they live in the bin as independent peers. The
  // `originalParentName` field is just informational meta. When the
  // original parent is gone (`originalParentMissing: true`), restoring
  // pops a fallback-parent picker dialog instead of being blocked.
  {
    id: 'rb-orphan-1',
    type: 'topic',
    name: '如何翻译技术文档',
    icon: '💬',
    meta: 'Translator（已删除）',
    source: 'manual',
    deletedAt: now - 3 * MS_PER_DAY,
    expiresAt: now + 27 * MS_PER_DAY,
    originalParentName: 'Translator',
    originalParentMissing: true,
  },
  {
    id: 'rb-orphan-2',
    type: 'session',
    name: '周报生成 · 第 12 周',
    icon: '▶️',
    meta: '周报生成 Agent（已删除）',
    source: 'manual',
    deletedAt: now - 4 * MS_PER_DAY,
    expiresAt: now + 26 * MS_PER_DAY,
    originalParentName: '周报生成 Agent',
    originalParentMissing: true,
  },

  // ── Painting (drawings produced in 创作 page) ─────────────────────
  {
    id: 'rb-painting-1',
    type: 'painting',
    name: '赛博朋克城市夜景，霓虹灯反射在湿润的街道上',
    icon: '🎨',
    meta: 'Midjourney v6 · 1024×1024',
    source: 'manual',
    deletedAt: now - 1 * MS_PER_DAY,
    expiresAt: now + 29 * MS_PER_DAY,
  },
  {
    id: 'rb-painting-2',
    type: 'painting',
    name: '极简风格的工作台插画，光线柔和',
    icon: '🎨',
    meta: 'DALL·E 3 · 1792×1024',
    source: 'manual',
    deletedAt: now - 8 * MS_PER_DAY,
    expiresAt: now + 22 * MS_PER_DAY,
  },
];

// ===========================
// Fallback-parent mock — used by the orphan-recovery picker.
// In real product this would query active assistants/agents from the
// store; prototype uses a fixed small list per type.
// ===========================
export const FALLBACK_PARENTS_BY_TYPE: Partial<Record<RecycleBinItemType, { id: string; name: string; isDefault?: boolean }[]>> = {
  topic: [
    { id: 'fallback-default-assistant', name: '默认助手', isDefault: true },
    { id: 'fallback-claude',            name: 'Claude 4 Sonnet' },
    { id: 'fallback-gpt',               name: 'GPT-4o' },
    { id: 'fallback-gemini',            name: 'Gemini 2.5 Pro' },
  ],
  session: [
    { id: 'fallback-default-agent',     name: '默认 Agent',     isDefault: true },
    { id: 'fallback-code-agent',        name: 'Coding Agent' },
    { id: 'fallback-research-agent',    name: 'Research Agent' },
  ],
};

// ===========================
// Context
// ===========================
const RecycleBinContext = createContext<RecycleBinContextValue | null>(null);

export function RecycleBinProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RecycleBinItem[]>(seedItems);
  const [retentionDays, setRetentionDays] = useState(RETENTION_DAYS_DEFAULT);

  // Stored undo / restore callbacks keyed by item id; kept in a ref so the
  // bin doesn't re-render every time a callback is registered.
  const callbacksRef = useRef<Map<string, MoveToBinOptions>>(new Map());

  const removeFromBin = useCallback((id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
    callbacksRef.current.delete(id);
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
                const cb = callbacksRef.current.get(item.id);
                cb?.onUndo?.();
                removeFromBin(item.id);
              },
            }
          : undefined,
      });
    }
  }, [retentionDays, removeFromBin]);

  // Recycle-bin "restore":
  // - If a call site registered an explicit onRestore, it owns the user
  //   feedback (custom toast / navigation hint) — we skip the generic
  //   "已恢复" success toast to avoid duplication.
  // - Otherwise fall back to onUndo (most call sites only register that)
  //   and show the generic toast since the callback is silent.
  const restore = useCallback((id: string, options?: { silent?: boolean }) => {
    const cb = callbacksRef.current.get(id);
    if (cb?.onRestore) {
      cb.onRestore();
    } else {
      cb?.onUndo?.();
      if (!options?.silent) toast.success('已恢复');
    }
    removeFromBin(id);
  }, [removeFromBin]);

  const permanentDelete = useCallback((id: string) => {
    removeFromBin(id);
    toast.success('已永久删除');
  }, [removeFromBin]);

  const restoreMany = useCallback((ids: string[]) => {
    let usedFallback = 0;
    ids.forEach(id => {
      const cb = callbacksRef.current.get(id);
      if (cb?.onRestore) {
        cb.onRestore();
      } else {
        cb?.onUndo?.();
        usedFallback++;
      }
      callbacksRef.current.delete(id);
    });
    setItems(prev => prev.filter(it => !ids.includes(it.id)));
    if (usedFallback > 0) {
      toast.success(`已恢复 ${ids.length} 项`);
    }
  }, []);

  const permanentDeleteMany = useCallback((ids: string[]) => {
    ids.forEach(id => callbacksRef.current.delete(id));
    setItems(prev => prev.filter(it => !ids.includes(it.id)));
    toast.success(`已永久删除 ${ids.length} 项`);
  }, []);

  const empty = useCallback(() => {
    const count = items.length;
    callbacksRef.current.clear();
    setItems([]);
    toast.success(`已清空回收站（${count} 项）`);
  }, [items.length]);

  const value = useMemo<RecycleBinContextValue>(() => ({
    items,
    retentionDays,
    setRetentionDays,
    moveToBin,
    restore,
    permanentDelete,
    restoreMany,
    permanentDeleteMany,
    empty,
  }), [items, retentionDays, moveToBin, restore, permanentDelete, restoreMany, permanentDeleteMany, empty]);

  return <RecycleBinContext.Provider value={value}>{children}</RecycleBinContext.Provider>;
}

export function useRecycleBin() {
  const ctx = useContext(RecycleBinContext);
  if (!ctx) throw new Error('useRecycleBin must be used inside <RecycleBinProvider>');
  return ctx;
}
