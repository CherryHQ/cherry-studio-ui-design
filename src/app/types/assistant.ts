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
