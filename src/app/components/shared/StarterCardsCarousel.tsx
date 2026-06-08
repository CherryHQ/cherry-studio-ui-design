import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shuffle,
  Mail, Newspaper, FileBarChart, Mic2, FileText, Languages, FileSearch,
  ShieldAlert, Utensils, BookOpen, Tags, Brain, FileSpreadsheet, Lightbulb,
  Target, Plane, Clapperboard, LineChart,
  Github, Search, FileSliders, Bug, Network, Rss, Wrench, Sheet, Database,
  Layout, KeySquare, Activity, GraduationCap, Captions, ReceiptText, Palette,
  TestTube2, Send,
} from 'lucide-react';
import { Button } from '@cherry-studio/ui';

export type StarterCard = {
  id: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  desc: string;
  prompt: string;
};

// Tone palette — each tone gives the card a recognizable identity (icon chip + hover halo)
// while staying within the muted design system. Classes must be literal so Tailwind picks them up.
type Tone = 'violet' | 'sky' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'fuchsia';
const TONE_STYLES: Record<Tone, { chipBg: string; chipText: string; ring: string; halo: string; chipBorder: string }> = {
  violet:  { chipBg: 'bg-violet-500/10  dark:bg-violet-400/12',  chipText: 'text-violet-600  dark:text-violet-300',  chipBorder: 'border-violet-500/20  dark:border-violet-400/20',  ring: 'group-hover:border-violet-400/40  dark:group-hover:border-violet-400/30',  halo: 'group-hover:bg-violet-500/[0.04]  dark:group-hover:bg-violet-400/[0.06]' },
  sky:     { chipBg: 'bg-sky-500/10     dark:bg-sky-400/12',     chipText: 'text-sky-600     dark:text-sky-300',     chipBorder: 'border-sky-500/20     dark:border-sky-400/20',     ring: 'group-hover:border-sky-400/40     dark:group-hover:border-sky-400/30',     halo: 'group-hover:bg-sky-500/[0.04]     dark:group-hover:bg-sky-400/[0.06]' },
  emerald: { chipBg: 'bg-emerald-500/10 dark:bg-emerald-400/12', chipText: 'text-emerald-600 dark:text-emerald-300', chipBorder: 'border-emerald-500/20 dark:border-emerald-400/20', ring: 'group-hover:border-emerald-400/40 dark:group-hover:border-emerald-400/30', halo: 'group-hover:bg-emerald-500/[0.04] dark:group-hover:bg-emerald-400/[0.06]' },
  amber:   { chipBg: 'bg-amber-500/12   dark:bg-amber-400/14',   chipText: 'text-amber-600   dark:text-amber-300',   chipBorder: 'border-amber-500/20   dark:border-amber-400/20',   ring: 'group-hover:border-amber-400/40   dark:group-hover:border-amber-400/30',   halo: 'group-hover:bg-amber-500/[0.04]   dark:group-hover:bg-amber-400/[0.06]' },
  rose:    { chipBg: 'bg-rose-500/10    dark:bg-rose-400/12',    chipText: 'text-rose-600    dark:text-rose-300',    chipBorder: 'border-rose-500/20    dark:border-rose-400/20',    ring: 'group-hover:border-rose-400/40    dark:group-hover:border-rose-400/30',    halo: 'group-hover:bg-rose-500/[0.04]    dark:group-hover:bg-rose-400/[0.06]' },
  cyan:    { chipBg: 'bg-cyan-500/10    dark:bg-cyan-400/12',    chipText: 'text-cyan-600    dark:text-cyan-300',    chipBorder: 'border-cyan-500/20    dark:border-cyan-400/20',    ring: 'group-hover:border-cyan-400/40    dark:group-hover:border-cyan-400/30',    halo: 'group-hover:bg-cyan-500/[0.04]    dark:group-hover:bg-cyan-400/[0.06]' },
  indigo:  { chipBg: 'bg-indigo-500/10  dark:bg-indigo-400/12',  chipText: 'text-indigo-600  dark:text-indigo-300',  chipBorder: 'border-indigo-500/20  dark:border-indigo-400/20',  ring: 'group-hover:border-indigo-400/40  dark:group-hover:border-indigo-400/30',  halo: 'group-hover:bg-indigo-500/[0.04]  dark:group-hover:bg-indigo-400/[0.06]' },
  fuchsia: { chipBg: 'bg-fuchsia-500/10 dark:bg-fuchsia-400/12', chipText: 'text-fuchsia-600 dark:text-fuchsia-300', chipBorder: 'border-fuchsia-500/20 dark:border-fuchsia-400/20', ring: 'group-hover:border-fuchsia-400/40 dark:group-hover:border-fuchsia-400/30', halo: 'group-hover:bg-fuchsia-500/[0.04] dark:group-hover:bg-fuchsia-400/[0.06]' },
};
const TONE_ORDER: Tone[] = ['violet', 'sky', 'emerald', 'amber', 'rose', 'cyan', 'indigo', 'fuchsia'];
function toneFor(id: string, index: number): Tone {
  // Stable per card id so visiting the same default deck looks the same.
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const base = (Math.abs(h) + index) % TONE_ORDER.length;
  return TONE_ORDER[base];
}

