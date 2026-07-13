// ===========================
// Feature Flags
// ===========================
// 工作模块 V2.0+ 新能力总开关：任务管理看板、自动化（定时任务）、
// Agent IM 项目组协作，以及配套的设置项（队友 / 定时任务）。
//
// - main 分支保持 false —— 生产预览（cherry-studio-ui.vercel.app）
//   只呈现 V2.0 的 Agent-Agent session 管理。
// - work-plus-preview 分支把它置为 true，获得独立的 Vercel 预览。
//   同步方式：在该分支上 merge main 即可，此文件是两个分支唯一的 diff。
export const WORK_PLUS: boolean = false;
