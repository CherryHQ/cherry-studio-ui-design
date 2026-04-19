import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  NotebookPen, FilePlus, FolderPlus, PanelLeftClose, PanelLeftOpen,
  PanelRightClose, Search, Star, SortAsc, Filter,
  FileText, ChevronRight, FolderOpen, Folder, PenLine,
  Brain, Sparkles,
  Check, Languages, Maximize2, MessageCircle, Hash,
  List, Send, Trash2, Download, Share2, MoreHorizontal,
  X, Home, Copy, Plus, ChevronDown, Tag,
  Bold, Italic, Underline, Strikethrough, ListOrdered, Quote,
  Code, Heading1, Heading2, Heading3, Undo2, Redo2,
  Braces, Table, Minus, Link, Image as ImageIcon, Eye
} from 'lucide-react';
import { Button, Input } from '@cherry-studio/ui';
import { Tooltip } from '@/components/common/Tooltip';
import type { AssistantInfo } from '@/types/assistant';
import { MOCK_ASSISTANTS, ASSISTANT_EMOJI_MAP } from '@/mock';
import { EmptyState } from '@/components/ui/EmptyState';

// ===========================
// Note Page Types & Data
// ===========================
interface NoteItem {
  id: string;
  title: string;
  type: 'file' | 'folder';
  children?: NoteItem[];
  starred?: boolean;
  updatedAt?: string;
  preview?: string;
  tags?: string[];
}

const mockNotes: NoteItem[] = [
  {
    id: 'f1', title: '工作笔记', type: 'folder', children: [
      {
        id: 'f1-1', title: '项目管理', type: 'folder', children: [
          { id: 'n1', title: '项目周报 - Week 12', type: 'file', starred: true, updatedAt: '2 小时前', preview: '本周完成了用户认证模块的开发，修复了 3 个关键 Bug...', tags: ['周报', '项目'] },
          { id: 'n2', title: 'Q4 OKR 复盘', type: 'file', updatedAt: '1 天前', preview: 'O1: 提升产品核心体验\nKR1: DAU 提升 20%...', tags: ['OKR'] },
          { id: 'n3', title: '需求评审记录 12/18', type: 'file', updatedAt: '3 天前', preview: '本次评审涉及 5 个需求，优先级排序如下...', tags: ['会议'] },
        ]
      },
      { id: 'n4', title: '团队周会纪要', type: 'file', starred: true, updatedAt: '5 小时前', preview: '讨论了下周的冲刺计划和资源分配问题...', tags: ['会议', '团队'] },
      { id: 'n5', title: '竞品分析报告', type: 'file', updatedAt: '2 天前', preview: '对比了 5 款竞品的功能、定价和用户体验...', tags: ['分析'] },
    ]
  },
  {
    id: 'f2', title: '学习笔记', type: 'folder', children: [
      { id: 'n6', title: 'React 性能优化技巧', type: 'file', starred: true, updatedAt: '1 天前', preview: '1. 使用 React.memo 避免不必要的重渲染\n2. useMemo 和 useCallback...', tags: ['React', '前端'] },
      { id: 'n7', title: 'TypeScript 高级类型', type: 'file', updatedAt: '4 天前', preview: '条件类型、映射类型、模板字面量类型...', tags: ['TypeScript'] },
      { id: 'n8', title: 'AI Prompt 工程实践', type: 'file', updatedAt: '1 周前', preview: 'Few-shot prompting、Chain-of-thought...', tags: ['AI', 'Prompt'] },
    ]
  },
  {
    id: 'f3', title: '个人', type: 'folder', children: [
      { id: 'n9', title: '2026 年度计划', type: 'file', starred: true, updatedAt: '3 天前', preview: '1. 完成 3 个开源项目\n2. 阅读 24 本书...', tags: ['计划'] },
      { id: 'n10', title: '读书笔记 - 思考快与慢', type: 'file', updatedAt: '5 天前', preview: '系统1和系统2的区别，锚定效应...', tags: ['读书'] },
    ]
  },
  { id: 'n11', title: '快速笔记', type: 'file', updatedAt: '30 分钟前', preview: '今天需要处理的事项：\n- 代码评审\n- 更新文档...', tags: ['临时'] },
  { id: 'n12', title: 'API 设计规范', type: 'file', updatedAt: '6 小时前', preview: 'RESTful API 命名规范和版本管理策略...', tags: ['规范', '后端'] },
];

const noteContent = `# 项目周报 - Week 12

## 本周完成

### 1. 用户认证模块
完成了基于 JWT 的用户认证系统开发，包括：
- 用户注册与登录接口
- Token 刷新机制
- 权限中间件

### 2. Bug 修复
修复了以下关键问题：
- **#1234** 用户头像上传后未即时刷新
- **#1256** 暗色模式下表单输入框文字不可见
- **#1278** 分页查询在特定条件下返回空结果

### 3. 性能优化
- 首屏加载时间从 3.2s 优化至 1.8s
- 列表页虚拟滚动实现，支持 10000+ 条数据流畅渲染

## 下周计划

1. 完成文件上传模块
2. 对接第三方支付 SDK
3. 编写单元测试（目标覆盖率 > 80%）

## 风险与阻塞

| 风险项 | 影响 | 应对措施 |
| --- | --- | --- |
| 支付 SDK 文档不完善 | 可能延期 | 已联系技术支持 |
| 测试环境不稳定 | 影响联调 | 运维已在排查 |

## 备注

> 下周需要与设计团队确认新版 UI 规范，建议安排一次 30 分钟的同步会议。

---
*更新时间：2026-02-25*`;

interface AIChatMsg { role: 'user' | 'assistant'; content: string; }

const mockAIChat: AIChatMsg[] = [
  { role: 'user', content: '帮我总结一下这篇周报的核心要点' },
  { role: 'assistant', content: '根据周报内容，以下是核心要点：\n\n**完成事项：**\n1. JWT 用户认证系统上线\n2. 修复 3 个关键 Bug\n3. 首屏加载优化至 1.8s\n\n**下周重点：**\n- 文件上传 & 支付 SDK 对接\n- 单元测试目标覆盖率 80%+\n\n**风险提示：**\n- 支付 SDK 文档问题\n- 测试环境稳定性' },
  { role: 'user', content: '有哪些需要跟进的 action items？' },
  { role: 'assistant', content: '根据周报，建议跟进以下 Action Items：\n\n1. **联系支付 SDK 技术支持** — 获取完整文档\n2. **协调运维排查测试环境** — 确保联调顺畅\n3. **安排与设计团队的同步会议** — 确认新版 UI 规范\n4. **准备单元测试框架** — 提前搭建以达成覆盖率目标' },
];



interface NoteQuickAction {
  id: string;
  label: string;
  icon: typeof Sparkles;
  category: 'write' | 'analyze' | 'organize' | 'format';
  mockResponse: string;
}

