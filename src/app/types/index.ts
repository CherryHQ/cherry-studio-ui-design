import React from 'react';

// Re-export shared & chat types for convenience
export type {
  AttachmentFileType, FileAttachment, ArtifactType, ArtifactData,
  TokenUsage, ModelCapability, ModelInfo,
  SearchProvider, ProviderParam, BlacklistSubscription,
} from './shared';
export type {
  MessageRole, Message, ToolCallData, GenerativeUIData,
  SearchResultItem, RAGInfo, MessageMetadata, ParallelResponse,
  WorkflowStep, WorkflowStepIcon, StepDetailItem,
  BadgeKind, SlashTab, KBItem, FewShotExample,
} from './chat';
export type {
  ApiResponse, PaginatedResponse, StreamChunk,
  ChatCompletionRequest, ChatRequestMessage, ChatRequestAttachment,
  UploadResult, SessionSummary, ApiErrorDetail,
} from './api';
export type {
  AgentMessageRole, AgentChatMessage, AgentSession,
  FileNode, OutputFile, AgentSessionData,
} from './agent';
export type {
  AssistantInfo, AssistantTopic, BranchNode, LayoutNode,
} from './assistant';
export type {
  FileTag, FileFolder, FileItem,
} from './file';
export type {
  ImageModel, ImageMode, AspectRatio, ImageSize,
  GenerationParams, GeneratedImage,
} from './image';
export type {
  NoteItem, AIChatMsg, NoteQuickAction,
} from './note';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface Tab {
  id: string;
  title: string;
  icon: React.ElementType;
  closeable: boolean;
  pinned?: boolean;
  sidebarDocked?: boolean;
  menuItemId?: string;
  miniAppId?: string;
  miniAppColor?: string;
  miniAppInitial?: string;
  miniAppUrl?: string;
  miniAppLogoUrl?: string;
}

export type SidebarLayout = 'hidden' | 'icon' | 'vertical-card' | 'full';

export interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  tabId: string;
}

export interface DetachedWindow {
  id: string;
  tab: Tab;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ===========================
// Library — Resource Types
// ===========================

export type ResourceType = 'agent' | 'assistant' | 'skill' | 'plugin';

export interface ResourceItem {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  avatar: string;
  model?: string;
  version?: string;
  tags: string[];
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
  hasUpdate?: boolean;
  // File-based resources (skill / plugin)
  fileName?: string;
  fileSize?: string;
  fileType?: 'md' | 'json' | 'zip';
  author?: string;
  homepage?: string;
}

export type ViewMode = 'grid' | 'list';
export type SortKey = 'name' | 'createdAt' | 'updatedAt';

// ===========================
// Library — Sidebar
// ===========================

export interface FolderNode {
  id: string;
  name: string;
  children: FolderNode[];
}

export interface TagItem {
  id: string;
  name: string;
  color: string;
  count: number;
}

export type LibrarySidebarFilter =
  | { type: 'all' }
  | { type: 'resource'; resourceType: ResourceType }
  | { type: 'folder'; folderId: string }
  | { type: 'tag'; tagName: string };

export type LibraryConfigView =
  | { type: 'list' }
  | { type: 'assistant-config'; resource: ResourceItem }
  | { type: 'agent-config'; resource: ResourceItem }
  | { type: 'skill-plugin-detail'; resource: ResourceItem };

// ===========================
// Library — Resource Type UI Config
// ===========================

export interface ResourceTypeUIConfig {
  label: string;
  icon: React.ElementType;
  color: string;
}

// ===========================
// Config — Knowledge Base
// ===========================

export interface KnowledgeBase {
  id: string;
  name: string;
  docCount: number;
  size: string;
  icon: string;
}

// ===========================
// Config — Agent Tools & Plugins
// ===========================

export type ToolRisk = 'low' | 'medium' | 'high';

export interface BuiltinTool {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  enabled: boolean;
  risk: ToolRisk;
}

export interface CustomScript {
  id: string;
  name: string;
  language: string;
  size: string;
}

export type MCPServerStatus = 'connected' | 'disconnected' | 'error';

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  enabled?: boolean;
  category?: string;
  icon?: React.ElementType;
}

export interface MCPServer {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  url?: string;
  status: MCPServerStatus;
  toolCount?: number;
  tools?: MCPTool[];
  endpoint?: string;
  version?: string;
}

export interface InstalledPlugin {
  id: string;
  name: string;
  version: string;
  icon: string;
  enabled: boolean;
  description: string;
}

// ===========================
// Config — Agent Permissions
// ===========================

export type PermissionMode = 'standard' | 'planning' | 'auto-edit' | 'autonomous';

export interface PermissionModeInfo {
  label: string;
  desc: string;
  icon: React.ElementType;
  level: string;
  color: string;
}