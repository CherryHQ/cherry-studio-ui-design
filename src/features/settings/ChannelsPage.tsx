import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, X, Copy, Pencil, Trash2, ChevronDown, ExternalLink, Eye, EyeOff,
  MessageSquare, Check, Info,
} from 'lucide-react';
import {
  Button, Input, Switch, BrandLogo, EmptyState, Typography,
  Popover, PopoverTrigger, PopoverContent,
} from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';

// ===========================
// Types
// ===========================
interface ChannelType {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: ChannelField[];
}

interface ChannelField {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'select' | 'textarea';
  halfWidth?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
  hintType?: 'info' | 'warning';
}

interface ChannelInstance {
  id: string;
  typeId: string;
  name: string;
  agentName?: string;
  enabled: boolean;
  status: 'online' | 'offline' | 'error';
  region?: string;
  config: Record<string, string>;
}

// ===========================
// Channel Type Definitions
// ===========================
const CHANNEL_TYPES: ChannelType[] = [
  {
    id: 'feishu', name: '飞书', description: '通过 WebSocket 使用飞书/Lark 机器人接收并回复消息。',
    icon: '🔵',
    fields: [
      { key: 'appId', label: '应用ID', placeholder: '输入你的飞书应用 ID', halfWidth: true },
      { key: 'appSecret', label: '应用密钥', placeholder: '输入你的飞书应用密钥', type: 'password', halfWidth: true },
      { key: 'encryptKey', label: '加密密钥', placeholder: '请输入来自你飞书应用的加...', type: 'password', halfWidth: true },
      { key: 'verifyToken', label: '验证令牌', placeholder: '输入你飞书应用中的验证令牌', type: 'password', halfWidth: true },
      { key: 'region', label: '域名', type: 'select', halfWidth: true, options: [
        { value: 'cn', label: '飞书（中国）' },
        { value: 'global', label: 'Lark (Global)' },
      ] },
      { key: 'chatIds', label: '允许的聊天 ID', placeholder: 'OC_XXXXX, OC_YYYYY', halfWidth: true, hint: '逗号分隔的聊天 ID，留空则允许所有聊天。', hintType: 'info' },
    ],
  },
  {
    id: 'telegram', name: 'Telegram', description: '通过 Telegram 机器人使用长轮询接收并回复消息。',
    icon: '💬',
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: '输入您的 Telegram 机器人 T...', type: 'password', halfWidth: true },
      { key: 'chatIds', label: '允许的会话 ID', placeholder: '123456789, 987654321', halfWidth: true, hint: '用逗号分隔，留空表示允许所有会话。', hintType: 'info' },
    ],
  },
  {
    id: 'qq', name: 'QQ', description: '通过 QQ 机器人官方 API 接收和回复消息。',
    icon: '🐧',
    fields: [
      { key: 'appId', label: 'App ID', placeholder: '输入您的 QQ 机器人 App ID', halfWidth: true },
      { key: 'clientSecret', label: 'Client Secret', placeholder: '输入您的 QQ 机器人 Client S...', type: 'password', halfWidth: true },
      { key: 'chatIds', label: '允许的会话 ID', placeholder: 'c2cabc123, group:groupId, channel:channelId...', hint: '格式：c2cabc123, group:groupId, channel:channelId，留空表示允许所有。', hintType: 'info' },
    ],
  },
  {
    id: 'wechat', name: '微信', description: '通过微信 Link Bot API 接收和回复消息。',
    icon: '💚',
    fields: [],
  },
  {
    id: 'discord', name: 'Discord', description: '通过 Discord 机器人使用 WebSocket 连接接收并回复消息。',
    icon: '🎮',
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: '输入您的 Discord 机器人 Token', type: 'password' },
      { key: 'channelIds', label: '允许的频道 ID', placeholder: 'channel:123456789, dm:987654321', hint: '格式：channel:id 或 dm:id，留空表示允许所有。', hintType: 'info' },
    ],
  },
  {
    id: 'slack', name: 'Slack', description: '通过 Slack 机器人使用 Socket Mode 接收并回复消息。',
    icon: '💼',
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: 'xoxb-...', type: 'password' },
      { key: 'appToken', label: '应用级别 Token', placeholder: 'xapp-...', type: 'password' },
      { key: 'channelIds', label: '允许的频道 ID', placeholder: 'C01234567, D89012345', hint: 'Slack 频道 ID，留空表示允许所有。', hintType: 'info' },
    ],
  },
];

