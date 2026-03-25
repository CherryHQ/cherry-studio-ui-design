# Cherry Studio V2 重构任务跟踪清单

经过对代码库的深度挖掘整理的最终原子级修改任务清单。所有 5 项任务均已完成。

### 1. 核心类型系统重构 (Core Type System) - ✅ 已完成

*   **Status**: 全部完成。统一的类型系统已建立并被所有消费者使用。
*   **`types/chat.ts`**: 定义了统一的 `Message` 接口（含 Assistant 和 Agent 的全部字段）、`MessageRole`、`ToolCallData`、`GenerativeUIData`、`WorkflowStep`、`MessageMetadata`、`SearchResultItem`、`RAGInfo`、`ParallelResponse` 等。
*   **`types/shared.ts`**: 包含 `FileAttachment`、`TokenUsage`、`ArtifactData`、`ModelInfo`、`ModelCapability` 等跨模块通用类型。
*   **`types/agent.ts`**: 包含 `AgentChatMessage`、`AgentSession`、`AgentSessionData`、`FileNode`、`OutputFile` 等 Agent 专用类型。
*   **`types/assistant.ts`**: 包含 `AssistantInfo`、`AssistantTopic` 等 Assistant 专用类型。
*   **旧定义清理**: 组件文件中不再定义本地类型接口，仅保留向后兼容的 type alias（如 `type AssistantMessage = Message`）。
*   **消费者迁移**: `AssistantRunPage`、`BranchTreePanel`、`TopicHistoryPage`、`AgentRunPage`、`NotePage`、`config/agentTools.ts` 等全部改为从 `@/app/types/*` 导入类型。

### 2. Mock 数据迁移与规范化 (Mock Data) - ✅ 已完成

已建立 `src/app/mock/` 目录作为数据中心，barrel 重导出已就绪。

*   **`mock/index.ts`**: 统一 barrel，所有消费者已改为从 `@/app/mock` 导入数据。
*   **已物理迁移**: `fileData.ts`、`imageData.ts`、`assistantData.ts`、`agentData.ts` 已在 `mock/` 目录中。
*   **已转为薄 shim**: `components/assistant/mockData.ts` 和 `components/agent/run/mockData.ts` 均已转为纯 re-export shim，不再包含任何数据定义。
*   **类型定义去耦**: 所有 mockData 文件中的 interface 定义已全部改为从 `@/app/types` 导入 + type alias 重导出。
*   **消费者迁移**: 所有 `.tsx` 组件和 `.ts` 配置文件已改为从 `@/app/mock` 或 `@/app/types/*` 导入，不再直接引用组件目录的 mockData。仅 `mock/index.ts` 本身保留对组件目录的引用（作为数据中转）。

### 3. 组件逻辑深度解耦 (Component Decoupling) - ✅ 已完成

`ChatPanel.tsx` (Agent) 和 `AssistantRunPage` (Assistant) 的聊天逻辑已统一到 `ChatInterface` 组件。

*   **升级 `ChatInterface`**: ✅ 已完成
    *   `ChatInterface.tsx` 已具备完整 slot 体系：`topAddon`、`bottomAddon`、`listHeader`、`emptyState`、`customComposer`、`messageListClassName`。
    *   空状态路径已修复：emptyState 渲染时也会显示 composer。
    *   Agent `ChatPanel` 已作为 thin wrapper 使用 ChatInterface（通过 `listHeader` 传入 WorkflowPanel，`composerProps` 传入 rightInfo）。
    *   Assistant `AssistantRunPage` 已迁移为使用 ChatInterface（通过 `customComposer` 传入复杂输入区、`emptyState` 传入空状态、`messageListClassName` 调整内边距）。
    *   已移除 AssistantRunPage 中的手动 `scrollRef` 和 auto-scroll `useEffect`，由 MessageList 统一管理。
*   **迁移 `MessageComponents.tsx`**: ✅ 已完成
    *   组件已物理迁移至 `src/app/components/shared/Chat/components/MessageComponents.tsx`。
    *   新增 `Chat/components/index.ts` barrel 导出。
    *   原位置 `Chat/MessageComponents.tsx` 和 `shared/MessageComponents.tsx` 均转为 thin re-export shim。
    *   InlineCodeBlock/MermaidBlock 中的 emerald 复制确认色已替换为 `cherry-primary`。
    *   所有消费者（AssistantRunPage、Chat/index.ts）导入路径保持兼容。

