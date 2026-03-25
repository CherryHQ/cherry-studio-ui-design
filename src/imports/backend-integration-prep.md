toolName: todo_write
            
status: success
          
Todos updated: 1 items
          

        
            
toolName: view_folder
            
status: success
          
/Users/siin/Downloads/Cherry Studio UI/src/app
          

        
            
toolName: view_files
            
status: success
          
            
filePath: /Users/siin/Downloads/Cherry Studio UI/src/app/components/agent/run/ChatPanel.tsx
          
为了确保您的代码能够顺利交付给研发团队并与后端服务对接，除了基础的代码重构，我们还需要关注**API 通信层的设计**、**错误处理机制**以及**环境变量管理**。

以下是为您准备的“后端对接准备”修改清单。这些修改不会改变 UI，但会极大地简化后续的联调工作。

### 1. API 服务层架构 (API Service Layer) - 🔴 P0

目前前端代码中可能包含了一些模拟的异步操作，但没有统一的 API 请求入口。

*   **创建 `src/app/services/` 目录**:
    *   `src/app/services/apiClient.ts`: 封装 Axios 或 Fetch，统一处理拦截器（Token 注入、全局错误捕获）。
    *   `src/app/services/chatService.ts`: 定义聊天相关的 API 方法（发送消息、获取历史、停止生成）。
    *   `src/app/services/resourceService.ts`: 定义资源管理相关的 API（获取列表、上传文件）。
*   **定义 API 接口类型**:
    *   在 `src/app/types/api.ts` 中定义通用的响应结构（如 `ApiResponse<T>`, `PaginatedResponse<T>`）。
*   **Mock 与 Real 的切换**:
    *   设计一个简单的适配器模式，允许通过环境变量 `VITE_USE_MOCK=true` 切换使用 Mock 数据还是真实 API。

### 2. 环境变量配置 (Environment Variables) - 🟠 P1

后端对接通常需要配置 API Base URL、超时时间等。

*   **创建 `.env.example`**:
    *   列出所有必要的环境变量，供研发人员复制参考。
    *   ```env
        VITE_API_BASE_URL=http://localhost:8000/api/v1
        VITE_WS_URL=ws://localhost:8000/ws
        VITE_USE_MOCK=false
        VITE_APP_VERSION=2.0.0
        ```
*   **创建 `src/config/env.ts`**:
    *   封装对 `import.meta.env` 的读取，提供类型安全的配置对象。
    *   例如：`export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';`

### 3. 流式响应处理 (Streaming Response) - 🟡 P1

大模型对话通常使用 Server-Sent Events (SSE) 或 WebSocket 进行流式传输。

*   **封装 `useChatStream` Hook**:
    *   在 `src/app/hooks/useChatStream.ts` 中实现流式数据的解析逻辑。
    *   处理 SSE 的 `onmessage`, `onerror`, `onclose` 事件。
    *   支持“打字机效果”的增量更新。
*   **适配器**:
    *   确保前端的 `Message` 数据结构能兼容后端返回的流式 chunk 格式。

### 4. 错误边界与处理 (Error Handling) - 🟢 P2

*   **全局错误处理**:
    *   在 `apiClient.ts` 中统一处理 401 (未登录)、403 (无权限)、500 (服务器错误)。
    *   集成 `sonner` 或 `toast` 组件，自动弹出错误提示。
*   **React Error Boundary**:
    *   在 `MainContent` 或 `App` 根节点添加 `ErrorBoundary` 组件，防止局部渲染错误导致白屏。

### 5. 安全性准备 (Security) - 🔵 P2

*   **Markdown 渲染安全**:
    *   确保 `MessageComponents.tsx` 中的 Markdown 渲染器（如 `react-markdown`）配置了 `rehype-sanitize`，防止 XSS 攻击。
*   **敏感数据脱敏**:
    *   检查日志输出，确保不打印用户的 API Key 或敏感对话内容到控制台。

---

### 给 Claude 的执行指令 (Prompt)

```markdown
# Phase 3: Backend Integration Preparation

## 1. API Layer Setup
- **Create** `src/app/services/apiClient.ts`: Setup Axios/Fetch instance with interceptors for auth tokens and global error handling.
- **Create** `src/app/services/chatService.ts`: Define methods for `sendMessage` (streaming support) and `getHistory`.
- **Create** `src/app/types/api.ts`: Define generic `ApiResponse<T>` interfaces.

## 2. Environment Configuration
- **Create** `.env.example`: Document `VITE_API_BASE_URL`, `VITE_WS_URL`, etc.
- **Create** `src/config/env.ts`: Export type-safe configuration constants derived from `import.meta.env`.

## 3. Streaming Hook
- **Create** `src/app/hooks/useChatStream.ts`: Implement a hook to handle SSE/WebSocket connections for chat generation, managing loading states and incremental updates.

## 4. Security Check
- **Audit** Markdown rendering in `MessageComponents.tsx` to ensure HTML sanitization is enabled.
```

完成这些后，您的前端代码就不仅仅是一个 UI Shell，而是一个准备好接入真实大脑的完整客户端了。研发团队拿到代码后，只需配置 `.env` 文件即可开始联调。