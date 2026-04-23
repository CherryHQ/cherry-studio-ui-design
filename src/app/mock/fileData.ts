// ===========================
// File Management — Mock Data
// ===========================
// Canonical location for file-management mock data.
// Types are imported from the central type system.

import type { FileTag, FileFolder, FileItem } from '../types/file';

export const FILE_TAGS: FileTag[] = [
  { id: 't1', name: '工作',    color: { dot: 'bg-accent-blue',     badge: 'bg-accent-blue-muted text-accent-blue border-accent-blue/20' } },
  { id: 't2', name: '个人',    color: { dot: 'bg-accent-emerald',  badge: 'bg-accent-emerald-muted text-accent-emerald border-accent-emerald/20' } },
  { id: 't3', name: 'AI 生成', color: { dot: 'bg-accent-violet',   badge: 'bg-accent-violet-muted text-accent-violet border-accent-violet/20' } },
  { id: 't4', name: '重要',    color: { dot: 'bg-destructive',     badge: 'bg-destructive/12 text-destructive border-destructive/20' } },
  { id: 't5', name: 'RAG',     color: { dot: 'bg-accent-amber',    badge: 'bg-accent-amber-muted text-accent-amber border-accent-amber/20' } },
  { id: 't6', name: '参考',    color: { dot: 'bg-accent-cyan',     badge: 'bg-accent-cyan-muted text-accent-cyan border-accent-cyan/20' } },
  { id: 't7', name: '草稿',    color: { dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground border-border/50' } },
];

export const FILE_FOLDERS: FileFolder[] = [
  { id: 'f1', name: '项目文档', parentId: null, children: [
    { id: 'f1a', name: 'Cherry Studio', parentId: 'f1' },
    { id: 'f1b', name: 'API 设计', parentId: 'f1' },
  ]},
  { id: 'f2', name: 'AI 绘画', parentId: null, children: [
    { id: 'f2a', name: '风景', parentId: 'f2' },
    { id: 'f2b', name: '人物', parentId: 'f2' },
  ]},
  { id: 'f3', name: '代码片段', parentId: null },
  { id: 'f4', name: '学习资料', parentId: null },
  { id: 'f5', name: '会议记录', parentId: null },
];

export const MOCK_FILES: FileItem[] = [
  // Images
  { id: 'file1', name: '赛博朋克城市.png', type: 'image', format: 'png', size: '4.2 MB', sizeBytes: 4404019, createdAt: '2026-02-25 14:30', updatedAt: '2026-02-25 14:30', folderId: 'f2a', tags: ['t3'], starred: true, trashed: false, session: 'AI 绘画 #12', description: 'Midjourney v6 生成的赛博朋克城市夜景' },
  { id: 'file2', name: '水墨山水画.jpg', type: 'image', format: 'jpg', size: '3.1 MB', sizeBytes: 3250585, createdAt: '2026-02-24 09:15', updatedAt: '2026-02-24 09:15', folderId: 'f2a', tags: ['t3', 't2'], starred: false, trashed: false, session: 'AI 绘画 #10', description: 'DALL-E 3 生成的中国水墨风格山水画' },
  { id: 'file3', name: '产品 Logo 设计方案.png', type: 'image', format: 'png', size: '1.8 MB', sizeBytes: 1887436, createdAt: '2026-02-23 16:45', updatedAt: '2026-02-24 10:20', folderId: 'f1a', tags: ['t1'], starred: true, trashed: false, session: '设计讨论 #5' },
  { id: 'file4', name: '日落海滩.jpg', type: 'image', format: 'jpg', size: '5.6 MB', sizeBytes: 5872025, createdAt: '2026-02-22 18:00', updatedAt: '2026-02-22 18:00', folderId: 'f2a', tags: ['t3'], starred: false, trashed: false, session: 'AI 绘画 #8' },
  { id: 'file5', name: '界面截图 v2.png', type: 'image', format: 'png', size: '892 KB', sizeBytes: 913408, createdAt: '2026-02-21 11:30', updatedAt: '2026-02-21 11:30', folderId: 'f1a', tags: ['t1', 't6'], starred: false, trashed: false },
  // Documents
  { id: 'file6', name: 'RAG 技术白皮书.pdf', type: 'document', format: 'pdf', size: '8.4 MB', sizeBytes: 8808038, createdAt: '2026-02-25 10:00', updatedAt: '2026-02-25 10:00', folderId: 'f4', tags: ['t5', 't1'], starred: true, trashed: false, description: '检索增强生成技术的完整指南' },
  { id: 'file7', name: '产品需求文档 v3.docx', type: 'document', format: 'docx', size: '2.1 MB', sizeBytes: 2201927, createdAt: '2026-02-24 15:30', updatedAt: '2026-02-25 09:00', folderId: 'f1a', tags: ['t1', 't4'], starred: true, trashed: false, session: 'Cherry Studio V2' },
  { id: 'file8', name: '竞品分析报告.pdf', type: 'document', format: 'pdf', size: '5.3 MB', sizeBytes: 5557453, createdAt: '2026-02-23 14:00', updatedAt: '2026-02-23 14:00', folderId: 'f1', tags: ['t1', 't6'], starred: false, trashed: false },
  { id: 'file9', name: 'LLM 评测结果.pdf', type: 'document', format: 'pdf', size: '3.7 MB', sizeBytes: 3879731, createdAt: '2026-02-22 16:20', updatedAt: '2026-02-22 16:20', folderId: 'f4', tags: ['t5'], starred: false, trashed: false },
  { id: 'file10', name: '用户调研摘要.docx', type: 'document', format: 'docx', size: '780 KB', sizeBytes: 798720, createdAt: '2026-02-20 13:00', updatedAt: '2026-02-21 08:30', folderId: 'f5', tags: ['t1'], starred: false, trashed: false },
  { id: 'file11', name: '2026 Q1 计划.pdf', type: 'document', format: 'pdf', size: '1.2 MB', sizeBytes: 1258291, createdAt: '2026-02-18 09:00', updatedAt: '2026-02-19 14:00', folderId: 'f5', tags: ['t1', 't4'], starred: false, trashed: false },
  // Code
  { id: 'file12', name: 'data-pipeline.py', type: 'code', format: 'py', size: '12 KB', sizeBytes: 12288, createdAt: '2026-02-25 11:45', updatedAt: '2026-02-25 16:00', folderId: 'f3', tags: ['t3', 't1'], starred: false, trashed: false, session: 'Agent 任务 #7', description: 'Agent 生成的数据处理管线脚本' },
  { id: 'file13', name: 'FileManager.tsx', type: 'code', format: 'tsx', size: '8.5 KB', sizeBytes: 8704, createdAt: '2026-02-24 20:00', updatedAt: '2026-02-25 11:30', folderId: 'f3', tags: ['t1'], starred: true, trashed: false, session: '编码助手 #3' },
  { id: 'file14', name: 'api-schema.json', type: 'code', format: 'json', size: '4.2 KB', sizeBytes: 4300, createdAt: '2026-02-23 10:30', updatedAt: '2026-02-23 10:30', folderId: 'f1b', tags: ['t1', 't6'], starred: false, trashed: false },
  { id: 'file15', name: 'embedding-utils.py', type: 'code', format: 'py', size: '6.8 KB', sizeBytes: 6963, createdAt: '2026-02-22 14:15', updatedAt: '2026-02-22 14:15', folderId: 'f3', tags: ['t5', 't3'], starred: false, trashed: false, session: 'Agent 任务 #4' },
  { id: 'file16', name: 'config.yaml', type: 'code', format: 'yaml', size: '2.1 KB', sizeBytes: 2150, createdAt: '2026-02-21 09:00', updatedAt: '2026-02-21 09:00', folderId: 'f1a', tags: ['t7'], starred: false, trashed: false },
  // Audio/Video
  { id: 'file17', name: '会议录音-0225.mp3', type: 'audio', format: 'mp3', size: '24 MB', sizeBytes: 25165824, createdAt: '2026-02-25 15:00', updatedAt: '2026-02-25 15:00', folderId: 'f5', tags: ['t1'], starred: false, trashed: false },
  { id: 'file18', name: 'demo-video.mp4', type: 'video', format: 'mp4', size: '48 MB', sizeBytes: 50331648, createdAt: '2026-02-24 12:00', updatedAt: '2026-02-24 12:00', folderId: 'f1a', tags: ['t1'], starred: false, trashed: false },
  // Trashed
  { id: 'file19', name: '旧版设计稿.png', type: 'image', format: 'png', size: '2.5 MB', sizeBytes: 2621440, createdAt: '2026-02-15 10:00', updatedAt: '2026-02-20 09:00', folderId: null, tags: [], starred: false, trashed: true },
  { id: 'file20', name: '废弃的脚本.py', type: 'code', format: 'py', size: '3.4 KB', sizeBytes: 3481, createdAt: '2026-02-10 14:00', updatedAt: '2026-02-18 16:00', folderId: null, tags: [], starred: false, trashed: true },
  // More images
  { id: 'file21', name: '未来太空站.png', type: 'image', format: 'png', size: '6.1 MB', sizeBytes: 6396313, createdAt: '2026-02-20 17:00', updatedAt: '2026-02-20 17:00', folderId: 'f2b', tags: ['t3'], starred: false, trashed: false, session: 'AI 绘画 #6' },
  { id: 'file22', name: '极简建筑.jpg', type: 'image', format: 'jpg', size: '2.9 MB', sizeBytes: 3040870, createdAt: '2026-02-19 13:30', updatedAt: '2026-02-19 13:30', folderId: 'f2a', tags: ['t3', 't2'], starred: true, trashed: false, session: 'AI 绘画 #5' },
];

export function getFormatLabel(format: string): string {
  const map: Record<string, string> = {
    png: 'PNG', jpg: 'JPG', pdf: 'PDF', docx: 'DOCX',
    py: 'Python', tsx: 'TSX', json: 'JSON', yaml: 'YAML',
    mp3: 'MP3', mp4: 'MP4',
  };
  return map[format] || format.toUpperCase();
}

// Flatten folder tree helper
export function flattenFolders(items: FileFolder[]): FileFolder[] {
  return items.flatMap(f => [f, ...(f.children ? flattenFolders(f.children) : [])]);
}
