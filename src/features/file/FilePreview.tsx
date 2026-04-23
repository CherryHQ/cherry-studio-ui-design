import React from 'react';
import {
  X, FileText, Image as ImageIcon, Code2, Music, Video,
  File, Download, Share2, Tag, Clock, HardDrive,
  FolderClosed, MessageCircle, Maximize2,
} from 'lucide-react';
import { Button, Dialog, DialogContent } from '@cherry-studio/ui';
import type { FileItem, FileTag, FileFolder } from './mockData';
import { getFormatLabel, flattenFolders } from './mockData';

const typeIcons: Record<string, React.ElementType> = {
  image: ImageIcon, document: FileText, code: Code2,
  audio: Music, video: Video, other: File,
};

const typeIconColors: Record<string, string> = {
  image: 'text-accent-pink/50',
  document: 'text-accent-blue/50',
  code: 'text-accent-cyan/50',
  audio: 'text-accent-amber/50',
  video: 'text-accent-violet/50',
  other: 'text-muted-foreground/40',
};

const codePreviews: Record<string, string> = {
  py: `import numpy as np
from typing import List, Dict

class DataPipeline:
    def __init__(self, config: Dict):
        self.config = config
        self.steps = []

    def add_step(self, name: str, fn):
        self.steps.append({"name": name, "fn": fn})
        return self

    def run(self, data: List[Dict]) -> List[Dict]:
        result = data
        for step in self.steps:
            result = step["fn"](result)
        return result`,
  tsx: `import React, { useState } from 'react';

interface FileManagerProps {
  files: FileItem[];
  onSelect: (id: string) => void;
}

export function FileManager({ files, onSelect }: FileManagerProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex flex-col h-full">
      <Toolbar view={view} onViewChange={setView} />
      {view === 'grid' ? (
        <GridView files={files} onSelect={onSelect} />
      ) : (
        <ListView files={files} onSelect={onSelect} />
      )}
    </div>
  );
}`,
  json: `{
  "openapi": "3.0.0",
  "info": {
    "title": "Cherry Studio API",
    "version": "2.0.0"
  },
  "paths": {
    "/api/chat": {
      "post": {
        "summary": "Send message",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": { "$ref": "#/schemas/Message" }
            }
          }
        }
      }
    }
  }
}`,
  yaml: `name: cherry-studio
version: 2.0.0
services:
  api:
    image: cherry-api:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production`,
};

const mdPreview = `# RAG 技术白皮书

## 1. 概述
检索增强生成（Retrieval-Augmented Generation）是一种将外部知识检索与大语言模型相结合的技术架构...

## 2. 核心组件
- **文档处理**: 分块、嵌入、索引
- **检索引擎**: 向量相似度搜索 + BM25 混合检索
- **生成模型**: 基于检索结果的上下文增强生成

## 3. 最佳实践
1. 选择合适的分块策略（语义分块 vs 固定大小）
2. 优化嵌入模型（Cohere Embed v3 推荐）
3. 实现重排序（Reranking）提升精度`;

export function FilePreview({
  file,
  onClose,
  tags,
  folders,
}: {
  file: FileItem;
  onClose: () => void;
  tags: FileTag[];
  folders: FileFolder[];
}) {
  const Icon = typeIcons[file.type] || File;
  const fileTags = tags.filter(t => file.tags.includes(t.id));
  const folder = flattenFolders(folders).find(f => f.id === file.folderId);

  const renderPreviewContent = () => {
    if (file.type === 'image') {
      return (
        <div className="flex-1 flex items-center justify-center bg-muted/15 rounded-lg p-4">
          <div className="w-full max-w-[360px] aspect-[4/3] bg-muted/20 rounded-lg flex items-center justify-center">
            <ImageIcon size={48} className="text-accent-pink/15" />
          </div>
        </div>
      );
    }
    if (file.type === 'code') {
      const code = codePreviews[file.format] || '// No preview available';
      return (
        <div className="flex-1 bg-muted/30 rounded-lg p-3 overflow-auto">
          <pre className="text-xs text-accent-cyan/50 whitespace-pre-wrap font-mono">
            {code}
          </pre>
        </div>
      );
    }
    if (file.type === 'document') {
      return (
        <div className="flex-1 bg-muted/30 rounded-lg p-4 overflow-auto">
          <div className="max-w-[400px] mx-auto text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {mdPreview}
          </div>
        </div>
      );
    }
    if (file.type === 'audio') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-muted/30 rounded-lg">
          <Music size={40} className="text-accent-amber/20" />
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-accent-amber/25 rounded-full" />
          </div>
          <span className="text-xs text-muted-foreground/40">03:24 / 12:08</span>
        </div>
      );
    }
    if (file.type === 'video') {
      return (
        <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg">
          <div className="relative">
            <Video size={40} className="text-accent-violet/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <div className="w-0 h-0 border-l-[6px] border-l-border border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg">
        <File size={40} className="text-muted-foreground/40" />
      </div>
    );
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[680px] max-w-[90vw] max-h-[85vh] flex flex-col overflow-hidden p-0" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border/30">
          <Icon size={15} className={typeIconColors[file.type] || typeIconColors.other} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm text-foreground truncate font-medium">{file.name}</h3>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{getFormatLabel(file.format)} · {file.size}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="w-6 h-6 p-0 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
              <Download size={12} />
            </Button>
            <Button variant="ghost" className="w-6 h-6 p-0 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
              <Share2 size={12} />
            </Button>
            <Button variant="ghost" className="w-6 h-6 p-0 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
              <Maximize2 size={12} />
            </Button>
            <Button variant="ghost" onClick={onClose} className="w-6 h-6 p-0 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors ml-1">
              <X size={13} />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Preview */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {renderPreviewContent()}
          </div>
          {/* Detail panel */}
          <div className="w-[200px] flex-shrink-0 border-l border-border/30 p-4 overflow-y-auto scrollbar-thin-xs">
            <h4 className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-2">详细信息</h4>
            <div className="space-y-3">
              <DetailRow icon={HardDrive} label="大小" value={file.size} />
              <DetailRow icon={FileText} label="格式" value={getFormatLabel(file.format)} />
              <DetailRow icon={Clock} label="创建" value={file.createdAt} />
              <DetailRow icon={Clock} label="修改" value={file.updatedAt} />
              {folder && <DetailRow icon={FolderClosed} label="文件夹" value={folder.name} />}
              {file.session && <DetailRow icon={MessageCircle} label="会话" value={file.session} />}
              {file.description && (
                <div>
                  <p className="text-xs text-muted-foreground/60 mb-1">描述</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{file.description}</p>
                </div>
              )}
              {fileTags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground/40 mb-1.5">标签</p>
                  <div className="flex flex-wrap gap-1">
                    {fileTags.map(t => (
                      <span key={t.id} className={`flex items-center gap-1 px-1.5 py-[2px] rounded-full text-xs border ${t.color.badge}`}>
                        <Tag size={7} />
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={10} className="text-muted-foreground/40 mt-[2px] flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground/60">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
