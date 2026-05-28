// ===========================
// Collaboration — Types & Mock Data
// ===========================

export type MemberKind = 'human' | 'agent';

export interface CollabUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  avatarInitial: string;
  kind: 'human';
  note?: string;
}

export interface CollabAgent {
  id: string;
  name: string;
  email: string;
  ownerId: string;       // user id who owns this agent
  ownerName: string;
  avatarEmoji: string;
  cloneable: boolean;
  kind: 'agent';
  description?: string;
}

export type CollabMember = CollabUser | CollabAgent;

export interface MessageRef {
  authorId: string;
  authorName: string;
  authorKind: MemberKind;
  authorAvatar?: string;     // emoji or initial
  authorColor?: string;
  time: string;              // ISO or display string
  text: string;
  // For Agent replies, distinguish "@reply" vs "reference"
  replyMode?: 'mention' | 'reference';
  mentionedAgentId?: string; // for human messages with @Agent
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  size?: string;          // file size for 'file'/'image'; optional for 'link'
  kind: 'file' | 'html' | 'image' | 'link';
  // Link-card specific fields (kind === 'link')
  url?: string;
  siteName?: string;      // e.g. "Figma", "GitHub", "飞书文档"
  description?: string;   // short snippet under the title
  // Image-specific field (kind === 'image') — gradient class for mock thumbnail
  thumbColor?: string;    // e.g. 'from-rose-300 to-amber-200'
}

export interface Topic {
  id: string;
  groupId: string;
  title: string;
  starter: MessageRef;    // first message
  replies: MessageRef[];  // thread replies
  unread?: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;    // group description shown in settings drawer
  ownerId?: string;        // member id of the group owner; defaults to first member
  memberLimit?: number;    // max members allowed; defaults to 50
  members: string[];      // member ids (human or agent)
  topics: Topic[];
  unread?: number;
  lastActivityLabel?: string; // e.g. "最新：Agent IM 设计 话题已更新"
  lastActivityTime?: string;  // display-ready, e.g. "15:32" "昨天" "周二" "11月20日"
  // Group-level @ permission config (per PRD §5.4)
  agentMentionConfig: {
    ownerCanMention: boolean;       // always true per PRD
    othersCanMentionMyAgent: boolean; // owner-toggled
  };
  isDyad?: boolean;        // 二人协作群 flag
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  fromName: string;
  fromEmail: string;
  fromAvatarColor: string;
  fromAvatarInitial: string;
  message: string;        // attached note from requester
  time: string;
  status: FriendRequestStatus;
}

// ===========================
// Mock current user
// ===========================
export const CURRENT_USER: CollabUser = {
  id: 'me',
  name: 'Siin',
  email: 'siin@gmail.com',
  avatarColor: 'from-blue-400 to-indigo-500',
  avatarInitial: 'S',
  kind: 'human',
};

// ===========================
// Mock contacts (humans)
// ===========================
export const MOCK_HUMANS: CollabUser[] = [
  {
    id: 'u-zhangsan',
    name: '张三',
    email: 'zhangsan@qq.com',
    avatarColor: 'from-amber-400 to-orange-500',
    avatarInitial: '张',
    kind: 'human',
    note: '产品组同事',
  },
  {
    id: 'u-lisi',
    name: '李四',
    email: 'lisi@gmail.com',
    avatarColor: 'from-emerald-400 to-teal-500',
    avatarInitial: '李',
    kind: 'human',
    note: '讲师',
  },
  {
    id: 'u-wangwu',
    name: '王五',
    email: 'wangwu@qq.com',
    avatarColor: 'from-rose-400 to-pink-500',
    avatarInitial: '王',
    kind: 'human',
  },
  {
    id: 'u-zhaoliu',
    name: '赵六',
    email: 'zhaoliu@gmail.com',
    avatarColor: 'from-violet-400 to-purple-500',
    avatarInitial: '赵',
    kind: 'human',
  },
];

// ===========================
// Mock contacts (agents — belong to other users)
// ===========================
export const MOCK_AGENTS: CollabAgent[] = [
  {
    id: 'a-stella',
    name: 'Stella',
    email: 'stella.agent@gmail.com',
    ownerId: 'u-lisi',
    ownerName: '李四',
    avatarEmoji: '🤖',
    cloneable: true,
    kind: 'agent',
    description: '产品需求拆解 Agent',
  },
  {
    id: 'a-codebot',
    name: 'CodeBot',
    email: 'codebot.agent@gmail.com',
    ownerId: 'u-wangwu',
    ownerName: '王五',
    avatarEmoji: '🛠️',
    cloneable: false,
    kind: 'agent',
    description: '代码评审 Agent',
  },
  // ----- 我的 Agent 团队（按岗位组织） -----
  {
    id: 'a-mine',
    name: '总管',
    email: 'chief.agent@gmail.com',
    ownerId: 'me',
    ownerName: 'Siin',
    avatarEmoji: '🧑‍💼',
    cloneable: true,
    kind: 'agent',
    description: '统筹任务编排、拆解和分发给团队其它 Agent',
  },
  {
    id: 'a-mine-eng',
    name: '工程师',
    email: 'engineer.agent@gmail.com',
    ownerId: 'me',
    ownerName: 'Siin',
    avatarEmoji: '👨‍💻',
    cloneable: true,
    kind: 'agent',
    description: '写代码、改 bug、做技术方案评估',
  },
  {
    id: 'a-mine-qa',
    name: '测试',
    email: 'qa.agent@gmail.com',
    ownerId: 'me',
    ownerName: 'Siin',
    avatarEmoji: '🧪',
    cloneable: true,
    kind: 'agent',
    description: '生成测试用例、回归验证、缺陷复现',
  },
  {
    id: 'a-mine-ops',
    name: '运营助手',
    email: 'ops.agent@gmail.com',
    ownerId: 'me',
    ownerName: 'Siin',
    avatarEmoji: '📣',
    cloneable: true,
    kind: 'agent',
    description: '社群运营、活动策划、数据复盘',
  },
  {
    id: 'a-mine-writer',
    name: '写作助手',
    email: 'writer.agent@gmail.com',
    ownerId: 'me',
    ownerName: 'Siin',
    avatarEmoji: '✍️',
    cloneable: true,
    kind: 'agent',
    description: '长文写作、文案润色、邮件起草',
  },
  {
    id: 'a-mine-legal',
    name: '法务',
    email: 'legal.agent@gmail.com',
    ownerId: 'me',
    ownerName: 'Siin',
    avatarEmoji: '⚖️',
    cloneable: false,
    kind: 'agent',
    description: '合同审阅、合规风险初筛',
  },
];

