// ===========================
// Agent-Specific Types
// ===========================

import type { ToolCallData, GenerativeUIData, WorkflowStep } from './chat';

export type AgentMessageRole = 'user' | 'agent';

export interface AgentChatMessage {
  id: string;
  role: AgentMessageRole;
  content?: string;
  thinking?: string;
  toolCall?: ToolCallData;
  generativeUI?: GenerativeUIData;
  timestamp: string;
}

export interface AgentSession {
  id: string;
  title: string;
  agentName: string;
  agentIcon?: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  status: 'active' | 'completed' | 'paused';
  pinned?: boolean;
  tags?: string[];
  group?: string;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
}

export interface OutputFile {
  id: string;
  name: string;
  format: string;
  size: string;
  status: 'completed' | 'generating';
  timestamp: string;
}

export interface AgentSessionData {
  messages: AgentChatMessage[];
  steps: WorkflowStep[];
  files: FileNode[];
  outputFiles: OutputFile[];
  fileContents: Record<string, string>;
  previewHtml?: string;
  workDir?: string;
}