### 4. 硬编码清理 (Hardcoding Cleanup) - ✅ 已完成

扫描发现多处样式硬编码，影响 Dark Mode 和主题定制。

*   **emerald → cherry-* 语义变量替换**: ✅ 已完成
    *   **已完成文件** (primary theme 替换):
        *   `AgentRunPage.tsx`, `AgentConfig.tsx`, `FileExplorer.tsx`, `ArtifactViewer.tsx`
        *   `CodeToolPage.tsx`, `NotePage.tsx`, `KnowledgePage.tsx`, `MiniAppsPage.tsx`
        *   `SessionHistoryPage.tsx`, `SessionSidebar.tsx`, `WorkflowPanel.tsx`
        *   `GenerativeUI.tsx`, `AgentMessageRenderer.tsx`, `AssistantConfig.tsx`
        *   `AssistantRunPage.tsx`, `BranchTreePanel.tsx`
        *   `ChatSettingsPanel.tsx` (toggle/slider)
        *   `TopicHistoryPage.tsx` (选中态/checkbox/搜索框)
        *   `ToolSection.tsx` (连接状态toggle/checkbox)
        *   `ImagePage.tsx` (全面替换：选中环/模型选择/进度条/画廊/工具栏)
        *   `ImportModal.tsx` (成功状态)
        *   `ResourceGrid.tsx`, `SkillPluginDetail.tsx` (toggle开关/已保存)
        *   `ExperienceModal.tsx` (已添加状态)
        *   `PreviewModal.tsx` (已添加资源库按钮)
        *   `DataSourceList.tsx` (保存按钮/编辑框焦点)
        *   `RAGSettings.tsx` (全面替换：slider/select/input/button/提示框)
        *   `RetrievalTester.tsx` (搜索框焦点/按钮/spinner/复制确认)
        *   `ApiGatewayPage.tsx` (复制确认/主按钮/运行状态banner)
        *   `DataSettingsPage.tsx` (主按钮/链接)
        *   `DocumentServicePage.tsx` (主按钮/链接)
        *   `GeneralSettingsPage.tsx` (选中check/链接)
        *   `MCPServicePage.tsx` (编辑/添加按钮/安装按钮/版本badge/radio选择)
        *   `MemoriesPage.tsx` (所有主操作按钮)
        *   `ModelServicePage.tsx` (全面替换：选中check/checkbox/主按钮/tabs/radio/docs链接/拖拽边框/test按钮/toggle行为)
        *   `QuickAssistantPage.tsx` (全面替换：segmented control/默认标签/选中check/icon picker/focus border/save按钮/add按钮/link)
        *   `SelectionAssistantPage.tsx` (全面替换：segmented control/icon picker/focus border/save按钮/add按钮/link/添加应用按钮)
    *   **保留为上下文语义色的文件** (不替换):
        *   文件类型图标: `FileGrid.tsx`, `FileList.tsx`, `FilePreview.tsx`, `FileSidebar.tsx`, `FileExplorer.tsx`
        *   分类标签: `AgentConfig.tsx`('自动化'), `SessionHistoryPage.tsx`('可视化'), `TopicHistoryPage.tsx`('产品'), `BasicSection.tsx`('对话')
        *   Source type 区分色: `AssistantRunPage.tsx`(rag=blue/web=green), 能力图标(vision=green)
        *   助手类别色: `FavoritesDrawer.tsx`, `PreviewModal.tsx`, `ResourceCards.tsx`(assistants=emerald/cyan)
        *   数据源类型: `DataSourceList.tsx`(website=green)
        *   状态指示: `DataSourceList.tsx`(success/ready), `KnowledgeSidebar.tsx`(ready), `ApiGatewayPage.tsx`(enabled dot), `DocumentServicePage.tsx`(configured dot, OCR可用), `MCPServicePage.tsx`(enabled/installed/running dots)
        *   分数/高亮: `RetrievalTester.tsx`(score bar, keyword highlight)
        *   对话角色标记: `PromptSection.tsx`(助手标签)
        *   推荐/done badge: `ExperienceModal.tsx`
        *   模型品牌色: `ModelServicePage.tsx`(GPT系列=green)
        *   代码能力徽章: `ModelServicePage.tsx`(code capability badge)
        *   健康检查结果: `ModelServicePage.tsx`(成功状态/进度条/延迟数据)
        *   装饰渐变: `ExplorePage.tsx`
        *   第三方连接状态: `DataSettingsPage.tsx`(Notion/坚果云已连接), `DocumentServicePage.tsx`(语言包标签)
        *   代码预览: `FilePreview.tsx`(代码高亮色)
