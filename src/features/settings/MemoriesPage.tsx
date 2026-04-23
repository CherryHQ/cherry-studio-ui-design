import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Check, ChevronDown, X,
  Settings2, Trash2, RefreshCw, MoreHorizontal,
  Brain, MessageCircle, PenLine, Sparkles,
  Copy, AlertTriangle,
  ChevronRight, User,
} from 'lucide-react';
import { InlineSelect } from './shared';
import { Button, Input, Textarea, Popover, PopoverTrigger, PopoverContent, SearchInput, EmptyState, Switch } from '@cherry-studio/ui';

// ===========================
// Types
// ===========================
interface Memory {
  id: string;
  content: string;
  source: 'chat' | 'manual' | 'auto';
  timestamp: string;
  relativeTime: string;
}

interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatar: string;
  avatarColor: string;
  memoryCount: number;
  memories: Memory[];
}

// ===========================
// Mock Data
// ===========================
const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1',
    userId: 'default_001',
    displayName: 'Admin (Me)',
    avatar: 'Me',
    avatarColor: 'bg-accent-emerald',
    memoryCount: 128,
    memories: [
      { id: 'm1', content: '用户更喜欢使用 TypeScript 而不是 JavaScript 进行代码示例编写。在 React 项目中倾向于使用 Tailwind CSS。', source: 'chat', timestamp: '2026-02-26T10:30:00', relativeTime: '12 mins ago' },
      { id: 'm2', content: '项目 API Base URL 已变更为: https://api.v2.cherry-studio.com，所有请求需带上 Bearer Token。', source: 'manual', timestamp: '2026-02-24T14:00:00', relativeTime: '2 days ago' },
      { id: 'm3', content: '用户是左撇子，希望界面快捷键布局能考虑到这一点（虽然目前软件暂不支持键位镜像）。', source: 'auto', timestamp: '2026-02-21T09:15:00', relativeTime: '5 days ago' },
      { id: 'm4', content: 'User prefers technical explanations with Python code examples. Avoid using simplified analogies.', source: 'chat', timestamp: '2026-02-20T18:00:00', relativeTime: '6 days ago' },
      { id: 'm5', content: 'Likes dark mode interfaces and follows "Clean Code" principles.', source: 'chat', timestamp: '2026-02-19T11:00:00', relativeTime: '1 week ago' },
      { id: 'm6', content: '工作相关：项目代号 "Alpha" 指的是新的 CRM 系统重构项目。技术栈使用 React + Node.js。', source: 'manual', timestamp: '2026-02-18T16:30:00', relativeTime: '1 week ago' },
    ],
  },
  {
    id: 'u2',
    userId: 'user_001',
    displayName: 'User_001',
    avatar: 'U1',
    avatarColor: 'bg-accent-indigo',
    memoryCount: 42,
    memories: [
      { id: 'm7', content: '偏好简洁的回答风格，避免过多解释。', source: 'chat', timestamp: '2026-02-25T09:00:00', relativeTime: '1 day ago' },
      { id: 'm8', content: '主要使用 Python 和 Go 进行后端开发，前端经验较少。', source: 'auto', timestamp: '2026-02-23T14:00:00', relativeTime: '3 days ago' },
      { id: 'm9', content: '常用的数据库是 PostgreSQL，偶尔使用 Redis 作为缓存。', source: 'chat', timestamp: '2026-02-20T10:00:00', relativeTime: '6 days ago' },
    ],
  },
  {
    id: 'u3',
    userId: 'dev_team',
    displayName: 'Dev_Team',
    avatar: 'Dev',
    avatarColor: 'bg-accent-amber',
    memoryCount: 15,
    memories: [
      { id: 'm10', content: '团队代码规范：使用 ESLint + Prettier，缩进 2 空格，单引号，分号结尾。', source: 'manual', timestamp: '2026-02-24T11:00:00', relativeTime: '2 days ago' },
      { id: 'm11', content: 'CI/CD 使用 GitHub Actions，部署到 AWS ECS Fargate。', source: 'manual', timestamp: '2026-02-22T15:00:00', relativeTime: '4 days ago' },
    ],
  },
];

