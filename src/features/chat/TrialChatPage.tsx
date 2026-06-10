import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp, Check, Hash, MessageCircle, MessageSquare, Plus, Sparkles,
  Trash2, User as UserIcon, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  EmptyState, Textarea,
} from '@cherry-studio/ui';
import {
  appendTrialMessage, discardTrial, keepTrial, useTrial,
} from '@/app/stores/trialAssistantStore';

// 一些 mock 的"普通"对话占位，让侧边栏看起来像真的聊天列表，便于演示
// "切换到其他对话仍保留试聊" 的关键行为。
const MOCK_OTHER_CHATS = [
  { id: 'c-1', title: '产品周报 v3 草稿', preview: '帮我把上周的进展整理成一段...', when: '今天' },
  { id: 'c-2', title: 'iOS 上传卡死排查', preview: '看了下 stacktrace，主要是...', when: '昨天' },
  { id: 'c-3', title: '面试题：滑动窗口', preview: '给一个 O(n) 解法 + 思路解释', when: '昨天' },
  { id: 'c-4', title: '订阅成长曲线分析', preview: '上传了 5 月留存数据', when: '本周' },
];

const ASSISTANT_REPLIES = [
  '收到，我来按你提示词里设定的风格回应。\n\n这是一段演示性回复——在原型里我们不调用真实模型，目的是让你看到试聊的完整交互。',
  '好的。基于你这条消息，我会按预设的角色给出回应：\n\n1. 第一点\n2. 第二点\n3. 第三点',
  '这是一个 mock 回复，用来演示「试聊」过程中消息也会被正确追加，并且会被「丢弃」时一并清掉。',
];

interface KeepToast {
  name: string;
}

