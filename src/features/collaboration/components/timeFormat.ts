// ===========================
// Conventional IM time display (微信/飞书 style)
// ===========================
// Used by both session list rows and topic message rows.
// - today    → "HH:MM"          e.g. "14:32"
// - yesterday→ "昨天"            (in compact list) or "昨天 HH:MM" (in message row)
// - this week→ "周一" .. "周日"
// - this year→ "M月D日"
// - older   → "YYYY/M/D"

const WEEKDAY = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export type TimeVariant = 'compact' | 'full';

export function formatTime(date: Date | string | number, variant: TimeVariant = 'compact'): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const today = startOfDay(now);
  const that = startOfDay(d);
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86400000);
  const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (diffDays <= 0) return hhmm;
  if (diffDays === 1) return variant === 'full' ? `昨天 ${hhmm}` : '昨天';
  if (diffDays < 7) {
    const wd = WEEKDAY[d.getDay()];
    return variant === 'full' ? `${wd} ${hhmm}` : wd;
  }
  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
