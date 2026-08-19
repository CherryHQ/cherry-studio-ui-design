import { useState } from 'react';
import { Check, RotateCcw, UserRound } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { useAuth, type DemoState, type GoState } from '@/app/context/AuthContext';

// 「账号演示」切换器 —— 设计评审用的全局工具，固定在窗口右下角、分支预览的旁边。
// 两个独立维度：
//   - 账号：未登录 / 内测 / 普通（免费额度是黑盒，差别全靠"看得见/看不见"体现）
//   - Cherry Go：未订阅 / 已订阅 / 额度打满两种（订阅跟账号走，登出即清）
// 没有这个切换器，评审时要真的注册账号、订阅、把额度用完才能看全所有形态。
const STATES: { id: DemoState; title: string; desc: string }[] = [
  { id: 'logged-out', title: '未登录', desc: '模型选择器里没有 CherryAI' },
  { id: 'beta', title: '已登录 · 内测账号', desc: 'CherryAI 免费模型可用（默认）' },
  { id: 'standard', title: '已登录 · 普通账号', desc: '不在内测白名单，看不到免费模型' },
  { id: 'beta-exhausted', title: '内测账号 · 额度用完', desc: '礼物标识变灰，选中时提示' },
];

const GO_STATES: { id: GoState; title: string; desc: string }[] = [
  { id: 'none', title: '未订阅', desc: '模型列表里只有一行「旗舰开源模型 · 订阅」' },
  { id: 'active', title: '已订阅', desc: 'Go 组置顶，用量页有数据' },
  { id: 'limit-5h', title: '5 小时额度打满', desc: 'Go 模型置灰，可在网页端重置' },
  { id: 'limit-month', title: '本月额度打满', desc: '锁到下月重置（先不做加购）' },
  { id: 'expired', title: '订阅已过期', desc: '客户端回到订阅引导，「我的订阅」页引导续费' },
];

export function AccountDemoSwitcher() {
  const [open, setOpen] = useState(false);
  const {
    demoState, applyDemoState, goState, applyGoDemoState,
    isLoggedIn, replayOnboarding, onboardingSeen,
  } = useAuth();
  const current = STATES.find(s => s.id === demoState);
  const currentGo = GO_STATES.find(s => s.id === goState);

  const badgeLabel = isLoggedIn && goState !== 'none'
    ? `${current?.title ?? '账号'} · Go`
    : current?.title ?? '账号';

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
          {badgeLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={6} className="w-[276px] p-1.5 max-h-[70vh] overflow-y-auto scrollbar-thin">
        <div className="px-2 pt-1.5 pb-1 text-[11px] font-medium text-muted-foreground/70">
          账号演示 · 账号状态
        </div>
        {STATES.map(s => (
          <StateRow
            key={s.id}
            title={s.title}
            desc={s.desc}
            active={demoState === s.id}
            onClick={() => applyDemoState(s.id)}
          />
        ))}

        <div className="my-1.5 h-px bg-border/50" />
        <div className="px-2 pt-0.5 pb-1 text-[11px] font-medium text-muted-foreground/70">
          Cherry Go 订阅
        </div>
        {GO_STATES.map(s => (
          <StateRow
            key={s.id}
            title={s.title}
            desc={s.desc}
            active={goState === s.id}
            onClick={() => applyGoDemoState(s.id)}
          />
        ))}
        {!isLoggedIn && (
          <div className="px-2 pt-0.5 pb-1 text-[10px] leading-relaxed text-muted-foreground/45">
            订阅跟账号走：未登录时切 Go 状态会先落到内测账号。
          </div>
        )}
        {currentGo && isLoggedIn && goState !== 'none' && (
          <div className="px-2 pt-0.5 pb-1 text-[10px] leading-relaxed text-muted-foreground/45">
            也可以去网页端（?go=1）订阅 / 重置，客户端会自动同步。
          </div>
        )}

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
          登录进来一律算内测账号；要看非白名单的形态，切到「普通账号」。
        </div>
      </PopoverContent>
    </Popover>
  );
}

function StateRow({ title, desc, active, onClick }: {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left transition-colors
        ${active ? 'bg-cherry-active-bg' : 'hover:bg-accent/40'}`}
    >
      <Check size={13} className={`mt-0.5 flex-shrink-0 ${active ? 'text-cherry-primary' : 'text-transparent'}`} />
      <span className="min-w-0">
        <span className={`block text-xs ${active ? 'text-cherry-primary font-medium' : 'text-foreground/85'}`}>
          {title}
        </span>
        <span className="block text-[11px] text-muted-foreground/60 truncate">{desc}</span>
      </span>
    </button>
  );
}
