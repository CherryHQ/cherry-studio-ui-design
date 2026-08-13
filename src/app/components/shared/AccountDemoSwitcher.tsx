import { useState } from 'react';
import { Check, RotateCcw, UserRound } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { useAuth, type DemoState } from '@/app/context/AuthContext';

// 「账号演示」切换器 —— 设计评审用的全局工具，固定在窗口右下角、分支预览的旁边。
// 免费额度是邀请制内测，界面上没有任何数字，四种账号状态的差别全靠"看得见 /
// 看不见"体现；没有这个切换器，评审时要真的注册两个账号、聊到额度耗尽才能看全。
const STATES: { id: DemoState; title: string; desc: string }[] = [
  { id: 'logged-out', title: '未登录', desc: '模型选择器里没有 CherryAI' },
  { id: 'beta', title: '已登录 · 内测账号', desc: 'CherryAI 免费模型可用' },
  { id: 'standard', title: '已登录 · 普通账号', desc: '不在白名单，同样看不到' },
  { id: 'beta-exhausted', title: '内测账号 · 额度用完', desc: '礼物标识变灰，选中时提示' },
];

export function AccountDemoSwitcher() {
  const [open, setOpen] = useState(false);
  const { demoState, applyDemoState, replayOnboarding, onboardingSeen } = useAuth();
  const current = STATES.find(s => s.id === demoState);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          title="账号演示"
          className={`fixed bottom-2 left-[168px] z-[95] flex items-center gap-1 h-6 px-1.5 rounded-full border text-[10px] transition-all
            ${demoState === 'logged-out'
              ? 'border-border/50 bg-background/80 text-muted-foreground/60 opacity-50 hover:opacity-100'
              : 'border-cherry-primary/50 bg-cherry-active-bg text-cherry-primary opacity-90'}
            backdrop-blur hover:text-foreground hover:border-border shadow-sm`}
        >
          <UserRound size={11} />
          {current?.title ?? '账号'}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={6} className="w-[264px] p-1.5">
        <div className="px-2 pt-1.5 pb-1 text-[11px] font-medium text-muted-foreground/70">
          账号演示 · 状态切换
        </div>
        {STATES.map(s => {
          const active = demoState === s.id;
          return (
            <button
              key={s.id}
              onClick={() => applyDemoState(s.id)}
              className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left transition-colors
                ${active ? 'bg-cherry-active-bg' : 'hover:bg-accent/40'}`}
            >
              <Check size={13} className={`mt-0.5 flex-shrink-0 ${active ? 'text-cherry-primary' : 'text-transparent'}`} />
              <span className="min-w-0">
                <span className={`block text-xs ${active ? 'text-cherry-primary font-medium' : 'text-foreground/85'}`}>
                  {s.title}
                </span>
                <span className="block text-[11px] text-muted-foreground/60 truncate">{s.desc}</span>
              </span>
            </button>
          );
        })}

        <div className="my-1.5 h-px bg-border/50" />
        <button
          onClick={() => { replayOnboarding(); setOpen(false); }}
          disabled={!onboardingSeen}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[11px] text-muted-foreground/70 hover:bg-accent/40 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <RotateCcw size={12} className="flex-shrink-0" />
          重放首启引导
        </button>
        <div className="px-2 pt-1 pb-1.5 text-[10px] leading-relaxed text-muted-foreground/45">
          走完整登录流程：手机号尾号 8 或邮箱以 beta 开头 = 内测白名单。
        </div>
      </PopoverContent>
    </Popover>
  );
}
