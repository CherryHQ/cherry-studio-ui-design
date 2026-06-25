# CLAUDE.md

本文件为在此仓库工作的 Claude 提供项目约定。

## 工作流约定

- **改完 UI 不需要自己用浏览器打开逐一确认。** 用户会直接在浏览器里看，这样更高效。改完代码、说明清楚改了什么即可，把验证交给用户。（如果是逻辑/构建类问题，仍可按需自行检查；但纯 UI 改动不必每次截图确认。）

## 项目信息

- 类型：Vite + React UI 设计项目（pnpm workspace）。
- 包管理器：**pnpm**。
- 安装依赖：`pnpm install`
- 本地开发：`pnpm dev`（Vite dev server，默认端口 5173，被占用时自动顺延到 5174/5175…，以终端输出的实际地址为准）。
- 构建：`pnpm build`
- Lint：`pnpm lint` / `pnpm lint:fix`
- 格式化：`pnpm format`
