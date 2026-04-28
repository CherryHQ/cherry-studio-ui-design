import React, { useState } from 'react';
import {
  Check, Copy,
  Plus, Trash2,
  CheckCircle2, XCircle,
} from 'lucide-react';
import { Button, Input, Typography, Switch, EmptyState } from '@cherry-studio/ui';
import { copyToClipboard } from '@/app/utils/clipboard';
import { Tooltip } from '@/app/components/Tooltip';
import { InlineSelect, ConfigSection, FormRow } from './shared';

// ===========================
// Types
// ===========================

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  createdAt: string;
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
      size="icon-xs"
      onClick={handleCopy}
      className="text-muted-foreground/40 hover:text-foreground hover:bg-accent/50"
    >
      {copied ? <Check size={10} className="text-cherry-primary" /> : <Copy size={10} />}
    </Button></Tooltip>
  );
}

// ===========================
// Main: ApiGatewayPage
// ===========================
export function ApiGatewayPage() {
  const [serviceEnabled, setServiceEnabled] = useState(true);
  const [port, setPort] = useState('23334');
  const [host, setHost] = useState('localhost');
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    { id: '1', name: 'Default Key (Obsidian)', key: 'sk-cherry-9s8d...j2k9', createdAt: '2025-12-01' },
    { id: '2', name: 'VS Code Cursor', key: 'sk-cherry-m2k8...1l0p', createdAt: '2026-01-15' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const disabled = !serviceEnabled;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newKey: ApiKeyItem = {
      id: Date.now().toString(),
      name: newName.trim(),
      key: `sk-cherry-${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setKeys((prev: ApiKeyItem[]) => [...prev, newKey]);
    setNewName('');
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    setKeys((prev: ApiKeyItem[]) => prev.filter((k: ApiKeyItem) => k.id !== id));
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top bar with master toggle */}
      <div className="flex items-center justify-between px-6 pt-4 pb-0 flex-shrink-0">
        <div>
          <Typography variant="subtitle">配置 API 服务</Typography>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/60">{serviceEnabled ? '服务已开启' : '服务已关闭'}</span>
          <Switch size="sm" checked={serviceEnabled} onCheckedChange={setServiceEnabled} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
        {/* Status banner */}
        {serviceEnabled && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-success/[0.08] border border-success/20 rounded-xl mb-4">
            <CheckCircle2 size={13} className="text-success flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-success font-medium">API 网关正在运行</p>
              <p className="text-xs text-success/60 mt-0.5">{'兼容 OpenAI 接口标准，可供第三方应用直接调用。'}</p>
            </div>
            <Button variant="outline" size="xs" className="border-success/30 text-success/80 hover:bg-success/10">
              查看日志
            </Button>
          </div>
        )}
        {!serviceEnabled && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-muted/30 border border-section-border rounded-xl mb-4">
            <XCircle size={13} className="text-muted-foreground/40 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground/60 font-medium">API 服务未启用</p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">开启右上角开关以启动 API 网关服务。</p>
            </div>
          </div>
        )}

        {/* Connection settings — network interface only */}
        <div className={`space-y-4 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
          <ConfigSection title="网络接口">
            <FormRow label="监听端口 (Port)" desc="API 服务监听的本地端口号。">
              <div className="w-[160px]">
                <Input
                  value={port}
                  onChange={e => setPort(e.target.value)}
                  className="px-2.5 py-[5px] bg-muted/30 border-section-border text-xs text-muted-foreground font-mono"
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

          {/* Credentials — with "授权" header */}
          <ConfigSection title="授权">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground/40">主密钥 (Primary Key)</p>
              <div className="flex items-center px-3 py-[7px] bg-muted/30 rounded-lg border border-section-border">
                <span className="flex-1 text-xs text-muted-foreground/60 font-mono truncate">sk-cherry-82js...92ks</span>
                <CopyButton text="sk-cherry-82js-xxxx-xxxx-92ks" />
              </div>
            </div>
          </ConfigSection>

          {/* API Keys management */}
          <ConfigSection
            title="密钥列表"
            actions={
              <Button
                variant="ghost"
                onClick={() => setShowCreate(v => !v)}
                size="xs"
                className="text-cherry-primary-dark bg-cherry-active-bg hover:bg-cherry-active-border"
              >
                <Plus size={9} />
                <span>创建密钥</span>
              </Button>
            }
          >
            {showCreate && (
              <div className="flex items-center gap-2 p-2.5 bg-accent/30 border border-section-border rounded-lg mb-2">
                <div className="flex-1">
                  <Input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="密钥名称，例如: My App"
                    className="px-2.5 py-[5px] h-auto bg-background rounded-lg border-section-border text-xs text-muted-foreground placeholder:text-muted-foreground/60"
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    autoFocus
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={handleCreate}
                  size="xs"
                  className="text-cherry-primary-dark bg-cherry-active-bg hover:bg-cherry-active-border"
                >
                  确认
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => { setShowCreate(false); setNewName(''); }}
                  className="border-section-border text-muted-foreground/60 hover:text-foreground"
                >
                  取消
                </Button>
              </div>
            )}

            <div className="space-y-0">
              {keys.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground/40 font-mono mt-0.5">{item.key}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <CopyButton text={item.key} />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive/30 hover:text-destructive/60 hover:bg-destructive/[0.04]"
                    >
                      <Trash2 size={10} />
                    </Button>
                  </div>
                </div>
              ))}
              {keys.length === 0 && <EmptyState preset="no-api-key" compact />}
            </div>
          </ConfigSection>
        </div>
      </div>
    </div>
  );
}
