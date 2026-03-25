// ===========================
// Resource Service
// ===========================
// API methods for file uploads, resource management, etc.
// When USE_MOCK is true, returns mock data without hitting the network.

import { USE_MOCK } from '../config/env';
import { get, post, del } from './apiClient';
import type { UploadResult, PaginatedResponse } from '../types/api';
import type { ResourceItem } from '../types';

// ---------------------
// Mock helpers
// ---------------------

function mockDelay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------
// File Upload
// ---------------------

/**
 * Upload a file attachment.
 * In mock mode, creates a fake URL; in production, calls the upload endpoint.
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  if (USE_MOCK) {
    await mockDelay(500);
    return {
      fileId: `file-${Date.now()}`,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
    };
  }

  // Real upload via multipart form
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/v1/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`\u6587\u4ef6\u4e0a\u4f20\u5931\u8d25 (${response.status})`);
  }

  const json = await response.json();
  return json.data as UploadResult;
}

// ---------------------
// Resources (Library)
// ---------------------

/** Fetch resource list with optional filters. */
export async function getResources(params?: {
  type?: string;
  tag?: string;
  folderId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<ResourceItem>> {
  if (USE_MOCK) {
    await mockDelay();
    return {
      items: [],
      total: 0,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
      hasMore: false,
    };
  }

  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.folderId) searchParams.set('folderId', params.folderId);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

  const qs = searchParams.toString();
  return get<PaginatedResponse<ResourceItem>>(`/resources${qs ? '?' + qs : ''}`);
}

/** Create a new resource. */
export async function createResource(
  data: Partial<ResourceItem>,
): Promise<ResourceItem> {
  if (USE_MOCK) {
    await mockDelay();
    return {
      id: `res-${Date.now()}`,
      name: data.name || '\u65b0\u8d44\u6e90',
      type: data.type || 'assistant',
      description: data.description || '',
      avatar: data.avatar || '',
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enabled: true,
    };
  }
  return post<ResourceItem>('/resources', data);
}

/** Update an existing resource. */
export async function updateResource(
  id: string,
  data: Partial<ResourceItem>,
): Promise<ResourceItem> {
  if (USE_MOCK) {
    await mockDelay();
    return {
      id,
      name: data.name || '',
      type: data.type || 'assistant',
      description: data.description || '',
      avatar: data.avatar || '',
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enabled: true,
      ...data,
    } as ResourceItem;
  }
  return post<ResourceItem>(`/resources/${id}`, data);
}

/** Delete a resource. */
export async function deleteResource(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockDelay();
    return;
  }
  return del(`/resources/${id}`);
}

// ---------------------
// Knowledge Base
// ---------------------

/** Upload a document to a knowledge base for indexing. */
export async function uploadKnowledgeDoc(
  knowledgeBaseId: string,
  file: File,
): Promise<UploadResult> {
  if (USE_MOCK) {
    await mockDelay(800);
    return {
      fileId: `doc-${Date.now()}`,
      fileName: file.name,
      fileUrl: '',
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/v1/knowledge/${knowledgeBaseId}/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`\u6587\u6863\u4e0a\u4f20\u5931\u8d25 (${response.status})`);
  }

  const json = await response.json();
  return json.data as UploadResult;
}
