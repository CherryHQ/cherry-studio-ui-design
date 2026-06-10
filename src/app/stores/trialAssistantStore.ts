import { useEffect, useState } from 'react';
import type { AssistantPreset } from '@/features/library/assistantPresets';

// ============================================================
// Trial Assistant store
// ============================================================
// Backs the "立即试聊（Chat now）" flow from the assistant preset
// preview dialog. At most one trial exists at a time; when a second
// "立即试聊" fires while another trial is unsaved we surface a
// keep-or-discard conflict (handled by UI consumers, not the store).
//
// Mocked: no LLM. Messages are pushed by the trial chat page.

export interface TrialMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface TrialAssistant {
  preset: AssistantPreset;
  /** Snapshotted at trial-start so a later preset edit doesn't drift the chat */
  modelId: string;
  /** True when preset had no default model and we fell back to the user's global default */
  usingGlobalDefault: boolean;
  messages: TrialMessage[];
  createdAt: number;
}

let current: TrialAssistant | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(fn => fn());
}

export function getTrial(): TrialAssistant | null {
  return current;
}

export function startTrial(input: {
  preset: AssistantPreset;
  modelId: string;
  usingGlobalDefault: boolean;
}): void {
  current = { ...input, messages: [], createdAt: Date.now() };
  emit();
}

export function appendTrialMessage(msg: Omit<TrialMessage, 'id' | 'createdAt'>): void {
  if (!current) return;
  current = {
    ...current,
    messages: [
      ...current.messages,
      { ...msg, id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now() },
    ],
  };
  emit();
}

export function discardTrial(): void {
  current = null;
  emit();
}

/**
 * "保留此助手" 路径——返回 trial 的副本（caller 用它把试聊转成一个常规助手 + topic），
 * 然后清空 store。Caller responsible for persisting into the real assistant list (mocked).
 */
export function keepTrial(): TrialAssistant | null {
  const snapshot = current;
  current = null;
  emit();
  return snapshot;
}

export function useTrial(): TrialAssistant | null {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return current;
}