const INITIAL_INSTANCES: ChannelInstance[] = [
  { id: 'i1', typeId: 'feishu', name: 'Feishu', agentName: undefined, enabled: true, status: 'online', region: 'Feishu (China)', config: { region: 'cn' } },
  { id: 'i2', typeId: 'feishu', name: 'Feishu 2', agentName: undefined, enabled: true, status: 'offline', region: 'Feishu (China)', config: { region: 'cn' } },
  { id: 'i3', typeId: 'telegram', name: 'Telegram', agentName: undefined, enabled: true, status: 'online', config: {} },
  { id: 'i4', typeId: 'qq', name: 'QQ', agentName: 'Cherry Assistant', enabled: false, status: 'offline', config: {} },
  { id: 'i5', typeId: 'wechat', name: 'WeChat 3', agentName: 'Cherry Assistant', enabled: true, status: 'error', config: {} },
  { id: 'i6', typeId: 'wechat', name: 'WeChat 2', agentName: undefined, enabled: false, status: 'offline', config: {} },
  { id: 'i7', typeId: 'discord', name: 'Discord', agentName: undefined, enabled: false, status: 'offline', config: {} },
  { id: 'i8', typeId: 'slack', name: 'Slack', agentName: undefined, enabled: false, status: 'offline', config: {} },
];

const MOCK_AGENTS = ['Cherry Assistant', 'AI 助手', '客服机器人', '新闻推送'];