const noteQuickActions: NoteQuickAction[] = [
  { id: 'summarize', label: '总结要点', icon: Sparkles, category: 'analyze', mockResponse: '**核心要点总结：**\n\n1. **用户认证系统** — 基于 JWT 的完整认证方案已上线\n2. **Bug 修复** — 3 个关键问题已解决（头像、暗色模式、分页）\n3. **性能优化** — 首屏加载时间优化 44%（3.2s \u2192 1.8s）\n4. **虚拟滚动** — 支持万级数据流畅渲染\n\n**风险项：** 支付 SDK 文档不全、测试环境不稳定' },
  { id: 'outline', label: '生成大纲', icon: List, category: 'organize', mockResponse: '**文档大纲：**\n\n1. 本周完成\n   1.1 用户认证模块\n   1.2 Bug 修复（3 项）\n   1.3 性能优化\n2. 下周计划\n   2.1 文件上传模块\n   2.2 第三方支付 SDK\n   2.3 单元测试\n3. 风险与阻塞（2 项）\n4. 备注与后续' },
  { id: 'polish', label: '润色文字', icon: PenLine, category: 'write', mockResponse: '**润色建议：**\n\n1. "完成了基于 JWT 的用户认证系统开发" \u2192 "成功交付基于 JWT 的企业级用户认证系统"\n2. "修复了以下关键问题" \u2192 "定位并解决了以下高优先级缺陷"\n3. "首屏加载时间从 3.2s 优化至 1.8s" \u2192 "首屏加载性能提升 44%，由 3.2s 缩短至 1.8s"\n\n整体建议：增加量化指标，使周报更具说服力。' },
  { id: 'todo', label: '生成 TODO', icon: Check, category: 'organize', mockResponse: '**TODO 列表：**\n\n- [ ] 完成文件上传模块开发\n- [ ] 对接第三方支付 SDK\n- [ ] 联系支付 SDK 技术支持获取完整文档\n- [ ] 编写单元测试（目标覆盖率 > 80%）\n- [ ] 协调运维排查测试环境稳定性\n- [ ] 安排与设计团队的 UI 规范同步会议（30 分钟）\n- [ ] 跟进虚拟滚动在生产环境的表现\n\n**优先级排序：** 支付 SDK \u2192 文件上传 \u2192 单元测试' },
  { id: 'tags', label: '自动打标签', icon: Hash, category: 'analyze', mockResponse: '**建议标签：**\n\n**技术标签：**\n- `#JWT` `#认证` `#性能优化` `#虚拟滚动`\n\n**项目标签：**\n- `#周报` `#Week12` `#Q4`\n\n**状态标签：**\n- `#进行中` `#有风险`\n\n**分类标签：**\n- `#前端` `#后端` `#测试`\n\n已自动为当前笔记添加标签：`周报` `项目` `前端`' },
  { id: 'translate', label: '翻译全文', icon: Languages, category: 'write', mockResponse: '**英文翻译：**\n\n# Weekly Report - Week 12\n\n## Completed This Week\n\n### 1. User Authentication Module\nCompleted JWT-based authentication system, including:\n- User registration & login APIs\n- Token refresh mechanism\n- Permission middleware\n\n### 2. Bug Fixes\n- **#1234** Avatar not refreshing after upload\n- **#1256** Form input text invisible in dark mode\n- **#1278** Pagination returning empty results\n\n### 3. Performance Optimization\n- First screen load: 3.2s \u2192 1.8s (44% improvement)' },
  { id: 'expand', label: '扩展内容', icon: Maximize2, category: 'write', mockResponse: '**内容扩展建议：**\n\n1. **用户认证模块 — 补充细节：**\n   - Token 过期策略：Access Token 15min，Refresh Token 7d\n   - 支持 OAuth 2.0 第三方登录（Google、GitHub）\n   - RBAC 权限模型：管理员、编辑者、查看者三级\n\n2. **性能优化 — 补充数据：**\n   - LCP: 2.8s \u2192 1.2s\n   - FCP: 1.5s \u2192 0.6s\n   - Bundle Size: 减少 35%（Tree Shaking + 代码分割）\n\n3. **建议新增章节：**\n   - 技术债务清理进展\n   - 代码评审总结' },
  { id: 'mindmap', label: '思维导图', icon: Brain, category: 'organize', mockResponse: '**思维导图结构：**\n\n```\n项目周报 Week 12\n\u251c\u2500\u2500 本周完成\n\u2502   \u251c\u2500\u2500 认证系统 \u2705\n\u2502   \u2502   \u251c\u2500\u2500 注册/登录\n\u2502   \u2502   \u251c\u2500\u2500 Token 刷新\n\u2502   \u2502   \u2514\u2500\u2500 权限中间件\n\u2502   \u251c\u2500\u2500 Bug 修复 \u2705\n\u2502   \u2502   \u251c\u2500\u2500 #1234 头像刷新\n\u2502   \u2502   \u251c\u2500\u2500 #1256 暗色模式\n\u2502   \u2502   \u2514\u2500\u2500 #1278 分页查询\n\u2502   \u2514\u2500\u2500 性能优化 \u2705\n\u2502       \u251c\u2500\u2500 首屏 1.8s\n\u2502       \u2514\u2500\u2500 虚拟滚动\n\u251c\u2500\u2500 下周计划\n\u2502   \u251c\u2500\u2500 文件上传\n\u2502   \u251c\u2500\u2500 支付 SDK\n\u2502   \u2514\u2500\u2500 单元测试 (>80%)\n\u2514\u2500\u2500 风险\n    \u251c\u2500\u2500 SDK 文档\n    \u2514\u2500\u2500 测试环境\n```' },
  { id: 'qa', label: '生成问答', icon: MessageCircle, category: 'analyze', mockResponse: '**基于笔记生成的 Q&A：**\n\n**Q1: 本周最大的技术成就是什么？**\nA: JWT 用户认证系统的完整交付，包括注册登录、Token 刷新和权限中间件。\n\n**Q2: 性能优化的具体指标是？**\nA: 首屏加载从 3.2s 优化到 1.8s，列表页通过虚拟滚动支持 10000+ 条数据。\n\n**Q3: 当前面临的主要风险有哪些？**\nA: 两个——支付 SDK 文档不完善可能导致对接延期，测试环境不稳定影响联调。\n\n**Q4: 下周的优先级如何排列？**\nA: 文件上传 > 支付 SDK > 单元测试。' },
  { id: 'proofread', label: '校对纠错', icon: Eye, category: 'format', mockResponse: '**校对结果：**\n\n共发现 3 处可改进项：\n\n1. **第 15 行** "支持 10000+ 条数据" \u2192 建议使用 "支持万级数据" 更简洁\n2. **第 23 行** "目标覆盖率 > 80%" \u2192 建议具体化 "目标行覆盖率 \u2265 80%，分支覆盖率 \u2265 60%"\n3. **表格格式** 建议统一"应对措施"列的措辞风格\n\n**整体评估：** 文档结构清晰，格式规范，信息完整度 \u2605\u2605\u2605\u2605\u2606' },
];

const actionCategories = [
  { id: 'analyze' as const, label: '分析', icon: Search },
  { id: 'organize' as const, label: '整理', icon: List },
  { id: 'write' as const, label: '写作', icon: PenLine },
  { id: 'format' as const, label: '格式', icon: Eye },
];

// ===========================
// Helper Components
// ===========================
function NoteTreeItem({ item, depth = 0, selectedId, onSelect, expandedFolders, onToggleFolder, filterStarred, onContextMenu, renamingId, renameValue, onRenameChange, onRenameSubmit, onRenameCancel }: {
  item: NoteItem; depth?: number; selectedId: string; onSelect: (id: string) => void;
  expandedFolders: Set<string>; onToggleFolder: (id: string) => void; filterStarred: boolean;
  onContextMenu?: (e: React.MouseEvent, item: NoteItem) => void;
  renamingId?: string; renameValue?: string; onRenameChange?: (v: string) => void; onRenameSubmit?: () => void; onRenameCancel?: () => void;
}) {
  const isRenaming = renamingId === item.id;
  const handleCtx = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e, item); };

  if (item.type === 'folder') {
    const isExpanded = expandedFolders.has(item.id);
    const children = item.children || [];
    const filteredChildren = filterStarred ? children.filter(c => c.type === 'folder' || c.starred) : children;
    if (filterStarred && filteredChildren.length === 0) return null;
    return (
      <div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onToggleFolder(item.id)}
          onContextMenu={handleCtx}
          className="w-full flex items-center gap-1.5 py-[5px] px-2 h-auto rounded-md text-sm hover:bg-accent/60 group/folder justify-start"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <ChevronRight size={12} className={`text-muted-foreground/50 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
          {isExpanded ? <FolderOpen size={14} className="text-amber-500 flex-shrink-0" /> : <Folder size={14} className="text-amber-500/70 flex-shrink-0" />}
          {isRenaming ? (
            <Input
              autoFocus
              value={renameValue}
              onChange={e => onRenameChange?.(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onRenameSubmit?.(); if (e.key === 'Escape') onRenameCancel?.(); }}
              onBlur={() => onRenameSubmit?.()}
              onClick={e => e.stopPropagation()}
              className="flex-1 min-w-0 bg-accent border border-primary/40 rounded px-1 py-0 text-sm text-foreground h-auto"
            />
          ) : (
            <span className="truncate text-foreground/80 flex-1 text-left">{item.title}</span>
          )}
          <span className="text-xs text-muted-foreground/40 opacity-0 group-hover/folder:opacity-100">{children.length}</span>
        </Button>
        {isExpanded && filteredChildren.map(child => (
          <NoteTreeItem key={child.id} item={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} expandedFolders={expandedFolders} onToggleFolder={onToggleFolder} filterStarred={filterStarred} onContextMenu={onContextMenu} renamingId={renamingId} renameValue={renameValue} onRenameChange={onRenameChange} onRenameSubmit={onRenameSubmit} onRenameCancel={onRenameCancel} />
        ))}
      </div>
    );
  }

  if (filterStarred && !item.starred) return null;

  const isSelected = selectedId === item.id;
  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() => onSelect(item.id)}
      onContextMenu={handleCtx}
      className={`w-full flex items-center gap-1.5 py-[5px] px-2 h-auto rounded-md text-sm group/file justify-start
        ${isSelected ? 'bg-accent text-foreground' : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground'}`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <FileText size={13} className={`flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}`} />
      {isRenaming ? (
        <Input
          autoFocus
          value={renameValue}
          onChange={e => onRenameChange?.(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onRenameSubmit?.(); if (e.key === 'Escape') onRenameCancel?.(); }}
          onBlur={() => onRenameSubmit?.()}
          onClick={e => e.stopPropagation()}
          className="flex-1 min-w-0 bg-accent border border-primary/40 rounded px-1 py-0 text-sm text-foreground h-auto"
        />
      ) : (
        <span className="truncate flex-1 text-left">{item.title}</span>
      )}
      {item.starred && <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
    </Button>
  );
}

// Inline markdown rendering (bold, italic, code, strikethrough, links)
function renderInline(text: string): React.ReactNode {
  const inlinePattern = new RegExp('(`.+?`|\\*\\*.+?\\*\\*|\\*[^*]+?\\*|~~.+?~~|\\[.+?\\]\\(.+?\\))', 'g');
  const parts = text.split(inlinePattern);
  const linkPattern = new RegExp('^\\[(.+?)\\]\\((.+?)\\)$');
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="px-1 py-0.5 rounded bg-accent/60 text-xs font-mono text-primary/80">{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="italic text-foreground/70">{part.slice(1, -1)}</em>;
    if (part.startsWith('~~') && part.endsWith('~~')) return <span key={i} className="line-through text-muted-foreground/50">{part.slice(2, -2)}</span>;
    const linkMatch = part.match(linkPattern);
    if (linkMatch) return <a key={i} className="text-primary hover:underline cursor-pointer">{linkMatch[1]}</a>;
    return <span key={i}>{part}</span>;
  });
}

// --- Note Preview Renderer (read-only) ---
function NotePreviewRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';
  const elements: React.ReactNode[] = [];
  const numPattern = new RegExp('^\\d+\\. ');
  const numMatchPattern = new RegExp('^(\\d+)\\. (.+)');
  const boldItemPattern = new RegExp('- \\*\\*(.+?)\\*\\* (.+)');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="bg-accent/40 rounded-lg border border-border/20 my-3 overflow-hidden">
            {codeLang && <div className="px-3 py-1 border-b border-border/20 text-xs text-muted-foreground/50 bg-accent/30">{codeLang}</div>}
            <pre className="px-4 py-3 text-xs font-mono text-foreground/80 overflow-x-auto [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30">{codeLines.join('\n')}</pre>
          </div>
        );
        inCodeBlock = false;
        codeLines = [];
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    if (line.startsWith('# ')) { elements.push(<h1 key={i} className="text-xl text-foreground mb-4 pb-2 border-b border-border/30">{line.slice(2)}</h1>); continue; }
    if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-base text-foreground mt-6 mb-3">{line.slice(3)}</h2>); continue; }
    if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-sm text-foreground mt-4 mb-2">{line.slice(4)}</h3>); continue; }
    if (line.startsWith('> ')) { elements.push(<blockquote key={i} className="border-l-2 border-primary/40 pl-4 py-1 text-xs text-muted-foreground italic my-3">{line.slice(2)}</blockquote>); continue; }
    if (line.startsWith('---')) { elements.push(<hr key={i} className="my-4 border-border/30" />); continue; }
    if (line.startsWith('- [x] ')) { elements.push(<div key={i} className="flex items-start gap-2 py-0.5 ml-4 text-xs text-foreground/80"><span className="w-3.5 h-3.5 rounded border border-primary bg-primary flex items-center justify-center flex-shrink-0 mt-[1px]"><Check size={8} className="text-white" /></span><span className="line-through text-muted-foreground/60">{line.slice(6)}</span></div>); continue; }
    if (line.startsWith('- [ ] ')) { elements.push(<div key={i} className="flex items-start gap-2 py-0.5 ml-4 text-xs text-foreground/80"><span className="w-3.5 h-3.5 rounded border border-muted-foreground/30 flex-shrink-0 mt-[1px]" /><span>{line.slice(6)}</span></div>); continue; }
    if (line.startsWith('- **')) {
      const match = line.match(boldItemPattern);
      if (match) { elements.push(<div key={i} className="flex items-start gap-2 py-0.5 ml-4 text-xs text-foreground/80"><span className="text-primary">{String.fromCharCode(8226)}</span><span><strong className="text-foreground">{match[1]}</strong> {match[2]}</span></div>); continue; }
    }
    if (line.startsWith('- ')) { elements.push(<div key={i} className="flex items-start gap-2 py-0.5 ml-4 text-xs text-foreground/80"><span className="text-primary">{String.fromCharCode(8226)}</span><span>{renderInline(line.slice(2))}</span></div>); continue; }
    if (line.startsWith('| ---')) { elements.push(<div key={i} className="h-px bg-border/20 my-0.5" />); continue; }
    if (line.startsWith('| ')) {
      const pipePattern = new RegExp('^\\|?\\s*');
      const pipeEndPattern = new RegExp('\\s*\\|?$');
      const cells = line.split(' | ').map(c => c.replace(pipePattern, '').replace(pipeEndPattern, ''));
      const isHeader = lines[i + 1]?.startsWith('| ---');
      elements.push(
        <div key={i} className={`grid grid-cols-3 gap-2 text-xs py-1.5 px-2 ${isHeader ? 'bg-accent/40 rounded-t-md' : 'border-b border-border/10'}`}>
          {cells.map((c, ci) => <span key={ci} className={isHeader ? 'text-foreground' : 'text-foreground/70'}>{c}</span>)}
        </div>
      );
      continue;
    }
    if (line.match(numPattern)) {
      const match = line.match(numMatchPattern);
      if (match) { elements.push(<div key={i} className="flex items-start gap-2 py-0.5 ml-4 text-xs text-foreground/80"><span className="text-primary/70 w-4 text-right flex-shrink-0">{match[1]}.</span><span>{renderInline(match[2])}</span></div>); continue; }
    }
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) { elements.push(<p key={i} className="text-xs text-muted-foreground/50 italic">{line.replace(new RegExp('\\*', 'g'), '')}</p>); continue; }
    if (line.trim() === '') { elements.push(<div key={i} className="h-3" />); continue; }
    elements.push(<p key={i} className="text-xs text-foreground/80 leading-relaxed">{renderInline(line)}</p>);
  }
  return <div>{elements}</div>;
}