*   **Sidebar & TabBar**: 已在之前批次完成。
*   **Message Bubbles**: 已在之前批次完成。

### 5. 路径别名 (Path Alias) - ✅ 已完成

*   **Status**: 全部完成。所有 `../../`+ 深层相对路径和跨目录 `../` 相对路径已统一为 `@/app/` 别名。
*   **Scope**: 覆盖 mockData shim (assistant/file/image)、settings 子页面 (BrandLogos/VarManagerPanel/Tooltip)、layout 组件、pages 组件、agent/library 跨目录引用、CherryStudio/MainContent/MiniApps 等根组件。
*   **共修改 ~30 个文件**，消除了全部 `../../types`、`../../config``../../mock`、`../ui/`、`../Tooltip`、`../context/`、`../utils/`、`../services/`、`../assistant/`、`../agent/` 等跨边界相对路径。

---

*所有 5 项重构任务已全部完成。*

---

### 6. 后端联调准备 (Backend Integration Prep) - ✅ 已完成

*   **环境变量标准化**: ✅ 已完成
    *   `config/env.ts`: 移除 `(import.meta as any)` 类型断言，添加 Vite `ImportMetaEnv` 类型声明。
    *   环境变量现在具备完整的 TypeScript 类型安全支持。

*   **Mock 数据隔离**: ✅ 已完成
    *   新建 `mock/constants.mock.ts`: 从 `config/constants.ts` 中提取全部后端应提供的 Mock 数据。
    *   提取内容: `MOCK_RESOURCES`、`MOCK_FOLDERS`、`MOCK_KNOWLEDGE_BASES`、`MOCK_BUILTIN_TOOLS`、`MOCK_CUSTOM_SCRIPTS`、`MOCK_MCP_SERVERS`、`MOCK_INSTALLED_PLUGINS`、`MODEL_PROVIDERS`、`PROVIDER_MODELS`。
    *   `constants.ts` 通过 re-export 保持向后兼容，现有组件代码零改动。
    *   `mock/index.ts` barrel 同步更新。

*   **后端联调类型契约**: ✅ 已完成
    *   `types/api.ts`: 追加 `LoginRequest`、`LoginResponse`、`RefreshTokenRequest`、`UserSettingsPayload`、`ModelProvider`、`MCPServerConfig` 等后端契约类型。

*   **Context 性能优化**: ✅ 已完成
    *   `GlobalActionContext.tsx`: 拆分为 `GlobalActionFunctionsContext`(稳定回调) + `GlobalActionStateContext`(可变状态)，消除无关组件因 state 变化导致的重渲染。新增 `useGlobalActionFunctions()` 和 `useGlobalActionState()` 精细化 hooks，`useGlobalActions()` 保持向后兼容。
    *   `SettingsContext.tsx`: 拆分为 `SettingsStateContext` + `SettingsDispatchContext` + `ResolvedThemeContext` 三层，新增 `useSettingsState()`、`useUpdateSetting()`、`useResolvedTheme()` 精细化 hooks，`useSettings()` 保持向后兼容。

*   **大组件拆分 — Hook 提取**: ✅ 已完成
    *   `hooks/useTabs.ts`: 提取 Tab 管理逻辑（CRUD、持久化、pin、dock、mini-app 创建、标题变更）。
    *   `hooks/useFloatingWindows.ts`: 提取浮动窗口管理逻辑（detach、reattach、close）。
    *   `hooks/useTabDrag.ts`: 提取 Tab 拖拽交互逻辑（TabBar 拖拽、Sidebar 拖拽、DragGhost 状态）。
    *   `CherryStudio.tsx`: 从 674 行缩减至约 250 行，纯 JSX 声明 + 桥接逻辑。