const MOCK_LOGS = [
  { time: '10:37:49 PM', level: 'ERROR' as const, message: 'WeChat bot error: The operation was aborted due to timeout' },
  { time: '10:38:00 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
  { time: '10:38:12 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
  { time: '10:38:26 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
  { time: '10:38:44 PM', level: 'ERROR' as const, message: 'WeChat bot error: The operation was aborted due to timeout' },
  { time: '10:39:54 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
  { time: '10:40:14 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
  { time: '10:40:34 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
  { time: '10:40:54 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
  { time: '10:41:14 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
  { time: '10:41:34 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
  { time: '10:41:54 PM', level: 'ERROR' as const, message: 'WeChat bot error: net::ERR_CONNECTION_CLOSED' },
];

const PERMISSION_OPTIONS = [
  { value: 'inherit', label: '继承智能体设置' },
  { value: 'all', label: '允许所有权限' },
  { value: 'readonly', label: '只读模式' },
  { value: 'restricted', label: '受限模式' },
];

// ===========================
// Channel Type Icon
// ===========================
function ChannelIcon({ typeId, size = 18 }: { typeId: string; size?: number }) {
  const brandMap: Record<string, string> = {
    feishu: 'feishu', telegram: 'telegram', qq: 'qq',
    wechat: 'wechat', discord: 'discord', slack: 'slack',
  };
  const bid = brandMap[typeId];
  if (bid) return <BrandLogo id={bid} fallbackLetter={typeId[0].toUpperCase()} fallbackColor="#6b7280" size={size} />;
  return <MessageSquare size={size} />;
}

// ===========================
// Status Dot
// ===========================
function StatusDot({ status }: { status: ChannelInstance['status'] }) {
  const cls = status === 'online' ? 'bg-primary' : status === 'error' ? 'bg-destructive' : 'bg-muted-foreground/30';
  return <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cls}`} />;
}

// ===========================
// Dropdown Select (reusable)
// ===========================
function DropdownSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center w-full px-2.5 py-[5px] bg-muted/30 rounded-lg border border-section-border text-left hover:bg-muted/50 transition-colors"
          type="button"
        >
          <span className={`flex-1 text-sm truncate ${selected ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            {selected?.label || placeholder || '请选择'}
          </span>
          <ChevronDown size={12} className={`text-muted-foreground/40 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-1 w-[var(--radix-popover-trigger-width)]">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-left transition-colors ${
              opt.value === value ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            }`}
          >
            {opt.value === value && <Check size={10} className="flex-shrink-0" />}
            <span className={opt.value === value ? '' : 'pl-[18px]'}>{opt.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ===========================
// Edit Channel Side Panel
// ===========================
function EditChannelPanel({
  onClose, channelType, instance,
}: {
  onClose: () => void;
  channelType: ChannelType;
  instance?: ChannelInstance | null;
}) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [agentName, setAgentName] = useState(instance?.agentName || '');
  const [permission, setPermission] = useState('inherit');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(instance?.config || {});
  const title = instance?.name || channelType.name;
  const isWechat = channelType.id === 'wechat';

  const updateField = (key: string, val: string) => {
    setFieldValues((prev: Record<string, string>) => ({ ...prev, [key]: val }));
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-y-2 right-2 w-[320px] bg-background border border-section-border shadow-2xl flex flex-col z-[var(--z-sticky)] rounded-2xl"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-section-border flex-shrink-0">
        <span className="text-sm text-foreground font-semibold">{title}</span>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
          <X size={11} />
        </Button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin-xs">
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">名称</label>
          <Input defaultValue={title} className="h-8 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">绑定 Agent</label>
          <DropdownSelect
            value={agentName}
            onChange={setAgentName}
            options={MOCK_AGENTS.map(a => ({ value: a, label: a }))}
            placeholder="选择要绑定的 Agent"
          />
        </div>

        {isWechat ? (
          <div className="flex items-center gap-1">
            <Tooltip content="首次登录需要扫描二维码，启用频道后将自动弹出二维码。" side="left">
              <span className="text-accent-blue cursor-help"><Info size={12} /></span>
            </Tooltip>
            <span className="text-xs text-accent-blue">扫码登录</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <Tooltip content="未配置凭证，启用频道后将自动开始扫码注册，也可手动输入 App ID 和 App Secret。" side="left">
                <span className="text-accent-blue cursor-help"><Info size={12} /></span>
              </Tooltip>
              <span className="text-xs text-accent-blue">凭证配置</span>
            </div>

            {/* Dynamic fields */}
            <div className={channelType.fields.some(f => f.halfWidth) ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
              {channelType.fields.map(field => {
                const isPassword = field.type === 'password';
                const showPw = showPasswords[field.key] ?? false;

                const fieldContent = (
                  <div key={field.key}>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">{field.label}</label>
                    {field.type === 'select' ? (
                      <DropdownSelect
                        value={fieldValues[field.key] || field.options?.[0]?.value || ''}
                        onChange={(v) => updateField(field.key, v)}
                        options={field.options || []}
                      />
                    ) : (
                      <div className="relative">
                        <Input
                          type={isPassword && !showPw ? 'password' : 'text'}
                          placeholder={field.placeholder}
                          value={fieldValues[field.key] || ''}
                          onChange={(e) => updateField(field.key, e.target.value)}
                          className="h-8 text-sm pr-8"
                        />
                        {isPassword && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setShowPasswords((p: Record<string, boolean>) => ({ ...p, [field.key]: !showPw }))}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 hover:text-foreground"
                          >
                            {showPw ? <EyeOff size={10} /> : <Eye size={10} />}
                          </Button>
                        )}
                      </div>
                    )}
                    {field.hint && (
                      <Tooltip content={field.hint} side="left">
                        <span className={`inline-block mt-1 cursor-help ${field.hintType === 'warning' ? 'text-warning' : 'text-muted-foreground/30'}`}>
                          <Info size={10} />
                        </span>
                      </Tooltip>
                    )}
                  </div>
                );

                if (!field.halfWidth && channelType.fields.some(f => f.halfWidth)) {
                  return <div key={field.key} className="col-span-2">{fieldContent}</div>;
                }
                return fieldContent;
              })}
            </div>

            {channelType.fields.some(f => f.key === 'chatIds' || f.key === 'channelIds') && (
              <div className="flex items-center gap-1">
                <Tooltip content="留空时系统将自动监听。首先在对应平台上主动给 Bot 发送一条消息，系统才会记录 Chat ID 用于后续通知。" side="left">
                  <span className="text-warning cursor-help"><Info size={12} /></span>
                </Tooltip>
                <span className="text-xs text-warning">自动监听说明</span>
              </div>
            )}
            {channelType.id === 'qq' && (
              <div className="flex items-center gap-1">
                <Tooltip content="发送 /whoami 给机器人即可获取正确格式的会话 ID。" side="left">
                  <span className="text-accent-blue cursor-help"><Info size={12} /></span>
                </Tooltip>
                <span className="text-xs text-accent-blue">获取会话 ID</span>
              </div>
            )}
          </>
        )}

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">频道权限模式</label>
          <DropdownSelect
            value={permission}
            onChange={setPermission}
            options={PERMISSION_OPTIONS}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-section-border flex-shrink-0">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">取消</Button>
        <Button variant="default" size="sm" onClick={onClose} className="text-xs">确定</Button>
      </div>
    </motion.div>
  );
}

// ===========================
// Log Side Panel
// ===========================
function LogPanel({ onClose, instance }: { onClose: () => void; instance: ChannelInstance }) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-y-2 right-2 w-[400px] bg-background border border-section-border shadow-2xl flex flex-col z-[var(--z-sticky)] rounded-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-section-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground font-semibold">{instance.name} — 日志</span>
          <Tooltip content="复制日志" side="right">
            <Button variant="ghost" size="icon-xs" className="w-5 h-5 text-muted-foreground/40 hover:text-foreground">
              <Copy size={10} />
            </Button>
          </Tooltip>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
          <X size={11} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin font-mono text-xs space-y-[2px]">
        {MOCK_LOGS.map((log, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-muted-foreground/50 flex-shrink-0 w-[90px]">{log.time}</span>
            <span className={`flex-shrink-0 font-semibold ${log.level === 'ERROR' ? 'text-destructive' : 'text-muted-foreground'}`}>[{log.level}]</span>
            <span className="text-muted-foreground">{log.message}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ===========================
// Main Page
// ===========================
export function ChannelsPage() {
  const [selectedTypeId, setSelectedTypeId] = useState('feishu');
  const [instances, setInstances] = useState<ChannelInstance[]>(INITIAL_INSTANCES);
  const [editInstance, setEditInstance] = useState<ChannelInstance | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [logInstance, setLogInstance] = useState<ChannelInstance | null>(null);

  const selectedType = CHANNEL_TYPES.find(t => t.id === selectedTypeId)!;
  const filteredInstances = instances.filter((i: ChannelInstance) => i.typeId === selectedTypeId);

  const showPanel = !!editInstance || showAddPanel;
  const showLogPanel = !!logInstance;

  const closeAllPanels = () => {
    setEditInstance(null);
    setShowAddPanel(false);
    setLogInstance(null);
  };

  const toggleInstance = (id: string) => {
    setInstances((prev: ChannelInstance[]) => prev.map((inst: ChannelInstance) =>
      inst.id === id ? { ...inst, enabled: !inst.enabled } : inst
    ));
  };

  const deleteInstance = (id: string) => {
    setInstances((prev: ChannelInstance[]) => prev.filter((inst: ChannelInstance) => inst.id !== id));
    if (editInstance?.id === id) setEditInstance(null);
    if (logInstance?.id === id) setLogInstance(null);
  };

  return (
    <div className="relative flex h-full min-h-0">
      {/* Left: Channel Type Sidebar */}
      <div className="w-[170px] flex-shrink-0 flex flex-col border-r border-section-border min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground font-medium">频道</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin-xs">
          <div className="space-y-[2px]">
            {CHANNEL_TYPES.map(type => {
              const isSelected = selectedTypeId === type.id;
              return (
                <Button size="inline"
                  key={type.id}
                  variant="ghost"
                  onClick={() => setSelectedTypeId(type.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-[7px] text-left relative ${
                    isSelected
                      ? 'bg-cherry-active-bg'
                      : 'border border-transparent hover:bg-accent/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <ChannelIcon typeId={type.id} size={16} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{type.name}</p>
                    <p className="text-xs text-muted-foreground/40 truncate">{type.description.slice(0, 18)}...</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Instances List */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="px-5 pt-4 pb-3 border-b border-section-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChannelIcon typeId={selectedTypeId} size={18} />
              <div>
                <Typography variant="subtitle">{selectedType.name}</Typography>
                <p className="text-xs text-muted-foreground/50 mt-0.5">{selectedType.description}</p>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => { closeAllPanels(); setShowAddPanel(true); }}
              className="gap-1 text-xs"
            >
              <Plus size={12} />
              添加
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 scrollbar-thin">
          {filteredInstances.length === 0 ? (
            <div className="py-12">
              <EmptyState icon={<MessageSquare size={24} />} title={`暂无 ${selectedType.name} 频道`} description="点击右上角添加按钮创建一个" />
            </div>
          ) : (
            <div className="space-y-[1px]">
              {filteredInstances.map((inst: ChannelInstance) => (
                <div
                  key={inst.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StatusDot status={inst.status} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">{inst.name}</span>
                        {inst.status === 'error' && (
                          <span className="px-1.5 py-[1px] rounded-md text-xs font-medium bg-destructive/10 text-destructive">已断开</span>
                        )}
                        {inst.agentName && (
                          <span className="text-xs text-muted-foreground/50">{inst.agentName}</span>
                        )}
                      </div>
                      {inst.region && (
                        <p className="text-xs text-muted-foreground/40">{inst.region}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {inst.status === 'error' && (
                      <Tooltip content="查看日志" side="bottom">
                        <Button
                          variant="ghost" size="icon-xs"
                          onClick={() => { closeAllPanels(); setLogInstance(inst); }}
                          className="w-6 h-6 text-muted-foreground/40 hover:text-foreground"
                        >
                          <ExternalLink size={10} />
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip content="复制配置" side="bottom">
                      <Button variant="ghost" size="icon-xs" className="w-6 h-6 text-muted-foreground/40 hover:text-foreground">
                        <Copy size={10} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="编辑" side="bottom">
                      <Button
                        variant="ghost" size="icon-xs"
                        onClick={() => { closeAllPanels(); setEditInstance(inst); }}
                        className="w-6 h-6 text-muted-foreground/40 hover:text-foreground"
                      >
                        <Pencil size={10} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="删除" side="bottom">
                      <Button
                        variant="ghost" size="icon-xs"
                        onClick={() => deleteInstance(inst.id)}
                        className="w-6 h-6 text-muted-foreground/40 hover:text-destructive"
                      >
                        <Trash2 size={10} />
                      </Button>
                    </Tooltip>
                    <Switch size="sm" checked={inst.enabled} onCheckedChange={() => toggleInstance(inst.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add Side Panel */}
      <AnimatePresence>
        {showPanel && (
          <div className="absolute -left-[170px] top-0 right-0 bottom-0 z-[var(--z-overlay)]" onClick={closeAllPanels}>
            <div className="fixed inset-0 bg-foreground/10 backdrop-blur-[1px] z-[-1]" />
            {showAddPanel ? (
              <EditChannelPanel
                onClose={closeAllPanels}
                channelType={selectedType}
                instance={null}
              />
            ) : (
              <EditChannelPanel
                onClose={closeAllPanels}
                channelType={CHANNEL_TYPES.find(t => t.id === editInstance!.typeId)!}
                instance={editInstance}
              />
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Log Side Panel */}
      <AnimatePresence>
        {showLogPanel && logInstance && (
          <div className="absolute -left-[170px] top-0 right-0 bottom-0 z-[var(--z-overlay)]" onClick={() => setLogInstance(null)}>
            <div className="fixed inset-0 bg-foreground/10 backdrop-blur-[1px] z-[-1]" />
            <LogPanel onClose={() => setLogInstance(null)} instance={logInstance} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
