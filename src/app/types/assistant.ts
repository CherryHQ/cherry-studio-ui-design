// ===========================
// Assistant-Specific Types
// ===========================
// Types used by the Assistant run page and related components.
// Extracted from assistant/mockData.ts.

// --- Assistant Info ---
export interface AssistantInfo {
  id: string;
  name: string;
  model: string;
  modelProvider: string;
  updatedAt: string;
  tags: string[];
  systemPrompt: string;
  knowledgeBases: { id: string; name: string }[];
  tools: { id: string; name: string; icon?: string }[];
}

// --- Branch Tree Types ---
export interface BranchNode {
  id: string;
  role: 'user' | 'assistant' | 'parallel';
  label: string;
  preview: string;
  children: BranchNode[];
  branchId: string;
  model?: string;
  assistantName?: string;
  parallelCount?: number;
}

export interface LayoutNode {
  node: BranchNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
  collapsed: boolean;
  isActive: boolean;
}

// --- Assistant Topic ---
export interface AssistantTopic {
  id: string;
  title: string;
  assistantName: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  status: 'active' | 'completed';
  pinned?: boolean;
  tags?: string[];
  group?: string;
}
