import { useEffect, useState } from 'react';

// ============================================================
// Shared artifacts store
// ============================================================
// Tracks artifacts a user shared *out* of an agent run via the
// ArtifactViewer's share menu. Two destinations:
//   - "Pin 到工作台"  → adds a tile to the launchpad (HtmlArtifactTile).
//   - "分享到群组"    → adds an entry under that group's shared list,
//                       which TopicView merges into 文件 / Pin tabs.
// Prototype-grade: in-memory + localStorage so refresh survives.

export interface SharedArtifact {
  /** Stable id derived from fileName + timestamp. */
  id: string;
  /** File label (e.g. "周报-Week12.html"). */
  fileName: string;
  /** Short label for the launchpad tile. */
  label: string;
  /** Emoji used as the launchpad avatar. */
  emoji: string;
  /** Full HTML body (for srcDoc rendering). */
  html: string;
  /** When it was shared. */
  sharedAt: string;
}

interface StoreShape {
  pinned: SharedArtifact[];
  byGroup: Record<string, SharedArtifact[]>;
}

const STORAGE_KEY = 'cherry:shared-artifacts';

function loadStore(): StoreShape {
  if (typeof window === 'undefined') return { pinned: [], byGroup: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pinned: [], byGroup: {} };
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    return {
      pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
      byGroup: parsed.byGroup && typeof parsed.byGroup === 'object' ? parsed.byGroup : {},
    };
  } catch {
    return { pinned: [], byGroup: {} };
  }
}

function persist(state: StoreShape) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* swallow quota errors — non-load-bearing in mock */
  }
}

let state: StoreShape = loadStore();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());

function nextId(fileName: string): string {
  return `share-${fileName.replace(/\W+/g, '-')}-${Date.now()}`;
}

// ------- Pinned to launchpad -------

export function getPinnedArtifacts(): SharedArtifact[] {
  return state.pinned.slice();
}

export function pinArtifact(input: Omit<SharedArtifact, 'id' | 'sharedAt'>): SharedArtifact {
  const entry: SharedArtifact = {
    ...input,
    id: nextId(input.fileName),
    sharedAt: new Date().toISOString(),
  };
  // De-dupe by fileName — re-pinning replaces the existing entry.
  state = {
    ...state,
    pinned: [entry, ...state.pinned.filter(p => p.fileName !== entry.fileName)],
  };
  persist(state);
  emit();
  return entry;
}

export function unpinArtifact(id: string): void {
  state = { ...state, pinned: state.pinned.filter(p => p.id !== id) };
  persist(state);
  emit();
}

export function usePinnedArtifacts(): SharedArtifact[] {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return state.pinned;
}

/**
 * Resolve a pinned-artifact preview by its id (for the HtmlPreviewPage in
 * MainContent). Returns null if the artifact has been unpinned since the
 * tab was opened.
 */
export function findPinnedArtifact(id: string): SharedArtifact | null {
  return state.pinned.find(p => p.id === id) ?? null;
}

/**
 * Look up any shared artifact (pinned or group-scoped) by its fileName.
 * Used by the collaboration HtmlArtifactPanel to render the real HTML
 * the agent shared, rather than its built-in mock fallback.
 */
export function findSharedArtifactByFileName(fileName: string): SharedArtifact | null {
  const hit = state.pinned.find(p => p.fileName === fileName);
  if (hit) return hit;
  for (const list of Object.values(state.byGroup)) {
    const found = list.find(p => p.fileName === fileName);
    if (found) return found;
  }
  return null;
}

// ------- Shared to a group -------

export function getGroupSharedArtifacts(groupId: string): SharedArtifact[] {
  return state.byGroup[groupId]?.slice() ?? [];
}

export function shareArtifactToGroup(groupId: string, input: Omit<SharedArtifact, 'id' | 'sharedAt'>): SharedArtifact {
  const entry: SharedArtifact = {
    ...input,
    id: nextId(input.fileName),
    sharedAt: new Date().toISOString(),
  };
  const existing = state.byGroup[groupId] ?? [];
  state = {
    ...state,
    byGroup: {
      ...state.byGroup,
      [groupId]: [entry, ...existing.filter(p => p.fileName !== entry.fileName)],
    },
  };
  persist(state);
  emit();
  return entry;
}

export function useGroupSharedArtifacts(groupId: string | null | undefined): SharedArtifact[] {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  if (!groupId) return [];
  return state.byGroup[groupId] ?? [];
}
