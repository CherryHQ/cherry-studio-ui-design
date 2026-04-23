import React, { useState } from 'react';
import { Plus, Trash2, Check, ChevronDown, ChevronRight, ExternalLink, ToggleLeft, ToggleRight, Plug, Server, Wrench, Settings, AlertCircle, Globe, FileText, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, SearchInput, Popover, PopoverTrigger, PopoverContent, Typography, StatusBadge as UIStatusBadge, Card, Switch, Checkbox } from '@cherry-studio/ui';
import type { MCPServer } from '@/app/types';

const MOCK_MCP_SERVERS: MCPServer[] = [
  {
    id: 'mcp-filesystem',
    name: 'Filesystem',
    description: '本地文件系统读写、搜索和管理',
    icon: '📁',
    status: 'connected',
    endpoint: 'stdio://mcp-filesystem',
    version: '1.2.0',
    tools: [
      { id: 'fs-read', name: 'read_file', description: '读取文件内容', enabled: true, category: '文件操作' },
      { id: 'fs-write', name: 'write_file', description: '写入文件内容', enabled: true, category: '文件操作' },
      { id: 'fs-list', name: 'list_directory', description: '列出目录内容', enabled: true, category: '文件操作' },
      { id: 'fs-search', name: 'search_files', description: '搜索文件', enabled: false, category: '文件操作' },
      { id: 'fs-move', name: 'move_file', description: '移动或重命名文件', enabled: false, category: '文件操作' },
    ],
  },
  {
    id: 'mcp-browser',
    name: 'Browser',
    description: '网页浏览、截图和内容提取',
    icon: '🌐',
    status: 'connected',
    endpoint: 'stdio://mcp-browser',
    version: '0.9.1',
    tools: [
      { id: 'br-navigate', name: 'navigate', description: '打开指定 URL', enabled: true, category: '浏览器' },
      { id: 'br-screenshot', name: 'screenshot', description: '截取页面截图', enabled: true, category: '浏览器' },
      { id: 'br-extract', name: 'extract_content', description: '提取页面文本内容', enabled: true, category: '浏览器' },
      { id: 'br-click', name: 'click_element', description: '点击页面元素', enabled: false, category: '浏览器' },
    ],
  },
  {
    id: 'mcp-github',
    name: 'GitHub',
    description: 'GitHub 仓库、Issue 和 PR 管理',
    icon: '🐙',
    status: 'disconnected',
    endpoint: 'https://mcp.github.io/api',
    version: '2.1.0',
    tools: [
      { id: 'gh-repo', name: 'list_repos', description: '列出仓库', enabled: true, category: 'GitHub' },
      { id: 'gh-issue', name: 'create_issue', description: '创建 Issue', enabled: true, category: 'GitHub' },
      { id: 'gh-pr', name: 'list_pull_requests', description: '列出 PR', enabled: true, category: 'GitHub' },
      { id: 'gh-commit', name: 'get_commit', description: '获取 commit 详情', enabled: false, category: 'GitHub' },
    ],
  },
  {
    id: 'mcp-database',
    name: 'Database',
    description: 'SQL 数据库查询与管理',
    icon: '🗄️',
    status: 'error',
    endpoint: 'stdio://mcp-postgres',
    version: '1.0.3',
    tools: [
      { id: 'db-query', name: 'query', description: '执行 SQL 查询', enabled: true, category: '数据库' },
      { id: 'db-schema', name: 'get_schema', description: '获取表结构', enabled: true, category: '数据库' },
      { id: 'db-tables', name: 'list_tables', description: '列出所有表', enabled: true, category: '数据库' },
    ],
  },
];

const AVAILABLE_SERVERS: { id: string; name: string; description: string; icon: string }[] = [
  { id: 'mcp-slack', name: 'Slack', description: '发送消息、管理频道', icon: '💬' },
  { id: 'mcp-notion', name: 'Notion', description: '页面读写、数据库操作', icon: '📝' },
  { id: 'mcp-docker', name: 'Docker', description: '容器管理与日志查看', icon: '🐳' },
  { id: 'mcp-memory', name: 'Memory', description: '长期记忆存储与检索', icon: '🧠' },
];

