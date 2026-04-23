import React, { useState } from 'react';
import {
  Send, Plus, Paperclip, Code2, FolderOpen,
  Globe, Hammer, Brain, MoreHorizontal,
  Maximize2, RotateCcw,
} from 'lucide-react';
import {
  Button, Textarea,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@cherry-studio/ui';
import { MessageList } from '@cherry-studio/ui';
import { UserMessage, AgentMessageGroup, useGroupedMessages } from './AgentMessageRenderer';
import { WorkflowPanel } from './WorkflowPanel';
import type { AgentChatMessage } from '@/app/types/agent';
import type { WorkflowStep } from '@/app/types/chat';

// ===========================
// Plus menu items
// ===========================
const PLUS_MENU_ITEMS = [
  { id: 'attach', label: '添加图片或附件', icon: Paperclip, separator: true },
  { id: 'code', label: '代码', icon: Code2 },
  { id: 'folder', label: '添加文件夹', icon: FolderOpen },
  { id: 'websearch', label: '网络搜索', icon: Globe },
  { id: 'mcp', label: 'MCP', icon: Hammer },
  { id: 'reasoning', label: '推理', icon: Brain },
];

const PLUS_MENU_SECONDARY = [
  { id: 'expand', label: '展开输入框', icon: Maximize2, shortcut: '⌘⇧E' },
  { id: 'clearctx', label: '清除上下文', icon: RotateCcw, shortcut: '⌘K' },
];

// ===========================
// Agent Chat Panel
// ===========================
// Composes MessageList + AgentMessageRenderer + input bar.
// Used inside AgentRunPage for the main conversation view.

export interface ChatPanelProps {
  messages: AgentChatMessage[];
  steps: WorkflowStep[];
  onSendMessage: (text: string) => void;
  onResolveUI?: (msgId: string, value: string) => void;
  onAvatarClick?: () => void;
}

export function ChatPanel({
  messages,
  steps,
  onSendMessage,
  onResolveUI,
  onAvatarClick,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const grouped = useGroupedMessages(messages);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <MessageList
        scrollDeps={[messages.length]}
        header={steps.length > 0 ? <WorkflowPanel steps={steps} /> : undefined}
      >
        {grouped.map((group, i) => {
          if (group.type === 'user') {
            return <UserMessage key={group.msg.id} msg={group.msg} />;
          }
          return (
            <AgentMessageGroup
              key={group.msgs[0].id}
              msgs={group.msgs}
              onResolve={onResolveUI ?? (() => {})}
              onAvatarClick={onAvatarClick}
              isRunning={group.msgs.some(m => m.toolCall?.status === 'running' || (m.thinking && !m.content))}
            />
          );
        })}
      </MessageList>

      {/* Input Bar */}
      <div className="flex-shrink-0 px-4 pb-3 pt-2">
        <div className="relative rounded-xl border border-border/50 bg-background shadow-sm focus-within:border-border/80 transition-all duration-150">
          <Textarea
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none resize-none min-h-[36px] max-h-[140px] leading-[1.6] px-3.5 pt-[10px] pb-[36px]"
            placeholder="在这里输入消息，按 Enter 发送"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <div className="absolute bottom-[7px] left-2.5 right-2.5 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <DropdownMenu open={showPlusMenu} onOpenChange={setShowPlusMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm"
                    className={`p-[5px] w-auto h-auto transition-colors ${
                      showPlusMenu ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}>
                    <Plus size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-44">
                  {PLUS_MENU_ITEMS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id}>
                        <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                          <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                        </DropdownMenuItem>
                        {item.separator && idx < PLUS_MENU_ITEMS.length - 1 && <DropdownMenuSeparator />}
                      </div>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2 px-2 py-[5px] text-xs text-muted-foreground">
                      <MoreHorizontal size={13} strokeWidth={1.5} className="flex-shrink-0" />
                      <span className="flex-1 text-left">更多</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {PLUS_MENU_SECONDARY.map(item => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.id} className="gap-2 px-2 py-[5px] text-xs">
                            <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.shortcut && <span className="text-xs text-muted-foreground/60 tracking-wider">{item.shortcut}</span>}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="default"
              size="icon-sm"
              className="rounded-lg p-1.5 w-auto h-auto disabled:opacity-30"
              onClick={handleSend}
              disabled={!input.trim()}
              title="发送"
            >
              <Send size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
