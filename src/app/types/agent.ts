// ===========================
// Agent-Specific Types
// ===========================
// Types used by the Agent run page and its sub-components.
// Extracted from ChatPanel, SessionSidebar, and FileExplorer.

import type { ToolCallData, GenerativeUIData, WorkflowStep } from './chat';

// --- Agent Message Role (narrowed from unified MessageRole) ---
export type AgentMessageRole = 'user' | 'agent';

// --- Permission Approval Request ---
export type PermissionStatus = 'pending' | 'approved' | 'denied';

export interface PermissionRequest {
  id: string;
  toolName: string;
  toolDescription?: string;
  /** key/value pairs of tool input parameters to display */
  params?: { label: string; value: string }[];
  /** risk level affects visual treatment */
  risk?: 'low' | 'medium' | 'high';
  status: PermissionStatus;
  /** whether to show "always allow this tool" option */
  allowAutoApprove?: boolean;
}

// --- Agent Chat Message ---
export interface AgentChatMessage {
  id: string;
  role: AgentMessageRole;
  content?: string;
  thinking?: string;
  toolCall?: ToolCallData;
  generativeUI?: GenerativeUIData;
  permissionRequest?: PermissionRequest;
  timestamp: string;
}

// --- Agent Session ---
export interface AgentSession {
  id: string;
  title: string;
  agentName: string;
  agentIcon?: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  status: 'active' | 'completed' | 'error' | 'paused';
  pinned?: boolean;
  unread?: boolean;
  tags?: string[];
  group?: string;
  /** 'task' = long-running structured job (renders a progress ring
   *  when running); 'chat' = ordinary back-and-forth. Defaults to chat. */
  kind?: 'chat' | 'task';
  /** 0-100. Only consulted for kind === 'task' && status === 'active'. */
  progress?: number;
}

// --- File Explorer ---
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

// --- Session Data (links messages, steps, files for a session) ---
export interface AgentSessionData {
  messages: AgentChatMessage[];
  steps: WorkflowStep[];
  files: FileNode[];
  outputFiles: OutputFile[];
  fileContents: Record<string, string>;
  previewHtml?: string;
  workDir?: string;
}
