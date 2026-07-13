// ===========================
// 分支预览目录
// ===========================
// 「分支预览」切换器（BranchPreviewSwitcher）里展示的跨分支跳转链接。
// 新增长期预览分支时在此登记；Vercel 分支别名格式：
//   https://cherry-studio-ui-git-<branch-slug>-sinxus-projects.vercel.app
// 注意：分支别名默认受 Vercel Deployment Protection 保护（需要登录 Vercel
// 团队账号），对外演示请在 Vercel 项目设置里关闭 Vercel Authentication。

export interface PreviewBranch {
  branch: string;
  /** 一句话说明这个分支在看什么 */
  label: string;
  url: string;
}

export const PREVIEW_BRANCHES: PreviewBranch[] = [
  {
    branch: 'main',
    label: 'V2.0 基线 · 生产',
    url: 'https://cherry-studio-ui.vercel.app',
  },
  {
    branch: 'work-plus-preview',
    label: '任务管理 / 自动化 / IM 协作全开',
    url: 'https://cherry-studio-ui-git-work-plus-preview-sinxus-projects.vercel.app',
  },
];