// ---------- Chat catalog (Q&A / writing / lookup — quick artifact) ----------
const CHAT_CATALOG: StarterCard[] = [
  {
    id: 'c-trending',
    icon: Github,
    title: 'GitHub AI Trending 速读',
    desc: '今日 trending 仓库的中文要点',
    prompt: [
      '请帮我整理 GitHub 上今日 AI 类 Trending 仓库的中文速读。',
      '输入：今天（按当前日期）GitHub Trending 中 AI / LLM / Agent 类项目。',
      '约束：每个项目不超过 3 行；列出仓库名 / Star 涨幅 / 解决了什么问题。',
      '输出格式：Markdown 列表，最多 5 条，结尾给一个一句话趋势点评。',
    ].join('\n'),
  },
  {
    id: 'c-email-polish',
    icon: Mail,
    title: '邮件润色',
    desc: '把口语化邮件改成专业语气',
    prompt: [
      '请把下面这封邮件改写得更专业、得体、简洁。',
      '输入（请把原邮件粘贴在这一行下方）：',
      '',
      '约束：保留原意；不超过 180 字；中英文均使用半角标点。',
      '输出格式：1）改写后正文；2）一句修改说明。',
    ].join('\n'),
  },
  {
    id: 'c-compare-table',
    icon: FileBarChart,
    title: '竞品对照表',
    desc: '3 个产品 5 个维度的对比',
    prompt: [
      '请帮我做一个竞品功能对照表。',
      '输入：产品 A / B / C 名称（请替换）。',
      '维度：核心功能、定价、目标用户、差异化优势、最近一次更新。',
      '输出格式：Markdown 表格，行=维度，列=产品；表格下方给一段 100 字结论。',
    ].join('\n'),
  },
  {
    id: 'c-interview-intro',
    icon: Mic2,
    title: '面试自我介绍',
    desc: '3 分钟版本，可口播',
    prompt: [
      '请帮我写一份 3 分钟的中文自我介绍口播稿。',
      '输入：岗位（请替换）/ 我的核心经历（请替换）。',
      '约束：开头 30 秒抓注意力；中段 90 秒讲 1 个项目成果（含量化数据）；',
      '结尾 60 秒讲为什么是我；口语化，避免书面长句。',
      '输出格式：分段口播稿 + 每段建议语速。',
    ].join('\n'),
  },
  {
    id: 'c-weekly',
    icon: FileText,
    title: '周报生成',
    desc: '把散点改成结构化周报',
    prompt: [
      '请把下面这些散乱的工作记录整理成一份结构化周报。',
      '输入（请粘贴你这周的工作流水）：',
      '',
      '约束：合并同类项；用「本周进展 / 关键决策 / 下周计划 / 风险」四段式。',
      '输出格式：Markdown，每段 3-5 个 bullet，单点不超过 2 行。',
    ].join('\n'),
  },
  {
    id: 'c-translate-tech',
    icon: Languages,
    title: '技术文档中英互译',
    desc: '保留代码与术语',
    prompt: [
      '请把下面的技术文档做高质量翻译。',
      '输入语言：自动识别。目标语言：另一种（中→英 或 英→中）。',
      '约束：代码块 / 命令 / API 名 / 文件路径保持原样；专有名词首次出现给括注。',
      '输出格式：仅返回译文，保留原 Markdown 结构。',
      '',
      '内容：',
    ].join('\n'),
  },
  {
    id: 'c-paper-talk',
    icon: FileSearch,
    title: '论文 → 讲解稿',
    desc: '把论文摘要变成 5 分钟讲稿',
    prompt: [
      '请基于下面这篇论文的摘要，生成一份 5 分钟讲解稿。',
      '输入（粘贴摘要 / 论文链接）：',
      '',
      '约束：开头讲「为什么这件事重要」；中段讲方法和最关键的 1 张图；',
      '结尾讲局限与下一步；避免堆砌术语。',
      '输出格式：分段讲稿 + 1 个一句话总结。',
    ].join('\n'),
  },
  {
    id: 'c-contract-risk',
    icon: ShieldAlert,
    title: '合同条款风险提示',
    desc: '逐条标出潜在风险点',
    prompt: [
      '请帮我审阅下面这份合同 / 条款，标出潜在风险与不利于我方的条款。',
      '输入（粘贴合同文本）：',
      '',
      '约束：仅作风险提示，不出具法律意见；每条给出「原文 / 风险点 / 建议改法」。',
      '输出格式：Markdown 表格（原文 | 风险 | 建议）。',
    ].join('\n'),
  },
  {
    id: 'c-recipe',
    icon: Utensils,
    title: '今晚菜单',
    desc: '根据现有食材规划',
    prompt: [
      '请根据我冰箱里现有的食材规划今晚 2 人份的菜单。',
      '输入：我现在有（请替换）：…',
      '约束：3 菜 1 汤；30 分钟内能上桌；尽量不浪费食材。',
      '输出格式：每道菜 → 用料 / 做法步骤（5 步以内）/ 火候提示；最后给一份采购补缺清单。',
    ].join('\n'),
  },
  {
    id: 'c-book-zhihu',
    icon: BookOpen,
    title: '读书笔记 → 知乎答案',
    desc: '一本书改成一篇问答',
    prompt: [
      '请把这本书的核心观点改写成一篇知乎风格的回答。',
      '输入：书名（请替换）+ 我最有共鸣的章节（请替换）。',
      '约束：开头一句话钩子；中间 3 个分论点，每个配一个生活化例子；',
      '结尾给一句可执行的建议；总长 800-1200 字。',
      '输出格式：Markdown。',
    ].join('\n'),
  },
  {
    id: 'c-copy-3style',
    icon: Tags,
    title: '商品文案 3 风格',
    desc: '理性 / 感性 / 反差',
    prompt: [
      '请为下面这件商品写 3 个风格的电商主图文案。',
      '输入：商品名称 / 卖点（请替换）。',
      '约束：每个风格各给 1 个标题 + 3 个 bullet；不要写得像 AI；少用形容词堆叠。',
      '输出格式：分 3 段（理性 / 感性 / 反差），各自带标签。',
    ].join('\n'),
  },
  {
    id: 'c-explain-5',
    icon: Brain,
    title: '类比讲给 5 岁',
    desc: '把抽象概念变直觉',
    prompt: [
      '请用类比把下面这个概念讲给 5 岁小朋友听。',
      '输入：概念（请替换，例如「梯度下降」「区块链」）。',
      '约束：用 1 个生活类比贯穿；不出现专业术语；最后给一个一句话总结。',
      '输出格式：3 段口语化讲解。',
    ].join('\n'),
  },
  {
    id: 'c-resume-bullet',
    icon: FileSpreadsheet,
    title: '简历 bullet 重写',
    desc: '把描述改成结果导向',
    prompt: [
      '请把下面这段简历描述改写成结果导向的 bullet。',
      '输入（粘贴原描述）：',
      '',
      '约束：每条用「动词 + 做了什么 + 量化结果」结构；避免「负责 / 参与」类弱动词；',
      '保持事实不夸大。',
      '输出格式：3-5 条 bullet。',
    ].join('\n'),
  },
  {
    id: 'c-naming',
    icon: Lightbulb,
    title: '30 个产品命名',
    desc: '分 5 类风格脑暴',
    prompt: [
      '请为下面这个产品脑暴 30 个候选名字。',
      '输入：产品定位 / 目标用户（请替换）。',
      '约束：分 5 个风格（中文意象 / 英文短词 / 拼写组合 / 拟人 / 反直觉），每类 6 个；',
      '每个名字一句话点评。',
      '输出格式：Markdown 列表，按风格分组。',
    ].join('\n'),
  },
  {
    id: 'c-smart',
    icon: Target,
    title: 'SMART 目标拆解',
    desc: '把模糊愿望变可执行',
    prompt: [
      '请帮我把下面这个目标拆解成 SMART 形式 + 90 天行动计划。',
      '输入：我想（请替换）。',
      '约束：S/M/A/R/T 五项各 1 句；行动计划按 30/60/90 天分段；每段最多 4 条。',
      '输出格式：Markdown。',
    ].join('\n'),
  },
  {
    id: 'c-trip',
    icon: Plane,
    title: '3 天 2 晚旅行行程',
    desc: '含交通和预算',
    prompt: [
      '请帮我规划一段 3 天 2 晚的旅行行程。',
      '输入：目的地（请替换）/ 出发地 / 预算 / 偏好（自然 or 城市 or 美食）。',
      '约束：按 Day 1/2/3 分段；每天注明交通方式 + 预估时长 + 预算区间；',
      '加 1 个备选雨天方案。',
      '输出格式：Markdown 表格。',
    ].join('\n'),
  },
  {
    id: 'c-short-video',
    icon: Clapperboard,
    title: '30 秒短视频脚本',
    desc: '含画面 + 字幕 + BGM 建议',
    prompt: [
      '请写一份 30 秒短视频脚本。',
      '输入：主题 / 想达成的效果（请替换）。',
      '约束：前 3 秒钩子；分镜 6-8 个；每个分镜含画面描述 / 字幕 / 时长（秒）。',
      '输出格式：Markdown 表格 + 结尾给 1 条 BGM 风格建议。',
    ].join('\n'),
  },
  {
    id: 'c-data-story',
    icon: LineChart,
    title: '数据故事化',
    desc: '把表格变成 3 段叙述',
    prompt: [
      '请把下面这段数据改写成可读的故事化叙述。',
      '输入（粘贴数据或描述）：',
      '',
      '约束：3 段——「发生了什么 / 为什么 / 接下来」；每段 80-120 字；',
      '出现的数据必须忠实于原始数据。',
      '输出格式：Markdown 段落。',
    ].join('\n'),
  },
];

