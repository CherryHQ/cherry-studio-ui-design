// CLI / MCP bundle catalog. A CLI 套件（claude-code, lark-cli, gh…）
// is a bundle of named Skills; an MCP server exposes a bundle of named
// Tools. Both render the same way in MarketDetailDialog — name + short
// description card grid. Mocked here so the design works end-to-end
// without wiring real registries.

export interface BundledSubItem {
  name: string;
  description: string;
}

export const BUNDLE_MAP: Record<string, BundledSubItem[]> = {
  // ─── Claude Code (CLI) — Anthropic's official agent CLI bundles
  // the same Skills shipped via the cookbook
  'm-32': [
    { name: 'pdf',  description: '解析 PDF 正文、表格、签字与表单字段；按页面 / 段落抽取结构化内容。' },
    { name: 'xlsx', description: '读写 .xlsx，支持公式 / 图表 / 多表汇总。' },
    { name: 'docx', description: '生成 / 编辑 .docx，含目录、样式、批注。' },
    { name: 'pptx', description: '一句话生成可编辑幻灯片，支持模板与母版。' },
    { name: 'mermaid', description: '在对话中实时渲染 Mermaid 图表，支持 SVG / PNG 导出。' },
    { name: 'code-interpreter', description: 'Python 沙箱：跑代码、出图、读 csv / xlsx / parquet。' },
  ],

  // ─── lark-cli (飞书 CLI) — 多个 sub-command 等效为多个 Skill
  'm-30': [
    { name: 'im',       description: '消息收发、群管理、表情回复、富文本卡片、文件传输。' },
    { name: 'doc',      description: '云文档读写、目录浏览、块级编辑、评论与权限。' },
    { name: 'sheet',    description: '电子表格读写、批量数据更新、公式与图表管理。' },
    { name: 'bitable',  description: '多维表格操作：建表 / 字段 / 视图 / 记录 CRUD / 数据透视。' },
    { name: 'calendar', description: '日程查询 / 创建 / 修改、忙闲查询、会议室预定。' },
    { name: 'minutes',  description: '飞书妙记：列表 / 详情 / 下载音视频 / 提取章节与摘要。' },
    { name: 'vc',       description: '视频会议：搜索历史会议、纪要、转写、参会人快照。' },
    { name: 'task',     description: '任务清单：创建 / 更新 / 分配 / 完成度跟踪。' },
    { name: 'drive',    description: '云空间文件上传下载、文件夹管理、批量导入导出。' },
    { name: 'wiki',     description: '知识库节点管理、空间成员、文档移动复制。' },
    { name: 'mail',     description: '邮件草稿 / 发送 / 回复 / 转发 / 搜索 / 规则。' },
    { name: 'event',    description: '订阅与消费飞书事件流（消息回执、表情回应、群成员变更）。' },
  ],

  // ─── gh (GitHub CLI) — subset of common sub-commands
  'm-29': [
    { name: 'repo',     description: '仓库操作：clone / create / fork / list / view / archive。' },
    { name: 'pr',       description: 'Pull Request：列表 / 创建 / 合并 / 评论 / 检视。' },
    { name: 'issue',    description: 'Issue：创建 / 关闭 / 评论 / 标签 / 指派。' },
    { name: 'release',  description: '版本发布：草稿 / 发布 / 上传资源 / 自动 Changelog。' },
    { name: 'workflow', description: 'Actions：触发 / 查看运行 / 日志 / 重跑。' },
    { name: 'gist',     description: 'Gist：创建 / 编辑 / 列出 / 删除。' },
  ],

  // ─── vercel CLI
  'm-33': [
    { name: 'deploy',  description: '部署当前项目到 Vercel，自动检测框架并构建。' },
    { name: 'logs',    description: '实时查看部署的 stdout / stderr 与 Edge function 日志。' },
    { name: 'env',     description: '环境变量管理：list / add / pull / rm，区分环境。' },
    { name: 'domains', description: '自定义域名：绑定 / 解绑 / DNS 验证。' },
    { name: 'project', description: '项目列表 / 切换 / 删除。' },
  ],

  // ─── MCP servers — each exposes a set of Tools the agent can call
  'm-2': [
    { name: 'read_file',       description: '读取指定路径的文件内容（支持文本 / 二进制）。' },
    { name: 'write_file',      description: '写入或覆盖文件，自动创建父目录。' },
    { name: 'list_directory',  description: '列出目录条目，含类型 / 大小 / 修改时间。' },
    { name: 'search_files',    description: 'glob 模式跨子目录查找文件。' },
    { name: 'move_file',       description: '移动 / 重命名文件或目录。' },
    { name: 'create_directory', description: '创建目录（递归）。' },
  ],

  'm-5': [
    { name: 'search_repositories', description: '按关键词 / star / language 搜索仓库。' },
    { name: 'get_file_contents',   description: '读取指定 path 的文件内容（含分支 / commit）。' },
    { name: 'create_or_update_file', description: '在分支上创建或更新文件，自动 commit。' },
    { name: 'create_pull_request', description: '创建 PR，指定 head / base / title / body。' },
    { name: 'list_issues',         description: '列出 issue（state / labels / assignee 过滤）。' },
    { name: 'create_issue',        description: '创建 issue，支持 assignee 与 label。' },
    { name: 'search_code',         description: '跨仓库搜索代码（语法同 GitHub）。' },
  ],

  'm-11': [
    { name: 'resolve-library-id', description: '把开源库名（如 react）解析成可拉取的 lib-id。' },
    { name: 'get-library-docs',   description: '按 lib-id 拉取最新文档片段，注入到 LLM 上下文。' },
  ],

  'm-41': [
    { name: 'query',           description: '执行只读 SQL（SELECT），返回结果集。' },
    { name: 'list_tables',     description: '列出数据库中的所有表。' },
    { name: 'describe_table',  description: '查询表结构、列、索引、约束。' },
    { name: 'list_schemas',    description: '列出 schema（多 schema 数据库）。' },
  ],

  'm-55': [
    { name: 'browse',          description: '打开 URL 并返回渲染后页面。' },
    { name: 'screenshot',      description: '截屏，支持全页 / 元素级 / 不同 viewport。' },
    { name: 'click',           description: '通过 selector 点击元素。' },
    { name: 'fill',            description: '在 input / textarea 填值。' },
    { name: 'navigate',        description: '在当前会话内跳转 URL。' },
    { name: 'evaluate',        description: '在页面上下文里执行 JS 表达式。' },
    { name: 'wait_for',        description: '等待 selector 出现 / 状态变化。' },
  ],

  'm-18': [
    { name: 'search',  description: '执行实时网络搜索，可选时间窗 / 站点限制。' },
    { name: 'extract', description: '抓取并清洗指定 URL 的正文内容（去广告 / 导航）。' },
  ],
};
