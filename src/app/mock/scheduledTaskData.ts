// ===========================
// Scheduled Tasks (定时任务) — mock data
// ===========================
// Backs the Codex-"Automations"-style 定时任务 view reachable from the top
// of the Agent session list. Per the 06-11 内部需求同步会议, scheduled tasks
// should be runnable *inside the app* without being bound to a channel
// (飞书 / QQ); `runMode: 'in-app'` models that decoupled case, while
// `runMode: 'channel'` keeps the legacy "send out via a bound channel" path.

export type ScheduledTaskStatus = 'active' | 'paused';
export type ScheduledTaskRunMode = 'in-app' | 'channel';
export type ScheduledTaskRunStatus = 'success' | 'running' | 'failed';

/** One past (or in-flight) execution of a scheduled task. */
export interface ScheduledTaskRun {
  id: string;
  /** Human time label, e.g. "今天 12:46" / "5月27日 11:19". */
  time: string;
  status: ScheduledTaskRunStatus;
}

export interface ScheduledTask {
  id: string;
  /** Human name shown in the list. */
  name: string;
  /** One-line summary shown under the title on the detail page. */
  description: string;
  /** Agent this automation drives. */
  agentName: string;
  agentAvatar: string;
  /** Human-readable cadence, e.g. "每天 21:00" / "每周一 10:00" / "每 6 小时". */
  schedule: string;
  /** Where the result goes. 'in-app' = 应用内（无需绑定渠道）. */
  runMode: ScheduledTaskRunMode;
  /** Bound channel label when runMode === 'channel' (e.g. 飞书 / 邮件). */
  channel?: string;
  status: ScheduledTaskStatus;
  /** Relative label for the next fire, e.g. "今天 21:00" / "3 小时后". */
  nextRun: string;
  /** Relative label for the last fire, undefined if never run. */
  lastRun?: string;
  /** The prompt the automation sends to the agent. */
  prompt: string;
  /** Execution history, newest first. */
  runs: ScheduledTaskRun[];
}

export const MOCK_SCHEDULED_TASKS: ScheduledTask[] = [
  {
    id: 'st-gold',
    name: '每日金价提醒',
    description: '每天 21:00 提醒用户黄金价格',
    agentName: '投资分析助手',
    agentAvatar: '📈',
    schedule: '每天 21:00',
    runMode: 'in-app',
    status: 'active',
    nextRun: '今天 21:00',
    lastRun: '昨天 21:00',
    prompt: '使用 WebSearch 查询当前最新的黄金价格（包括国际现货黄金 XAU/USD 与人民币每克价格），汇总今日涨跌幅与主要影响因素，给出 3 条要点。',
    runs: [
      { id: 'r1', time: '今天 21:00', status: 'success' },
      { id: 'r2', time: '昨天 21:00', status: 'success' },
      { id: 'r3', time: '5月27日 21:00', status: 'failed' },
      { id: 'r4', time: '5月26日 21:00', status: 'success' },
      { id: 'r5', time: '5月25日 21:00', status: 'success' },
    ],
  },
  {
    id: 'st-coffee',
    name: '咖啡豆市场监测',
    description: '每天 09:00 推送咖啡豆行情到飞书',
    agentName: '市场分析',
    agentAvatar: '☕',
    schedule: '每天 09:00',
    runMode: 'channel',
    channel: '飞书',
    status: 'active',
    nextRun: '明天 09:00',
    lastRun: '今天 09:00',
    prompt: '抓取主要产区咖啡豆期货行情，对比昨日变化并推送到飞书群。',
    runs: [
      { id: 'r1', time: '今天 09:00', status: 'success' },
      { id: 'r2', time: '昨天 09:00', status: 'success' },
      { id: 'r3', time: '前天 09:00', status: 'success' },
    ],
  },
  {
    id: 'st-competitor',
    name: '竞品动态周报',
    description: '每周一 10:00 汇总竞品动态',
    agentName: '调研助手',
    agentAvatar: '🔍',
    schedule: '每周一 10:00',
    runMode: 'in-app',
    status: 'active',
    nextRun: '周一 10:00',
    lastRun: '上周一 10:00',
    prompt: '收集本周竞品的版本发布、定价与营销动作，生成结构化周报。',
    runs: [
      { id: 'r1', time: '上周一 10:00', status: 'success' },
      { id: 'r2', time: '上上周一 10:00', status: 'success' },
    ],
  },
  {
    id: 'st-token',
    name: 'Token 用量日报',
    description: '每天 23:30 邮件发送 Token 成本日报',
    agentName: '数据分析',
    agentAvatar: '📊',
    schedule: '每天 23:30',
    runMode: 'channel',
    channel: '邮件',
    status: 'active',
    nextRun: '今天 23:30',
    lastRun: '昨天 23:30',
    prompt: '统计今日各模型 Token 消耗与成本，按助手维度拆分后发送邮件。',
    runs: [
      { id: 'r1', time: '昨天 23:30', status: 'success' },
      { id: 'r2', time: '前天 23:30', status: 'success' },
      { id: 'r3', time: '5月25日 23:30', status: 'success' },
    ],
  },
  {
    id: 'st-health',
    name: '服务器健康巡检',
    description: '每 6 小时巡检生产环境水位',
    agentName: 'DevOps 助手',
    agentAvatar: '🛠️',
    schedule: '每 6 小时',
    runMode: 'in-app',
    status: 'paused',
    nextRun: '已暂停',
    lastRun: '6 小时前',
    prompt: '检查生产环境 CPU / 内存 / 磁盘水位，异常时高亮告警项。',
    runs: [
      { id: 'r1', time: '6 小时前', status: 'success' },
      { id: 'r2', time: '12 小时前', status: 'failed' },
      { id: 'r3', time: '18 小时前', status: 'success' },
    ],
  },
];
