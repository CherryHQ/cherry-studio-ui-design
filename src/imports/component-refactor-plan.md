toolName: todo_write
            
status: success
          
Todos updated: 1 items
          

        
            
toolName: view_folder
            
status: success
          
/Users/siin/Downloads/Cherry Studio UI/src/app/components
          

        
            
toolName: view_files
            
status: success
          
            
filePath: /Users/siin/Downloads/Cherry Studio UI/src/app/components/assistant/AssistantRunPage.tsx
          

        
            
toolName: view_files
            
status: success
          
            
filePath: /Users/siin/Downloads/Cherry Studio UI/src/app/components/agent/run/AgentRunPage.tsx
          

        
            
toolName: view_files
            
status: success
          
            
filePath: /Users/siin/Downloads/Cherry Studio UI/src/app/components/library/LibraryPage.tsx
          
通过对 `AssistantRunPage.tsx`, `AgentRunPage.tsx` 和 `LibraryPage.tsx` 的深入审查，我发现了一些可以提升组件复用性的关键领域。

### 1. 聊天/会话界面的复用 (Chat Interface Reusability)
目前 `AssistantRunPage` 和 `AgentRunPage` 都实现了类似的聊天界面，但代码存在大量重复。

*   **现状**:
    *   两个页面都独立实现了消息列表渲染、输入框逻辑、代码高亮 (`highlightLine`)、Markdown 渲染等。
    *   `AssistantRunPage` 中包含 `ThinkingBlock` (思考块)，而 `AgentRunPage` 似乎也有类似的逻辑但实现可能略有不同。
    *   两者都使用了 `lucide-react` 图标，但导入列表非常长且重复。
*   **建议**:
    *   **提取 `ChatInterface` 组件**: 创建一个通用的 `src/app/components/shared/ChatInterface.tsx`。
        *   支持 `messages` 数组 prop。
        *   支持 `onSendMessage` 回调。
        *   支持 `header` 插槽 (用于放置不同的顶部工具栏)。
        *   支持 `sidebar` 插槽 (用于放置右侧设置面板或左侧会话历史)。
    *   **提取 `MessageBubble` 组件**: 将消息气泡的渲染（包括 Markdown、代码高亮、Thinking Block）提取为独立组件 `src/app/components/shared/MessageBubble.tsx`。
    *   **统一代码高亮**: `highlightLine` 函数目前在组件内部定义，应移至 `src/utils/syntaxHighlight.ts` 或使用现成的轻量级高亮库（如 `prismjs` 或 `shiki`，如果不想引入新库，至少应封装为通用 Utility）。

### 2. 资源/文件管理复用 (Resource Management)
`LibraryPage` 和 `AgentRunPage` (及可能的 `FilePage`) 都有文件/资源列表的展示需求。

*   **现状**:
    *   `LibraryPage` 手动实现了 `findFolder`, `buildTags` 等逻辑。
    *   `AgentRunPage` 中也有文件图标获取逻辑 `getFileIcon`。
*   **建议**:
    *   **提取 `FileSystem` Hooks**: 将文件夹操作逻辑 (增删改查) 封装为 `useFileSystem` hook。
    *   **统一图标映射**: 将 `getFileIcon` 移至 `src/app/components/ui/file-icon.tsx` 或 `src/utils/file.ts`，供全局使用。
    *   **通用资源网格/列表**: `ResourceGrid` 目前似乎只在 Library 中使用，但 Agent 的 Artifacts 查看器可能也需要类似的网格视图，建议使其更通用，接受泛型的 `Item` 类型。

### 3. 配置面板与表单 (Settings & Forms)
`AssistantConfig` 和 `AgentConfig` (在 `LibraryPage` 中引用) 可能共享很多表单元素。

*   **现状**:
    *   模型选择、温度调节、System Prompt 输入等控件在不同页面重复出现。
*   **建议**:
    *   **原子化表单组件**: 确保使用 Shadcn 的 `Form`, `Input`, `Select` 等组件构建表单，而不是手写 `div` + `input`。
    *   **提取 `ModelSelector`**: 模型选择器（包含模型图标、名称、上下文长度提示）是一个高频复用组件，应独立封装。

### 4. 动画与交互 (Animation & Interaction)
*   **现状**:
    *   `ThinkingBlock` 中的 `shakeAnimation` 是硬编码在组件内的。
    *   页面切换动画（如 `LibraryPage` 中的 `AnimatePresence`）分散在各处。
*   **建议**:
    *   **动画常量库**: 将 `framer-motion` 的 variants (如 `fadeIn`, `slideIn`, `shake`) 集中管理在 `src/config/animations.ts`。

### 5. 模拟数据 (Mock Data)
*   **现状**:
    *   `mockData.ts` 散落在各个组件目录中 (`agent/run/mockData.ts`, `assistant/mockData.ts`)，导致类型定义和数据结构可能不一致。
*   **建议**:
    *   虽然是 Mock 数据，但建议定义统一的 TypeScript 接口（如 `Message`, `Session`, `Agent`）在 `src/types` 中，确保不同模块对核心实体的理解一致。

---

### 总结建议清单

| 模块 | 建议项 | 预期收益 |
| :--- | :--- | :--- |
| **聊天** | 🧩 提取 `MessageBubble` 和 `ChatInterface` | 消除 Assistant/Agent 页面 40% 以上的重复代码 |
| **工具** | 🛠️ 提取 `getFileIcon`, `highlightLine` 为 Utility | 统一视觉表现，减少复制粘贴错误 |
| **资源** | 📂 封装 `useFileSystem` 和通用 `ResourceGrid` | 统一文件管理逻辑，易于扩展到其他模块 |
| **表单** | 📝 封装 `ModelSelector` 组件 | 统一模型选择体验，方便后续对接真实 API |
| **数据** | 📐 统一 `src/types` 定义 | 确保各模块间数据结构兼容 |

这些建议将显著降低代码库的冗余度，并提高新功能的开发效率。