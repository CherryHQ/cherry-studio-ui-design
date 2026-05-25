import React, { useState, useMemo } from 'react';
import { Info, Plug } from 'lucide-react';
import { Typography, SimpleTooltip, Switch } from '@cherry-studio/ui';

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
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Typography variant="subtitle">MCP</Typography>
          <SimpleTooltip
            content="选择允许该助手调用的 MCP 服务。MCP 服务的连接与配置在全局「设置 → MCP」里完成。"
            side="top"
            sideOffset={6}
          >
            <button
              type="button"
              tabIndex={-1}
              className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground cursor-help"
              aria-label="什么是 MCP"
            >
              <Info size={13} />
            </button>
          </SimpleTooltip>
        </div>
      </div>

      {/* Mode selector — vertical radio cards matching source's
          Radio.Group with Radio.Button items */}
      <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="MCP 模式">
        {MODE_OPTIONS.map(opt => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(opt.id)}
              className={`text-left px-3 py-2 rounded-lg border transition-colors flex items-start gap-2.5 ${
                active
                  ? 'border-border bg-accent/30'
                  : 'border-border/25 bg-card/30 hover:border-border/50 hover:bg-accent/15'
              }`}
            >
              <span
                className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border mt-[3px] flex-shrink-0 transition-colors ${
                  active ? 'border-primary' : 'border-border/50'
                }`}
              >
                {active && <span className="w-[7px] h-[7px] rounded-full bg-primary" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] font-medium ${active ? 'text-foreground' : 'text-foreground/85'}`}>
                  {opt.label}
                </div>
                <div className="text-[11px] text-muted-foreground/60 mt-0.5 leading-snug">{opt.description}</div>
              </div>
            </button>
          );
        })}
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
            <div className="border border-dashed border-border/20 rounded-xl p-8 flex flex-col items-center">
              <Plug size={22} strokeWidth={1.2} className="text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground/40 mb-1">没有可用的 MCP 服务</p>
              <p className="text-xs text-muted-foreground/50">请先在「设置 → MCP」中连接服务</p>
            </div>
          ) : (
            <div className="space-y-0.5">
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