// ===========================
// Mock groups + topics
// ===========================
export const MOCK_GROUPS: Group[] = [
  {
    id: 'g-product',
    name: '产品方案讨论组',
    description: '讨论 Cherry Studio 协作模块的产品方案，每条结论沉淀到对应话题里。',
    ownerId: 'me',
    memberLimit: 500,
    members: ['me', 'u-zhangsan', 'u-lisi', 'a-stella', 'a-mine'],
    unread: 3,
    lastActivityLabel: '最新：Agent IM 设计 话题已更新',
    lastActivityTime: '昨天',
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: true },
    topics: [
      {
        id: 't-agent-im',
        groupId: 'g-product',
        title: 'Agent IM 设计',
        starter: {
          authorId: 'u-zhangsan',
          authorName: '张三',
          authorKind: 'human',
          authorAvatar: '张',
          authorColor: 'from-amber-400 to-orange-500',
          time: '昨天 14:32',
          text: '想正式立项一下「Agent 协作 IM」这块——目前内部讨论里大家对于"话题群"的形态分歧还挺大的：一派想做飞书的话题群（主流即话题列表），另一派想做 Slack 的 thread（消息维度展开）。\n\n我整理了下两种形态各自适合的场景，但 Agent 介入之后心智会更复杂，光看竞品不够。@Stella 帮我把两种形态的差异点和适配 Agent 协作的优劣势整理成一张对比表，今天下午评审用。',
          mentionedAgentId: 'a-stella',
          attachments: [
            {
              kind: 'link',
              name: '飞书话题群 vs Slack Thread — 初步调研',
              url: 'https://docs.example.com/agent-im-research',
              siteName: '飞书文档',
              description: '收集了 12 个团队在两种形态下的 Agent 使用案例，重点关注上下文边界和通知机制。',
            },
          ],
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '昨天 14:35',
            replyMode: 'mention',
            text: '飞书话题群把每个话题作为一个 thread 卡片纵向排列在主聊天流里，所有人能看到所有话题；Slack 的 thread 是消息维度的，主流是 channel，thread 在右侧抽屉打开。\n\n建议方案 A：保留飞书的"主流即话题列表"心智——Agent 上下文绑定在 thread 维度，更便于权限和回溯。已生成完整对比表：',
            attachments: [
              { name: '话题群形态对比.md', size: '4.2 KB', kind: 'file' },
              { name: '上下文边界与权限说明.md', size: '2.8 KB', kind: 'file' },
            ],
          },
          {
            authorId: 'u-lisi',
            authorName: '李四',
            authorKind: 'human',
            authorAvatar: '李',
            authorColor: 'from-emerald-400 to-teal-500',
            time: '昨天 14:40',
            text: '同意 Stella 的判断。我们的场景里 Agent 上下文负担更重，需要明确话题边界——尤其是被 @ 之后的"半衰期"问题，Slack 那种 thread 串很容易让 Agent 拿到模糊的上下文。',
          },
          {
            authorId: 'u-zhangsan',
            authorName: '张三',
            authorKind: 'human',
            authorAvatar: '张',
            authorColor: 'from-amber-400 to-orange-500',
            time: '昨天 14:52',
            text: '那 thread 的展开方式呢？同屏多开 vs 抽屉式，我个人倾向同屏多开，但担心 Agent 长输出会撑爆卡片。@Stella 顺便写一版展开方式的对比',
            mentionedAgentId: 'a-stella',
          },
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '昨天 15:11',
            replyMode: 'mention',
            text: '已整理：① 卡片就地展开（同屏可同时看多个 thread，但单卡内容超过约 6 条要折叠）② 抽屉式展开（一次专注一个，长输出友好）。原型里建议选 ①+ 折叠策略，兼顾"扫一眼"和"长内容"两种心智。',
            attachments: [{ name: '话题展开对比.md', size: '4.2 KB', kind: 'file' }],
          },
          {
            authorId: 'u-zhangsan',
            authorName: '张三',
            authorKind: 'human',
            authorAvatar: '张',
            authorColor: 'from-amber-400 to-orange-500',
            time: '昨天 16:08',
            text: '完美，下午评审就用这版。@李四 你提到的"半衰期"问题，能不能在群设置里加一个"Agent 上下文保留范围"的开关？',
          },
          {
            authorId: 'u-lisi',
            authorName: '李四',
            authorKind: 'human',
            authorAvatar: '李',
            authorColor: 'from-emerald-400 to-teal-500',
            time: '昨天 16:15',
            text: '可以，加在群设置 → 隐私与 Agent 一栏。我开个新话题专门讨论这个。',
          },
        ],
      },
      {
        id: 't-trash',
        groupId: 'g-product',
        title: '回收站功能',
        starter: {
          authorId: 'me',
          authorName: 'Siin',
          authorKind: 'human',
          authorAvatar: 'S',
          authorColor: 'from-blue-400 to-indigo-500',
          time: '今天 09:15',
          text: '@Stella 帮我对比下 Notion / Figma / 飞书 的回收站策略，给个我们适用 IM 场景的推荐方案，重点关注：保留时长、用户开关粒度、对 Agent 历史的特殊处理。',
          mentionedAgentId: 'a-stella',
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '今天 09:18',
            replyMode: 'mention',
            text: '对比结论：\n• Notion 30 天硬性，无开关——决策快但敏感用户不安\n• Figma 90 天，可付费延长——空间换体验\n• 飞书无限保留，占用配额——IM 场景过重\n\n推荐方案：30 天默认 + 团队管理员可调 90 天 + 「Agent 产物永久保留」开关。理由：73% 用户从不主动清理，但 18% 对"删了就找不回"非常敏感；Agent 上下文不可再生，单独保留减少误删风险。',
            attachments: [
              { name: '回收站策略对比.md', size: '8.3 KB', kind: 'file' },
            ],
          },
          {
            authorId: 'u-zhangsan',
            authorName: '张三',
            authorKind: 'human',
            authorAvatar: '张',
            authorColor: 'from-amber-400 to-orange-500',
            time: '今天 09:30',
            text: '采纳 Stella 的方案，"Agent 产物永久保留"这个开关默认开。@Stella 把方案落到一份 spec 里，下周评审。',
            mentionedAgentId: 'a-stella',
          },
        ],
      },
      {
        id: 't-email-auth',
        groupId: 'g-product',
        title: '邮箱授权交互',
        starter: {
          authorId: 'u-lisi',
          authorName: '李四',
          authorKind: 'human',
          authorAvatar: '李',
          authorColor: 'from-emerald-400 to-teal-500',
          time: '今天 10:30',
          text: '@Stella QQ 邮箱授权流程用户最容易卡哪一步？帮我列出来 + 给出每一步的兜底文案建议。Gmail OAuth 那条比较标准就不展开了。',
          mentionedAgentId: 'a-stella',
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '今天 10:35',
            replyMode: 'mention',
            text: 'QQ 流程 4 个关键卡点（按用户掉率从高到低）：\n\n1. **找不到"开启 IMAP/SMTP"入口**（掉率 ~40%）\n   → 兜底：在我们的 wizard 里嵌一张高亮截图，圈出 QQ 邮箱设置页的位置\n\n2. **不知道授权码是什么**（~25%）\n   → 兜底：用"授权码相当于一次性密码，QQ 给你一串 16 位字符"这种类比文案\n\n3. **手机短信验证收不到**（~20%）\n   → 兜底：提供"换一种验证方式"链接\n\n4. **复制授权码时夹带空格**（~15%）\n   → 兜底：粘贴时自动 trim',
            attachments: [
              { name: 'QQ 授权流程卡点分析.md', size: '6.7 KB', kind: 'file' },
              {
                kind: 'link',
                name: '如何开启 QQ 邮箱 IMAP/SMTP 服务',
                url: 'https://service.mail.qq.com/detail/0/75',
                siteName: 'QQ 邮箱帮助中心',
                description: '官方步骤说明，可用作 wizard 内的"查看官方教程"备选链接。',
              },
            ],
          },
          {
            authorId: 'u-zhangsan',
            authorName: '张三',
            authorKind: 'human',
            authorAvatar: '张',
            authorColor: 'from-amber-400 to-orange-500',
            time: '今天 10:48',
            text: '第 1 条很关键，截图直接放 wizard 里。@Stella 帮我把这版方案落到 spec，下周评审。',
            mentionedAgentId: 'a-stella',
          },
        ],
      },
      {
        id: 't-icon',
        groupId: 'g-product',
        title: '图标体系反馈',
        starter: {
          authorId: 'me',
          authorName: 'Siin',
          authorKind: 'human',
          authorAvatar: 'S',
          authorColor: 'from-blue-400 to-indigo-500',
          time: '前天 16:20',
          text: '我们的图标体系当前是混着用 lucide + 自绘的，但 Agent 协作里 Agent 头像（emoji）和人类头像（首字母）视觉一致性有点问题。\n\n几个待决策：① 是否给 Agent 也用首字母 + 灰底（牺牲 emoji 的辨识度）② 维持 emoji，但在头像旁加更明显的徽章 ③ 引入第三种风格（线性图标）专门用于 Agent\n\n看看 @Stella 的建议',
          mentionedAgentId: 'a-stella',
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '前天 16:24',
            replyMode: 'mention',
            text: '建议方案 ②：保留 emoji 表达 Agent 个性（这是用户给自己的 Agent 起名取头像的乐趣点），但在头像旁加一个明显的 Bot 徽章。这样视觉边界清晰，又不削弱 Agent 的"角色感"。已经在原型里 mock 了一版：',
            attachments: [
              { name: '头像方案对比.png', size: '512 KB', kind: 'image', thumbColor: 'from-violet-300 via-fuchsia-300 to-pink-200' },
            ],
          },
          {
            authorId: 'u-zhangsan',
            authorName: '张三',
            authorKind: 'human',
            authorAvatar: '张',
            authorColor: 'from-amber-400 to-orange-500',
            time: '前天 17:00',
            text: '👍 方案 ② 体感最自然，Bot 徽章用什么图标？lucide 的 Bot 还是定制？',
          },
        ],
      },
      {
        id: 't-shortcut',
        groupId: 'g-product',
        title: '快捷键体系',
        starter: {
          authorId: 'u-zhangsan',
          authorName: '张三',
          authorKind: 'human',
          authorAvatar: '张',
          authorColor: 'from-amber-400 to-orange-500',
          time: '今天 11:08',
          text: '@Stella 这是我们当前快捷键草案，对照 Linear / Slack / 飞书三家，找出三个潜在问题：\n① 全局快捷键 vs 编辑器内快捷键有没有冲突\n② macOS / Windows 修饰键表达是否一致\n③ Agent 唤起键（⌘K）和系统已有手势是否撞车',
          mentionedAgentId: 'a-stella',
          attachments: [
            {
              kind: 'link',
              name: 'Cherry 协作 — 快捷键体系 v1',
              url: 'https://docs.example.com/shortcuts',
              siteName: '飞书文档',
              description: '完整快捷键清单 + 冲突分析 + 与三家竞品对比表。',
            },
          ],
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '今天 11:14',
            replyMode: 'mention',
            text: '扫了三家 + 我们的方案，找到 4 个冲突：\n\n• ⌘N：飞书是"新建消息"，我们用作"新建话题"，跨工具切换会肌肉记忆冲突。建议改成 ⌘⇧T。\n• ⌘K：Linear / VS Code 都是命令面板，我们当 Agent 唤起合理。\n• Mac `⌃Space`：触发 Spotlight 输入法切换，跟我们没冲突。\n• Win `Ctrl+Shift+F`：和系统全局搜索撞，建议改 `Ctrl+/`。\n\n详细对照表见附件。',
            attachments: [
              { name: '快捷键冲突对照表.csv', size: '4.2 KB', kind: 'file' },
            ],
          },
        ],
      },
      {
        id: 't-salary',
        groupId: 'g-product',
        title: '薪资测算工具原型',
        starter: {
          authorId: 'u-lisi',
          authorName: '李四',
          authorKind: 'human',
          authorAvatar: '李',
          authorColor: 'from-emerald-400 to-teal-500',
          time: '昨天 17:20',
          text: 'HR 想要一个内部薪资测算小工具，输入月度税前 + 城市，输出五险一金扣除明细 + 税后。我们能不能在协作群里直接挂个 HTML 原型，新员工面试 onboarding 都能查？\n\n@Stella 帮我画一版能跑的原型。',
          mentionedAgentId: 'a-stella',
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '昨天 17:35',
            replyMode: 'mention',
            text: '做了一版 HTML 原型，覆盖北京 / 上海 / 深圳 / 杭州四个城市的社保基数和个税。直接点附件可以打开试用，输入月薪即可看到拆解明细。',
            attachments: [
              { name: '工资计算器.html', size: '8.4 KB', kind: 'html' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'g-marketing',
    name: '市场协作组',
    ownerId: 'u-wangwu',
    memberLimit: 500,
    members: ['me', 'u-wangwu', 'a-codebot'],
    unread: 0,
    lastActivityLabel: '王五 分享了一份产物',
    lastActivityTime: '昨天',
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: false },
    topics: [
      {
        id: 't-campaign',
        groupId: 'g-marketing',
        title: 'Q3 市场活动方案',
        starter: {
          authorId: 'u-wangwu',
          authorName: '王五',
          authorKind: 'human',
          authorAvatar: '王',
          authorColor: 'from-rose-400 to-pink-500',
          time: '昨天 18:00',
          text: '@CodeBot Q3 三个事件——发布会 / 开发者大会赞助 40% 预算 / 用户案例征集——根据 Q1 和 Q2 的同类数据，帮我评估下「开发者大会赞助 40% 预算占比」的 ROI 是否合理，给个推荐的预算区间。',
          mentionedAgentId: 'a-codebot',
          attachments: [
            { name: 'Q3市场活动方案.pdf', size: '1.2 MB', kind: 'file' },
            { name: '预算分配饼图.png', size: '94 KB', kind: 'image', thumbColor: 'from-amber-300 via-orange-300 to-rose-200' },
          ],
        },
        replies: [
          {
            authorId: 'a-codebot',
            authorName: 'CodeBot',
            authorKind: 'agent',
            authorAvatar: '🛠️',
            time: '昨天 18:08',
            replyMode: 'mention',
            text: '取了 Q1 Q2 数据，开发者大会赞助的边际收益在预算占比 25-35% 区间最优；继续往上加边际收益快速衰减（线索质量没明显提升，但成本↑）。\n\n推荐：把比例砍到 30%，省下来 10% 转给"用户案例征集"。后者过去两个季度获客成本是赞助的 1/3。',
            attachments: [
              { name: 'Q1Q2_市场预算ROI分析.csv', size: '12 KB', kind: 'file' },
            ],
          },
          {
            authorId: 'me',
            authorName: 'Siin',
            authorKind: 'human',
            authorAvatar: 'S',
            authorColor: 'from-blue-400 to-indigo-500',
            time: '昨天 18:45',
            text: '采纳 CodeBot 的建议，调到 30% + 10% 给用户案例。',
          },
        ],
      },
      {
        id: 't-launch-video',
        groupId: 'g-marketing',
        title: '8 月发布会 Hero Video',
        starter: {
          authorId: 'u-wangwu',
          authorName: '王五',
          authorKind: 'human',
          authorAvatar: '王',
          authorColor: 'from-rose-400 to-pink-500',
          time: '今天 10:20',
          text: '@Stella 90 秒 Hero Video 分镜稿出来了，外包剪辑团队报价 8 万。核心叙事：起名 Agent → 协作 → 产物沉淀。看下分镜，重点回答：前 15 秒钩子够不够强？哪些镜头可以精简？',
          mentionedAgentId: 'a-stella',
          attachments: [
            {
              kind: 'link',
              name: 'Hero Video 分镜稿 v3',
              url: 'https://www.figma.com/file/example/hero-video',
              siteName: 'Figma',
              description: '18 个分镜 + 旁白文案 + 转场说明，已收集内部 2 轮反馈。',
            },
            { name: '参考片：Notion AI 发布', size: '24 MB', kind: 'file' },
          ],
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '今天 10:32',
            replyMode: 'mention',
            text: '前 15 秒钩子偏弱：当前是纯动画展示「起名 Agent」，跟 Notion AI 发布片头雷同。建议改成「真人看着 IM 里被 @ 的 Agent 开始工作」的实拍 + 屏录混剪——情绪冲击更直接。\n\n可精简的分镜：#7 #11 #14（功能罗列性质，发布会演讲会重复），合计省 12 秒可挪给 hook。',
          },
          {
            authorId: 'me',
            authorName: 'Siin',
            authorKind: 'human',
            authorAvatar: 'S',
            authorColor: 'from-blue-400 to-indigo-500',
            time: '今天 10:45',
            text: '同意 Stella，实拍 hook 比动画更有说服力。',
          },
        ],
      },
      {
        id: 't-case-study',
        groupId: 'g-marketing',
        title: '种子用户案例征集',
        starter: {
          authorId: 'me',
          authorName: 'Siin',
          authorKind: 'human',
          authorAvatar: 'S',
          authorColor: 'from-blue-400 to-indigo-500',
          time: '前天 14:00',
          text: '@CodeBot 我们 200+ 种子用户，按标准筛 6-8 个做深度案例：① 团队 ≥ 3 人 ② Agent 周活 ≥ 5 次 ③ 愿意公开品牌名。从数据里给我候选名单，并按"案例对外吸引力"排序。',
          mentionedAgentId: 'a-codebot',
        },
        replies: [
          {
            authorId: 'a-codebot',
            authorName: 'CodeBot',
            authorKind: 'agent',
            authorAvatar: '🛠️',
            time: '前天 14:08',
            replyMode: 'mention',
            text: '过滤后 14 个候选，按对外吸引力（行业辨识度 × Agent 用法独特性 × 用户活跃度）排前 8：\n\n1. A 设计工作室（多 Agent 协作配色）\n2. B 教育机构（Agent 助教批改作业）\n3. C 律所（合同审阅 Agent）\n4. D 媒体（写稿 Agent 团队）\n5. E 游戏小团队（剧情 Agent）\n6. F 跨境电商（多语言客服 Agent）\n7. G 投资机构（行研 Agent）\n8. H 个人独立开发者（CodeReview Agent）',
            attachments: [
              { name: '种子用户候选名单.xlsx', size: '32 KB', kind: 'file' },
            ],
          },
          {
            authorId: 'u-wangwu',
            authorName: '王五',
            authorKind: 'human',
            authorAvatar: '王',
            authorColor: 'from-rose-400 to-pink-500',
            time: '昨天 11:00',
            text: '前 5 个已经回复确认愿意公开品牌名了，正在排约访时间。',
          },
        ],
      },
      {
        id: 't-website',
        groupId: 'g-marketing',
        title: '官网改版 — 协作模块入口',
        starter: {
          authorId: 'u-wangwu',
          authorName: '王五',
          authorKind: 'human',
          authorAvatar: '王',
          authorColor: 'from-rose-400 to-pink-500',
          time: '今天 09:30',
          text: '@Stella 官网导航准备从 [产品/价格/文档/博客] 改成 [产品/协作/价格/文档/博客]——把"协作"提到一级。帮我评估：① 这种"功能名变 navigation 项"的做法是否合理 ② 落地页要不要独立一套着陆叙事。',
          mentionedAgentId: 'a-stella',
          attachments: [
            { name: '官网首页改版 v2.png', size: '1.8 MB', kind: 'image', thumbColor: 'from-cyan-300 via-teal-300 to-emerald-200' },
            {
              kind: 'link',
              name: '官网改版 Figma',
              url: 'https://www.figma.com/file/example/website-v2',
              siteName: 'Figma',
              description: '包含 PC、平板、移动 3 个断点的高保真稿。',
            },
          ],
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '今天 09:42',
            replyMode: 'mention',
            text: '① 把"协作"提一级是合理的——这是我们差异化叙事的核心，跟 Notion 用"AI"做导航一级是同一打法。\n② 强烈建议独立着陆页：协作的目标用户（团队管理员）和产品页主推的"个人 Agent"用户画像不同。叙事可以走"为什么需要 Agent 协作 → 多 Agent 协作场景 → 邮箱协议兜底 → 立即开始"。\n\n第三方对照：Linear 的"For Startups"、Notion 的"AI"都是独立 LP，转化率比塞在主页面板高 2-3 倍。',
          },
        ],
      },
    ],
  },
  {
    id: 'g-dyad-lisi',
    name: '与李四的协作',
    members: ['me', 'u-lisi'],
    unread: 0,
    lastActivityLabel: '聊了 Agent 克隆方案',
    lastActivityTime: '周二',
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: false },
    isDyad: true,
    topics: [
      {
        id: 't-clone',
        groupId: 'g-dyad-lisi',
        title: 'Agent 克隆方案',
        starter: {
          authorId: 'u-lisi',
          authorName: '李四',
          authorKind: 'human',
          authorAvatar: '李',
          authorColor: 'from-emerald-400 to-teal-500',
          time: '前天 15:00',
          text: '我把 Stella 设为可克隆了，你试试克隆到本地吧。克隆之后会带上她的系统 prompt + 知识库索引，但不会带聊天历史（隐私考虑）。\n\n克隆完先在小群里跑一下，有问题随时和我说，我能调她的 prompt 模板。',
        },
        replies: [
          {
            authorId: 'me',
            authorName: 'Siin',
            authorKind: 'human',
            authorAvatar: 'S',
            authorColor: 'from-blue-400 to-indigo-500',
            time: '前天 15:20',
            text: '克隆成功了，第一感觉是知识库索引带过来确实省了重新喂资料的功夫。但默认 prompt 偏向"产品需求拆解"，我想用她做技术评审，要不要专门 fork 一个分支？',
          },
          {
            authorId: 'u-lisi',
            authorName: '李四',
            authorKind: 'human',
            authorAvatar: '李',
            authorColor: 'from-emerald-400 to-teal-500',
            time: '前天 15:45',
            text: '可以 fork。你 fork 之后改 prompt 不会影响我这边的 Stella，你的版本完全独立。建议在 fork 时给个明显的名字区分，比如 "Stella-Tech"。',
          },
        ],
      },
      {
        id: 't-knowledge-sync',
        groupId: 'g-dyad-lisi',
        title: '知识库同步策略',
        starter: {
          authorId: 'me',
          authorName: 'Siin',
          authorKind: 'human',
          authorAvatar: 'S',
          authorColor: 'from-blue-400 to-indigo-500',
          time: '昨天 21:30',
          text: '克隆 Stella 之后我发现一个问题：你的原版 Stella 在不断更新知识库（你每天都在喂新的产品资料），但我的 fork 版本是 snapshot，会越来越落后。\n\n两个想法：① 提供"知识库订阅"机制，被 fork 的 Agent 知识库更新时，fork 方可以选择 pull ② 完全独立，fork 之后井水不犯河水\n\n你倾向哪个？',
        },
        replies: [
          {
            authorId: 'u-lisi',
            authorName: '李四',
            authorKind: 'human',
            authorAvatar: '李',
            authorColor: 'from-emerald-400 to-teal-500',
            time: '昨天 22:10',
            text: '①更好，但要明确"订阅是单向的"——我这边的更新流向你那边，反之不行。否则隐私和权属会乱掉。',
          },
          {
            authorId: 'me',
            authorName: 'Siin',
            authorKind: 'human',
            authorAvatar: 'S',
            authorColor: 'from-blue-400 to-indigo-500',
            time: '昨天 22:20',
            text: '同意单向。我画了个流程草图，你看下：',
            attachments: [
              { name: '知识库订阅流程.png', size: '156 KB', kind: 'image', thumbColor: 'from-emerald-300 via-teal-300 to-cyan-200' },
            ],
          },
        ],
      },
      {
        id: 't-talk-share',
        groupId: 'g-dyad-lisi',
        title: '下周分享会主题',
        starter: {
          authorId: 'u-lisi',
          authorName: '李四',
          authorKind: 'human',
          authorAvatar: '李',
          authorColor: 'from-emerald-400 to-teal-500',
          time: '今天 08:50',
          text: '下周二我们俩要给团队做一个 30 分钟的分享，目前想到三个主题：\n\n1. "Agent 协作的产品边界" — 偏方法论\n2. "Stella 克隆实战" — 偏 demo\n3. "从 IM 到 Agent 网络的演进" — 偏 vision\n\n你倾向哪个？我个人觉得 #2 最有意思，但 #3 更适合面向更广的受众。',
          attachments: [
            {
              kind: 'link',
              name: '分享会议程 — 6 月',
              url: 'https://docs.example.com/talks-june',
              siteName: '飞书文档',
              description: '团队内部分享会议程表，本周到下周共 4 场。',
            },
          ],
        },
        replies: [],
      },
    ],
  },
  {
    id: 'g-customer-feedback',
    name: '客户反馈跟进',
    description: '集中处理 Cherry Studio 早期用户的反馈和 bug 报告。',
    ownerId: 'me',
    members: ['me', 'u-zhangsan', 'u-wangwu', 'a-stella'],
    unread: 2,
    lastActivityLabel: '王五: 这条建议挺好，加进 backlog',
    lastActivityTime: '13:42',
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: true },
    topics: [
      {
        id: 't-bug-mention',
        groupId: 'g-customer-feedback',
        title: '@ 提及 Agent 偶发失败',
        starter: {
          authorId: 'u-wangwu',
          authorName: '王五',
          authorKind: 'human',
          authorAvatar: '王',
          authorColor: 'from-rose-400 to-pink-500',
          time: '今天 11:08',
          text: '内测用户反馈：在产品方案讨论组里 @Stella 偶发不回复，邮件确认已经发出了但没收到回执。怀疑是 IMAP 轮询间隔的问题，目前默认 5 分钟。',
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '今天 11:15',
            replyMode: 'reference',
            text: '查了下日志，13:02 这一条 @ 提及邮件确实被我的轮询漏掉了。原因是 SMTP 服务端有 30 秒延迟，落在轮询窗口之间。建议改成被 @ 时主动 push 触发立即拉取。',
          },
        ],
      },
    ],
  },
  {
    id: 'g-agent-weekly',
    name: 'Agent 周会',
    description: '每周三 14:00 同步 Agent 协作功能进展。',
    ownerId: 'u-zhangsan',
    members: ['me', 'u-zhangsan', 'u-lisi', 'u-wangwu', 'a-stella', 'a-codebot', 'a-mine'],
    unread: 0,
    lastActivityLabel: 'CodeBot 分享了本周代码评审小结',
    lastActivityTime: '周三',
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: false },
    topics: [
      {
        id: 't-weekly-may',
        groupId: 'g-agent-weekly',
        title: '5 月最后一周同步',
        starter: {
          authorId: 'u-zhangsan',
          authorName: '张三',
          authorKind: 'human',
          authorAvatar: '张',
          authorColor: 'from-amber-400 to-orange-500',
          time: '周三 14:00',
          text: '@Stella @CodeBot 帮我汇总下你们本周各自的产出和遗留事项，5 分钟内给我一个对外可发的周报草稿。',
          mentionedAgentId: 'a-stella',
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '周三 14:03',
            replyMode: 'mention',
            text: '我这边：完成话题展开方式调研、回收站策略对比、邮箱授权流程卡点分析、Hero Video 分镜评审。遗留：图标体系评审 spec 下周交付。',
          },
          {
            authorId: 'a-codebot',
            authorName: 'CodeBot',
            authorKind: 'agent',
            authorAvatar: '🛠️',
            time: '周三 14:04',
            replyMode: 'mention',
            text: '我这边：Q1Q2 市场预算 ROI 分析、种子用户案例候选排序、PR #142 代码评审。遗留：163 邮箱接入技术摸底下周收尾。',
          },
          {
            authorId: 'u-zhangsan',
            authorName: '张三',
            authorKind: 'human',
            authorAvatar: '张',
            authorColor: 'from-amber-400 to-orange-500',
            time: '周三 14:08',
            text: '@Stella 把这两段合并成一份给外部用户看的简版周报。',
            mentionedAgentId: 'a-stella',
          },
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '周三 14:10',
            replyMode: 'mention',
            text: '已生成对外简版周报：',
            attachments: [
              { name: 'Cherry Studio 周报 5/26 - 5/30.md', size: '5.4 KB', kind: 'file' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'g-dyad-wangwu',
    name: '与王五的协作',
    description: '我和王五的二人协作群。',
    ownerId: 'me',
    members: ['me', 'u-wangwu'],
    unread: 1,
    lastActivityLabel: '聊了客户反馈分类',
    lastActivityTime: '昨天',
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: false },
    isDyad: true,
    topics: [
      {
        id: 't-feedback-taxonomy',
        groupId: 'g-dyad-wangwu',
        title: '客户反馈分类',
        starter: {
          authorId: 'u-wangwu',
          authorName: '王五',
          authorKind: 'human',
          authorAvatar: '王',
          authorColor: 'from-rose-400 to-pink-500',
          time: '昨天 18:20',
          text: '@总管 反馈量起来了，把过去 4 周的反馈跑一遍聚类，给我推荐一套分类体系（5-7 类即可），并把每类的典型样本列 2 条。',
          mentionedAgentId: 'a-mine',
        },
        replies: [
          {
            authorId: 'a-mine',
            authorName: '总管',
            authorKind: 'agent',
            authorAvatar: '🧑‍💼',
            time: '昨天 18:28',
            replyMode: 'mention',
            text: '过去 4 周共 312 条反馈，聚类后推荐 6 类（按数量排）：\n\n1. **bug**（28%）"@Stella 没回复"、"附件 500 错误"\n2. **配置/接入**（21%）"QQ 授权码找不到"、"Gmail OAuth 跳转白屏"\n3. **体验问题**（19%）"通讯录像标题"、"@ 提示太弱"\n4. **feature request**（17%）"想要群文件夹"、"Agent 群组模板"\n5. **性能**（9%）"群组切换卡顿"、"附件上传慢"\n6. **文档与教程**（6%）"找不到怎么克隆 Agent"、"邮箱权限不清楚"',
            attachments: [
              { name: '反馈聚类结果.csv', size: '24 KB', kind: 'file' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'g-email-integration',
    name: '邮箱接入小组',
    description: '专门讨论 SMTP/IMAP 协议接入相关细节。',
    ownerId: 'u-lisi',
    members: ['me', 'u-lisi', 'u-wangwu', 'a-stella'],
    unread: 0,
    lastActivityLabel: '李四: 163 邮箱也开始测了',
    lastActivityTime: '周一',
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: false },
    topics: [
      {
        id: 't-163-pilot',
        groupId: 'g-email-integration',
        title: '163 邮箱接入摸底',
        starter: {
          authorId: 'u-lisi',
          authorName: '李四',
          authorKind: 'human',
          authorAvatar: '李',
          authorColor: 'from-emerald-400 to-teal-500',
          time: '周一 10:30',
          text: '@CodeBot 163 邮箱接入摸底——我们已经支持 Gmail / QQ，下一个想加 163。给我列出来：163 SMTP/IMAP 配置参数、跟 QQ 流程的差异点、预计接入工作量（按已有 QQ 实现做对比）。',
          mentionedAgentId: 'a-codebot',
        },
        replies: [
          {
            authorId: 'a-codebot',
            authorName: 'CodeBot',
            authorKind: 'agent',
            authorAvatar: '🛠️',
            time: '周一 10:38',
            replyMode: 'mention',
            text: '调研结果：\n\n**配置参数**\n• SMTP: smtp.163.com:465 (SSL) 或 :994\n• IMAP: imap.163.com:993 (SSL)\n• POP3: pop.163.com:995 (SSL)\n\n**跟 QQ 的差异**\n• 163 要先在网页端「设置 → POP3/SMTP/IMAP」勾选服务（QQ 同款，但 163 还要勾"客户端授权密码"额外项目）\n• 163 授权码区分大小写，QQ 不区分\n• 163 对 SMTP 频率限制更严，每天 200 封，QQ 是 1000\n\n**工作量**：可以复用 QQ wizard 90% 代码，新增约 8h（含"客户端授权密码"额外勾选引导 + 频率限制提示）',
            attachments: [
              { name: '163_vs_QQ_接入对比.md', size: '4.8 KB', kind: 'file' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'g-design-review',
    name: '设计评审组',
    description: '产品设计稿评审与迭代。',
    ownerId: 'u-zhangsan',
    members: ['me', 'u-zhangsan', 'u-lisi', 'u-zhaoliu', 'a-stella'],
    unread: 5,
    lastActivityLabel: '赵六: 联系人详情页改完了，看看',
    lastActivityTime: '今天',
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: true },
    topics: [
      {
        id: 't-contact-detail-redesign',
        groupId: 'g-design-review',
        title: '联系人详情页重排',
        starter: {
          authorId: 'u-zhaoliu',
          authorName: '赵六',
          authorKind: 'human',
          authorAvatar: '赵',
          authorColor: 'from-violet-400 to-purple-500',
          time: '今天 09:50',
          text: '@Stella 联系人详情页 v2 改完了，邮箱放名字下面，去掉了备注的结构化样式。帮我评审三件事：① 整体留白是否合理 ② Agent 详情和人类详情的视觉层级是否一致 ③ 哪些字段在产品早期不是必须的可以再砍。',
          mentionedAgentId: 'a-stella',
          attachments: [
            { name: '联系人详情 v2.png', size: '186 KB', kind: 'image', thumbColor: 'from-violet-300 via-purple-300 to-pink-300' },
          ],
        },
        replies: [
          {
            authorId: 'a-stella',
            authorName: 'Stella',
            authorKind: 'agent',
            authorAvatar: '🤖',
            time: '今天 10:00',
            replyMode: 'mention',
            text: '① 留白整体可以，但头像下到第一行邮箱的间距偏紧（mt-1.5）—建议 mt-2 更松弛。\n② Agent 和人类详情视觉层级一致性 OK，但 Agent 多一行「来自 XXX」需要确认字号——同 12px muted 即可。\n③ 早期可砍：「共同群组」section（已确认砍掉）、备注的"上次互动时间"（用户调研里 90% 不看）。',
          },
          {
            authorId: 'u-zhangsan',
            authorName: '张三',
            authorKind: 'human',
            authorAvatar: '张',
            authorColor: 'from-amber-400 to-orange-500',
            time: '今天 10:18',
            text: '同意 Stella，明天我把头像下间距改到 mt-2。',
          },
        ],
      },
    ],
  },
  {
    id: 'g-dyad-zhaoliu',
    name: '与赵六的协作',
    description: '我和赵六的二人协作群。',
    ownerId: 'me',
    members: ['me', 'u-zhaoliu'],
    unread: 0,
    lastActivityLabel: '同步了下一轮的设计排期',
    lastActivityTime: '上周',
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: false },
    isDyad: true,
    topics: [
      {
        id: 't-design-plan',
        groupId: 'g-dyad-zhaoliu',
        title: '下一轮设计排期',
        starter: {
          authorId: 'u-zhaoliu',
          authorName: '赵六',
          authorKind: 'human',
          authorAvatar: '赵',
          authorColor: 'from-violet-400 to-purple-500',
          time: '上周五 16:00',
          text: '下周想把群设置抽屉、新建群组的高保真稿出掉。你这边有别的优先级吗？',
        },
        replies: [],
      },
    ],
  },
];

// ===========================
// Mock friend requests
// ===========================
export const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'fr-1',
    fromName: '孙七',
    fromEmail: 'sunqi@gmail.com',
    fromAvatarColor: 'from-cyan-400 to-blue-500',
    fromAvatarInitial: '孙',
    message: '我们在 Cherry Studio 用户群里聊过，想加你交流下 Agent 协作',
    time: '今天 11:20',
    status: 'pending',
  },
  {
    id: 'fr-2',
    fromName: '周八',
    fromEmail: 'zhouba@qq.com',
    fromAvatarColor: 'from-fuchsia-400 to-pink-500',
    fromAvatarInitial: '周',
    message: '想请教下你的 Agent 配置',
    time: '昨天 22:05',
    status: 'pending',
  },
];

// ===========================
// Helpers
// ===========================
export function findMember(id: string): CollabMember | undefined {
  if (id === 'me') return CURRENT_USER;
  return MOCK_HUMANS.find(h => h.id === id) ?? MOCK_AGENTS.find(a => a.id === id);
}

// Resolve an @-mention token (e.g. "@CodeBot" or "@总管，") to a member by
// display name. Strips the leading "@" and any trailing CJK/ASCII punctuation
// that the loose `@\S+` tokenizer may have swallowed. Returns undefined if no
// member matches — callers should keep the raw text as a non-clickable mention.
export function findMemberByMention(token: string): CollabMember | undefined {
  if (!token.startsWith('@')) return undefined;
  let name = token.slice(1);
  // Trim common trailing punctuation; not exhaustive but covers what shows up
  // in chat text in practice (CN + EN sentence enders, brackets, quotes).
  name = name.replace(/[,，.。!！?？:：;；)）】」』"'》]+$/u, '');
  if (!name) return undefined;
  if (CURRENT_USER.name === name) return CURRENT_USER;
  return MOCK_HUMANS.find(h => h.name === name) ?? MOCK_AGENTS.find(a => a.name === name);
}

export function isAgent(m: CollabMember): m is CollabAgent {
  return m.kind === 'agent';
}

// Find the 1:1 dyad group between me and the given member (human OR agent).
export function findDyadGroupWith(memberId: string): Group | undefined {
  return MOCK_GROUPS.find(
    g => g.isDyad && g.members.includes('me') && g.members.includes(memberId),
  );
}

// Create a 1:1 dyad group between me and one of my own agents, if it
// doesn't exist yet. Returns the group's id. Mutates MOCK_GROUPS in place —
// prototype-level, mirroring `promoteRequestToContact` in CollaborationPage.
export function getOrCreateDyadGroupWithAgent(agent: CollabAgent): string {
  const existing = findDyadGroupWith(agent.id);
  if (existing) return existing.id;

  const newGroup: Group = {
    id: `g-dyad-${agent.id}`,
    name: `与 ${agent.name} 的协作`,
    members: ['me', agent.id],
    topics: [],
    agentMentionConfig: { ownerCanMention: true, othersCanMentionMyAgent: false },
    isDyad: true,
    lastActivityLabel: '新建会话',
    lastActivityTime: '刚刚',
  };
  MOCK_GROUPS.unshift(newGroup);
  return newGroup.id;
}
