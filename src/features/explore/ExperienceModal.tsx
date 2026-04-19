import React, { useState, useRef, useEffect } from 'react';
import {
  X, ChevronDown, Check, Send, Bot, User,
  Wrench, Loader2, Sparkles, Plus,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import type { Agent, Assistant } from './ExploreData';
import { models } from './ExploreData';

// ===========================
// Model Selector
// ===========================

function ModelSelector({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  const selected = models.find(m => m.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-1.5 px-2.5 py-1 h-auto rounded-lg border text-xs ${
            open ? 'border-primary/30 bg-accent/50' : 'border-border/30 hover:border-border/60 hover:bg-accent/30'
          }`}
        >
          <Sparkles size={10} className="text-muted-foreground/50" />
          <span className="text-foreground">{selected?.name || '选择模型'}</span>
          <span className="text-[9px] text-muted-foreground/40">{selected?.provider}</span>
          <ChevronDown size={9} className={`text-muted-foreground/40 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-1 min-w-[220px] overflow-y-auto max-h-[280px] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {models.map(m => (
          <Button
            key={m.id}
            variant="ghost"
            onClick={() => { onSelect(m.id); setOpen(false); }}
            className={`w-full justify-start px-2.5 py-[6px] h-auto rounded-lg text-xs flex items-center gap-2 ${
              selectedId === m.id ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent/50'
            }`}
          >
            <span className="flex-1 truncate text-left">{m.name}</span>
            <span className="text-[9px] text-muted-foreground/35">{m.provider}</span>
            {m.badge && (
              <span className={`text-[8px] px-1.5 py-px rounded-full ${
                m.badge === '推荐' ? 'bg-foreground/[0.06] text-foreground/70' :
                m.badge === '热门' ? 'bg-blue-500/10 text-blue-500' :
                'bg-amber-500/10 text-amber-600'
              }`}>{m.badge}</span>
            )}
            {selectedId === m.id && <Check size={10} className="text-primary flex-shrink-0" />}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ===========================
// Chat Message
// ===========================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-accent'
      }`}>
        {isUser ? <User size={11} /> : <Bot size={11} className="text-muted-foreground" />}
      </div>
      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-accent/60 text-foreground rounded-bl-sm'
      }`}>
        {msg.content}
      </div>
    </motion.div>
  );
}

// ===========================
// Agent Tool Log
// ===========================

interface ToolLog {
  id: string;
  tool: string;
  status: 'running' | 'done' | 'error';
  detail: string;
  elapsed?: number;
}

function ToolLogItem({ log }: { log: ToolLog }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-start gap-2 px-3 py-1.5 text-xs"
    >
      <div className="mt-0.5 flex-shrink-0">
        {log.status === 'running' && <Loader2 size={10} className="text-blue-500 animate-spin" />}
        {log.status === 'done' && <CheckCircle2 size={10} className="text-foreground/60" />}
        {log.status === 'error' && <AlertCircle size={10} className="text-red-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Wrench size={9} className="text-muted-foreground/40" />
          <span className="text-foreground/70">{log.tool}</span>
          {log.elapsed !== undefined && <span className="text-[9px] text-muted-foreground/30">{log.elapsed}ms</span>}
        </div>
        <p className="text-muted-foreground/50 mt-0.5 truncate">{log.detail}</p>
      </div>
    </motion.div>
  );
}

// ===========================
// Mock responses
// ===========================

const assistantReplies = [
  "这是一个很好的问题！让我为你逐步分析。\n\n首先，我们来看核心架构。一个设计良好的系统应该在数据层、业务逻辑和展示层之间实现关注点分离……",
  "我很乐意帮助你解决这个问题。根据我的经验，以下是关键考虑因素：\n\n1. **可扩展性** — 从一开始就为水平扩展做设计\n2. **可靠性** — 实现熔断器和重试逻辑\n3. **可观测性** — 添加结构化日志和指标监控",
  "以下是我基于当前最佳实践的建议：\n\n你描述的方案是可行的，但我建议做一些优化，可以将性能提升 30-40%。",
];

const agentThinking = [
  "正在分析任务需求并规划执行策略……",
  "正在将目标分解为可执行的子任务……",
  "正在识别所需工具和数据源……",
];

const agentToolLogs: ToolLog[][] = [
  [
    { id: 'tl1', tool: 'web_search', status: 'done', detail: '搜索最新文档和参考资料', elapsed: 1240 },
    { id: 'tl2', tool: 'code_interpreter', status: 'done', detail: '分析代码结构和依赖关系', elapsed: 890 },
    { id: 'tl3', tool: 'file_write', status: 'done', detail: '生成包含分析结果的输出报告', elapsed: 340 },
  ],
];

// ===========================
// Main Modal
// ===========================

interface ExperienceModalProps {
  resource: Agent | Assistant;
  type: 'agent' | 'assistant';
  onClose: () => void;
}

export function ExperienceModal({ resource, type, onClose }: ExperienceModalProps) {
  const [modelId, setModelId] = useState(resource.recommended_model);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolLogs, setToolLogs] = useState<ToolLog[]>([]);
  const [thinking, setThinking] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [added, setAdded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, toolLogs, thinking]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    const userMsg: Message = { id: `m-${Date.now()}`, role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    if (type === 'assistant') {
      setTimeout(() => {
        const reply = assistantReplies[messages.length % assistantReplies.length];
        setMessages(prev => [...prev, { id: `m-${Date.now()}`, role: 'assistant', content: reply }]);
        setIsProcessing(false);
      }, 800 + Math.random() * 600);
    } else {
      // Agent: show thinking -> tool logs -> response
      const thinkText = agentThinking[messages.length % agentThinking.length];
      setThinking(thinkText);
      const logs = agentToolLogs[0];
      let delay = 1200;
      setTimeout(() => setThinking(''), delay);

      logs.forEach((log, i) => {
        const d = delay + (i + 1) * 800;
        setTimeout(() => {
          if (i === 0) setToolLogs([]);
          setToolLogs(prev => [...prev, { ...log, id: `tl-${Date.now()}-${i}`, status: i < logs.length - 1 ? 'done' : 'done' }]);
        }, d);
      });

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `m-${Date.now()}`,
          role: 'assistant',
          content: "任务已成功完成。我已分析需求并生成输出。以下是完成情况的摘要：\n\n\u2022 搜索并收集了相关文档资料\n\u2022 分析了代码库结构\n\u2022 生成了包含建议的综合报告",
        }]);
        setIsProcessing(false);
      }, delay + logs.length * 800 + 500);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-popover border border-border/30 rounded-2xl shadow-2xl w-[580px] max-w-[580px] max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0 [&>button:last-child]:hidden">
        {/* Hidden DialogHeader for accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>{resource.name}</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/15">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-base flex-shrink-0">
              {resource.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground truncate">{resource.name}</span>
                <span className="text-[9px] px-1.5 py-px rounded-full bg-accent text-muted-foreground/60 uppercase tracking-wide">
                  {type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/40 truncate mt-px">作者: {resource.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ModelSelector selectedId={modelId} onSelect={setModelId} />
            <Button variant="ghost" size="icon" onClick={onClose}
              className="w-6 h-6 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-accent">
              <X size={13} />
            </Button>
          </div>
        </div>

        {/* Chat / Task area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[300px] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
          {messages.length === 0 && !thinking && (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="w-12 h-12 rounded-2xl bg-accent/60 flex items-center justify-center text-xl mb-3">{resource.avatar}</div>
              <p className="text-sm text-foreground/80 mb-1">{resource.name}</p>
              <p className="text-xs text-muted-foreground/40 text-center max-w-[300px] leading-relaxed">{resource.description}</p>
              {type === 'agent' && (
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground/30">
                  <Wrench size={9} />
                  <span>该智能体可以使用工具来完成任务</span>
                </div>
              )}
            </div>
          )}

          {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}

          {/* Agent thinking */}
          <AnimatePresence>
            {thinking && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/[0.06] border border-blue-500/10"
              >
                <Loader2 size={10} className="text-blue-500 animate-spin" />
                <span className="text-xs text-blue-600/70">{thinking}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tool logs */}
          {toolLogs.length > 0 && (
            <div className="rounded-lg border border-border/15 bg-muted/[0.03] overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/10">
                <Wrench size={9} className="text-muted-foreground/35" />
                <span className="text-xs text-muted-foreground/40">工具执行</span>
              </div>
              {toolLogs.map(log => <ToolLogItem key={log.id} log={log} />)}
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && !thinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 py-1"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground/25"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="px-5 pb-3 pt-1 border-t border-border/15">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={type === 'agent' ? '描述你的任务……' : '输入消息……'}
                rows={1}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/30 bg-accent/20 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/25 focus:ring-1 focus:ring-primary/10 resize-none transition-all leading-relaxed"
                style={{ minHeight: 40, maxHeight: 120 }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              size="icon"
              className="w-8 h-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 flex-shrink-0 active:scale-95"
            >
              <Send size={12} />
            </Button>
          </div>

          {/* Footer: Add to library */}
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[9px] text-muted-foreground/25">
              模型: {models.find(m => m.id === modelId)?.name}
            </span>
            <Button
              variant="ghost"
              onClick={() => setAdded(true)}
              disabled={added}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 h-auto rounded-lg ${
                added
                  ? 'bg-cherry-active-bg text-cherry-primary-dark'
                  : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent'
              }`}
            >
              {added ? <Check size={9} /> : <Plus size={9} />}
              <span>{added ? '已添加到资源库' : '添加到我的资源库'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
