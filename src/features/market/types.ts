import type React from 'react';
import {
  Sparkles, Terminal, MousePointerClick, Bot,
  Network, FileText, BookOpen, Plug,
} from 'lucide-react';

// Assistant 是对话型 persona（system prompt + 模型 +（可选）MCP/知识库），
// Agent 是多步自治 workflow（在 tool-call 循环里产出结构化产物）。
// Market 的 kind 列表必须把两者分开。
export type ResourceKind =
  | 'skill' | 'cli' | 'assistant' | 'agent'
  | 'mcp' | 'prompt' | 'kb' | 'integration';

export interface MarketItem {
  id: string;
  kind: ResourceKind;
  name: string;
  tagline: string;
  author: string;
  avatar: string;
  avatarBg: string;
  language?: string;
  region?: string;
  category: string;
  ageLabel: string;
  installs: number;
  trending?: boolean;
  /** Semver-ish version label shown in card / detail (e.g. "1.2.0"). */
  version?: string;
}

export const KIND_LABEL: Record<ResourceKind, string> = {
  skill: 'Skill', cli: 'CLI', assistant: 'Assistant', agent: 'Agent',
  mcp: 'MCP', prompt: 'Prompt', kb: '知识库', integration: '连接器',
};

export const KIND_ICON: Record<ResourceKind, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  skill: Sparkles, cli: Terminal, assistant: MousePointerClick, agent: Bot,
  mcp: Network, prompt: FileText, kb: BookOpen, integration: Plug,
};
