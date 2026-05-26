import React, { useState, useMemo } from 'react';
import { Info, Plug } from 'lucide-react';
import { Typography, SimpleTooltip, Switch, EmptyState } from '@cherry-studio/ui';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@cherrystudio/ui/components/primitives/select';

// ===========================
// Assistant MCP Settings
// ===========================
// Mirrors Cherry Studio source's AssistantMCPSettings exactly:
//   1. Title + ⓘ tooltip
//   2. Mode selector — Radio cards (disabled / auto / manual)
//   3. When mode === 'manual': counter + flat server list with one
//      Switch per MCP server. Disabled servers (i.e. not connected
//      in the global MCP settings) show as opacity-reduced and the
//      Switch is locked off with a tooltip.
// The previous per-tool expand/collapse + add-server picker pattern
// is dropped — source doesn't surface them here. MCP servers are
// authored/connected in the global MCP settings, this view only
// toggles which ones the assistant may call.

type McpMode = 'disabled' | 'auto' | 'manual';

interface AssistantMCPServer {
  id: string;
  name: string;
  description?: string;
  baseUrl?: string;
  /** Whether the server is connected/active at the global level. */
  isActive: boolean;
}

const MOCK_MCP_SERVERS: AssistantMCPServer[] = [
  { id: 'mcp-filesystem', name: 'Filesystem', description: '本地文件系统读写、搜索和管理', baseUrl: 'stdio://mcp-filesystem',     isActive: true },
  { id: 'mcp-browser',    name: 'Browser',    description: '网页浏览、截图和内容提取',     baseUrl: 'stdio://mcp-browser',        isActive: true },
  { id: 'mcp-github',     name: 'GitHub',     description: 'GitHub 仓库、Issue 和 PR 管理', baseUrl: 'https://mcp.github.io/api',  isActive: true },
  { id: 'mcp-database',   name: 'Database',   description: 'SQL 数据库查询与管理',         baseUrl: 'stdio://mcp-postgres',       isActive: false },
  { id: 'mcp-slack',      name: 'Slack',      description: '发送消息、管理频道',           baseUrl: 'https://mcp.slack.dev',      isActive: true },
  { id: 'mcp-notion',     name: 'Notion',     description: '页面读写、数据库操作',         baseUrl: 'https://mcp.notion.so',      isActive: false },
];

const MODE_OPTIONS: { id: McpMode; label: string; description: string }[] = [
  { id: 'disabled', label: '关闭', description: '助手不会调用任何 MCP 工具。' },
  { id: 'auto',     label: '自动', description: '让模型根据上下文自行决定调用哪些 MCP 工具。' },
  { id: 'manual',   label: '手动', description: '仅允许下方手动勾选的 MCP 服务被调用。' },
];

export function ToolSection() {
  const [mode, setMode] = useState<McpMode>('manual');
  const [selectedIds, setSelectedIds] = useState<string[]>(['mcp-filesystem', 'mcp-browser']);

  const toggleServer = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const activeCount = useMemo(
    () => selectedIds.filter(id => MOCK_MCP_SERVERS.find(s => s.id === id)?.isActive).length,
    [selectedIds],
  );

  return (
    <div className="max-w-3xl space-y-5">
      {/* MCP enable Switch + 调用方式 Select. Reads as two standard
          form rows instead of a floating segmented chip — clearer
          affordance + the description sits under the Select where
          users naturally look for field hints. */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-sm text-foreground/85">启用 MCP</label>
            <SimpleTooltip content="关闭后助手不会调用任何 MCP 工具" side="top" sideOffset={6}>
              <button type="button" tabIndex={-1}
                className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground cursor-help">
                <Info size={12} />
              </button>
            </SimpleTooltip>
          </div>
          <Switch
            checked={mode !== 'disabled'}
            onCheckedChange={(v) => setMode(v ? 'auto' : 'disabled')}
            className="flex-shrink-0"
          />
        </div>

        {mode !== 'disabled' && (
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-foreground/85">调用方式</label>
            <div className="flex flex-col items-end gap-1">
              <Select value={mode} onValueChange={(v) => setMode(v as McpMode)}>
                <SelectTrigger className="h-8 w-[140px] text-sm border-border/40 bg-muted/30 hover:bg-muted/40 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动</SelectItem>
                  <SelectItem value="manual">手动</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground/55 text-right max-w-[280px]">
                {MODE_OPTIONS.find(o => o.id === mode)?.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual mode: server list */}
      {mode === 'manual' && (
        <div>
          {MOCK_MCP_SERVERS.length > 0 && (
            <div className="text-xs text-muted-foreground/60 mb-2">
              {activeCount} / {MOCK_MCP_SERVERS.length} 启用中
            </div>
          )}
          {MOCK_MCP_SERVERS.length === 0 ? (
            <EmptyState preset="no-resource" title="没有可用的 MCP 服务"
              description="请先在「设置 → MCP」中连接服务" compact />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-0.5">
              {MOCK_MCP_SERVERS.map(server => {
                const enabled = selectedIds.includes(server.id);
                const switchEl = (
                  <Switch
                    checked={enabled && server.isActive}
                    disabled={!server.isActive}
                    onCheckedChange={() => toggleServer(server.id)}
                    className="flex-shrink-0"
                  />
                );
                const rowTooltip = server.baseUrl;
                const row = (
                  <div
                    key={server.id}
                    title={rowTooltip}
                    className={`flex items-center gap-3 px-2.5 py-1.5 rounded-md hover:bg-accent/15 transition-colors ${
                      server.isActive ? '' : 'opacity-60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-foreground truncate leading-tight">{server.name}</div>
                      {server.description && (
                        <div className="text-[11px] text-muted-foreground/55 truncate mt-0.5 leading-snug">{server.description}</div>
                      )}
                    </div>
                    {server.isActive ? (
                      switchEl
                    ) : (
                      <SimpleTooltip content="请先在「设置 → MCP」中启用该服务" side="left" sideOffset={6}>
                        <span className="inline-flex">{switchEl}</span>
                      </SimpleTooltip>
                    )}
                  </div>
                );
                return row;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
