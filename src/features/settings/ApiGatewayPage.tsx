import React, { useState } from 'react';
import {
  Check, Copy, Eye, EyeOff,
  Plus, Trash2, RefreshCw, ExternalLink,
  Shield, Server, Wifi,
  AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, Info,
} from 'lucide-react';
import { Button, Input } from '@cherry-studio/ui';
import { copyToClipboard } from '@/app/utils/clipboard';
import { Tooltip } from '@/app/components/Tooltip';
import { Toggle, InlineSelect, ConfigSection } from './shared';

// ===========================
// Types
// ===========================
type GatewaySubPage = 'connection' | 'security' | 'model-map';

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

// ===========================
// Shared UI — local FormRow (custom font size for this page)
// ===========================
function FormRow({ label, desc, children, noBorder, disabled }: {
  label: string; desc?: string; children: React.ReactNode; noBorder?: boolean; disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${noBorder ? '' : ''} ${disabled ? 'opacity-40' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-foreground/65 font-medium">{label}</p>
          {desc && (
            <Tooltip content={desc} side="top">
              <span className="text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                <Info size={13} />
              </span>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Tooltip content="复制" side="top"><Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="p-1 w-auto h-auto rounded-md text-foreground/25 hover:text-foreground/50 hover:bg-foreground/[0.04]"
    >
      {copied ? <Check size={10} className="text-cherry-primary" /> : <Copy size={10} />}
    </Button></Tooltip>
  );
}

// ===========================
// Nav items
// ===========================
interface NavItem {
  id: GatewaySubPage;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'connection', label: '连接设置', desc: '端口、主机地址、跨域策略', icon: <Wifi size={14} /> },
  { id: 'security', label: '鉴权管理', desc: 'API Key 批量管理与权限', icon: <Shield size={14} /> },
  { id: 'model-map', label: '模型映射', desc: '暴露的模型白名单配置', icon: <Server size={14} /> },
];

// ===========================
// Connection Panel
// ===========================
function ConnectionPanel({ enabled }: { enabled: boolean }) {
  const [port, setPort] = useState('23334');
  const [host, setHost] = useState('localhost');
  const [cors, setCors] = useState(true);
  const [autoStart, setAutoStart] = useState(true);

  const disabled = !enabled;

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm text-foreground/90 font-semibold">连接设置</h3>
          <p className="text-[9px] text-foreground/35 mt-0.5">配置 API 服务监听的地址和端口。</p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5 px-2.5 py-[4px] h-auto rounded-lg border-border/30 text-xs text-foreground/40 hover:text-foreground/60">
          <RefreshCw size={9} />
          <span>重置默认</span>
        </Button>
      </div>

      <ConfigSection title="网络接口">
        <FormRow label="监听端口 (Port)" desc="API 服务监听的本地端口号。">
          <div className="w-[160px]">
            <Input
              value={port}
              onChange={e => setPort(e.target.value)}
              className="px-2.5 py-[5px] h-auto bg-foreground/[0.03] rounded-lg border-border/30 text-xs text-foreground/60 font-mono"
            />
          </div>
        </FormRow>
        <FormRow label="监听地址 (Host)" desc="选择允许访问的网络接口。" noBorder>
          <InlineSelect
            value={host}
            onChange={setHost}
            options={[
              { value: 'localhost', label: '127.0.0.1 (仅本地)' },
              { value: 'all', label: '0.0.0.0 (域网)' },
            ]}
          />
        </FormRow>
      </ConfigSection>

      <ConfigSection title="安全与策略">
        <FormRow label="开启 CORS 跨域支持" desc={'允许 Web 应用（如浏览器插件）直接调用 API。'}>
          <Toggle checked={cors} onChange={setCors} />
        </FormRow>
        <FormRow label="开机自启" desc="随 Cherry Studio 动时自动开启 API 服务。" noBorder>
          <Toggle checked={autoStart} onChange={setAutoStart} />
        </FormRow>
      </ConfigSection>

      <ConfigSection title="当前活跃凭证">
        <div className="space-y-1">
          <p className="text-[9px] text-foreground/35">主密钥 (Primary Key)</p>
          <div className="flex items-center px-3 py-[7px] bg-foreground/[0.03] rounded-lg border border-border/30">
            <span className="flex-1 text-xs text-foreground/50 font-mono truncate">sk-cherry-82js...92ks</span>
            <CopyButton text="sk-cherry-82js-xxxx-xxxx-92ks" />
          </div>
        </div>
      </ConfigSection>
    </div>
  );
}

// ===========================
// Security Panel
// ===========================
function SecurityPanel({ enabled }: { enabled: boolean }) {
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    { id: '1', name: 'Default Key (Obsidian)', key: 'sk-cherry-9s8d...j2k9', createdAt: '2025-12-01' },
    { id: '2', name: 'VS Code Cursor', key: 'sk-cherry-m2k8...1l0p', createdAt: '2026-01-15' },
  ]);
  const [noAuth, setNoAuth] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const disabled = !enabled;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newKey: ApiKeyItem = {
      id: Date.now().toString(),
      name: newName.trim(),
      key: `sk-cherry-${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setKeys(prev => [...prev, newKey]);
    setNewName('');
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-1">
        <h3 className="text-sm text-foreground/90 font-semibold">安全凭证 (API Keys)</h3>
        <p className="text-[9px] text-foreground/35 mt-0.5">管理访问此网关的密钥。</p>
      </div>

      <ConfigSection
        title="密钥列表"
        actions={
          <Button
            onClick={() => setShowCreate(v => !v)}
            size="sm"
            className="flex items-center gap-1.5 px-2.5 py-[4px] h-auto rounded-lg bg-cherry-primary text-white text-xs hover:bg-cherry-primary-dark"
          >
            <Plus size={9} />
            <span>创建密钥</span>
          </Button>
        }
      >
        {showCreate && (
          <div className="flex items-center gap-2 p-2.5 bg-cherry-active-bg border border-cherry-ring rounded-lg mb-2">
            <div className="flex-1">
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="密钥名称，例如: My App"
                className="px-2.5 py-[5px] h-auto bg-background rounded-lg border-border/30 text-xs text-foreground/60 placeholder:text-foreground/20"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <Button
              onClick={handleCreate}
              size="sm"
              className="px-2.5 py-[5px] h-auto rounded-lg bg-cherry-primary text-white text-xs hover:bg-cherry-primary-dark"
            >
              确认
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowCreate(false); setNewName(''); }}
              className="px-2 py-[5px] h-auto rounded-lg border-border/30 text-xs text-foreground/40 hover:text-foreground/60"
            >
              取消
            </Button>
          </div>
        )}

        <div className="space-y-0">
          {keys.map((item, i) => (
            <div key={item.id} className={`flex items-center gap-3 py-2.5`}>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/65 truncate font-medium">{item.name}</p>
                <p className="text-[9px] text-foreground/30 font-mono mt-0.5">{item.key}</p>
              </div>
              <div className="flex items-center gap-1">
                <CopyButton text={item.key} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  className="p-1 w-auto h-auto rounded-md text-destructive/30 hover:text-destructive/60 hover:bg-destructive/[0.04]"
                >
                  <Trash2 size={10} />
                </Button>
              </div>
            </div>
          ))}
          {keys.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-xs text-foreground/25">暂无 API Key</p>
              <p className="text-[9px] text-foreground/15 mt-0.5">点击上方按钮创建你的第一个密钥</p>
            </div>
          )}
        </div>
      </ConfigSection>

      <ConfigSection title="无需鉴权模式">
        <FormRow
          label="允许无鉴权访问"
          desc={'警告：开启后任何人都可调用接口（仅建议本地调试）'}
          noBorder
        >
          <Toggle checked={noAuth} onChange={setNoAuth} />
        </FormRow>
        {noAuth && (
          <div className="flex items-start gap-2 px-3 py-2 bg-warning/[0.06] border border-warning/15 rounded-lg mt-1">
            <AlertTriangle size={10} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-warning/70 leading-relaxed">
              无鉴权模式已启用。请确保仅在受信任的网络环境下使用。
            </p>
          </div>
        )}
      </ConfigSection>
    </div>
  );
}

// ===========================
// Model Mapping Panel
// ===========================
function ModelMappingPanel({ enabled }: { enabled: boolean }) {
  const [models] = useState([
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', enabled: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', enabled: true },
    { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', provider: 'Anthropic', enabled: true },
    { id: 'claude-4-opus', name: 'Claude 4 Opus', provider: 'Anthropic', enabled: false },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', enabled: true },
    { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', enabled: false },
    { id: 'qwen-3', name: 'Qwen 3', provider: 'Alibaba', enabled: true },
  ]);
  const [modelStates, setModelStates] = useState<Record<string, boolean>>(
    Object.fromEntries(models.map(m => [m.id, m.enabled]))
  );

  const disabled = !enabled;
  const enabledCount = Object.values(modelStates).filter(Boolean).length;

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm text-foreground/90 font-semibold">模型映射</h3>
          <p className="text-[9px] text-foreground/35 mt-0.5">控制通 API 网关暴露哪些模型。已启用 {enabledCount}/{models.length} 个模型。</p>
        </div>
      </div>

      <ConfigSection title="可用模型列表" hint="仅开启的模型可通过 API 被外部调用">
        <div className="space-y-0">
          {models.map((model, i) => {
            const isEnabled = modelStates[model.id] ?? model.enabled;
            return (
              <div key={model.id} className={`flex items-center justify-between py-2.5`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isEnabled ? 'bg-primary' : 'bg-foreground/10'}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/65 truncate font-medium">{model.name}</p>
                    <p className="text-[8px] text-foreground/25 mt-0.5">{model.provider}</p>
                  </div>
                </div>
                <Toggle
                  checked={isEnabled}
                  onChange={v => setModelStates(prev => ({ ...prev, [model.id]: v }))}
                />
              </div>
            );
          })}
        </div>
      </ConfigSection>

      <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle size={11} className="text-foreground/25 flex-shrink-0 mt-0.5" />
          <p className="text-[9px] text-foreground/35 leading-relaxed">
            禁用的模型将不会出现在 /v1/models 接口返回中，也无法通过 API 调用。修改后立即生效。
          </p>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Integration Section (always shown at bottom of right panel)
// ===========================
function IntegrationSection({ enabled, port }: { enabled: boolean; port: string }) {
  const baseUrl = `http://127.0.0.1:${port}/v1`;
  const curlExample = `curl ${baseUrl}/chat/completions \\\\
  -H "Content-Type: application/json" \\\\
  -H "Authorization: Bearer cs-sk-..." \\\\
  -d '{ "model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}] }'`;

  return (
    <div className={`mt-5 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <ConfigSection
        title="集成指南 (Integration)"
        hint={'如何在第三方应用中使用 Cherry Studio。'}
        actions={
          <Button variant="outline" size="sm" className="flex items-center gap-1 px-2 py-[3px] h-auto rounded-lg border-border/30 text-[9px] text-foreground/40 hover:text-foreground/60">
            <span>查看完整文档</span>
            <ExternalLink size={7} />
          </Button>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="text-[9px] text-foreground/40 mb-1">API Base URL</p>
            <div className="flex items-center px-3 py-[7px] bg-foreground/[0.03] rounded-lg border border-border/30">
              <span className="flex-1 text-xs text-foreground/50 font-mono truncate">{baseUrl}</span>
              <CopyButton text={baseUrl} />
            </div>
          </div>

          <div>
            <p className="text-[9px] text-foreground/40 mb-1">示例调用 (Curl)</p>
            <div className="relative">
              <pre className="px-3 py-3 bg-foreground/[0.04] border border-foreground/[0.06] rounded-lg text-[9px] text-foreground/45 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                {curlExample}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={curlExample} />
              </div>
            </div>
          </div>

          <p className="text-[8px] text-foreground/25 leading-relaxed">
            {'在第三方应用（如 Cursor, Obsidian, LangChain）中，将 Base URL 设置为上方地址，并填入任意已创建的 API Key 即可使用 Cherry Studio 的模型能力。'}
          </p>
        </div>
      </ConfigSection>
    </div>
  );
}

// ===========================
// Main: ApiGatewayPage
// ===========================
export function ApiGatewayPage() {
  const [selectedId, setSelectedId] = useState<GatewaySubPage>('connection');
  const [serviceEnabled, setServiceEnabled] = useState(true);

  const renderConfig = () => {
    switch (selectedId) {
      case 'connection': return <ConnectionPanel enabled={serviceEnabled} />;
      case 'security': return <SecurityPanel enabled={serviceEnabled} />;
      case 'model-map': return <ModelMappingPanel enabled={serviceEnabled} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Middle Column: Navigation */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-foreground/[0.05] min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0">
          <p className="text-xs text-foreground/40 font-medium">API 网关</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
          <div className="space-y-[2px]">
            {NAV_ITEMS.map(item => {
              const isSelected = selectedId === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-[8px] h-auto rounded-xl transition-all text-left relative ${
                    isSelected
                      ? 'bg-cherry-active-bg'
                      : 'border border-transparent hover:bg-foreground/[0.03]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`flex-shrink-0 ${isSelected ? 'text-foreground/50' : 'text-foreground/30'}`}>{item.icon}</span>
                    <span className={`text-xs truncate ${isSelected ? 'text-foreground/85 font-medium' : 'text-foreground/55'}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-foreground/25' : 'text-foreground/10'}`} />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Config */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top bar with master toggle */}
        <div className="flex items-center justify-between px-6 pt-4 pb-0 flex-shrink-0">
          <div>
            <h2 className="text-sm text-foreground/85 font-semibold">
              {selectedId === 'connection' ? '配置 API 服务' : selectedId === 'security' ? '安全凭证管理' : '模型映射管理'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/40">{serviceEnabled ? '服务已开启' : '服务已关闭'}</span>
            <Toggle checked={serviceEnabled} onChange={setServiceEnabled} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
          {/* Status banner */}
          {serviceEnabled && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-cherry-active-bg border border-cherry-ring rounded-xl mb-4">
              <CheckCircle2 size={13} className="text-cherry-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-cherry-primary-dark font-medium">API 网关正在运行</p>
                <p className="text-[8px] text-cherry-text-muted mt-0.5">{'兼容 OpenAI 接口标准，可供第三方应用直接调用。'}</p>
              </div>
              <Button variant="outline" size="sm" className="px-2 py-[3px] h-auto rounded-lg border-cherry-ring text-[9px] text-cherry-text-muted hover:bg-cherry-active-bg">
                查看日志
              </Button>
            </div>
          )}
          {!serviceEnabled && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl mb-4">
              <XCircle size={13} className="text-foreground/20 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-foreground/40 font-medium">API 服务未启用</p>
                <p className="text-[8px] text-foreground/20 mt-0.5">开启右上角开关以启动 API 网关服务。</p>
              </div>
            </div>
          )}

          {renderConfig()}

          {/* Integration section always at bottom for connection page */}
          {selectedId === 'connection' && <IntegrationSection enabled={serviceEnabled} port="23334" />}
        </div>
      </div>
    </div>
  );
}
