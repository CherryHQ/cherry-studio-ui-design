import { useEffect, useState } from 'react';
import type { ResourceItem } from '@/app/types';

// ============================================================
// User-created Skills store
// ============================================================
// Small module-level store that backs Skills created from the agent
// chat ("保存为 Skill" flow). Persists to localStorage so the design
// playground survives a refresh. The Library page subscribes via
// `useUserSkills()` and merges into its resource list.

const STORAGE_KEY = 'cherry:user-skills';

function load(): ResourceItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ResourceItem[]) : [];
  } catch {
    return [];
  }
}

function persist(items: ResourceItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* swallow quota / serialization errors — not load-bearing in mock */
  }
}

let userSkills: ResourceItem[] = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(fn => fn());
}

export function getUserSkills(): ResourceItem[] {
  return userSkills.slice();
}

export function addUserSkill(skill: ResourceItem): void {
  userSkills = [skill, ...userSkills];
  persist(userSkills);
  emit();
}

export function useUserSkills(): ResourceItem[] {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return userSkills;
}