// ===========================
// Engine Config Side Panel
// ===========================
function EngineConfigPanel({ onClose }: { onClose: () => void }) {
  const [llmModel, setLlmModel] = useState('gpt-4o');
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small');
  const [dimensions, setDimensions] = useState('1536');

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-y-0 right-0 w-[300px] bg-background border-l border-border/30 shadow-xl flex flex-col z-[var(--z-sticky)] rounded-r-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 size={12} className="text-muted-foreground/60" />
          <span className="text-xs text-foreground font-semibold">记忆引擎配置</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40 hover:text-foreground hover:bg-accent">
          <X size={11} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin-xs">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs">🧠</span>
            <label className="text-sm text-muted-foreground font-medium">提取模型 (LLM)</label>
          </div>
          <InlineSelect
            value={llmModel}
            onChange={setLlmModel}
            options={[
              { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
              { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
              { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
              { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
            ]}
            fullWidth
          />
          <p className="text-xs text-muted-foreground/40 mt-1.5">用于从对话中分析并提取事实的模型。</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs">📦</span>
            <label className="text-sm text-muted-foreground font-medium">嵌入模型 (Embedding)</label>
          </div>
          <InlineSelect
            value={embeddingModel}
            onChange={setEmbeddingModel}
            options={[
              { value: 'text-embedding-3-small', label: 'text-embedding-3-small (OpenAI)' },
              { value: 'text-embedding-3-large', label: 'text-embedding-3-large (OpenAI)' },
              { value: 'text-embedding-ada-002', label: 'text-embedding-ada-002' },
            ]}
            fullWidth
          />
          <p className="text-xs text-muted-foreground/40 mt-1.5">用于将文本转换为向量进行存储和检索。</p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block font-medium">向量维度</label>
          <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
            <Input
              type="text"
              value={dimensions}
              onChange={e => setDimensions(e.target.value)}
              className="flex-1 bg-transparent text-xs text-muted-foreground min-w-0 border-0 h-auto p-0 focus-visible:ring-0"
            />
          </div>
          <p className="text-xs text-muted-foreground/40 mt-1.5">修改维度将需要重新索引所有现有记忆。</p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border/30 flex items-center gap-2 flex-shrink-0">
        <Button variant="outline" size="xs" onClick={onClose} className="flex-1 text-muted-foreground/60 hover:text-foreground border-border/25">
          取消
        </Button>
        <Button variant="ghost" size="xs" onClick={onClose} className="flex-1 text-cherry-primary-dark bg-cherry-active-bg hover:bg-cherry-active-border">
          保存配置
        </Button>
      </div>
    </motion.div>
  );
}

// ===========================
// New User Side Panel
// ===========================
function NewUserPanel({ onClose, onAdd }: { onClose: () => void; onAdd: (userId: string, displayName: string) => void }) {
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleCreate = () => {
    if (!userId.trim()) return;
    onAdd(userId.trim(), displayName.trim() || userId.trim());
    onClose();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-y-0 right-0 w-[300px] bg-background border-l border-border/30 shadow-xl flex flex-col z-[var(--z-sticky)] rounded-r-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 flex-shrink-0">
        <span className="text-xs text-foreground font-semibold">新建用户空间</span>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40 hover:text-foreground hover:bg-accent">
          <X size={11} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin-xs">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block font-medium">用户 ID / 命名空间</label>
          <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
            <Input
              autoFocus
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="例如: user_002 或 project_beta"
              className="flex-1 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 min-w-0 border-0 h-auto p-0 focus-visible:ring-0"
            />
          </div>
          <p className="text-xs text-muted-foreground/40 mt-1.5">唯一标识符，用于隔离记忆数据。</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block font-medium">显示名称 (可选)</label>
          <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
            <Input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="例如: Work Profile"
              className="flex-1 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 min-w-0 border-0 h-auto p-0 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border/30 flex items-center gap-2 flex-shrink-0">
        <Button variant="outline" size="xs" onClick={onClose} className="flex-1 text-muted-foreground/60 hover:text-foreground border-border/25">
          取消
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleCreate}
          disabled={!userId.trim()}
          className="flex-1 text-cherry-primary-dark bg-cherry-active-bg hover:bg-cherry-active-border"
        >
          创建
        </Button>
      </div>
    </motion.div>
  );
}

// ===========================
// Add Memory Side Panel
// ===========================
function AddMemoryPanel({ userName, onClose, onAdd }: {
  userName: string;
  onClose: () => void;
  onAdd: (content: string) => void;
}) {
  const [content, setContent] = useState('');

  const handleAdd = () => {
    if (!content.trim()) return;
    onAdd(content.trim());
    onClose();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-y-0 right-0 w-[300px] bg-background border-l border-border/30 shadow-xl flex flex-col z-[var(--z-sticky)] rounded-r-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 flex-shrink-0">
        <div>
          <span className="text-xs text-foreground font-semibold">添加记忆</span>
          <p className="text-xs text-muted-foreground/40 mt-0.5">添加至 {userName}</p>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40 hover:text-foreground hover:bg-accent">
          <X size={11} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin-xs">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block font-medium">记忆内容</label>
          <Textarea
            autoFocus
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="输入要记住的事实或偏好..."
            rows={5}
            className="w-full px-2.5 py-2 bg-muted/30 rounded-lg border border-border/30 text-xs text-muted-foreground outline-none resize-none placeholder:text-muted-foreground/60 scrollbar-thin-xs"
          />
        </div>
        <div className="bg-muted/30 border border-border/50 rounded-lg p-2.5">
          <p className="text-xs text-muted-foreground/40">
            <span className="text-muted-foreground/60 font-medium">提示：</span>
            手动添加的记忆将标记为 "Manual" 来源，可随时编辑或删除。
          </p>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border/30 flex items-center gap-2 flex-shrink-0">
        <Button variant="outline" size="xs" onClick={onClose} className="flex-1 text-muted-foreground/60 hover:text-foreground border-border/25">
          取消
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleAdd}
          disabled={!content.trim()}
          className="flex-1 text-cherry-primary-dark bg-cherry-active-bg hover:bg-cherry-active-border"
        >
          添加记忆
        </Button>
      </div>
    </motion.div>
  );
}

// ===========================
// Source Badge
// ===========================
function SourceBadge({ source }: { source: 'chat' | 'manual' | 'auto' }) {
  const config = {
    chat: { label: 'Chat Conversation', icon: MessageCircle, color: 'text-muted-foreground/40' },
    manual: { label: 'Manual', icon: PenLine, color: 'text-muted-foreground/40' },
    auto: { label: 'Auto-Generated', icon: Sparkles, color: 'text-muted-foreground/40' },
  };
  const { label, icon: Icon, color } = config[source];
  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Icon size={8} />
      <span className="text-xs">{label}</span>
    </div>
  );
}