// ---------- Agent catalog (multi-step / tool-using — concrete artifact) ----------
const AGENT_CATALOG: StarterCard[] = [
  {
    id: 'a-trending',
    icon: Github,
    title: 'GitHub AI Trending Roundup',
    desc: '拉今日 trending，输出对照表 + 文案',
    prompt: [
      '请帮我跑一遍今日 GitHub AI Trending Roundup 流程。',
      '步骤：1）抓取今天 GitHub Trending 中 AI / LLM / Agent 类前 10 名仓库；',
      '2）对每个仓库提取：名称 / star 涨幅 / 一句话定位 / README 中的 quickstart 链接；',
      '3）筛出 5 个最值得关注的；4）生成一段适合发到 Slack / 群里的中文文案。',
      '输出格式：① Markdown 表格；② 群发文案（不超过 200 字）。',
    ].join('\n'),
  },
  {
    id: 'a-comp-recon',
    icon: Search,
    title: '竞品速查',
    desc: '官网 + 定价 + 对照 Markdown',
    prompt: [
      '请帮我做一份竞品速查报告。',
      '输入：竞品名称列表（请替换）。',
      '步骤：1）访问各家官网；2）抓取定位 / 核心功能 / 定价档位 / 最近一次更新；',
      '3）合并成对照表；4）输出一份 .md 文件可直接保存。',
      '输出：竞品对照 .md（含表格 + 结尾 100 字结论）。',
    ].join('\n'),
  },
  {
    id: 'a-pdf-slides',
    icon: FileSliders,
    title: '长 PDF → 10 页 Slides',
    desc: '抽核心 + 生成大纲',
    prompt: [
      '请把下面这份 PDF 压缩成一套 10 页的演讲 slides。',
      '输入（粘贴 PDF 路径或链接）：',
      '',
      '步骤：1）提取目录与关键章节；2）抽 5 个核心论点 + 3 张关键图；',
      '3）按封面 / 背景 / 问题 / 方法 / 数据 / 案例 / 结论 / Q&A 结构编排；',
      '4）每页给标题 + 3 个 bullet + 配图说明。',
      '输出格式：Markdown 大纲，可直接转 slides。',
    ].join('\n'),
  },
  {
    id: 'a-bug-repro',
    icon: Bug,
    title: 'Bug 日志 → 复现报告',
    desc: '从堆栈到最小复现',
    prompt: [
      '请基于下面这段报错 / 日志生成一份可提交的复现报告。',
      '输入（粘贴日志或错误堆栈）：',
      '',
      '步骤：1）定位最可能的根因；2）列出复现步骤（含环境 / 版本 / 输入）；',
      '3）给出最小复现代码片段；4）给出 1-2 个修复方向。',
      '输出格式：GitHub Issue 模板（标题 / 环境 / 复现 / 期望 / 实际 / 建议）。',
    ].join('\n'),
  },
  {
    id: 'a-repo-map',
    icon: Network,
    title: '仓库结构梳理',
    desc: '架构图 + README 草稿',
    prompt: [
      '请帮我梳理当前仓库的结构。',
      '步骤：1）扫一级和二级目录，识别每个模块的职责；',
      '2）画一张文字版架构图（用层级关系表达依赖）；',
      '3）给出一份 README 草稿（含项目简介 / 目录说明 / 快速开始 / 开发约定）。',
      '输出：① 架构图（文字 / Mermaid）；② README.md 草稿。',
    ].join('\n'),
  },
  {
    id: 'a-rss',
    icon: Rss,
    title: 'RSS 摘要日报',
    desc: '从订阅源生成 5 条速读',
    prompt: [
      '请帮我跑一遍今日 RSS 摘要日报。',
      '输入：RSS 源列表（请替换）。',
      '步骤：1）拉取最近 24 小时新增条目；2）按主题去重；',
      '3）选 5 条最值得读的，每条给 50 字摘要 + 原文链接。',
      '输出格式：Markdown 日报（按主题分组）。',
    ].join('\n'),
  },
  {
    id: 'a-mcp-audit',
    icon: Wrench,
    title: 'MCP 工具盘点',
    desc: '列已接入工具 + 用例',
    prompt: [
      '请帮我盘点当前已接入的 MCP server / 工具。',
      '步骤：1）列出所有可用 server 与暴露的工具；2）对每个工具给一句话用途；',
      '3）给 2-3 个最有价值的组合用例（怎么把多个工具串起来用）。',
      '输出格式：Markdown（清单 + 用例）。',
    ].join('\n'),
  },
  {
    id: 'a-excel-merge',
    icon: Sheet,
    title: 'Excel 多 sheet 合并',
    desc: '透视 + 异常标注',
    prompt: [
      '请帮我合并下面这份 Excel 中的多个 sheet 并做基本透视。',
      '输入：文件路径（请替换）。',
      '步骤：1）对齐字段；2）合并为一张主表；3）按指定维度透视（请替换）；',
      '4）标注空值 / 重复 / 异常行。',
      '输出：① 合并后表格；② 透视结果；③ 数据质量备注。',
    ].join('\n'),
  },
  {
    id: 'a-scrape-csv',
    icon: Database,
    title: '网页爬取 → 结构化 CSV',
    desc: '抽字段 + 清洗',
    prompt: [
      '请帮我从下面这些网页抓取结构化数据。',
      '输入：URL 列表（请替换）。',
      '步骤：1）抓取页面；2）抽取指定字段（请替换）；',
      '3）做基础清洗（去 HTML / 去空格 / 统一日期格式）；4）合并为 CSV。',
      '输出：CSV 内容 + 一段抓取过程说明（成功 / 失败 / 跳过）。',
    ].join('\n'),
  },
  {
    id: 'a-landing',
    icon: Layout,
    title: '落地页一键生成',
    desc: 'Hero + 特性 + CTA HTML',
    prompt: [
      '请帮我生成一份单页落地页。',
      '输入：产品名 / 一句话定位 / 目标用户（请替换）。',
      '步骤：1）写一个 Hero 区文案；2）3 个特性卡片；3）社会证明区；4）CTA。',
      '输出：可直接预览的 HTML 文件（含基础内联样式），不要外部依赖。',
    ].join('\n'),
  },
  {
    id: 'a-secret-scan',
    icon: KeySquare,
    title: '密钥泄露扫描',
    desc: 'git 历史 + 现有文件',
    prompt: [
      '请帮我扫描当前仓库是否有疑似密钥泄露。',
      '步骤：1）扫描 git 历史与当前文件中常见密钥模式（API key / token / 私钥头）；',
      '2）对每个命中给出文件 / 行号 / 上下文片段；3）按严重程度排序；',
      '4）给出处置建议（轮换 / git filter-repo 等）。',
      '输出格式：Markdown 报告。',
    ].join('\n'),
  },
  {
    id: 'a-sentry',
    icon: Activity,
    title: 'Sentry 报错趋势',
    desc: '近 7 天 Top 错误',
    prompt: [
      '请帮我分析最近 7 天的 Sentry 报错趋势。',
      '步骤：1）拉取近 7 天 issue；2）按事件量排出 Top 10；',
      '3）对每个 issue 给一句话归因（前端 / 后端 / 第三方）；',
      '4）找出 1-2 个最值得本周修的。',
      '输出格式：Markdown 表格 + 结尾本周修复建议。',
    ].join('\n'),
  },
  {
    id: 'a-paper-related',
    icon: GraduationCap,
    title: '论文相关工作梳理',
    desc: '跨 5 篇 → 综述',
    prompt: [
      '请帮我做一份相关工作（Related Work）梳理。',
      '输入：5 篇论文（标题 / 链接，请替换）。',
      '步骤：1）抽每篇方法 / 数据集 / 主要结论；2）按主题聚类；',
      '3）写一段综述段落（300-500 字），结尾点出 gap。',
      '输出格式：Markdown（聚类表 + 综述段落 + 参考文献）。',
    ].join('\n'),
  },
  {
    id: 'a-srt',
    icon: Captions,
    title: '视频字幕中英双语',
    desc: '从音频生成 SRT',
    prompt: [
      '请帮我把这个视频生成中英双语 SRT 字幕。',
      '输入：视频文件路径（请替换）。',
      '步骤：1）转写音频（中文）；2）翻译为英文；',
      '3）按句切分时间轴；4）合并为双语 SRT（中文在上 / 英文在下）。',
      '输出：可下载的 .srt 文件 + 一段质量说明。',
    ].join('\n'),
  },
  {
    id: 'a-invoice',
    icon: ReceiptText,
    title: '发票 OCR → 报销表',
    desc: '一沓发票自动汇总',
    prompt: [
      '请帮我把这一沓发票图片识别后汇总成报销表。',
      '输入：发票图片文件夹（请替换）。',
      '步骤：1）逐张 OCR；2）抽取金额 / 日期 / 抬头 / 发票号 / 类目；',
      '3）按类目汇总；4）标出疑似重复或字段缺失的发票。',
      '输出：① CSV 报销表；② 异常发票清单。',
    ].join('\n'),
  },
  {
    id: 'a-brand-tokens',
    icon: Palette,
    title: '品牌色 → 设计 Token',
    desc: '从图像提取主色板',
    prompt: [
      '请从下面这张品牌素材中提取设计系统 token。',
      '输入：图像路径或链接（请替换）。',
      '步骤：1）提取主色 / 辅助色 / 中性色（5-7 色）；2）给每个色出 50/100/.../900 阶；',
      '3）按浅色 / 深色主题给两套语义 token（bg / fg / muted / accent / destructive）。',
      '输出：JSON token 文件 + 一段使用说明。',
    ].join('\n'),
  },
  {
    id: 'a-unit-test',
    icon: TestTube2,
    title: '单元测试补全',
    desc: '给定文件 → 测试用例',
    prompt: [
      '请帮我为下面这个文件补全单元测试。',
      '输入：文件路径（请替换）。',
      '步骤：1）识别公共函数 / 类；2）枚举正常路径 / 边界 / 异常路径；',
      '3）按现有测试框架（请替换）生成用例；4）跑一遍并报告通过率。',
      '输出：测试代码 + 覆盖说明。',
    ].join('\n'),
  },
  {
    id: 'a-bulk-mail',
    icon: Send,
    title: '邮件批量草稿',
    desc: 'CSV 收件人 → 个性化',
    prompt: [
      '请帮我基于下面这份收件人 CSV 生成批量个性化邮件草稿。',
      '输入：CSV 路径（含姓名 / 公司 / 标签等字段，请替换）。',
      '步骤：1）按标签分群；2）为每群定一个主题；',
      '3）对每位收件人合成个性化称呼 + 1 段定制内容；4）保留统一签名。',
      '输出：每封邮件 → 收件人 / 主题 / 正文 三段；汇总成可粘贴清单。',
    ].join('\n'),
  },
];

