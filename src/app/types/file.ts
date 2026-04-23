// ===========================
// File Management Types
// ===========================
// Types used by the File management page and its sub-components.

export interface FileTag {
  id: string;
  name: string;
  color: { dot: string; badge: string };
}

export interface FileFolder {
  id: string;
  name: string;
  parentId: string | null;
  children?: FileFolder[];
}

export interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'code' | 'audio' | 'video' | 'other';
  format: string;
  size: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
  tags: string[];
  starred: boolean;
  trashed: boolean;
  session?: string;
  preview?: string;
  description?: string;
}
