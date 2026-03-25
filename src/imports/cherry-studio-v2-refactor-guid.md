toolName: todo_write
            
status: success
          
Todos updated: 1 items
          
这是为您精心整理的 **Cherry Studio V2 终极重构与架构升级指南**。这份文档不仅包含了之前的优化点，还融合了最新的“Feature-based Architecture”架构调整方案，旨在打造一个**结构清晰、工程化完备、易于扩展**的生产级代码库。

您可以将此文档直接交付给研发团队（或让 Claude 按此执行）。

---

# 🍒 Cherry Studio V2 终极重构与架构升级指南

## 1. 核心目标 (Objectives)
*   **架构清晰化**: 从“按文件类型分层”转向“按业务领域分层 (Feature-based)”，消除 `src/app` 的深层嵌套。
*   **工程标准化**: 恢复 TypeScript 严格模式，统一路径别名，规范类型定义。
*   **组件原子化**: 提取通用的聊天、布局和 UI 组件，消除重复代码。
*   **数据隔离化**: 彻底分离 Mock 数据与 UI 组件，预留标准的 API 服务层。

---

## 2. 目录结构重整 (Architecture Restructuring)

**现状**: 所有代码堆积在 `src/app/components`，结构混乱，难以维护。
**目标**: 扁平化 `src/app`，采用 Features 模式。

### ✅ 执行动作
1.  **废弃 `src/app/`**: 将其内容提升至 `src/` 根目录。
2.  **建立 Feature 目录 (`src/features/`)**:
    *   `src/features/agent/`: 包含 AgentRunPage, Config, Components。
    *   `src/features/assistant/`: 包含 AssistantRunPage, Config。
    *   `src/features/library/`: 包含 LibraryPage 及相关组件。
    *   `src/features/settings/`: 包含所有设置页面。
3.  **组件归位**:
    *   `src/components/ui/`: 存放 Shadcn 原子组件 (Button, Input)。
    *   `src/components/common/`: 存放业务通用组件 (ChatInterface, ErrorBoundary)。
    *   `src/components/layout/`: 存放 Sidebar, TabBar。
4.  **工具库归位**:
    *   `src/lib/utils/`: 存放工具函数。
    *   `src/lib/api/`: 存放 API Client 和 Service。
5.  **清理**: 删除 `src/imports/` 等临时文件夹。

---

## 3. 工程化与配置 (Engineering)

**现状**: 缺失 `tsconfig.json`，路径引用混乱 (`../../../`)。

### ✅ 执行动作
1.  **创建 `tsconfig.json`**:
    *   启用 `"strict": true`。
    *   配置路径别名 (Path Alias):
        ```json
        "paths": {
          "@/*": ["./src/*"],
          "@features/*": ["./src/features/*"],
          "@components/*": ["./src/components/*"],
          "@lib/*": ["./src/lib/*"]
        }
        ```
2.  **全量替换路径**:
    *   使用脚本或 IDE 搜索替换，将所有相对路径 `../../` 替换为上述别名。

---

## 4. 类型与数据治理 (Type & Data)

**现状**: 类型定义散落在 `mockData.ts` 中，Mock 数据与组件耦合。

### ✅ 执行动作
1.  **统一类型定义 (`src/types/`)**:
    *   `src/types/chat.ts`: 定义统一的 `Message`, `Role`, `Attachment` 接口。
    *   `src/types/agent.ts`: 定义 `Agent`, `Tool` 接口。
2.  **物理隔离 Mock 数据 (`src/mock/`)**:
    *   创建 `src/mock/chat.ts`, `src/mock/resources.ts`。
    *   **强制要求**: Mock 文件只能导出常量数据，**禁止**定义 Interface，必须引用 `src/types`。
3.  **移除组件内 Mock**: 清空 `features/agent/mockData.ts` 等文件，改为从 `src/mock` 导入。

---

## 5. 深度组件复用 (Component Reusability)

**现状**: Assistant 和 Agent 页面存在大量重复的聊天逻辑。

### ✅ 执行动作
1.  **完善 `ChatInterface` (`src/components/common/Chat/`)**:
    *   确保其支持 `topAddon` (Agent 步骤条) 和 `bottomAddon` (Assistant 并行回复) 插槽。
    *   整合 `MessageList`, `Composer`, `AttachmentList`。
2.  **迁移 Agent 页面**:
    *   重构 `AgentRunPage`，废弃旧的 `ChatPanel`，改用统一的 `<ChatInterface />`。
3.  **样式变量化**:
    *   在 `src/styles/theme.css` 中定义 `--sidebar-bg`, `--chat-bubble-bg` 等变量。
    *   替换 `Sidebar.tsx` 中的硬编码颜色。

---

## 6. 后端对接准备 (Backend Readiness)

**现状**: 纯前端 Mock，无 API 层。

### ✅ 执行动作
1.  **API Client 封装 (`src/lib/api/`)**:
    *   `apiClient.ts`: 封装 Fetch/Axios，处理拦截器和错误。
    *   `chatService.ts`: 定义 `sendMessage`, `getHistory` 等方法。
2.  **流式 Hooks (`src/hooks/`)**:
    *   `useChatStream.ts`: 处理 SSE/WebSocket 流式响应，管理 loading 状态。
3.  **环境变量**:
    *   创建 `.env.example`，列出 `VITE_API_BASE_URL` 等配置。

---

### 📝 研发交付清单 (Handover Checklist)

完成以上步骤后，您可以向研发团队交付以下内容：

1.  **代码库**: 结构清晰、类型安全的 React 代码仓库。
2.  **文档**:
    *   `README.md`: 项目启动指南。
    *   `.env.example`: 环境变量配置说明。
    *   `ARCHITECTURE.md`: 说明 Feature-based 目录结构的设计理念。
3.  **规范**: `tsconfig.json` 和 ESLint 配置，确保后续开发风格一致。

这份指南将确保 Cherry Studio V2 从“原型”华丽转身为“产品”。