function pickDefault(catalog: StarterCard[], n = 9): StarterCard[] {
  return catalog.slice(0, n);
}

function shufflePick(catalog: StarterCard[], n = 9): StarterCard[] {
  const arr = [...catalog];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

export type StarterSurface = 'chat' | 'agent';

const CATALOGS: Record<StarterSurface, StarterCard[]> = {
  chat: CHAT_CATALOG,
  agent: AGENT_CATALOG,
};

const AUTO_ROTATE_MS = 5000;
const PAGES = 3;
const CARDS_PER_PAGE = 3;

export function StarterCardsCarousel({
  surface,
  onPickPrompt,
  className,
}: {
  surface: StarterSurface;
  onPickPrompt: (prompt: string) => void;
  className?: string;
}) {
  const catalog = CATALOGS[surface];
  const [cards, setCards] = useState<StarterCard[]>(() => pickDefault(catalog));
  const [page, setPage] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const dragStartX = useRef<number | null>(null);

  useEffect(() => {
    if (hovered) return;
    const t = setInterval(() => {
      setDirection(1);
      setPage(p => (p + 1) % PAGES);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(t);
  }, [hovered]);

  const goTo = (next: number) => {
    if (next === page) return;
    setDirection(next > page ? 1 : -1);
    setPage(((next % PAGES) + PAGES) % PAGES);
  };

  const handleShuffle = () => {
    setCards(shufflePick(catalog));
    setDirection(-1);
    setPage(0);
  };

  const visible = useMemo(() => {
    const start = page * CARDS_PER_PAGE;
    return cards.slice(start, start + CARDS_PER_PAGE);
  }, [cards, page]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goTo((page + 1) % PAGES);
    else goTo((page - 1 + PAGES) % PAGES);
  };

  return (
    <div
      className={`w-full max-w-[640px] mx-auto select-none ${className ?? ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cards row */}
      <div
        className="relative overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={page}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 24 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-3 gap-2"
          >
            {visible.map((card, idx) => {
              const Icon = card.icon;
              const tone = TONE_STYLES[toneFor(card.id, idx)];
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onPickPrompt(card.prompt)}
                  className={`group relative flex flex-col gap-2 rounded-xl border border-border/50 bg-background/80 px-3 py-3 text-left overflow-hidden transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.5)] ${tone.ring} ${tone.halo}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg border ${tone.chipBg} ${tone.chipBorder} ${tone.chipText} flex-shrink-0 transition-transform duration-200 group-hover:scale-[1.06]`}>
                      <Icon size={14} strokeWidth={1.8} />
                    </span>
                    <span className="text-[12.5px] font-medium text-foreground tracking-[-0.01em] truncate leading-none">{card.title}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground/75 leading-[1.45] line-clamp-2 min-h-[2.6em]">{card.desc}</span>
                  {/* subtle inner highlight (top edge) */}
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/[0.05] to-transparent" />
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Shuffle — bottom-right under the cards */}
      <div className="mt-2 flex items-center justify-end">
        <Button
          variant="ghost"
          size="xs"
          onClick={handleShuffle}
          className="h-6 px-2 gap-1 text-[11px] text-muted-foreground/70 hover:text-foreground rounded-full"
        >
          <Shuffle size={11} strokeWidth={1.6} />
          <span>换一批</span>
        </Button>
      </div>
    </div>
  );
}