// ===========================
// More Menu Dropdown
// ===========================
function MoreMenu({ onRefresh, onClearUser, onDeleteUser }: {
  onRefresh: () => void;
  onClearUser: () => void;
  onDeleteUser: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="w-6 h-6 text-muted-foreground/40 hover:text-foreground hover:bg-accent"
        >
          <MoreHorizontal size={13} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[140px] p-0.5">
        <Button variant="ghost" size="xs" onClick={() => { onRefresh(); setOpen(false); }} className="w-full text-left px-2.5 text-xs text-muted-foreground hover:bg-accent/50 justify-start">
          <RefreshCw size={9} />
          <span>刷新列表</span>
        </Button>
        <Button variant="ghost" size="xs" onClick={() => { onClearUser(); setOpen(false); }} className="w-full text-left px-2.5 text-xs text-muted-foreground hover:bg-accent/50 justify-start">
          <Trash2 size={9} />
          <span>清空当前用户</span>
        </Button>
        <div className="h-px bg-muted/50 mx-1.5 my-0.5" />
        <Button
          variant="ghost"
          size="xs"
          onClick={() => { onDeleteUser(); setOpen(false); }}
          className="w-full text-left px-2.5 text-xs text-destructive/70 hover:bg-destructive/5 justify-start"
        >
          <AlertTriangle size={9} />
          <span>删除此用户</span>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

// ===========================
// Main: MemoriesPage
// ===========================
export function MemoriesPage() {
  const [enabled, setEnabled] = useState(true);
  const [users, setUsers] = useState(MOCK_USERS);
  const [selectedUserId, setSelectedUserId] = useState('u1');
  const [search, setSearch] = useState('');

  // Side panels
  const [showEngineConfig, setShowEngineConfig] = useState(false);
  const [showNewUser, setShowNewUser] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const filteredMemories = selectedUser.memories.filter(m =>
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = (userId: string, displayName: string) => {
    const abbrev = displayName.slice(0, 2).toUpperCase();
    const colors = ['bg-destructive', 'bg-accent-violet', 'bg-accent-cyan', 'bg-accent-amber', 'bg-accent-pink'];
    const color = colors[users.length % colors.length];
    setUsers(prev => [...prev, {
      id: `u${Date.now()}`,
      userId,
      displayName,
      avatar: abbrev,
      avatarColor: color,
      memoryCount: 0,
      memories: [],
    }]);
  };

  const handleAddMemory = (content: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== selectedUserId) return u;
      return {
        ...u,
        memoryCount: u.memoryCount + 1,
        memories: [{
          id: `m${Date.now()}`,
          content,
          source: 'manual' as const,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
        }, ...u.memories],
      };
    }));
  };

  const handleDeleteMemory = (memoryId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== selectedUserId) return u;
      return {
        ...u,
        memoryCount: Math.max(0, u.memoryCount - 1),
        memories: u.memories.filter(m => m.id !== memoryId),
      };
    }));
  };

  return (
    <div className="flex h-full min-h-0 relative">
      {/* Middle Column: Control Panel */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0">
        {/* Header */}
        <div className="px-3.5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-muted-foreground/60 font-medium">记忆管理</p>
          <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin-xs">
          <div className="space-y-[2px]">
            {/* Engine Config */}
            <Button size="inline"
              variant="ghost"
              onClick={() => setShowEngineConfig(true)}
              className="w-full flex items-center justify-between px-3 py-[8px] text-left border border-transparent hover:bg-accent/50 justify-start"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="flex-shrink-0 text-muted-foreground/40"><Settings2 size={14} /></span>
                <span className="text-sm text-muted-foreground">引擎配置</span>
              </div>
              <ChevronRight size={9} className="flex-shrink-0 text-muted-foreground/40" />
            </Button>

            {/* Users section label */}
            <p className="text-xs text-muted-foreground/40 tracking-wider px-3 pt-2.5 pb-1 font-medium">用户</p>

            {/* Users */}
            {users.map(user => {
              const isSelected = selectedUserId === user.id;
              return (
                <Button size="inline"
                  key={user.id}
                  variant="ghost"
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full flex items-center justify-between px-3 py-[8px] text-left relative justify-start ${
                    isSelected
                      ? 'bg-cherry-active-bg'
                      : 'border border-transparent hover:bg-accent/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}><User size={14} /></span>
                    <span className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground font-normal'}`}>{user.displayName}</span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
                </Button>
              );
            })}

            {/* Add user */}
            <Button size="inline"
              variant="ghost"
              onClick={() => setShowNewUser(true)}
              className="w-full flex items-center gap-1.5 px-3 py-[8px] text-xs text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 border border-transparent justify-start"
            >
              <span className="w-4 flex-shrink-0" />
              <Plus size={9} />
              <span>添加用户</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Memory List */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0 border-b border-border/30">
          {/* User info */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-white font-semibold ${selectedUser.avatar.length > 2 ? 'text-xs' : 'text-xs'} ${selectedUser.avatarColor}`}
            >
              {selectedUser.avatar}
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">{selectedUser.displayName}</p>
              <p className="text-xs text-muted-foreground/40 font-mono">user_id: {selectedUser.userId}</p>
            </div>
          </div>

          {/* Search */}
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="搜索记忆内容..."
            iconSize={10}
            wrapperClassName="flex-1 flex items-center gap-2 px-2.5 py-[4px] bg-muted/30 rounded-lg border border-border/25 mx-3"
          />

          {/* Actions */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowAddMemory(true)}
            className="flex-shrink-0 text-cherry-primary-dark bg-cherry-active-bg hover:bg-cherry-active-border"
          >
            <Plus size={9} />
            <span>添加记忆</span>
          </Button>
          <MoreMenu
            onRefresh={() => {}}
            onClearUser={() => {
              setUsers(prev => prev.map(u => u.id === selectedUserId ? { ...u, memoryCount: 0, memories: [] } : u));
            }}
            onDeleteUser={() => {
              if (users.length <= 1) return;
              setUsers(prev => prev.filter(u => u.id !== selectedUserId));
              setSelectedUserId(users.find(u => u.id !== selectedUserId)?.id || users[0].id);
            }}
          />
        </div>

        {/* Memory Count */}
        <div className="px-5 py-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground/40">
            共 {filteredMemories.length} 条记忆，按时间排序
          </p>
        </div>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2 scrollbar-thin">
          {filteredMemories.length === 0 ? (
            <EmptyState
              icon={Brain}
              title={search ? '没有匹配的记忆' : '暂无记忆'}
              description={search ? '尝试不同的搜索关键词' : '对话中的事实会被自动提取，或手动添加记忆。'}
            />
          ) : (
            filteredMemories.map(memory => (
              <div
                key={memory.id}
                className="bg-muted/50 border border-border/50 rounded-xl px-4 py-3 group hover:border-border/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🧠</span>
                    <span className="text-xs text-muted-foreground/40">{memory.relativeTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <SourceBadge source={memory.source} />
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-xs" className="text-muted-foreground/50 hover:text-foreground hover:bg-accent">
                        <Copy size={9} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="text-muted-foreground/50 hover:text-destructive/60 hover:bg-destructive/5"
                      >
                        <Trash2 size={9} />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{memory.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Side Panels (within right column) */}
        <AnimatePresence>
          {showEngineConfig && (
            <div className="absolute inset-0 z-[var(--z-overlay)]" onClick={() => setShowEngineConfig(false)}>
              <div className="fixed inset-0 bg-foreground/10 backdrop-blur-[1px]" />
              <EngineConfigPanel onClose={() => setShowEngineConfig(false)} />
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showNewUser && (
            <div className="absolute inset-0 z-[var(--z-overlay)]" onClick={() => setShowNewUser(false)}>
              <div className="fixed inset-0 bg-foreground/10 backdrop-blur-[1px]" />
              <NewUserPanel onClose={() => setShowNewUser(false)} onAdd={handleAddUser} />
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showAddMemory && (
            <div className="absolute inset-0 z-[var(--z-overlay)]" onClick={() => setShowAddMemory(false)}>
              <div className="fixed inset-0 bg-foreground/10 backdrop-blur-[1px]" />
              <AddMemoryPanel
                userName={selectedUser.displayName}
                onClose={() => setShowAddMemory(false)}
                onAdd={handleAddMemory}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
