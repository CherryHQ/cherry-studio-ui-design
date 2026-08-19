import React, { useState } from 'react';
import { ArrowUpRight, Gauge, MessageSquareText, Palette, Settings } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, Progress } from '@cherry-studio/ui';
import { useAuth } from '@/app/context/AuthContext';
import { buildGoPageUrl } from '@/app/lib/authStorage';
import { FEEDBACK_URL, GO_PROMO_TEXT, getGoUsage, usagePercent } from '@/app/config/goPlan';

// ===========================
// 设置入口菜单
// ===========================
// 侧边栏底部「设置」不再直接进设置页，而是先弹这个菜单（参考 Codex / Claude
// 的入口习惯）：订阅额度 → 外观 → 设置 → 帮助与反馈。
// - 「订阅额度」是富行：已订阅 Go 时带一条 5 小时额度的 mini 进度条；
//   未订阅显示「未订阅 Go」。点击进设置页的「订阅额度」。
// - Free 是黑盒：这里**不**出现任何 free 额度数字。
// - 「帮助与反馈」是外链。

export function SettingsMenu({
  children,
  onNavigate,
  side = 'top',
  align = 'start',
}: {
  /** 触发器（侧边栏里的那颗设置按钮） */
  children: React.ReactNode;
  /** 进入设置页；section 缺省 = 设置首页 */
  onNavigate: (section?: string) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const { goSubscribed, goState } = useAuth();

  const fiveHour = getGoUsage(goState).find(w => w.key === '5h');
  const fiveHourPct = fiveHour ? usagePercent(fiveHour) : 0;

  const navigate = (section?: string) => {
    setOpen(false);
    onNavigate(section);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side={side} align={align} sideOffset={6} className="w-[224px] p-1.5">
        {/* 订阅额度 —— 富行。已订阅：5h 额度 mini 进度条，点击进设置的订阅额度页；
            未订阅：第二行是「$10 畅享旗舰开源模型 →」引导，点击跳网页端订阅 */}
        {goSubscribed ? (
          <button
            onClick={() => navigate('usage-billing')}
            className="w-full flex flex-col gap-1.5 px-2 py-2 rounded-lg text-left hover:bg-accent/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Gauge size={14} className="text-muted-foreground/70 flex-shrink-0" />
              <span className="text-xs text-foreground/85 flex-1">订阅额度</span>
              <span className="text-[10px] tabular-nums text-muted-foreground/60">{fiveHourPct}%</span>
            </span>
            <span className="flex items-center gap-2 pl-[22px]">
              <Progress
                value={fiveHourPct}
                className={`h-1 flex-1 bg-muted-foreground/15 ${fiveHourPct >= 100 ? '[&>[data-slot=progress-indicator]]:bg-destructive/70' : '[&>[data-slot=progress-indicator]]:bg-cherry-primary/70'}`}
              />
              <span className="text-[10px] text-muted-foreground/45 flex-shrink-0">5h 额度</span>
            </span>
          </button>
        ) : (
          <button
            onClick={() => {
              setOpen(false);
              window.open(buildGoPageUrl(), '_blank')?.focus();
            }}
            className="group w-full flex flex-col gap-1 px-2 py-2 rounded-lg text-left hover:bg-accent/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Gauge size={14} className="text-muted-foreground/70 flex-shrink-0" />
              <span className="text-xs text-foreground/85 flex-1">订阅额度</span>
            </span>
            <span className="flex items-center gap-2 pl-[22px]">
              <span className="text-[11px] text-muted-foreground/60 group-hover:text-foreground/70 transition-colors flex-1">
                {GO_PROMO_TEXT}
              </span>
              <ArrowUpRight size={11} className="text-muted-foreground/40 group-hover:text-foreground/60 transition-colors flex-shrink-0" />
            </span>
          </button>
        )}

        <MenuRow icon={<Palette size={14} />} label="外观" onClick={() => navigate('appearance')} />
        <MenuRow icon={<Settings size={14} />} label="设置" onClick={() => navigate()} />
        <MenuRow
          icon={<MessageSquareText size={14} />}
          label="帮助与反馈"
          trailing={<ArrowUpRight size={11} className="text-muted-foreground/40" />}
          onClick={() => {
            setOpen(false);
            window.open(FEEDBACK_URL, '_blank')?.focus();
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function MenuRow({
  icon, label, trailing, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-accent/40 transition-colors"
    >
      <span className="text-muted-foreground/70 flex-shrink-0">{icon}</span>
      <span className="text-xs text-foreground/85 flex-1">{label}</span>
      {trailing}
    </button>
  );
}