*   **跳过项** (React 18 不支持):
    *   Activity API (React 19+): 保持 CSS display 切换方案。
    *   useEffectEvent (React 19+): 保持当前 useCallback 方案。
    *   SettingsContext useEffect 拆分: 代码已经是单一职责的独立 effect，无需修改。

---

### 7. 架构迁移 — 组件/功能层 Shim 创建 (Architecture Migration Phase 2) - ✅ 已完成

从 `src/app/` 扁平结构到 `src/` 顶层标准目录的 re-export shim 创建。

*   **`src/components/common/`**: ✅ 已完成 (8 个文件)
    *   `Sidebar.tsx` → `src/app/components/layout/Sidebar`
    *   `TabBar.tsx` → `src/app/components/layout/TabBar`
    *   `Tooltip.tsx` → `src/app/components/Tooltip`
    *   `ErrorBoundary.tsx` → `src/app/components/shared/ErrorBoundary`
    *   `MessageComponents.tsx` → `src/app/components/shared/MessageComponents`
    *   `Chat/` (index.ts + 5 子文件 + components/ 子目录) → `src/app/components/shared/Chat/`

*   **`src/components/layout/`**: ✅ 已完成 (2 个文件)
    *   `CherryStudio.tsx` → `src/app/components/CherryStudio`
    *   `MainContent.tsx` → `src/app/components/MainContent`

*   **`src/features/`**: ✅ 已完成 (13 个功能模块, 共 ~55 个 shim 文件)
    *   `agent/` (1 + run/ 子目录 10 个文件)
    *   `assistant/` (6 + sections/ 子目录 4 个文件)
    *   `chat/` (3 个文件: ChatPage, GenericPage, HomePage)
    *   `explore/` (6 个文件: ExplorePage + 5 子页面)
    *   `file/` (6 个文件)
    *   `knowledge/` (5 个文件: KnowledgePage + 4 子组件)
    *   `library/` (6 个文件)
    *   `miniapp/` (2 个文件: MiniAppsPage, MiniAppEmbedPage)
    *   `note/` (1 个文件: NotePage)
    *   `painting/` (2 个文件: ImagePage, mockData)
    *   `settings/` (15 个文件: SettingsPage + 13 子页面 + shared)
    *   `translate/` (1 个文件: TranslatePage)
    *   `codetool/` (1 个文件: CodeToolPage)

*   **`src/hooks/`**: ✅ 补充完成 (新增 3 个 shim)
    *   `useFloatingWindows.ts` → `src/app/hooks/useFloatingWindows`
    *   `useTabDrag.ts` → `src/app/hooks/useTabDrag`
    *   `useTabs.ts` → `src/app/hooks/useTabs`

**下一步**: 逐步将 shim 内联为完整物理拷贝，然后更新 App.tsx 使用新路径 (`@/components/`, `@/features/`)，最终删除 `src/app/` 下的旧文件（保留 `App.tsx` 和 `components/figma/`）。

---

### 8. Shim 内联进度 (Shim Inlining Progress) - 🔄 进行中

将 `src/features/` 下的 re-export shim 内联为完整物理拷贝（含合规修复），然后将原始文件反转为指向新位置的 re-export shim。

**已完成全流程** (物理内联 + 原文件反转 + 合规修复):
*   `codetool/CodeToolPage.tsx` ✅
*   `translate/TranslatePage.tsx` ✅
*   `note/NotePage.tsx` ✅
*   `painting/mockData.ts` ✅
*   `miniapp/MiniAppEmbedPage.tsx` ✅
*   `file/` 全部 6 文件 ✅ (mockData, FileGrid, FileList, FileSidebar, FilePreview, FilePage — 含 regex 转 new RegExp)
*   `knowledge/RAGSettings.tsx` ✅
*   `knowledge/RetrievalTester.tsx` ✅ (含 regex 转 new RegExp)
*   `chat/` 全部 3 文件 ✅ (ChatPage, GenericPage, HomePage — 无合规问题)
*   `knowledge/KnowledgePage.tsx` ✅ (导入路径从相对路径改为 @/features/knowledge/ + @/app/)
*   `knowledge/KnowledgeSidebar.tsx` ✅ (含 type re-export)
*   `library/ImportModal.tsx` ✅ (无合规问题)
*   `library/LibrarySidebar.tsx` ✅ (无合规问题)
*   `library/SkillPluginDetail.tsx` ✅ (无合规问题)
*   `library/SkillPluginImportModal.tsx` ✅ (含 regex 转 new RegExp: 文件扩展名剥离/连字符替换/单词首字母大写)
*   `explore/` 全部 6 文件 ✅ (ExploreData/ResourceCards/ExperienceModal/FavoritesDrawer/PreviewModal — 无合规问题; ExplorePage — 导入路径从 ./pages/explore/ 改为 ./ 同目录)
*   `library/LibraryPage.tsx` ✅ (同目录 ./ 导入自动指向已内联的 features/library/ 文件)
*   `library/ResourceGrid.tsx` ✅ (无合规问题)

