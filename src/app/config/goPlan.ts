// ===========================
// Cherry Go 订阅 —— 套餐与用量演示数据
// ===========================
// Go 是「$10/月订阅、旗舰开源模型畅享」的模式（对标 opencode 的 Go），与国内的
// CherryAI Free 内测并行存在。两条线的口径差异：
//   - Free 是黑盒：界面上不出现任何额度数字，用完只有礼物置灰 + 一句提示；
//   - Go 是明盒：5 小时 / 每周 / 每月三个窗口的额度百分比都展示出来，
//     消耗单位是**积分**（不是美元）—— 每次请求扣多少积分，明细里可查。
// 套餐价格是钱（$10/月），用量全部用积分说话。
//
// 客户端不碰支付：订阅、查看套餐、限额重置全部跳网页端（?go=1）。
// 先不做加购：月度打满就锁到下月，没有「升级 / 买次数」入口。

import type { GoState } from '@/app/lib/authStorage';

// --- 套餐 ---

export const GO_PLAN = {
  name: 'Go',
  /** 订阅价格 —— 唯一用美元表述的地方 */
  price: '$10 / 月',
  /** 套餐卡 / 网页端共用的一句话描述 */
  tagline: '畅享旗舰开源模型',
  /** 演示用的下次续费日 */
  renewDate: '2026-09-12',
  /** 演示用的过期日（订阅过期态） */
  expiredDate: '2026-08-12',
} as const;

/** 未订阅时的引导文案 —— 模型选择器的订阅行、设置菜单里共用同一句 */
export const GO_PROMO_TEXT = '$10 畅享旗舰开源模型';

// --- 额度窗口 ---

export interface GoUsageWindow {
  key: '5h' | 'week' | 'month';
  label: string;
  /** 已用积分 */
  used: number;
  /** 窗口总积分 */
  total: number;
  /** 重置说明，如「14:30 重置」 */
  resetNote: string;
}

/**
 * 演示数据：不同 Go 状态下三个窗口的用量。
 * limit-month 时 5 小时 / 每周并不满 —— 卡住用户的是月度窗口，
 * 这样「限额重置帮不上忙」在界面上一眼能看出来。
 */
export function getGoUsage(go: GoState): GoUsageWindow[] {
  const limit5h = go === 'limit-5h';
  const limitMonth = go === 'limit-month';
  return [
    {
      key: '5h',
      label: '5 小时用量',
      used: limit5h ? 600 : limitMonth ? 380 : 252,
      total: 600,
      resetNote: '14:30 重置',
    },
    {
      key: 'week',
      label: '每周用量',
      used: limit5h ? 1660 : limitMonth ? 1900 : 432,
      total: 2400,
      resetNote: '周一 08:00 重置',
    },
    {
      key: 'month',
      label: '每月用量',
      used: limitMonth ? 8000 : limit5h ? 4160 : 720,
      total: 8000,
      resetNote: '9 月 1 日重置',
    },
  ];
}

export function usagePercent(w: GoUsageWindow): number {
  return Math.min(100, Math.round((w.used / w.total) * 100));
}

// --- 使用限额重置 ---
// 参考 opencode：套餐每月自带 N 次重置，点一下立即恢复 5 小时 + 每周窗口。
// 重置在客户端和网页端都能直接完成（不涉及支付）。先不做加购次数。

export const GO_RESETS = {
  used: 1,
  total: 3,
  note: '重置后 5 小时与每周额度立即恢复，每月额度不受影响',
} as const;

// --- 额度打满的提示文案 ---
// 和 QuotaNotice 一样：同一状态在模型卡、选中提示、发送拦截三处必须是同一句话。
//
// 关于精确重置时间：free 的规则是「只说待重置，不给时间」（见 QuotaNotice），
// 因为 free 是黑盒、重置周期服务端说了算。Go 反过来 —— 三个窗口是确定性的、
// 服务端会返回精确的重置时间戳（对标 Codex 的用量页），所以这里给准点。
// 两条线口径不同是有意为之，不是疏漏。
//
// 5h 打满和月度打满的出路不同，detail 必须分开写：限额重置只恢复 5 小时与
// 每周窗口，月度打满时指引用户去重置就是把人引向一个无效动作。