// --- Note Editable Renderer (WYSIWYG-like) ---
function NoteEditableRenderer({ content, onChange }: { content: string; onChange: (newContent: string) => void }) {
  const lines = content.split('\n');
  const taskPattern = new RegExp('^- \\[.\\] ');
  const numPattern = new RegExp('^\\d+\\. ');
  const numMatchPattern = new RegExp('^(\\d+)\\. (.+)');
  const numExtractPattern = new RegExp('^(\\d+)\\.');

  const updateLine = (lineIndex: number, newText: string) => {
    const newLines = [...lines];
    newLines[lineIndex] = newText;
    onChange(newLines.join('\n'));
  };

  const handleKeyDown = (e: React.KeyboardEvent, lineIndex: number, prefix: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newLines = [...lines];
      const line = newLines[lineIndex];
      let newLineContent = '';
      if (line.match(taskPattern)) newLineContent = '- [ ] ';
      else if (line.startsWith('- ')) newLineContent = '- ';
      else if (line.match(numPattern)) {
        const num = parseInt(line.match(numExtractPattern)?.[1] || '0');
        newLineContent = `${num + 1}. `;
      } else if (line.startsWith('> ')) newLineContent = '> ';

      newLines.splice(lineIndex + 1, 0, newLineContent);
      onChange(newLines.join('\n'));
    }
    if (e.key === 'Backspace' && (e.target as HTMLElement).textContent === '' && lines.length > 1) {
      e.preventDefault();
      const newLines = [...lines];
      newLines.splice(lineIndex, 1);
      onChange(newLines.join('\n'));
    }
  };

  const insertNewLineAfter = (lineIndex: number) => {
    const newLines = [...lines];
    newLines.splice(lineIndex + 1, 0, '');
    onChange(newLines.join('\n'));
  };

  let inCodeBlock = false;
  let codeStartIdx = -1;
  const elements: React.ReactNode[] = [];
  const pipePattern = new RegExp('^\\|?\\s*');
  const pipeEndPattern = new RegExp('\\s*\\|?$');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const codeContent = lines.slice(codeStartIdx + 1, i).join('\n');
        const lang = lines[codeStartIdx].slice(3).trim();
        const startIdx = codeStartIdx;
        const endIdx = i;
        elements.push(
          <div key={`code-${i}`} className="bg-accent/40 rounded-lg border border-border/20 my-3 overflow-hidden group/code">
            {lang && <div className="px-3 py-1 border-b border-border/20 text-xs text-muted-foreground/50 bg-accent/30">{lang}</div>}
            <textarea
              value={codeContent}
              onChange={e => {
                const newLines = [...lines];
                const codeLines = e.target.value.split('\n');
                newLines.splice(startIdx + 1, endIdx - startIdx - 1, ...codeLines);
                onChange(newLines.join('\n'));
              }}
              spellCheck={false}
              className="w-full px-4 py-3 text-xs font-mono text-foreground/80 bg-transparent border-none outline-none resize-none min-h-[40px]"
              rows={Math.max(2, codeContent.split('\n').length)}
            />
          </div>
        );
        inCodeBlock = false;
        continue;
      } else {
        inCodeBlock = true;
        codeStartIdx = i;
        continue;
      }
    }
    if (inCodeBlock) continue;

    // Table handling
    if (line.startsWith('| ')) {
      const cells = line.split(' | ').map(c => c.replace(pipePattern, '').replace(pipeEndPattern, ''));
      const isHeader = lines[i + 1]?.startsWith('| ---');
      const lineIdx = i;
      elements.push(
        <div key={i} className={`grid grid-cols-3 gap-1 text-xs py-1 px-1 ${isHeader ? 'bg-accent/40 rounded-t-md' : 'border-b border-border/10'}`}>
          {cells.map((c, ci) => (
            <input
              key={ci}
              value={c}
              onChange={e => {
                const newCells = [...cells];
                newCells[ci] = e.target.value;
                updateLine(lineIdx, '| ' + newCells.join(' | ') + ' |');
              }}
              className={`bg-transparent border-none outline-none px-1 py-0.5 rounded text-xs focus:bg-accent/60 transition-colors ${isHeader ? 'text-foreground' : 'text-foreground/70'}`}
            />
          ))}
        </div>
      );
      continue;
    }
    if (line.startsWith('| ---')) {
      elements.push(<div key={i} className="h-px bg-border/20 my-0.5" />);
      continue;
    }

    // Separator
    if (line.startsWith('---')) {
      elements.push(
        <div key={i} className="relative my-4 group/hr">
          <hr className="border-border/30" />
          <Button variant="ghost" size="icon-xs" onClick={() => insertNewLineAfter(i)} className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-accent border border-border/30 text-muted-foreground/30 opacity-0 group-hover/hr:opacity-100 hover:text-foreground"><Plus size={10} /></Button>
        </div>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      const lineIdx = i;
      elements.push(
        <div
          key={i}
          contentEditable
          suppressContentEditableWarning
          onFocus={e => { if (!e.currentTarget.textContent) e.currentTarget.classList.add('min-h-[20px]'); }}
          onBlur={e => {
            const txt = e.currentTarget.textContent || '';
            if (txt.trim()) updateLine(lineIdx, txt);
            e.currentTarget.classList.remove('min-h-[20px]');
          }}
          onKeyDown={e => handleKeyDown(e, lineIdx, '')}
          className="h-3 outline-none text-xs text-foreground/80 leading-relaxed cursor-text hover:bg-accent/20 rounded transition-colors"
        />
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      const lineIdx = i;
      elements.push(
        <h1 key={i} contentEditable suppressContentEditableWarning
          onBlur={e => updateLine(lineIdx, '# ' + (e.currentTarget.textContent || ''))}
          onKeyDown={e => handleKeyDown(e, lineIdx, '# ')}
          className="text-xl text-foreground mb-4 pb-2 border-b border-border/30 outline-none focus:bg-accent/10 rounded px-1 -mx-1 transition-colors"
        >{line.slice(2)}</h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      const lineIdx = i;
      elements.push(
        <h2 key={i} contentEditable suppressContentEditableWarning
          onBlur={e => updateLine(lineIdx, '## ' + (e.currentTarget.textContent || ''))}
          onKeyDown={e => handleKeyDown(e, lineIdx, '## ')}
          className="text-base text-foreground mt-6 mb-3 outline-none focus:bg-accent/10 rounded px-1 -mx-1 transition-colors"
        >{line.slice(3)}</h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      const lineIdx = i;
      elements.push(
        <h3 key={i} contentEditable suppressContentEditableWarning
          onBlur={e => updateLine(lineIdx, '### ' + (e.currentTarget.textContent || ''))}
          onKeyDown={e => handleKeyDown(e, lineIdx, '### ')}
          className="text-sm text-foreground mt-4 mb-2 outline-none focus:bg-accent/10 rounded px-1 -mx-1 transition-colors"
        >{line.slice(4)}</h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const lineIdx = i;
      elements.push(
        <blockquote key={i} className="border-l-2 border-primary/40 pl-4 py-1 my-3">
          <div contentEditable suppressContentEditableWarning
            onBlur={e => updateLine(lineIdx, '> ' + (e.currentTarget.textContent || ''))}
            onKeyDown={e => handleKeyDown(e, lineIdx, '> ')}
            className="text-xs text-muted-foreground italic outline-none focus:bg-accent/10 rounded px-1 -mx-1 transition-colors"
          >{line.slice(2)}</div>
        </blockquote>
      );
      continue;
    }

    // Task list
    if (line.match(taskPattern)) {
      const checked = line.startsWith('- [x] ');
      const text = line.slice(6);
      const lineIdx = i;
      elements.push(
        <div key={i} className="flex items-start gap-2 py-0.5 ml-4 text-xs text-foreground/80 group/task">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => updateLine(lineIdx, checked ? `- [ ] ${text}` : `- [x] ${text}`)}
            className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 mt-[1px] p-0 ${checked ? 'border-primary bg-primary' : 'border-muted-foreground/30 hover:border-primary'}`}
          >{checked && <Check size={8} className="text-white" />}</Button>
          <div contentEditable suppressContentEditableWarning
            onBlur={e => updateLine(lineIdx, `- [${checked ? 'x' : ' '}] ` + (e.currentTarget.textContent || ''))}
            onKeyDown={e => handleKeyDown(e, lineIdx, `- [${checked ? 'x' : ' '}] `)}
            className={`flex-1 outline-none focus:bg-accent/10 rounded px-1 -mx-1 transition-colors ${checked ? 'line-through text-muted-foreground/60' : ''}`}
          >{text}</div>
        </div>
      );
      continue;
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const lineIdx = i;
      elements.push(
        <div key={i} className="flex items-start gap-2 py-0.5 ml-4 text-xs text-foreground/80">
          <span className="text-primary mt-[1px]">{String.fromCharCode(8226)}</span>
          <div contentEditable suppressContentEditableWarning
            onBlur={e => updateLine(lineIdx, '- ' + (e.currentTarget.textContent || ''))}
            onKeyDown={e => handleKeyDown(e, lineIdx, '- ')}
            className="flex-1 outline-none focus:bg-accent/10 rounded px-1 -mx-1 transition-colors"
          >{renderInline(line.slice(2))}</div>
        </div>
      );
      continue;
    }

    // Ordered list
    if (line.match(numPattern)) {
      const match = line.match(numMatchPattern);
      if (match) {
        const lineIdx = i;
        const num = match[1];
        elements.push(
          <div key={i} className="flex items-start gap-2 py-0.5 ml-4 text-xs text-foreground/80">
            <span className="text-primary/70 w-4 text-right flex-shrink-0">{num}.</span>
            <div contentEditable suppressContentEditableWarning
              onBlur={e => updateLine(lineIdx, `${num}. ` + (e.currentTarget.textContent || ''))}
              onKeyDown={e => handleKeyDown(e, lineIdx, `${num}. `)}
              className="flex-1 outline-none focus:bg-accent/10 rounded px-1 -mx-1 transition-colors"
            >{renderInline(match[2])}</div>
          </div>
        );
        continue;
      }
    }

    // Italic-only line
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      const lineIdx = i;
      elements.push(
        <div key={i} contentEditable suppressContentEditableWarning
          onBlur={e => updateLine(lineIdx, '*' + (e.currentTarget.textContent || '') + '*')}
          onKeyDown={e => handleKeyDown(e, lineIdx, '*')}
          className="text-xs text-muted-foreground/50 italic outline-none focus:bg-accent/10 rounded px-1 -mx-1 transition-colors"
        >{line.replace(new RegExp('\\*', 'g'), '')}</div>
      );
      continue;
    }

    // Regular paragraph
    const lineIdx = i;
    elements.push(
      <div key={i} contentEditable suppressContentEditableWarning
        onBlur={e => updateLine(lineIdx, e.currentTarget.textContent || '')}
        onKeyDown={e => handleKeyDown(e, lineIdx, '')}
        className="text-xs text-foreground/80 leading-relaxed outline-none focus:bg-accent/10 rounded px-1 -mx-1 py-0.5 transition-colors"
      >{renderInline(line)}</div>
    );
  }

  return <div className="space-y-0">{elements}</div>;
}

function flattenNotes(items: NoteItem[]): NoteItem[] {
  const result: NoteItem[] = [];
  for (const item of items) {
    if (item.type === 'file') result.push(item);
    if (item.children) result.push(...flattenNotes(item.children));
  }
  return result;
}

function renderBoldText(text: string) {
  const boldPattern = new RegExp('(\\*\\*.+?\\*\\*)', 'g');
  const parts = text.split(boldPattern);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ===========================
// Main NotePage Component
// ===========================
export function NotePage() {
  const [notes, setNotes] = useState<NoteItem[]>(mockNotes);
  const [selectedNoteId, setSelectedNoteId] = useState('n1');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['f1', 'f1-1', 'f2', 'f3']));
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStarred, setFilterStarred] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [aiMessages, setAiMessages] = useState<AIChatMsg[]>(mockAIChat);
  const [aiInput, setAiInput] = useState('');
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(320);
  const [selectedAssistantId, setSelectedAssistantId] = useState(MOCK_ASSISTANTS[0].id);
  const [showAssistantPicker, setShowAssistantPicker] = useState(false);
  const [astSearch, setAstSearch] = useState('');
  const [astTag, setAstTag] = useState<string | null>(null);
  const [activeActionCategory, setActiveActionCategory] = useState<string>('analyze');
  const [showAllActions, setShowAllActions] = useState(false);
  const assistantPickerRef = useRef<HTMLDivElement>(null);
  const astSearchRef = useRef<HTMLInputElement>(null);
  const selectedAssistant = useMemo(() => MOCK_ASSISTANTS.find(a => a.id === selectedAssistantId) || MOCK_ASSISTANTS[0], [selectedAssistantId]);
  const selectedAssistantEmoji = ASSISTANT_EMOJI_MAP[selectedAssistant.name] || '\u{1F916}';
  const allAstTags = useMemo(() => Array.from(new Set(MOCK_ASSISTANTS.flatMap(a => a.tags))), []);
  const filteredNoteAssistants = useMemo(() => {
    let list = MOCK_ASSISTANTS;
    if (astSearch) list = list.filter(a => a.name.toLowerCase().includes(astSearch.toLowerCase()));
    if (astTag) list = list.filter(a => a.tags.includes(astTag));
    return list;
  }, [astSearch, astTag]);
  const aiEndRef = useRef<HTMLDivElement>(null);
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  // Editor mode & content
  const [editorMode, setEditorMode] = useState<'edit' | 'markdown' | 'preview'>('edit');
  const [noteContents, setNoteContents] = useState<Record<string, string>>({ n1: noteContent });
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Context menu
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; item: NoteItem } | null>(null);
  const ctxRef = useRef<HTMLDivElement>(null);
  // Rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  // Move dialog
  const [moveDialog, setMoveDialog] = useState<{ item: NoteItem } | null>(null);
  const [moveExpandedFolders, setMoveExpandedFolders] = useState<Set<string>>(new Set(['f1', 'f1-1', 'f2', 'f3']));
  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<NoteItem | null>(null);

  // Close context menu / assistant picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) setCtxMenu(null);
      if (assistantPickerRef.current && !assistantPickerRef.current.contains(e.target as Node)) setShowAssistantPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allNotes = flattenNotes(notes);
  const selectedNote = allNotes.find(n => n.id === selectedNoteId);

  // --- Tree mutation helpers ---
  const updateItemInTree = (items: NoteItem[], id: string, updater: (item: NoteItem) => NoteItem): NoteItem[] => {
    return items.map(item => {
      if (item.id === id) return updater(item);
      if (item.children) return { ...item, children: updateItemInTree(item.children, id, updater) };
      return item;
    });
  };

  const removeItemFromTree = (items: NoteItem[], id: string): NoteItem[] => {
    return items.filter(item => item.id !== id).map(item => {
      if (item.children) return { ...item, children: removeItemFromTree(item.children, id) };
      return item;
    });
  };

  const findItemInTree = (items: NoteItem[], id: string): NoteItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) { const found = findItemInTree(item.children, id); if (found) return found; }
    }
    return null;
  };

  const addItemToFolder = (items: NoteItem[], folderId: string, newItem: NoteItem): NoteItem[] => {
    return items.map(item => {
      if (item.id === folderId && item.type === 'folder') return { ...item, children: [...(item.children || []), newItem] };
      if (item.children) return { ...item, children: addItemToFolder(item.children, folderId, newItem) };
      return item;
    });
  };

  const collectFolders = (items: NoteItem[]): NoteItem[] => {
    const result: NoteItem[] = [];
    for (const item of items) {
      if (item.type === 'folder') { result.push(item); if (item.children) result.push(...collectFolders(item.children)); }
    }
    return result;
  };

  // --- Actions ---
  const handleContextMenu = (e: React.MouseEvent, item: NoteItem) => { setCtxMenu({ x: e.clientX, y: e.clientY, item }); };
  const startRename = (item: NoteItem) => { setRenamingId(item.id); setRenameValue(item.title); setCtxMenu(null); };
  const submitRename = () => { if (renamingId && renameValue.trim()) { setNotes(prev => updateItemInTree(prev, renamingId, item => ({ ...item, title: renameValue.trim() }))); } setRenamingId(null); setRenameValue(''); };
  const cancelRename = () => { setRenamingId(null); setRenameValue(''); };
  const toggleStar = (id: string) => { setNotes(prev => updateItemInTree(prev, id, item => ({ ...item, starred: !item.starred }))); setCtxMenu(null); };
  const confirmDelete = (item: NoteItem) => { setDeleteConfirm(item); setCtxMenu(null); };
  const executeDelete = () => { if (deleteConfirm) { setNotes(prev => removeItemFromTree(prev, deleteConfirm.id)); if (selectedNoteId === deleteConfirm.id) setSelectedNoteId(''); } setDeleteConfirm(null); };
  const openMoveDialog = (item: NoteItem) => { setMoveDialog({ item }); setCtxMenu(null); };
  const executeMove = (targetFolderId: string | 'root') => {
    if (!moveDialog) return;
    const item = findItemInTree(notes, moveDialog.item.id);
    if (!item) return;
    let newTree = removeItemFromTree(notes, moveDialog.item.id);
    if (targetFolderId === 'root') { newTree = [...newTree, item]; } else { newTree = addItemToFolder(newTree, targetFolderId, item); setExpandedFolders(prev => new Set([...prev, targetFolderId])); }
    setNotes(newTree);
    setMoveDialog(null);
  };

  const duplicateItem = (item: NoteItem) => {
    const newItem: NoteItem = { ...item, id: `dup-${Date.now()}`, title: `${item.title} (副本)` };
    if (item.children) newItem.children = item.children.map((c, i) => ({ ...c, id: `dup-c-${Date.now()}-${i}` }));
    const insertAfter = (items: NoteItem[]): NoteItem[] => {
      const result: NoteItem[] = [];
      for (const n of items) {
        result.push(n);
        if (n.id === item.id) result.push(newItem);
        if (n.id !== item.id && n.children) { result[result.length - 1] = { ...n, children: insertAfter(n.children) }; }
      }
      return result;
    };
    setNotes(prev => insertAfter(prev));
    setCtxMenu(null);
  };

  const addNewNoteInFolder = (folderId: string) => {
    const newNote: NoteItem = { id: `n-new-${Date.now()}`, title: '新建笔记', type: 'file', updatedAt: '刚刚', preview: '' };
    setNotes(prev => addItemToFolder(prev, folderId, newNote));
    setExpandedFolders(prev => new Set([...prev, folderId]));
    setSelectedNoteId(newNote.id); setRenamingId(newNote.id); setRenameValue(newNote.title); setCtxMenu(null);
  };

  const addNewSubfolder = (folderId: string) => {
    const newFolder: NoteItem = { id: `f-new-${Date.now()}`, title: '新建文件夹', type: 'folder', children: [] };
    setNotes(prev => addItemToFolder(prev, folderId, newFolder));
    setExpandedFolders(prev => new Set([...prev, folderId]));
    setRenamingId(newFolder.id); setRenameValue(newFolder.title); setCtxMenu(null);
  };

  const addNewNoteAtRoot = () => {
    const newNote: NoteItem = { id: `n-new-${Date.now()}`, title: '新建笔记', type: 'file', updatedAt: '刚刚', preview: '' };
    setNotes(prev => [...prev, newNote]); setSelectedNoteId(newNote.id); setRenamingId(newNote.id); setRenameValue(newNote.title);
  };

  const addNewFolderAtRoot = () => {
    const newFolder: NoteItem = { id: `f-new-${Date.now()}`, title: '新建文件夹', type: 'folder', children: [] };
    setNotes(prev => [...prev, newFolder]); setRenamingId(newFolder.id); setRenameValue(newFolder.title);
  };

  // --- Editor helpers ---
  const getCurrentContent = () => noteContents[selectedNoteId] || '';

  const updateContent = (newContent: string) => {
    const oldContent = getCurrentContent();
    if (oldContent !== newContent) { setUndoStack(prev => [...prev.slice(-50), oldContent]); setRedoStack([]); }
    setNoteContents(prev => ({ ...prev, [selectedNoteId]: newContent }));
    setSavedIndicator(true); setTimeout(() => setSavedIndicator(false), 1500);
  };

  const handleUndo = () => { if (undoStack.length === 0) return; const prev = undoStack[undoStack.length - 1]; setRedoStack(r => [...r, getCurrentContent()]); setUndoStack(s => s.slice(0, -1)); setNoteContents(p => ({ ...p, [selectedNoteId]: prev })); };
  const handleRedo = () => { if (redoStack.length === 0) return; const next = redoStack[redoStack.length - 1]; setUndoStack(s => [...s, getCurrentContent()]); setRedoStack(r => r.slice(0, -1)); setNoteContents(p => ({ ...p, [selectedNoteId]: next })); };

  const insertMarkdown = (prefix: string, suffix: string = '', placeholder: string = '') => {
    if (editorMode !== 'markdown' || !editorRef.current) return;
    const ta = editorRef.current;
    const start = ta.selectionStart; const end = ta.selectionEnd;
    const content = getCurrentContent();
    const selected = content.slice(start, end);
    const insert = selected || placeholder;
    const newContent = content.slice(0, start) + prefix + insert + suffix + content.slice(end);
    updateContent(newContent);
    setTimeout(() => {
      ta.focus();
      const cursorPos = start + prefix.length + insert.length + suffix.length;
      if (!selected && placeholder) { ta.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length); }
      else { ta.setSelectionRange(cursorPos, cursorPos); }
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    if (editorMode !== 'markdown' || !editorRef.current) return;
    const ta = editorRef.current;
    const start = ta.selectionStart;
    const content = getCurrentContent();
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', start);
    const line = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const newLine = line.startsWith(prefix) ? line.slice(prefix.length) : prefix + line;
    const newContent = content.slice(0, lineStart) + newLine + content.slice(lineEnd === -1 ? content.length : lineEnd);
    updateContent(newContent);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length); }, 0);
  };

  const getOrCreateContent = (noteId: string): string => {
    if (noteContents[noteId]) return noteContents[noteId];
    const note = allNotes.find(n => n.id === noteId);
    if (!note) return '';
    const defaultContent = `# ${note.title}\n\n${note.preview || '开始编写你的笔记...'}\n`;
    setNoteContents(prev => ({ ...prev, [noteId]: defaultContent }));
    return defaultContent;
  };

  useEffect(() => { if (selectedNoteId) getOrCreateContent(selectedNoteId); }, [selectedNoteId]);

  const toggleFolder = (id: string) => { setExpandedFolders(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };

  const handleAISend = () => {
    if (!aiInput.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', content: aiInput }]);
    const q = aiInput; setAiInput('');
    setTimeout(() => {
      const matchedAction = noteQuickActions.find(a => a.label === q);
      const response = matchedAction ? matchedAction.mockResponse : `[${selectedAssistant.name}] \u5173\u4e8e\u300c${q}\u300d\uff0c\u6211\u7684\u5206\u6790\u5982\u4e0b\uff1a\n\n\u57fa\u4e8e\u5f53\u524d\u7b14\u8bb0\u5185\u5bb9\u548c ${selectedAssistant.systemPrompt.slice(0, 20)} \u7684\u4e13\u4e1a\u89c6\u89d2\uff1a\n\n1. **\u7ed3\u6784\u5316\u6574\u7406** \u2014 \u5c06\u76f8\u5173\u8981\u70b9\u5206\u7c7b\u5f52\u7eb3\n2. **\u5173\u8054\u5206\u6790** \u2014 \u627e\u51fa\u4e0e\u5176\u4ed6\u7b14\u8bb0\u7684\u5173\u8054\n3. **\u884c\u52a8\u5efa\u8bae** \u2014 \u8f6c\u5316\u4e3a\u53ef\u6267\u884c\u7684\u4efb\u52a1`;
      setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setTimeout(() => aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 600);
  };

  const handleQuickAction = (action: NoteQuickAction) => {
    setAiMessages(prev => [...prev, { role: 'user', content: action.label }]);
    setTimeout(() => {
      setAiMessages(prev => [...prev, { role: 'assistant', content: action.mockResponse }]);
      setTimeout(() => aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 500);
  };

  const startLeftResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); isResizingLeft.current = true;
    const startX = e.clientX; const startW = leftWidth;
    const onMove = (ev: MouseEvent) => { if (!isResizingLeft.current) return; const newW = Math.max(180, Math.min(400, startW + ev.clientX - startX)); setLeftWidth(newW); };
    const onUp = () => { isResizingLeft.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  }, [leftWidth]);

  const startRightResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); isResizingRight.current = true;
    const startX = e.clientX; const startW = rightWidth;
    const onMove = (ev: MouseEvent) => { if (!isResizingRight.current) return; const newW = Math.max(260, Math.min(500, startW - (ev.clientX - startX))); setRightWidth(newW); };
    const onUp = () => { isResizingRight.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  }, [rightWidth]);

  const filterNotes = (items: NoteItem[]): NoteItem[] => {
    if (!searchTerm) return items;
    return items.map(item => {
      if (item.type === 'folder') {
        const filtered = filterNotes(item.children || []);
        if (filtered.length > 0) return { ...item, children: filtered };
        if (item.title.toLowerCase().includes(searchTerm.toLowerCase())) return item;
        return null;
      }
      if (item.title.toLowerCase().includes(searchTerm.toLowerCase())) return item;
      return null;
    }).filter((n): n is NoteItem => n !== null);
  };

  const filteredNotes = filterNotes(notes);

  return (
    <div className="flex-1 flex min-h-0">
      {/* Left Panel - Note Directory */}
      {leftPanelOpen && (
        <div className="contents">
          <div className="flex flex-col h-full flex-shrink-0 border-r border-border/40" style={{ width: leftWidth }}>
            <div className="h-11 flex items-center gap-1.5 px-3 flex-shrink-0">
              <NotebookPen size={14} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs text-foreground flex-1 truncate">笔记</span>
              <Tooltip content="新建笔记"><Button variant="ghost" size="icon-xs" onClick={addNewNoteAtRoot} className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-accent"><FilePlus size={13} /></Button></Tooltip>
              <Tooltip content="新建文件夹"><Button variant="ghost" size="icon-xs" onClick={addNewFolderAtRoot} className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-accent"><FolderPlus size={13} /></Button></Tooltip>
              <Tooltip content="收起目录"><Button variant="ghost" size="icon-xs" onClick={() => setLeftPanelOpen(false)} className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-accent"><PanelLeftClose size={13} /></Button></Tooltip>
            </div>
            <div className="px-2.5 pt-2 pb-1 space-y-1.5">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <Input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索笔记..." className="w-full h-7 pl-7 pr-2 rounded-md bg-accent/40 border-none text-xs text-foreground placeholder:text-muted-foreground/40 focus:bg-accent/60 focus:ring-1 focus:ring-border/50" />
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="xs" onClick={() => setFilterStarred(!filterStarred)} className={`flex items-center gap-1 px-2 py-1 h-auto rounded-md text-xs ${filterStarred ? 'bg-amber-500/15 text-amber-600' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>
                  <Star size={10} className={filterStarred ? 'fill-amber-500' : ''} /> 收藏
                </Button>
                <Button variant="ghost" size="xs" onClick={() => setSortBy(sortBy === 'name' ? 'date' : 'name')} className="flex items-center gap-1 px-2 py-1 h-auto rounded-md text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground">
                  <SortAsc size={10} /> {sortBy === 'name' ? '名称' : '日期'}
                </Button>
                <Button variant="ghost" size="xs" className="flex items-center gap-1 px-2 py-1 h-auto rounded-md text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground">
                  <Filter size={10} /> 筛选
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-1.5 py-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              {filteredNotes.map(item => (
                <NoteTreeItem key={item.id} item={item} selectedId={selectedNoteId} onSelect={setSelectedNoteId} expandedFolders={expandedFolders} onToggleFolder={toggleFolder} filterStarred={filterStarred} onContextMenu={handleContextMenu} renamingId={renamingId || undefined} renameValue={renameValue} onRenameChange={setRenameValue} onRenameSubmit={submitRename} onRenameCancel={cancelRename} />
              ))}
              {filteredNotes.length === 0 && notes.length === 0 && (
                <EmptyState preset="no-note" compact />
              )}
              {filteredNotes.length === 0 && notes.length > 0 && (
                <EmptyState preset="no-result" compact title="没有找到笔记" description="尝试调整搜索关键词" />
              )}
            </div>
            <div className="h-8 flex items-center px-3 text-xs text-muted-foreground/40 flex-shrink-0">
              {allNotes.length} 篇笔记 · {collectFolders(notes).length} 个文件夹
            </div>
          </div>
          <div onMouseDown={startLeftResize} className="w-[3px] hover:w-[4px] flex-shrink-0 cursor-col-resize hover:bg-primary/30 transition-colors group relative"><div className="absolute inset-y-0 -left-1 -right-1" /></div>
        </div>
      )}

      {/* Center - Note Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-11 flex items-center px-4 flex-shrink-0 gap-2">
          {!leftPanelOpen && (
            <Tooltip content="展开目录"><Button variant="ghost" size="icon-sm" onClick={() => setLeftPanelOpen(true)} className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-accent mr-1"><PanelLeftOpen size={15} /></Button></Tooltip>
          )}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <FileText size={13} className="text-primary flex-shrink-0" />
            <span className="text-xs text-foreground truncate">{selectedNote?.title || '选择一篇笔记'}</span>
            {selectedNote?.starred && <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
            {selectedNote?.updatedAt && <span className="text-xs text-muted-foreground/40 flex-shrink-0 ml-1">{String.fromCharCode(183)} {selectedNote.updatedAt}</span>}
          </div>
          {selectedNote?.tags && selectedNote.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {selectedNote.tags.map(tag => (<span key={tag} className="px-1.5 py-0.5 rounded bg-accent/60 text-xs text-muted-foreground">#{tag}</span>))}
            </div>
          )}
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
            <div className="flex items-center bg-accent/40 rounded-lg p-0.5 gap-0.5">
              <Tooltip content="实时编辑"><Button variant="ghost" size="icon-xs" onClick={() => setEditorMode('edit')} className={`w-6 h-6 ${editorMode === 'edit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground/60 hover:text-foreground'}`}><PenLine size={11} /></Button></Tooltip>
              <Tooltip content="Markdown 源码"><Button variant="ghost" size="icon-xs" onClick={() => setEditorMode('markdown')} className={`w-6 h-6 ${editorMode === 'markdown' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground/60 hover:text-foreground'}`}><Code size={11} /></Button></Tooltip>
              <Tooltip content="只读预览"><Button variant="ghost" size="icon-xs" onClick={() => setEditorMode('preview')} className={`w-6 h-6 ${editorMode === 'preview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground/60 hover:text-foreground'}`}><Eye size={11} /></Button></Tooltip>
            </div>
          </div>
          <div className="w-px h-4 bg-border/30 mx-1" />
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Tooltip content="导出"><Button variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-accent"><Download size={13} /></Button></Tooltip>
            <Tooltip content="分享"><Button variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-accent"><Share2 size={13} /></Button></Tooltip>
            <Tooltip content="更多"><Button variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-accent"><MoreHorizontal size={13} /></Button></Tooltip>
            <div className="w-px h-4 bg-border/30 mx-1" />
            <Tooltip content={rightPanelOpen ? '关闭 AI 面板' : '打开 AI 面板'}><Button variant="ghost" size="icon-xs" onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`w-7 h-7 ${rightPanelOpen ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}><Sparkles size={13} /></Button></Tooltip>
          </div>
        </div>

        {/* Toolbar */}
        {editorMode !== 'preview' && (
          <div className="h-9 flex items-center px-3 gap-0.5 flex-shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden bg-muted/20 rounded-lg mx-3 mt-1">
            <div className="flex items-center gap-0.5">
              <Tooltip content="撤销"><Button variant="ghost" size="icon-xs" onClick={handleUndo} className={`w-7 h-7 ${undoStack.length > 0 ? 'text-muted-foreground/60 hover:text-foreground hover:bg-accent' : 'text-muted-foreground/20 cursor-not-allowed'}`}><Undo2 size={13} /></Button></Tooltip>
              <Tooltip content="重做"><Button variant="ghost" size="icon-xs" onClick={handleRedo} className={`w-7 h-7 ${redoStack.length > 0 ? 'text-muted-foreground/60 hover:text-foreground hover:bg-accent' : 'text-muted-foreground/20 cursor-not-allowed'}`}><Redo2 size={13} /></Button></Tooltip>
            </div>
            <div className="w-px h-4 bg-border/20 mx-1" />
            <div className="flex items-center gap-0.5">
              <Tooltip content="标题 1"><Button onClick={() => insertLinePrefix('# ')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Heading1 size={13} /></Button></Tooltip>
              <Tooltip content="标题 2"><Button onClick={() => insertLinePrefix('## ')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Heading2 size={13} /></Button></Tooltip>
              <Tooltip content="标题 3"><Button onClick={() => insertLinePrefix('### ')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Heading3 size={13} /></Button></Tooltip>
            </div>
            <div className="w-px h-4 bg-border/20 mx-1" />
            <div className="flex items-center gap-0.5">
              <Tooltip content="加粗"><Button onClick={() => insertMarkdown('**', '**', '粗体文字')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Bold size={13} /></Button></Tooltip>
              <Tooltip content="斜体"><Button onClick={() => insertMarkdown('*', '*', '斜体文字')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Italic size={13} /></Button></Tooltip>
              <Tooltip content="下划线"><Button onClick={() => insertMarkdown('<u>', '</u>', '下划线文字')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Underline size={13} /></Button></Tooltip>
              <Tooltip content="删除线"><Button onClick={() => insertMarkdown('~~', '~~', '删除线文字')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Strikethrough size={13} /></Button></Tooltip>
            </div>
            <div className="w-px h-4 bg-border/20 mx-1" />
            <div className="flex items-center gap-0.5">
              <Tooltip content="无序列表"><Button onClick={() => insertLinePrefix('- ')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><List size={13} /></Button></Tooltip>
              <Tooltip content="有序列表"><Button onClick={() => insertLinePrefix('1. ')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><ListOrdered size={13} /></Button></Tooltip>
              <Tooltip content="引用"><Button onClick={() => insertLinePrefix('> ')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Quote size={13} /></Button></Tooltip>
              <Tooltip content="代码"><Button onClick={() => insertMarkdown('`', '`', 'code')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Code size={13} /></Button></Tooltip>
            </div>
            <div className="w-px h-4 bg-border/20 mx-1" />
            <div className="flex items-center gap-0.5">
              <Tooltip content="分割线"><Button onClick={() => insertMarkdown('\n---\n')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Minus size={13} /></Button></Tooltip>
              <Tooltip content="插入链接"><Button onClick={() => insertMarkdown('[', '](url)', '链接文字')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Link size={13} /></Button></Tooltip>
              <Tooltip content="插入图片"><Button onClick={() => insertMarkdown('![', '](image-url)', '图片描述')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><ImageIcon size={13} /></Button></Tooltip>
            </div>
            {editorMode === 'markdown' && (
              <div className="contents">
                <div className="w-px h-4 bg-border/20 mx-1" />
                <div className="flex items-center gap-0.5">
                  <Tooltip content="代码块"><Button onClick={() => insertMarkdown('\n```\n', '\n```\n', '// 代码')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Braces size={13} /></Button></Tooltip>
                  <Tooltip content="表格"><Button onClick={() => insertMarkdown('\n| 标题1 | 标题2 | 标题3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Table size={13} /></Button></Tooltip>
                  <Tooltip content="任务列表"><Button onClick={() => insertLinePrefix('- [ ] ')} variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground/60 hover:text-foreground hover:bg-accent"><Check size={13} /></Button></Tooltip>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
          {selectedNote ? (
            <div>
              {editorMode === 'markdown' && (
                <div className="flex h-full">
                  <div className="flex-shrink-0 pt-8 pb-8 pl-4 pr-0 select-none">
                    {getCurrentContent().split('\n').map((_, i) => (
                      <div key={i} className="text-xs text-muted-foreground/25 text-right pr-3 leading-[22px] font-mono" style={{ minWidth: '32px' }}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    ref={editorRef}
                    value={getCurrentContent()}
                    onChange={e => updateContent(e.target.value)}
                    onKeyDown={e => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) handleRedo(); else handleUndo(); }
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = e.currentTarget.selectionStart; const end = e.currentTarget.selectionEnd;
                        const content = getCurrentContent();
                        const newContent = content.slice(0, start) + '  ' + content.slice(end);
                        updateContent(newContent);
                        setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2; }, 0);
                      }
                    }}
                    spellCheck={false}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground font-mono leading-[22px] resize-none py-8 pr-10 placeholder:text-muted-foreground/30 [&::-webkit-scrollbar]:hidden"
                    style={{ tabSize: 2 }}
                  />
                </div>
              )}
              {editorMode === 'edit' && (
                <div className="max-w-[780px] mx-auto px-10 py-8"><NoteEditableRenderer content={getCurrentContent()} onChange={updateContent} /></div>
              )}
              {editorMode === 'preview' && (
                <div className="max-w-[780px] mx-auto px-10 py-8"><div className="prose prose-sm dark:prose-invert max-w-none"><NotePreviewRenderer content={getCurrentContent()} /></div></div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
              <NotebookPen size={32} className="mb-3" /><p className="text-sm">选择一篇笔记开始编辑</p>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="h-7 flex items-center px-4 text-xs text-muted-foreground/40 flex-shrink-0 gap-4">
          <span className={`px-1.5 py-0.5 rounded ${editorMode === 'markdown' ? 'bg-cherry-active-bg text-cherry-primary-dark' : editorMode === 'edit' ? 'bg-primary/10 text-primary' : 'bg-accent text-muted-foreground/60'}`}>
            {editorMode === 'markdown' ? 'Markdown' : editorMode === 'edit' ? '实时编辑' : '只读预览'}
          </span>
          <span>{getCurrentContent().split('\n').length} 行</span>
          <span>{getCurrentContent().length} 字符</span>
          {undoStack.length > 0 && <span className="text-muted-foreground/30">可撤销 {undoStack.length}</span>}
          <div className="flex-1" />
          {savedIndicator && (<span className="flex items-center gap-1 text-primary animate-in fade-in duration-200"><Check size={9} />已保存</span>)}
          <span>UTF-8</span>
          <span>自动保存</span>
        </div>
      </div>

      {/* Right Panel - AI Chat */}
      {rightPanelOpen && (
        <div className="contents">
          <div onMouseDown={startRightResize} className="w-[3px] hover:w-[4px] flex-shrink-0 cursor-col-resize hover:bg-primary/30 transition-colors group relative"><div className="absolute inset-y-0 -left-1 -right-1" /></div>
          <div className="flex flex-col h-full flex-shrink-0 border-l border-border/40" style={{ width: rightWidth }}>
            <div className="h-11 flex items-center gap-2 px-3 flex-shrink-0 relative">
              <div className="relative" ref={assistantPickerRef}>
                <Button variant="ghost" size="xs" onClick={() => { setShowAssistantPicker(!showAssistantPicker); setAstSearch(''); setAstTag(null); }} className={`flex items-center gap-1.5 px-2 py-[4px] h-auto rounded-md text-xs ${showAssistantPicker ? 'bg-accent/25 text-foreground' : 'text-foreground/75 hover:text-foreground hover:bg-accent/15'}`}>
                  <span className="text-sm leading-none flex-shrink-0">{selectedAssistantEmoji}</span>
                  <span className="truncate max-w-[100px]">{selectedAssistant.name}</span>
                  <ChevronDown size={8} className={`text-muted-foreground/50 flex-shrink-0 transition-transform duration-100 ${showAssistantPicker ? 'rotate-180' : ''}`} />
                </Button>
                {showAssistantPicker && (
                  <div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAssistantPicker(false)} />
                    <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 min-w-[260px]">
                      <div className="px-2 pt-2 pb-1">
                        <div className="flex items-center gap-1.5 px-2 py-[5px] rounded-md bg-accent/15 border border-border/20">
                          <Search size={10} className="text-muted-foreground/40 flex-shrink-0" />
                          <Input ref={astSearchRef} value={astSearch} onChange={e => setAstSearch(e.target.value)} placeholder="搜索助手..." className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/30 min-w-0 border-0 h-auto p-0 focus-visible:ring-0" autoFocus />
                          {astSearch && <Button variant="ghost" size="icon-xs" onClick={() => setAstSearch('')} className="w-4 h-4 text-muted-foreground/30 hover:text-muted-foreground/60"><X size={8} /></Button>}
                        </div>
                      </div>
                      {allAstTags.length > 0 && (
                        <div className="px-2 pb-1.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <Tag size={8} className="text-muted-foreground/30 flex-shrink-0" />
                            {allAstTags.map(tag => (
                              <Button key={tag} variant="ghost" size="xs" onClick={() => setAstTag(astTag === tag ? null : tag)} className={`px-1.5 py-px h-auto rounded-full text-[8px] ${astTag === tag ? 'bg-foreground/10 text-foreground/70 border border-border/40' : 'bg-accent/20 text-muted-foreground/50 border border-transparent hover:bg-accent/40 hover:text-muted-foreground/70'}`}>{tag}</Button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="h-px bg-border/20 mx-1" />
                      <div className="p-1.5 pt-1 max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {filteredNoteAssistants.length === 0 ? (
                          <div className="px-2.5 py-3 text-center text-[9px] text-muted-foreground/40">无匹配结果</div>
                        ) : (
                          filteredNoteAssistants.map(a => {
                            const isActive = selectedAssistant.id === a.id;
                            return (
                              <Button key={a.id} variant="ghost" size="xs" onClick={() => { setSelectedAssistantId(a.id); setShowAssistantPicker(false); }} className={`flex items-center gap-2 w-full px-2 py-[5px] h-auto rounded-lg text-xs mb-px justify-start ${isActive ? 'bg-accent/30 text-foreground ring-1 ring-border/30' : 'text-foreground/75 hover:text-foreground hover:bg-accent/15'}`}>
                                <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-foreground/10' : 'bg-accent/30'}`}>
                                  <span className="text-xs leading-none">{ASSISTANT_EMOJI_MAP[a.name] || '\u{1F916}'}</span>
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="text-xs text-foreground truncate">{a.name}</div>
                                  <div className="text-[9px] text-muted-foreground/50 truncate">{a.systemPrompt.slice(0, 20)}</div>
                                </div>
                                {isActive && <Check size={10} className="text-cherry-primary flex-shrink-0" />}
                              </Button>
                            );
                          })
                        )}
                      </div>
                      <div className="border-t border-border/20 px-3 py-1.5">
                        <p className="text-[9px] text-muted-foreground/40 leading-relaxed">切换助手将改变 AI 的分析视角和专业能力</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1" />
              <Tooltip content="清空对话"><Button variant="ghost" size="icon-xs" onClick={() => setAiMessages([])} className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-accent"><Trash2 size={12} /></Button></Tooltip>
              <Tooltip content="关闭面板"><Button variant="ghost" size="icon-xs" onClick={() => setRightPanelOpen(false)} className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-accent"><PanelRightClose size={12} /></Button></Tooltip>
            </div>

            {/* Quick Actions */}
            <div className="flex-shrink-0">
              <div className="flex items-center px-2 pt-1.5 gap-0.5">
                {actionCategories.map(cat => {
                  const CatIcon = cat.icon;
                  return (<Button key={cat.id} variant="ghost" size="xs" onClick={() => setActiveActionCategory(cat.id)} className={`flex items-center gap-1 px-2 py-1 h-auto rounded-md text-xs ${activeActionCategory === cat.id ? 'bg-accent text-foreground' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}><CatIcon size={10} />{cat.label}</Button>);
                })}
                <div className="flex-1" />
                <Button variant="ghost" size="xs" onClick={() => setShowAllActions(!showAllActions)} className="text-xs text-muted-foreground/40 hover:text-foreground px-1 h-auto">{showAllActions ? '收起' : '全部'}</Button>
              </div>
              <div className="px-2 py-1.5 flex flex-wrap gap-1">
                {(showAllActions ? noteQuickActions : noteQuickActions.filter(a => a.category === activeActionCategory)).map(action => {
                  const AIcon = action.icon;
                  return (<Button key={action.id} variant="ghost" size="xs" onClick={() => handleQuickAction(action)} className="flex items-center gap-1 px-2 py-1 h-auto rounded-md bg-accent/30 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"><AIcon size={10} />{action.label}</Button>);
                })}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                <FileText size={11} className="text-primary flex-shrink-0" />
                <span className="text-xs text-primary/70 truncate flex-1">当前笔记: {selectedNote?.title}</span>
                <span className="text-xs leading-none flex-shrink-0">{selectedAssistantEmoji}</span>
              </div>
              {aiMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/30">
                  <div className="w-10 h-10 rounded-xl bg-accent/40 flex items-center justify-center mb-3 opacity-60"><span className="text-[22px] leading-none">{selectedAssistantEmoji}</span></div>
                  <p className="text-xs text-muted-foreground/50 mb-1">{selectedAssistant.name}</p>
                  <p className="text-xs text-muted-foreground/30">{selectedAssistant.modelProvider} {String.fromCharCode(183)} {selectedAssistant.model.split('/').pop()}</p>
                  <p className="text-xs text-muted-foreground/20 mt-3">点击上方操作或输入问题开始</p>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-1.5`}>
                  {msg.role === 'assistant' && (
                    <div className="w-5 h-5 rounded-md bg-accent/40 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs leading-none">{selectedAssistantEmoji}</span></div>
                  )}
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-accent/60 text-foreground rounded-bl-sm'}`}>
                    {msg.content.split('\n').map((line, li) => {
                      if (line.startsWith('```')) return <div key={li} className="font-mono text-xs bg-background/50 rounded px-1.5 py-0.5 my-1 text-muted-foreground">{line.replace(new RegExp('```', 'g'), '')}</div>;
                      if (line.startsWith('**') && line.endsWith('**')) return <p key={li} className="text-foreground mt-1.5 mb-0.5">{line.replace(new RegExp('\\*\\*', 'g'), '')}</p>;
                      if (line.startsWith('- [ ] ')) return <div key={li} className="flex items-start gap-1.5 py-0.5"><span className="w-3 h-3 rounded border border-muted-foreground/30 flex-shrink-0 mt-[1px]" /><span>{line.slice(6)}</span></div>;
                      if (line.startsWith('- ')) return <div key={li} className="flex items-start gap-1.5 py-0.5"><span className="text-primary mt-[2px]">{String.fromCharCode(8226)}</span><span>{renderBoldText(line.slice(2))}</span></div>;
                      if (line.match(new RegExp('^\\d+\\. '))) {
                        const m = line.match(new RegExp('^(\\d+)\\. (.+)'));
                        if (m) return <div key={li} className="flex items-start gap-1.5 py-0.5"><span className="text-muted-foreground w-3 text-right flex-shrink-0">{m[1]}.</span><span>{renderBoldText(m[2])}</span></div>;
                      }
                      if (line.match(new RegExp('^\\s+\\d+\\.\\d+ '))) return <div key={li} className="flex items-start gap-1.5 py-0.5 pl-4"><span className="text-muted-foreground/50">{String.fromCharCode(183)}</span><span className="text-foreground/70">{line.trim()}</span></div>;
                      if (line.startsWith('\u2502') || line.startsWith('\u251c') || line.startsWith('\u2514')) return <div key={li} className="font-mono text-xs text-muted-foreground leading-tight">{line}</div>;
                      if (line.trim() === '') return <div key={li} className="h-1.5" />;
                      return <p key={li} className="py-0.5">{renderBoldText(line)}</p>;
                    })}
                  </div>
                </div>
              ))}
              <div ref={aiEndRef} />
            </div>

            {/* AI Input */}
            <div className="px-3 pb-3 pt-1 flex-shrink-0">
              <div className="flex items-end gap-1.5 bg-accent/40 rounded-xl px-3 py-2 border border-border/30 focus-within:border-primary/30 focus-within:bg-accent/60 transition-all">
                <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAISend(); } }} placeholder={`向 ${selectedAssistant.name} 提问...`} rows={1} className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/40 resize-none min-h-[20px] max-h-[80px]" />
                <Button size="icon-xs" onClick={handleAISend} disabled={!aiInput.trim()} className={`w-6 h-6 flex-shrink-0 ${aiInput.trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground/30'}`}><Send size={11} /></Button>
              </div>
              <p className="text-[9px] text-muted-foreground/30 mt-1.5 text-center">{selectedAssistant.name} {String.fromCharCode(183)} 基于笔记上下文 {String.fromCharCode(183)} Enter 发送</p>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {ctxMenu && (
        <div ref={ctxRef} className="fixed z-[200] min-w-[180px] bg-popover border border-border/60 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100" style={{ left: ctxMenu.x, top: ctxMenu.y }}>
          {ctxMenu.item.type === 'file' ? (
            <div className="contents">
              <Button onClick={() => { setSelectedNoteId(ctxMenu.item.id); setCtxMenu(null); }} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><FileText size={13} className="text-muted-foreground" />打开</Button>
              <div className="h-px bg-border/30 my-0.5 mx-2" />
              <Button onClick={() => startRename(ctxMenu.item)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><PenLine size={13} className="text-muted-foreground" />重命名</Button>
              <Button onClick={() => duplicateItem(ctxMenu.item)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><Copy size={13} className="text-muted-foreground" />创建副本</Button>
              <Button onClick={() => toggleStar(ctxMenu.item.id)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><Star size={13} className={ctxMenu.item.starred ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />{ctxMenu.item.starred ? '取消收藏' : '添加收藏'}</Button>
              <div className="h-px bg-border/30 my-0.5 mx-2" />
              <Button onClick={() => openMoveDialog(ctxMenu.item)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><FolderOpen size={13} className="text-muted-foreground" />移动到...</Button>
              <div className="h-px bg-border/30 my-0.5 mx-2" />
              <Button onClick={() => confirmDelete(ctxMenu.item)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-destructive hover:bg-destructive/10 justify-start"><Trash2 size={13} />删除</Button>
            </div>
          ) : (
            <div className="contents">
              <Button onClick={() => { toggleFolder(ctxMenu.item.id); setCtxMenu(null); }} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><ChevronRight size={13} className="text-muted-foreground" />{expandedFolders.has(ctxMenu.item.id) ? '收起文件夹' : '展开文件夹'}</Button>
              <div className="h-px bg-border/30 my-0.5 mx-2" />
              <Button onClick={() => addNewNoteInFolder(ctxMenu.item.id)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><FilePlus size={13} className="text-muted-foreground" />新建笔记</Button>
              <Button onClick={() => addNewSubfolder(ctxMenu.item.id)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><FolderPlus size={13} className="text-muted-foreground" />新建子文件夹</Button>
              <div className="h-px bg-border/30 my-0.5 mx-2" />
              <Button onClick={() => startRename(ctxMenu.item)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><PenLine size={13} className="text-muted-foreground" />重命名</Button>
              <Button onClick={() => openMoveDialog(ctxMenu.item)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><FolderOpen size={13} className="text-muted-foreground" />移动到...</Button>
              <Button onClick={() => duplicateItem(ctxMenu.item)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-foreground hover:bg-accent justify-start"><Copy size={13} className="text-muted-foreground" />创建副本</Button>
              <div className="h-px bg-border/30 my-0.5 mx-2" />
              <Button onClick={() => confirmDelete(ctxMenu.item)} variant="ghost" size="xs" className="w-full flex items-center gap-2.5 px-3 py-1.5 h-auto text-xs text-destructive hover:bg-destructive/10 justify-start"><Trash2 size={13} />删除文件夹</Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-popover border border-border/60 rounded-xl shadow-2xl w-[340px] p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center flex-shrink-0"><Trash2 size={18} className="text-destructive" /></div>
              <div><h3 className="text-sm text-foreground">确认删除</h3><p className="text-xs text-muted-foreground mt-0.5">{deleteConfirm.type === 'folder' ? '将删除文件夹及其所有内容' : '此操作不可撤销'}</p></div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/40 mb-4">
              {deleteConfirm.type === 'folder' ? <Folder size={14} className="text-amber-500" /> : <FileText size={14} className="text-muted-foreground" />}
              <span className="text-xs text-foreground truncate">{deleteConfirm.title}</span>
              {deleteConfirm.type === 'folder' && deleteConfirm.children && (<span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{deleteConfirm.children.length} 项</span>)}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 h-auto rounded-lg text-xs text-muted-foreground hover:bg-accent">取消</Button>
              <Button variant="destructive" size="sm" onClick={executeDelete} className="px-3 py-1.5 h-auto rounded-lg text-xs">删除</Button>
            </div>
          </div>
        </div>
      )}

      {/* Move Dialog */}
      {moveDialog && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40" onClick={() => setMoveDialog(null)}>
          <div className="bg-popover border border-border/60 rounded-xl shadow-2xl w-[360px] max-h-[480px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
              <FolderOpen size={15} className="text-primary" /><span className="text-sm text-foreground flex-1">移动到</span>
              <Button variant="ghost" size="icon-xs" onClick={() => setMoveDialog(null)} className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-accent"><X size={14} /></Button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/20 bg-accent/20">
              {moveDialog.item.type === 'folder' ? <Folder size={13} className="text-amber-500" /> : <FileText size={13} className="text-muted-foreground" />}
              <span className="text-xs text-foreground truncate">{moveDialog.item.title}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
              <Button variant="ghost" size="xs" onClick={() => executeMove('root')} className="w-full flex items-center gap-2 px-3 py-2 h-auto rounded-lg text-xs text-foreground hover:bg-accent justify-start"><Home size={13} className="text-muted-foreground" /><span>根目录</span></Button>
              {collectFolders(notes).filter(f => f.id !== moveDialog.item.id).map(folder => (
                <Button key={folder.id} variant="ghost" size="xs" onClick={() => executeMove(folder.id)} className="w-full flex items-center gap-2 px-3 py-2 h-auto rounded-lg text-xs text-foreground hover:bg-accent justify-start"><Folder size={13} className="text-amber-500" /><span className="truncate">{folder.title}</span></Button>
              ))}
            </div>
            <div className="flex justify-end px-4 py-2.5 border-t border-border/30"><Button variant="ghost" size="sm" onClick={() => setMoveDialog(null)} className="px-3 py-1.5 h-auto rounded-lg text-xs text-muted-foreground hover:bg-accent">取消</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