// ===========================
// Status Badge
// ===========================

function StatusBadge({ status }: { status: MCPServer['status'] }) {
  const variantMap = { connected: 'success', disconnected: 'default', error: 'error' } as const;
  const labelMap = { connected: '已连接', disconnected: '未连接', error: '异常' };
  return (
    <UIStatusBadge
      variant={variantMap[status]}
      pulse={status === 'connected'}
      className="px-1.5 py-[2px] rounded-md"
    >
      {labelMap[status]}
    </UIStatusBadge>
  );
}

// ===========================
// Server Card
// ===========================

function ServerCard({ server, onToggleTool, onRemove, onToggleConnection }: {
  server: MCPServer;
  onToggleTool: (serverId: string, toolId: string) => void;
  onRemove: (serverId: string) => void;
  onToggleConnection: (serverId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const enabledCount = server.tools.filter(t => t.enabled).length;

  return (
    <Card className={`rounded-xl transition-all shadow-none gap-0 py-0 ${
      server.status === 'connected'
        ? 'border-border/20 bg-accent/5'
        : server.status === 'error'
        ? 'border-destructive/15 bg-destructive/3'
        : 'border-border/15 bg-accent/5'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center text-base flex-shrink-0">
          {server.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground">{server.name}</span>
            <StatusBadge status={server.status} />
          </div>
          <p className="text-xs text-muted-foreground/50 mt-0.5 truncate">{server.description}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Switch
            size="sm"
            checked={server.status === 'connected'}
            onCheckedChange={() => onToggleConnection(server.id)}
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.1 }}>
              <ChevronRight size={11} />
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Expanded: Tool List */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3 pt-0">
              <div className="h-px bg-border/30 mb-2.5" />

              {/* Server info */}
              <div className="flex items-center gap-3 mb-2.5 text-xs text-muted-foreground/40">
                {server.endpoint && (
                  <span className="flex items-center gap-1">
                    <Globe size={8} />
                    {server.endpoint}
                  </span>
                )}
                {server.version && (
                  <span className="flex items-center gap-1">
                    <Code2 size={8} />
                    v{server.version}
                  </span>
                )}
              </div>

              {/* Tools */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground/50">
                  工具列表 ({enabledCount}/{server.tools.length} 已启用)
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    const allEnabled = server.tools.every(t => t.enabled);
                    server.tools.forEach(t => {
                      if (allEnabled === t.enabled) onToggleTool(server.id, t.id);
                    });
                  }}
                  className="text-xs text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  {server.tools.every(t => t.enabled) ? '全部禁用' : '全部启用'}
                </Button>
              </div>

              <div className="space-y-[3px]">
                {server.tools.map(tool => (
                  <div
                    key={tool.id}
                    className={`flex items-center gap-2.5 px-2.5 py-[6px] rounded-lg transition-colors ${
                      tool.enabled ? 'bg-accent/15' : 'opacity-30'
                    }`}
                  >
                    <Checkbox
                      checked={tool.enabled}
                      onCheckedChange={() => onToggleTool(server.id, tool.id)}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs text-foreground font-mono">{tool.name}</code>
                      </div>
                      <p className="text-xs text-muted-foreground/40 mt-px truncate">{tool.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border/30 mt-2.5 mb-2" />

              {/* Remove */}
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onRemove(server.id)}
                className="flex items-center gap-1.5 text-xs text-destructive/50 hover:text-destructive transition-colors"
              >
                <Trash2 size={9} />
                移除服务
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ===========================
// Tool Section (MCP Config)
// ===========================

export function ToolSection() {
  const [servers, setServers] = useState<MCPServer[]>(MOCK_MCP_SERVERS);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [addSearch, setAddSearch] = useState('');

  const handleToggleTool = (serverId: string, toolId: string) => {
    setServers(prev => prev.map(s =>
      s.id === serverId
        ? { ...s, tools: s.tools.map(t => t.id === toolId ? { ...t, enabled: !t.enabled } : t) }
        : s
    ));
  };

  const handleRemoveServer = (serverId: string) => {
    setServers(prev => prev.filter(s => s.id !== serverId));
  };

  const handleToggleConnection = (serverId: string) => {
    setServers(prev => prev.map(s =>
      s.id === serverId
        ? { ...s, status: s.status === 'connected' ? 'disconnected' : 'connected' }
        : s
    ));
  };

  const handleAddServer = (id: string) => {
    const available = AVAILABLE_SERVERS.find(s => s.id === id);
    if (!available) return;
    const newServer: MCPServer = {
      id: available.id,
      name: available.name,
      description: available.description,
      icon: available.icon,
      status: 'disconnected',
      endpoint: `stdio://mcp-${available.name.toLowerCase()}`,
      version: '1.0.0',
      tools: [],
    };
    setServers(prev => [...prev, newServer]);
    setShowAddPicker(false);
    setAddSearch('');
  };

  const usedIds = new Set(servers.map(s => s.id));
  const availableFiltered = AVAILABLE_SERVERS.filter(s =>
    !usedIds.has(s.id) && (!addSearch || s.name.toLowerCase().includes(addSearch.toLowerCase()))
  );

  const totalTools = servers.reduce((acc, s) => acc + s.tools.length, 0);
  const enabledTools = servers.reduce((acc, s) => acc + s.tools.filter(t => t.enabled).length, 0);
  const connectedCount = servers.filter(s => s.status === 'connected').length;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Typography variant="subtitle" className="mb-1">MCP 工具配置</Typography>
        <p className="text-xs text-muted-foreground/60">管理 MCP 服务连接和工具权限</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          <Server size={10} className="text-muted-foreground/40" />
          <span className="text-muted-foreground/50">{connectedCount}/{servers.length} 服务已连接</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Wrench size={10} className="text-muted-foreground/40" />
          <span className="text-muted-foreground/50">{enabledTools}/{totalTools} 工具已启用</span>
        </div>
      </div>

      {/* Server List */}
      <div>
        <label className="text-sm text-muted-foreground/60 mb-2 block">MCP 服务</label>
        {servers.length === 0 ? (
          <div className="border border-dashed border-border/20 rounded-xl p-8 flex flex-col items-center">
            <Plug size={22} strokeWidth={1.2} className="text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground/40 mb-1">暂未添加 MCP 服务</p>
            <p className="text-xs text-muted-foreground/50">添加 MCP 服务后，助手可以调用外部工具</p>
          </div>
        ) : (
          <div className="space-y-2">
            {servers.map(server => (
              <ServerCard
                key={server.id}
                server={server}
                onToggleTool={handleToggleTool}
                onRemove={handleRemoveServer}
                onToggleConnection={handleToggleConnection}
              />
            ))}
          </div>
        )}

        {/* Add Server */}
        <Popover open={showAddPicker} onOpenChange={(open) => { setShowAddPicker(open); if (!open) setAddSearch(''); }}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="xs"
              className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors border-border/15 hover:border-border/30 mt-2.5"
            >
              <Plus size={10} /> 添加 MCP 服务
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-2 min-w-[260px]">
            <div className="mb-2">
              <SearchInput value={addSearch} onChange={setAddSearch} placeholder="搜索可用服务..." autoFocus />
            </div>
            {availableFiltered.length === 0 ? (
              <p className="text-xs text-muted-foreground/40 px-2 py-3 text-center">没有更多可用的服务</p>
            ) : (
              availableFiltered.map(s => (
                <Button size="inline"
                  key={s.id}
                  variant="ghost"
                  onClick={() => handleAddServer(s.id)}
                  className="flex items-center gap-2.5 w-full justify-start px-2.5 py-2 rounded-lg text-left hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground/40">{s.description}</div>
                  </div>
                  <Plus size={10} className="text-muted-foreground/40 flex-shrink-0" />
                </Button>
              ))
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-info/5 border border-info/12">
        <AlertCircle size={12} className="text-info/50 flex-shrink-0 mt-px" />
        <div>
          <p className="text-xs text-info/60">MCP (Model Context Protocol) 允许模型安全地调用外部工具。</p>
          <p className="text-xs text-info/40 mt-0.5">仅启用必要的工具可以提高安全性和响应速度。</p>
        </div>
      </div>
    </div>
  );
}
