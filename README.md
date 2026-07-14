# Cherry Studio UI Design

Cherry Studio V2 的产品设计与 UI 交互原型。基于 React + TailwindCSS + shadcn/ui 构建的可交互设计稿。

## 在线预览

| 分支 | 说明 | 预览地址 |
| --- | --- | --- |
| `main` | V2.0 基线 · 生产 | https://cherry-studio-ui.vercel.app |
| `work-plus-preview` | 任务管理 / 自动化 / IM 协作全开 | https://cherry-studio-ui-git-work-plus-preview-sinxus-projects.vercel.app |
| `automation_agentIM` | 自动化 / Agent IM 协作 | https://cherry-studio-ui-git-automationagentim-sinxus-projects.vercel.app |

> 分支预览由 Vercel 自动构建，push 后约 1–2 分钟更新。也可在页面左下角「分支预览」切换器中直接跳转。新增长期分支时，请同步登记 `src/app/config/previewBranches.ts` 和本表格。

## 快速开始

```bash
pnpm install
pnpm dev
```

## 技术栈

- React 18 + TypeScript
- TailwindCSS v4
- shadcn/ui (Radix UI)
- Framer Motion
- Vite

## 项目结构

```
src/
  app/              # 应用入口、布局、路由、上下文
  features/         # 功能页面（chat、settings、extensions、knowledge 等）
  styles/           # 主题 CSS 变量
```

## 相关资源

- [Figma 设计稿](https://www.figma.com/design/vLN3r86zkCR69EnEh2j2B6/Cherry-Studio-UI-Design)
- [Cherry Studio 主仓库](https://github.com/CherryHQ/cherry-studio)
