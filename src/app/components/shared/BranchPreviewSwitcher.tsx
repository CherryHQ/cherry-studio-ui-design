import { useState } from 'react';
import { GitBranch, Check, ExternalLink, RotateCcw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import {
  WORK_PLUS, WORK_PLUS_DEFAULT, WORK_PLUS_OVERRIDDEN, setWorkPlusOverride,
} from '@/app/config/featureFlags';
import { PREVIEW_BRANCHES } from '@/app/config/previewBranches';

// 「分支预览」切换器 — 设计评审用的全局工具，固定在窗口右下角。
// 两层能力：
// 1. 同部署即时切换 WORK_PLUS（V2.0 基线 ↔ 工作模块新能力），运行时覆盖，
//    无需跳转到别的分支部署；
// 2. 跨分支跳转链接（PREVIEW_BRANCHES 目录），跳到各分支的 Vercel 预览。
export function BranchPreviewSwitcher() {
  const [open, setOpen] = useState(false);
  const host = typeof window !== 'undefined' ? window.location.host : '';

  const modes = [
    { value: false, title: 'V2.0 基线', desc: 'Agent-Agent session 管理' },
    { value: true, title: 'V2.0+ 新能力', desc: '任务管理 · 自动化 · IM 协作' },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          title="分支预览"
          className={`fixed bottom-2 left-24 z-[95] flex items-center gap-1 h-6 px-1.5 rounded-full border text-[10px] transition-all
            ${WORK_PLUS_OVERRIDDEN
              ? 'border-cherry-primary/50 bg-cherry-active-bg text-cherry-primary opacity-90'
              : 'border-border/50 bg-background/80 text-muted-foreground/60 opacity-50 hover:opacity-100'}
            backdrop-blur hover:text-foreground hover:border-border shadow-sm`}
        >
          <GitBranch size={11} />
          {WORK_PLUS ? 'V2.0+' : 'V2.0'}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={6} className="w-[264px] p-1.5">
        <div className="px-2 pt-1.5 pb-1 text-[11px] font-medium text-muted-foreground/70">
          当前部署 · 形态切换
        </div>
        {modes.map(m => {
          const active = WORK_PLUS === m.value;
          return (
            <button
              key={String(m.value)}
              onClick={() => { if (!active) setWorkPlusOverride(m.value); }}
              className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left transition-colors
                ${active ? 'bg-cherry-active-bg' : 'hover:bg-accent/40'}`}
            >
              <Check size={13} className={`mt-0.5 flex-shrink-0 ${active ? 'text-cherry-primary' : 'text-transparent'}`} />
              <span className="min-w-0">
                <span className={`block text-xs ${active ? 'text-cherry-primary font-medium' : 'text-foreground/85'}`}>
                  {m.title}
                  {m.value === WORK_PLUS_DEFAULT && (
                    <span className="ml-1 text-[10px] text-muted-foreground/50">本分支默认</span>
                  )}
                </span>
                <span className="block text-[11px] text-muted-foreground/60 truncate">{m.desc}</span>
              </span>
            </button>
          );
        })}
        {WORK_PLUS_OVERRIDDEN && (
          <button
            onClick={() => setWorkPlusOverride(null)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[11px] text-muted-foreground/70 hover:bg-accent/40 transition-colors"
          >
            <RotateCcw size={12} className="flex-shrink-0" />
            清除覆盖，回到本分支默认
          </button>
        )}

        <div className="my-1.5 h-px bg-border/50" />
        <div className="px-2 pb-1 text-[11px] font-medium text-muted-foreground/70">
          分支预览 · 跳转
        </div>
        {PREVIEW_BRANCHES.map(b => {
          const here = host !== '' && b.url.includes(host);
          return (
            <a
              key={b.branch}
              href={here ? undefined : b.url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors group
                ${here ? 'opacity-60 cursor-default' : 'hover:bg-accent/40'}`}
            >
              <GitBranch size={13} className="mt-0.5 flex-shrink-0 text-muted-foreground/50" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-foreground/85 truncate">
                  {b.branch}
                  {here && <span className="ml-1 text-[10px] text-muted-foreground/50">当前</span>}
                </span>
                <span className="block text-[11px] text-muted-foreground/60 truncate">{b.label}</span>
              </span>
              {!here && (
                <ExternalLink size={12} className="mt-1 flex-shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
              )}
            </a>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
