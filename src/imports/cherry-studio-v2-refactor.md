toolName: todo_write
            
status: success
          
Todos updated: 1 items
          
这是为您准备的 **Cherry Studio V2 代码优化与架构重构建议书**。该文档旨在指导后续开发工作，确保项目在**不改变现有设计与交互**的前提下，完成底层技术栈的现代化升级。

---

# 🍒 Cherry Studio V2 代码优化与架构重构建议书

## 1. 背景与目标 (Context & Objectives)

### 1.1 项目背景
Cherry Studio V2 是一个现代化的 Web 应用，目前代码库正处于从 V1 向 V2 架构迁移的过渡期。
现有代码虽然功能可用，但存在**技术栈混杂**（MUI 与 Shadcn 共存）、**路由方案过时**（传统 React Router）、**组件未充分原子化**（Sidebar 手写实现）等问题。这导致了打包体积冗余、类型安全不足以及长期维护成本高昂。

### 1.2 重构目标
本次重构的核心目标是**消除技术负债，统一技术规范**，具体包括：
1.  **统一 UI 体系**：彻底移除 Material UI (MUI)，全面拥抱 Shadcn UI + Tailwind CSS。
2.  **现代化路由架构**：迁移至 TanStack Router，利用其 Loader 机制提升性能。
3.  **高性能状态管理**：引入 React Activity (Keep-Alive) 机制，解决 Tab 切换导致的状态丢失问题。
4.  **工程化规范**：补全 TypeScript 配置，强化代码质量检查。

### 1.3 核心约束 (Constraints)
*   **🚫 禁止改变 UI 设计**：所有的重构必须保持像素级的视觉还原，布局、颜色、间距等不得变更。
*   **🚫 禁止改变交互逻辑**：现有的点击、拖拽、弹窗等交互行为必须保持原样。
*   **✅ 仅限底层代码优化**：所有的修改仅限于代码结构、依赖库替换和逻辑实现层。

---

## 2. 架构与代码结构修改意见 (Architecture & Code Structure)

### 2.1 依赖治理与清理 (Dependency Management)
目前 `package.json` 中存在大量未使用的 V1 遗留依赖，需进行清理。

*   **移除列表**:
    *   `@mui/material`, `@mui/icons-material`: 与 Shadcn UI 冲突，增加包体积。
    *   `@emotion/react`, `@emotion/styled`: MUI 的配套依赖，需一并移除。
    *   `react-router`: 替换为 `@tanstack/react-router`。
*   **新增/确认**:
    *   确认 `@tanstack/react-router` 已安装。
    *   确认 `oxlint` 或 `eslint` 配置已就位。

### 2.2 路由架构重构 (Routing Architecture)
目前的路由逻辑分散在 `App.tsx` 和 `MainContent.tsx` 中，且使用了条件渲染来模拟路由。

*   **现状**: `MainContent.tsx` 使用 `if (tab === 'chat') return <ChatPage />`。
*   **重构方案**:
    1.  **引入 TanStack Router**: 在 `src/app/routes` 目录下定义文件路由（File-based Routing）。
    2.  **Loader 预加载**: 为 `KnowledgePage`, `ExplorePage` 等重数据页面实现 `loader` 函数，实现“渲染前获取数据”。
    3.  **类型安全路由**: 利用 TanStack Router 的自动类型生成，消除硬编码的 URL 字符串（如 `navigate('/chat')`）。

### 2.3 核心组件重构 (Component Refactoring)

#### A. 侧边栏 (Sidebar) - `src/app/components/layout/Sidebar.tsx`
*   **问题**: 当前使用原生的 `div` 和 `button` 手写实现，包含大量复杂的 Tailwind 类名拼接逻辑，维护困难。
*   **建议**:
    *   保留现有的 **四态逻辑** (宽、窄、图标、悬浮) 不变。
    *   内部实现替换为 Shadcn UI 的 `<Sidebar>`, `<SidebarContent>`, `<SidebarGroup>`, `<SidebarMenu>` 组件。
    *   利用 `SidebarProvider` 的 Context 来管理展开/收起状态，替代手写的 `useState`。

#### B. 多标签页容器 (MainContent) - `src/app/components/MainContent.tsx`
*   **问题**: 切换 Tab 时组件被销毁，导致聊天记录滚动条复位、输入框内容丢失。
*   **建议**:
    *   引入 **Keep-Alive 机制**。使用 React 19 的 `<Activity mode="visible|hidden">` (或 `Offscreen`) 包裹路由组件。
    *   **实现逻辑**:
        ```tsx
        // 修改前
        {activeTab === 'chat' && <ChatPage />}

        // 修改后 (伪代码)
        <Activity mode={activeTab === 'chat' ? 'visible' : 'hidden'}>
          <ChatPage />
        </Activity>
        ```

### 2.4 样式与主题规范 (Styling & Theming)
*   **CSS 变量提取**:
    *   扫描代码中的硬编码颜色（如 `bg-emerald-500/[0.08]`），将其提取为 `src/styles/theme.css` 中的语义化变量（如 `--sidebar-accent`, `--sidebar-accent-foreground`）。
    *   确保 Tailwind 配置引用这些变量，从而实现真正的“一键换肤”能力，并完美适配 Dark Mode。

### 2.5 工程化配置 (Engineering)
*   **TypeScript 配置**:
    *   在根目录补全 `tsconfig.json`，启用 `strict: true`，确保类型安全。
    *   配置 `path alias` (如 `@/components/*` 映射到 `src/app/components/*`)，简化导入路径。

---

## 3. 修改清单 (Action Checklist)

| 优先级 | 模块 | 任务描述 | 预期成果 |
| :--- | :--- | :--- | :--- |
| **P0** | **依赖** | 清理 `package.json`，移除 MUI/Emotion，安装 TanStack Router | 纯净的依赖环境 |
| **P0** | **配置** | 创建标准 `tsconfig.json` | 启用 TypeScript 严格模式 |
| **P1** | **组件** | 重构 `Sidebar.tsx` 使用 Shadcn 原语 | 代码结构更清晰，易于维护 |
| **P1** | **核心** | 在 `MainContent.tsx` 中实现 `<Activity>` 保活机制 | **解决 Tab 切换状态丢失痛点** |
| **P2** | **路由** | 配置 TanStack Router 并替换现有路由逻辑 | 获得类型安全的路由体验 |
| **P2** | **样式** | 提取硬编码颜色至 CSS 变量 | 统一的主题管理系统 |

这份建议书为您提供了一个清晰的重构蓝图，执行后将显著提升代码库的质量和可维护性，同时严格遵守了“不改变现有设计”的约束。