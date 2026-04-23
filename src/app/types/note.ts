import React from 'react';

// ===========================
// Note Page Types
// ===========================

export interface NoteItem {
  id: string;
  title: string;
  type: 'file' | 'folder';
  children?: NoteItem[];
  starred?: boolean;
  updatedAt?: string;
  preview?: string;
  tags?: string[];
}

export interface AIChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export interface NoteQuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  category: 'write' | 'analyze' | 'organize' | 'format';
  mockResponse: string;
}
