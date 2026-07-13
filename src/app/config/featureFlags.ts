// ===========================
// Feature Flags
// ===========================
// 工作模块 V2.0+ 新能力总开关：任务管理看板、自动化（定时任务）、
// Agent IM 项目组协作，以及配套的设置项（队友 / 定时任务）。
//
// - main 分支 DEFAULT 保持 false —— 生产预览（cherry-studio-ui.vercel.app）
//   默认呈现 V2.0 的 Agent-Agent session 管理。
// - work-plus-preview 分支把 DEFAULT 置为 true；该分支与 main 的唯一 diff
//   就是这一行，同步 main 时直接 merge 即可。
// - 任何部署上都能运行时覆盖：右下角「分支预览」切换器，或 URL 带
//   ?workplus=1 / ?workplus=0。覆盖值记在 localStorage，清除后回到默认。
const WORK_PLUS_DEFAULT = false;

const OVERRIDE_KEY = 'cherry-ui-workplus-override';

function readWorkPlusOverride(): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search).get('workplus');
    if (q === '1' || q === '0') {
      localStorage.setItem(OVERRIDE_KEY, q);
      return q === '1';
    }
    const stored = localStorage.getItem(OVERRIDE_KEY);
    if (stored === '1' || stored === '0') return stored === '1';
  } catch {
    // 隐私模式等 localStorage 不可用的场景 — 回落到默认值
  }
  return null;
}

export const WORK_PLUS: boolean = readWorkPlusOverride() ?? WORK_PLUS_DEFAULT;

/** 当前 WORK_PLUS 是否来自运行时覆盖（而非分支默认值） */
export const WORK_PLUS_OVERRIDDEN: boolean = readWorkPlusOverride() !== null;

export { WORK_PLUS_DEFAULT };

/** 写入/清除运行时覆盖并整页刷新（模块级常量被各处直接引用，刷新最稳妥） */
export function setWorkPlusOverride(value: boolean | null): void {
  try {
    if (value === null) localStorage.removeItem(OVERRIDE_KEY);
    else localStorage.setItem(OVERRIDE_KEY, value ? '1' : '0');
  } catch {
    // localStorage 不可用时覆盖不生效，刷新后仍是默认值
  }
  const url = new URL(window.location.href);
  url.searchParams.delete('workplus');
  window.location.href = url.toString();
}