export const GO_LIMIT_MESSAGES: Record<'limit-5h' | 'limit-month', string> = {
  'limit-5h': '5 小时额度已用完，14:30 重置',
  'limit-month': '本月额度已用完，9 月 1 日重置',
};

export const GO_LIMIT_DETAILS: Record<'limit-5h' | 'limit-month', string> = {
  'limit-5h': '可使用限额重置立即恢复，或继续使用其他模型',
  'limit-month': '限额重置无法恢复每月额度，可继续使用其他模型',
};

// --- 用量明细（网页端） ---

export interface GoUsageRecord {
  time: string;
  model: string;
  tokens: string;
  /** 消耗积分 —— 明细的主列 */
  credits: number;
}

// 明细量会很大，网页端按分页展示（每页 GO_USAGE_PAGE_SIZE 条），不做「加载更多」
export const GO_USAGE_PAGE_SIZE = 8;

export const GO_USAGE_RECORDS: GoUsageRecord[] = [
  { time: '08-18 14:02', model: 'Kimi K2.5', tokens: '12.4k', credits: 38 },
  { time: '08-18 13:47', model: 'DeepSeek V4', tokens: '8.1k', credits: 21 },
  { time: '08-18 11:20', model: 'Qwen3 Coder Max', tokens: '31.9k', credits: 86 },
  { time: '08-18 10:52', model: 'GLM-5', tokens: '5.6k', credits: 14 },
  { time: '08-18 09:31', model: 'DeepSeek V4', tokens: '6.9k', credits: 18 },
  { time: '08-17 22:15', model: 'Kimi K2.5', tokens: '19.2k', credits: 57 },
  { time: '08-17 21:03', model: 'MiniMax M2.5', tokens: '3.8k', credits: 9 },
  { time: '08-17 18:40', model: 'DeepSeek V4', tokens: '24.7k', credits: 63 },
  { time: '08-17 16:28', model: 'Qwen3 Coder Max', tokens: '11.3k', credits: 30 },
  { time: '08-17 14:19', model: 'GLM-5', tokens: '9.4k', credits: 24 },
  { time: '08-17 11:07', model: 'Kimi K2.5', tokens: '15.8k', credits: 47 },
  { time: '08-17 09:44', model: 'MiniMax M2.5', tokens: '2.6k', credits: 6 },
  { time: '08-16 23:12', model: 'DeepSeek V4', tokens: '18.5k', credits: 48 },
  { time: '08-16 20:36', model: 'Qwen3 Coder Max', tokens: '27.1k', credits: 73 },
  { time: '08-16 17:58', model: 'Kimi K2.5', tokens: '8.7k', credits: 26 },
  { time: '08-16 15:23', model: 'GLM-5', tokens: '13.2k', credits: 33 },
  { time: '08-16 10:41', model: 'DeepSeek V4', tokens: '5.3k', credits: 13 },
  { time: '08-15 21:55', model: 'Qwen3 Coder Max', tokens: '22.9k', credits: 61 },
  { time: '08-15 19:14', model: 'Kimi K2.5', tokens: '10.6k', credits: 32 },
  { time: '08-15 16:02', model: 'MiniMax M2.5', tokens: '4.4k', credits: 11 },
  { time: '08-15 13:37', model: 'GLM-5', tokens: '7.8k', credits: 20 },
  { time: '08-15 09:26', model: 'DeepSeek V4', tokens: '16.3k', credits: 42 },
  { time: '08-14 22:49', model: 'Kimi K2.5', tokens: '21.5k', credits: 64 },
  { time: '08-14 18:11', model: 'Qwen3 Coder Max', tokens: '14.7k', credits: 40 },
  { time: '08-14 15:33', model: 'GLM-5', tokens: '6.1k', credits: 16 },
  { time: '08-14 11:08', model: 'MiniMax M2.5', tokens: '3.2k', credits: 8 },
];

// --- 外链 ---

/** 意见反馈（设置弹菜单里的入口） */
export const FEEDBACK_URL = 'https://github.com/CherryHQ/cherry-studio/issues';