**第二阶段** — ✅ 已全部完成:
*   `painting/ImagePage.tsx` ✅ (1186 行, 无合规问题, ./mockData 在 features/painting/ 下正常解析)
*   `miniapp/MiniAppsPage.tsx` ✅ (477 行, 相对路径 ./ui/ 修复为 @/app/components/ui/)
*   `knowledge/DataSourceList.tsx` ✅ (632 行, 2 处 regex 字面量已转 new RegExp() + String.fromCharCode())

**第三阶段** (核心模块 — feature shim → @/ 路径 + 源文件 `<>` 合规修复，待物理内联):
*   `settings/` — ✅ 已完成 7/16 物理内联 + 原文件反转, 9 文件待内联
    *   `shared.tsx` ✅ (277 行, 无合规问题)
    *   `DefaultModelSettingsPage.tsx` ✅ (188 行, 新建文件)
    *   `ShortcutsPage.tsx` ✅ (319 行, 无合规问题)
    *   `GeneralSettingsPage.tsx` ✅ (377 行, 无合规问题)
    *   `DashboardPage.tsx` ✅ (385 行, 无合规问题)
    *   `ApiGatewayPage.tsx` ✅ (503 行, 无合规问题)
    *   `DocumentServicePage.tsx` ✅ (574 行, 无合规问题)
    *   `MemoriesPage.tsx` 🔄 (663 行, 待内联)
    *   `WebSearchPage.tsx` 🔄 (682 行, 待内联)
    *   `QuickPhrasesPage.tsx` 🔄 (781 行, 待内联)
    *   `SelectionAssistantPage.tsx` 🔄 (810 行, 待内联)
    *   `DataSettingsPage.tsx` 🔄 (870 行, 待内联)
    *   `QuickAssistantPage.tsx` 🔄 (891 行, 待内联)
    *   `SettingsPage.tsx` 🔄 (1003 行, 待内联)
    *   `MCPServicePage.tsx` 🔄 (1217 行, 待内联)
    *   `ModelServicePage.tsx` 🔄 (3605 行, 待内联)
*   `assistant/` 全部 10 文件 — feature shim → @/ 路径 ✅, 源文件 `<>` 已修复, 待物理内联
*   `agent/` 全部 11 文件 — ✅ 已全部完成物理内联 + 原文件反转
    *   `run/mockData.ts` ✅ (已使用 @/ 路径)
    *   `run/GenerativeUI.tsx` ✅ (无合规问题)
    *   `run/AgentMessageRenderer.tsx` ✅ (相对路径 ./GenerativeUI)
    *   `run/FileExplorer.tsx` ✅ (无合规问题)
    *   `run/WorkflowPanel.tsx` ✅ (无合规问题)
    *   `run/SessionSidebar.tsx` ✅ (无合规问题)
    *   `run/ArtifactViewer.tsx` ✅ (regex 字面量已转 new RegExp() + String.fromCharCode())
    *   `run/ChatPanel.tsx` ✅ (内部导入改为相对路径 ./AgentMessageRenderer, ./WorkflowPanel)
    *   `run/SessionHistoryPage.tsx` ✅ (967 行, 无合规问题)
    *   `run/AgentRunPage.tsx` ✅ (1399 行, 已在此前完成)
    *   `AgentConfig.tsx` ✅ (843 行, 无合规问题)

**下一步**: 继续将第三阶段剩余文件 (settings/ 9 文件, assistant/ 10 文件) 逐步物理内联。所有待内联文件的 `./` 导入路径在 features/settings/ 下已可正确解析（无需修改），仅需物理拷贝 + 原文件反转。