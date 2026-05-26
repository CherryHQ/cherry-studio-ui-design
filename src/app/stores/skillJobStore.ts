import { useEffect, useState } from 'react';
import type { ResourceItem } from '@/app/types';
import { addUserSkill } from './userSkillsStore';

// ============================================================
// SkillJob store — backgrounded "create_skill" execution
// ============================================================
// The "保存为 Skill" flow used to play its tool-call timeline inside
// the confirm dialog. That blocked the user. Now the dialog just
// captures basic metadata and exits; the actual create_skill work
// runs against this store. The chat header reads the active job and
// renders a clickable status chip so the user can peek at progress
// or jump to the resulting Skill in the library.

export const CREATE_SKILL_STEPS = [
  { id: 'analyze', label: '分析对话上下文' },
  { id: 'extract', label: '提取关键步骤与边界条件' },
  { id: 'compose', label: '生成 Skill 文件' },
  { id: 'persist', label: '写入资源库' },
] as const;

export interface SkillJob {
  id: string;
  name: string;
  description: string;
  tags: string[];
  agentName: string;
  agentAvatar: string;
  status: 'running' | 'done';
  currentStep: number; // index of the in-progress step (0..steps.length-1)
  startedAt: number;
  resourceId?: string;
}

let activeJob: SkillJob | null = null;
const listeners = new Set<() => void>();
function emit() { listeners.forEach(fn => fn()); }

export function getActiveSkillJob(): SkillJob | null {
  return activeJob;
}

export function dismissActiveSkillJob(): void {
  activeJob = null;
  emit();
}

export function startSkillJob(opts: {
  name: string;
  description: string;
  tags: string[];
  agentName: string;
  agentAvatar: string;
  contentForMock: string;
}): string {
  const id = `job-${Date.now()}`;
  activeJob = {
    id,
    name: opts.name,
    description: opts.description,
    tags: opts.tags,
    agentName: opts.agentName,
    agentAvatar: opts.agentAvatar,
    status: 'running',
    currentStep: 0,
    startedAt: Date.now(),
  };
  emit();

  const advance = () => {
    if (!activeJob || activeJob.id !== id) return;
    const next = activeJob.currentStep + 1;
    if (next < CREATE_SKILL_STEPS.length) {
      activeJob = { ...activeJob, currentStep: next };
      emit();
      setTimeout(advance, 750);
    } else {
      // All four steps complete — actually persist the skill.
      const now = new Date().toISOString();
      const resourceId = `skill-${Date.now()}`;
      const skill: ResourceItem = {
        id: resourceId,
        name: opts.name,
        type: 'skill',
        description: opts.description,
        avatar: opts.agentAvatar || '✨',
        tags: opts.tags,
        createdAt: now,
        updatedAt: now,
        enabled: true,
        author: `create_skill · 从「${opts.agentName}」对话生成`,
        content: opts.contentForMock,
        fileName: `${opts.name}.md`,
        fileType: 'md',
        fileSize: '<1 KB',
      };
      addUserSkill(skill);
      activeJob = { ...activeJob, status: 'done', resourceId };
      emit();
    }
  };
  setTimeout(advance, 750);
  return id;
}

export function useActiveSkillJob(): SkillJob | null {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return activeJob;
}
