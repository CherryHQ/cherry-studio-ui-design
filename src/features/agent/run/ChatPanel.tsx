import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { MessageList } from '@/app/components/shared/Chat/MessageList';
import { UserMessage, AgentMessageGroup, useGroupedMessages } from './AgentMessageRenderer';
import { WorkflowPanel } from './WorkflowPanel';
import type { AgentChatMessage } from '@/app/types/agent';
import type { WorkflowStep } from '@/app/types/chat';

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
    <div className="flex flex-col h-full">
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
            />
          );
        })}
      </MessageList>

      {/* Input Bar */}
      <div className="flex-shrink-0 border-t border-border/40 px-3 py-2.5">
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-1.5">
          <button className="text-muted-foreground/50 hover:text-foreground transition-colors" title="附件">
            <Paperclip size={14} />
          </button>
          <input
            className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/40 outline-none"
            placeholder="输入消息..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`transition-colors ${input.trim() ? 'text-cherry-primary hover:text-cherry-primary-dark' : 'text-muted-foreground/30'}`}
            onClick={handleSend}
            disabled={!input.trim()}
            title="发送"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}