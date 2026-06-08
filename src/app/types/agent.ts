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

// --- Annotation (in-message annotations on Markdown / HTML artifacts) ---
export type AnnotationAnchorKind = 'text' | 'element';

export interface AnnotationAnchor {
  kind: AnnotationAnchorKind;
  /** Human-readable label shown in the side panel and the dispatched message,
   *  e.g. "段落 3 · 第 2 句" or "<button> · 第 1 个". */
  label: string;
  /** Verbatim excerpt of the anchored content (selected text, or text content
   *  of the clicked element). Used to make the revision request precise. */
  excerpt: string;
  /** Stable machine-readable descriptor the agent uses to identify the anchor
   *  in source, e.g. "p[2]/range[10..52]" or "button[0]". */
  descriptor: string;
}

export interface Annotation {
  id: string;
  anchor: AnnotationAnchor;
  comment: string;
  createdAt: number;
}

export interface AnnotationBatch {
  artifactKind: 'html' | 'markdown';
  artifactName?: string;
  annotations: Annotation[];
  /** Optional free-text instruction the user typed in the composer to
   *  accompany the annotation batch (e.g. "and tighten the headlines"). */
  extraInstruction?: string;
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
  /** User-role only: a structured revision request derived from artifact
   *  annotations. Rendered as a special bubble instead of plain text. */
  annotationRequest?: AnnotationBatch;
  /** Agent-role only: alternate annotatable representations of the final
   *  artifact. When the agent produces a non-annotatable output (PDF, image,
   *  etc.) it can proactively offer Markdown / HTML "source" versions so the
   *  user can pin comments on specific spans. Clicking one swaps the
   *  artifact viewer to that representation. */
  alternateArtifacts?: AlternateArtifact[];
  timestamp: string;
}

export interface AlternateArtifact {
  kind: 'markdown' | 'html';
  /** Display label, e.g. "Markdown 草稿". */
  label: string;
  /** File-style display name carried over to the artifact viewer header. */
  name?: string;
  markdownContent?: string;
  previewHtml?: string;
}

// --- Artifact version history (annotation-driven revisions) ---
// A version is a snapshot of *all* representations of the artifact at a
// point in time — the deliverable (PDF/native HTML) AND any annotatable
// alternate scratchpads the user has been working on. When the user picks
// a prior version from the toolbar dropdown, every view jumps to that
// version's content so future annotations land on the same v.
export interface ArtifactVersion {
  id: string;
  /** Display label, e.g. "v1", "v2". */
  label: string;
  /** Wall-clock timestamp when this snapshot was created. */
  createdAt: number;
  /** Snapshot of the deliverable (what session-default mode shows). */
  defaultMarkdownContent?: string;
  defaultPreviewHtml?: string;
  /** Snapshot of the annotatable Markdown scratchpad at this version. */
  altMarkdownContent?: string;
  /** Snapshot of the annotatable HTML scratchpad at this version. */
  altPreviewHtml?: string;
  /** Optional one-line summary of what changed in this revision. */
  summary?: string;
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
  /** Markdown source for an MD artifact. When set, the artifact viewer
   *  renders this as styled Markdown instead of the HTML preview. */
  markdownContent?: string;
  /** Display name for the artifact (used by annotation flows). */
  artifactName?: string;
  /** Whether the session's *default* artifact (i.e. the original previewHtml /
   *  markdownContent before any alternate-source override) supports
   *  in-message annotations. Defaults to true. Set to false on sessions
   *  whose default artifact is e.g. a PDF — the agent should then surface
   *  Markdown / HTML alternates that the user picks to enable annotation. */
  defaultArtifactAnnotatable?: boolean;
  workDir?: string;
}