export function TrialChatPage() {
  const trial = useTrial();
  const [selected, setSelected] = useState<'trial' | string>('trial');
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [keepToast, setKeepToast] = useState<KeepToast | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 当 trial 状态从无到有 / 切换 preset 时，自动 focus 到试聊。
  useEffect(() => {
    if (trial) setSelected('trial');
  }, [trial?.preset.id]);

  // Auto-scroll on new message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [trial?.messages.length, isReplying]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!keepToast) return;
    const t = setTimeout(() => setKeepToast(null), 3000);
    return () => clearTimeout(t);
  }, [keepToast]);

  const handleSend = () => {
    if (!input.trim() || !trial || isReplying) return;
    appendTrialMessage({ role: 'user', content: input.trim() });
    setInput('');
    setIsReplying(true);
    setTimeout(() => {
      const reply = ASSISTANT_REPLIES[trial.messages.length % ASSISTANT_REPLIES.length];
      appendTrialMessage({ role: 'assistant', content: reply });
      setIsReplying(false);
    }, 700 + Math.random() * 500);
  };

  const handleKeep = () => {
    if (!trial) return;
    const snapshot = keepTrial();
    if (snapshot) {
      // mock：实际产品里这里会把 snapshot.preset 持久化为"我的助手"，
      // 然后把当前 topic 挂到那个助手下。原型只需要 toast 表达成功。
      setKeepToast({ name: snapshot.preset.name });
    }
  };

  const handleDiscardClick = () => {
    if (!trial) return;
    const hasUserMsg = trial.messages.some(m => m.role === 'user');
    if (hasUserMsg) {
      setDiscardConfirm(true);
    } else {
      discardTrial();
    }
  };

  const userMsgCount = useMemo(
    () => trial?.messages.filter(m => m.role === 'user').length ?? 0,
    [trial?.messages],
  );

  return (
    <div className="flex-1 flex min-h-0 bg-background">
      {/* 侧边栏 ——「试聊中」分组 + mock 普通对话列表 */}
      <aside className="w-[240px] flex-shrink-0 border-r border-border/15 bg-background/50 flex flex-col min-h-0">
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-sm text-foreground tracking-tight">默认助手</h2>
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground/50 hover:text-foreground">
            <Plus size={12} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-3 scrollbar-thin">
          {/* 试聊中 */}
          {trial && (
            <div>
              <div className="flex items-center gap-1.5 px-2.5 py-1">
                <Sparkles size={9} className="text-accent-violet/60" />
                <span className="text-xs text-accent-violet/70">试聊中</span>
              </div>
              <button
                onClick={() => setSelected('trial')}
                className={`group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all border ${
                  selected === 'trial'
                    ? 'bg-accent-violet/[0.08] border-accent-violet/30'
                    : 'border-dashed border-accent-violet/30 hover:bg-accent-violet/[0.04]'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${trial.preset.avatarBg}`}>
                  {trial.preset.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{trial.preset.name}</div>
                  <div className="text-xs text-muted-foreground/60 truncate">
                    {trial.messages.length === 0 ? '尚未开始' : `${trial.messages.length} 条消息`}
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* 我的对话 — mock */}
          <div>
            <div className="flex items-center gap-1.5 px-2.5 py-1">
              <MessageSquare size={9} className="text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/40">我的对话</span>
            </div>
            {MOCK_OTHER_CHATS.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full flex items-start gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  selected === c.id
                    ? 'bg-accent/60 text-foreground'
                    : 'text-muted-foreground/70 hover:bg-accent/30 hover:text-foreground'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground/40 truncate mt-0.5">{c.preview}</div>
                </div>
                <span className="text-xs text-muted-foreground/30 flex-shrink-0 mt-px">{c.when}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 主区 */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {selected === 'trial' && trial ? (
          <TrialConversation
            trial={trial}
            input={input}
            isReplying={isReplying}
            onInputChange={setInput}
            onSend={handleSend}
            onKeep={handleKeep}
            onDiscard={handleDiscardClick}
            scrollRef={scrollRef}
          />
        ) : selected === 'trial' && !trial ? (
          <EmptyTrialFallback />
        ) : (
          <PlaceholderChat
            title={MOCK_OTHER_CHATS.find(c => c.id === selected)?.title ?? '对话'}
          />
        )}
      </main>

      {/* 丢弃确认 */}
      <Dialog open={discardConfirm} onOpenChange={(open) => { if (!open) setDiscardConfirm(false); }}>
        <DialogContent
          showCloseButton={false}
          className="!max-w-[400px] sm:!max-w-[400px] !w-[min(400px,90vw)] !p-0 !gap-0 !rounded-2xl overflow-hidden border border-border/20 shadow-xl"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>丢弃试聊</DialogTitle>
          </DialogHeader>
          <div className="px-5 pt-5 pb-3">
            <div className="text-sm font-medium text-foreground">丢弃试聊？</div>
            <p className="text-xs text-muted-foreground/70 leading-relaxed mt-2">
              将删除 {userMsgCount} 条消息以及整个试聊会话。此操作不可恢复。
            </p>
          </div>
          <DialogFooter className="px-5 py-3 border-t border-border/15 bg-muted/15">
            <Button variant="ghost" size="sm" onClick={() => setDiscardConfirm(false)}>取消</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                discardTrial();
                setDiscardConfirm(false);
              }}
              className="gap-1.5"
            >
              <Trash2 size={12} />
              丢弃
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 保留 toast */}
      <AnimatePresence>
        {keepToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-foreground text-background text-xs shadow-lg"
          >
            <Check size={12} className="text-emerald-400" />
            <span>「{keepToast.name}」已加入我的助手</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrialConversation({
  trial, input, isReplying, onInputChange, onSend, onKeep, onDiscard, scrollRef,
}: {
  trial: NonNullable<ReturnType<typeof useTrial>>;
  input: string;
  isReplying: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onKeep: () => void;
  onDiscard: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      {/* 顶部 breadcrumb */}
      <div className="h-11 flex items-center justify-between px-5 flex-shrink-0 border-b border-border/10">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${trial.preset.avatarBg}`}>
            {trial.preset.emoji}
          </div>
          <span className="text-foreground">{trial.preset.name}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-muted-foreground/60">试聊</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <Hash size={11} />
          <span>{trial.modelId}</span>
        </div>
      </div>

      {/* 消息流 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
        {trial.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 ${trial.preset.avatarBg}`}>
              {trial.preset.emoji}
            </div>
            <div className="text-sm text-foreground">{trial.preset.name}</div>
            <p className="text-xs text-muted-foreground/60 text-center max-w-[320px] leading-relaxed mt-2">
              {trial.preset.description}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/40">
              <Sparkles size={10} />
              <span>试聊：发消息试试，不满意可以直接丢弃</span>
            </div>
          </div>
        ) : (
          <div className="max-w-[760px] mx-auto space-y-4">
            {trial.messages.map(m => (
              <Bubble key={m.id} role={m.role} content={m.content} avatar={trial.preset.emoji} avatarBg={trial.preset.avatarBg} />
            ))}
            {isReplying && (
              <div className="flex items-center gap-2 pl-9 text-xs text-muted-foreground/50">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span>正在回复…</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 试聊横幅 + 输入框 */}
      <div className="px-6 pb-5 pt-1 flex-shrink-0">
        <div className="max-w-[760px] mx-auto">
          <TrialBanner trial={trial} onKeep={onKeep} onDiscard={onDiscard} />
          <div className="rounded-2xl border border-border/40 bg-background shadow-sm">
            <Textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder={`和「${trial.preset.name}」聊聊…`}
              rows={1}
              className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none px-4 pt-3.5 pb-1"
              style={{ minHeight: 48 }}
            />
            <div className="flex items-center justify-end px-3 pb-2.5 pt-0.5">
              <Button
                onClick={onSend}
                disabled={!input.trim() || isReplying}
                size="icon-sm"
                className="rounded-full disabled:opacity-30"
              >
                <ArrowUp size={14} strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TrialBanner({
  trial, onKeep, onDiscard,
}: {
  trial: NonNullable<ReturnType<typeof useTrial>>;
  onKeep: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border border-accent-violet/25 bg-accent-violet/[0.06]">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Sparkles size={11} className="text-accent-violet/70 flex-shrink-0" />
        <div className="text-xs text-foreground truncate">
          正在试聊：<span className="font-medium">{trial.preset.name}</span>
          <span className="text-muted-foreground/60"> · 尚未加入助手列表</span>
          {trial.usingGlobalDefault && (
            <span className="text-muted-foreground/60"> · 使用默认模型：{trial.modelId}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button size="xs" variant="ghost" onClick={onDiscard} className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive">
          <X size={11} className="mr-1" />
          丢弃
        </Button>
        <Button size="xs" onClick={onKeep} className="h-7 px-3 text-xs gap-1">
          <Check size={11} />
          保留此助手
        </Button>
      </div>
    </div>
  );
}

function Bubble({ role, content, avatar, avatarBg }: {
  role: 'user' | 'assistant';
  content: string;
  avatar: string;
  avatarBg: string;
}) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
        isUser ? 'bg-primary text-primary-foreground' : avatarBg
      }`}>
        {isUser ? <UserIcon size={12} /> : avatar}
      </div>
      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : 'bg-accent/40 text-foreground rounded-bl-md'
      }`}>
        {content}
      </div>
    </motion.div>
  );
}

function PlaceholderChat({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <MessageCircle size={32} className="text-muted-foreground/30 mb-3" />
      <div className="text-sm text-foreground">{title}</div>
      <p className="text-xs text-muted-foreground/50 mt-1.5 max-w-[360px] leading-relaxed">
        （原型占位）这是一条普通对话——试聊会话仍在左侧「试聊中」分组里，没有被丢弃。
      </p>
    </div>
  );
}

function EmptyTrialFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <EmptyState
        preset="no-chat"
        title="试聊已结束"
        compact
      />
    </div>
  );
}
