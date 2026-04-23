import React, { useState } from 'react';
import { Button, Input, BrandLogo, Switch } from '@cherry-studio/ui';
import {
  FolderOpen, HardDrive, Download, Upload as UploadIcon,
  X, Eye, EyeOff,
  ExternalLink, Activity, RefreshCw, Trash2,
  FileText, Image, BookOpen, Copy,
  AlertTriangle, CheckCircle2, Smartphone,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { InlineSelect, ConfigSection, TextInput, ActionButton, PanelHeader, FormRow } from './shared';

// ===========================
// Types
// ===========================
type DataSubPage =
  | 'data-dir'
  | 'local-backup'
  | 'webdav' | 'jianguoyun' | 's3'
  | 'import' | 'export'
  | 'notion' | 'yuque' | 'joplin' | 'obsidian' | 'siyuan';

interface NavItem {
  id: DataSubPage;
  label: string;
  icon?: string;
  iconType?: 'brand' | 'lucide';
  lucideIcon?: React.ReactNode;
  iconColor?: string;
  connected?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: '基础数据设置',
    items: [
      { id: 'data-dir', label: '数据目录', iconType: 'lucide', lucideIcon: <FolderOpen size={14} /> },
    ],
  },
  {
    label: '云备份设置',
    items: [
      { id: 'local-backup', label: '本地备份', iconType: 'lucide', lucideIcon: <HardDrive size={14} /> },
      { id: 'webdav', label: 'WebDAV', iconType: 'brand', icon: 'webdav', connected: true },
      { id: 'jianguoyun', label: '坚果云配置', iconType: 'brand', icon: 'jianguoyun' },
      { id: 's3', label: 'S3 兼容存储', iconType: 'brand', icon: 's3' },
    ],
  },
  {
    label: '迁移 (MIGRATION)',
    items: [
      { id: 'import', label: '导入外部数据', iconType: 'lucide', lucideIcon: <Download size={14} /> },
      { id: 'export', label: '导出 / Markdown', iconType: 'lucide', lucideIcon: <UploadIcon size={14} /> },
    ],
  },
  {
    label: '第三方连接 (CONNECT)',
    items: [
      { id: 'notion', label: 'Notion 设置', iconType: 'brand', icon: 'notion', connected: true },
      { id: 'yuque', label: '语雀配置', iconType: 'brand', icon: 'yuque' },
      { id: 'joplin', label: 'Joplin 配置', iconType: 'brand', icon: 'joplin' },
      { id: 'obsidian', label: 'Obsidian 配置', iconType: 'brand', icon: 'obsidian' },
      { id: 'siyuan', label: '思源笔记配置', iconType: 'brand', icon: 'siyuan' },
    ],
  },
];


// ===========================
// Data Directory Panel
// ===========================
function DataDirPanel() {
  return (
    <div className="space-y-3">
      <PanelHeader icon="📁" title="数据设置" />

      <ConfigSection
        title="数据备份与恢复"
        actions={
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="xs">
              <UploadIcon size={9} />
              <span>备份</span>
            </Button>
            <Button variant="outline" size="xs">
              <Download size={9} />
              <span>恢复</span>
            </Button>
          </div>
        }
      >
        <FormRow label="精简备份" desc="备份时跳过图片、知识库等数据文件，仅备份记录和设置，减小占用。">
          <Switch size="sm" checked={true} onCheckedChange={() => {}} />
        </FormRow>
        <FormRow label="导出至手机" noBorder>
          <Button variant="outline" size="xs">
            <Smartphone size={9} />
            <span>局域网传输</span>
          </Button>
        </FormRow>
      </ConfigSection>

      <ConfigSection title="数据目录">
        <FormRow label="应用数据" desc="/Users/user/Library/Application Support/CherryStudio">
          <Button variant="outline" size="xs">
            <FolderOpen size={9} />
            <span>修改目录</span>
          </Button>
        </FormRow>
        <FormRow label="应用日志" desc=".../CherryStudio/logs">
          <Button variant="outline" size="xs">
            <FileText size={9} />
            <span>打开日志</span>
          </Button>
        </FormRow>
        <FormRow label="知识库文件">
          <Button variant="outline" size="xs">
            <Trash2 size={9} />
            <span>删除文件</span>
          </Button>
        </FormRow>
        <FormRow label="清除缓存 (0.33MB)" noBorder>
          <Button variant="outline" size="xs">
            <RefreshCw size={9} />
            <span>清除缓存</span>
          </Button>
        </FormRow>
      </ConfigSection>

      <div className="bg-destructive/[0.04] border border-destructive/10 rounded-xl px-3.5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-destructive/70 font-medium">重置数据</p>
            <p className="text-xs text-destructive/40 mt-0.5">清空所有配置和聊天记录，恢复出厂设置。此操作不可逆。</p>
          </div>
          <ActionButton variant="danger">重置数据</ActionButton>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Local Backup Panel
// ===========================
function LocalBackupPanel() {
  const [slimBackup, setSlimBackup] = useState(true);
  const [autoSync, setAutoSync] = useState('off');
  const [maxBackups, setMaxBackups] = useState('unlimited');

  return (
    <div className="space-y-3">
      <PanelHeader
        icon="🖥"
        title="本地备份"
        desc="将数据备份到本地磁盘。"
        actions={
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="xs">
              <UploadIcon size={9} />
              <span>立即备份</span>
            </Button>
            <Button variant="outline" size="xs">
              <FolderOpen size={9} />
              <span>管理备份</span>
            </Button>
          </div>
        }
      />

      <ConfigSection title="备份策略">
        <FormRow label="自动备份" desc="应用关闭时或每隔一定时间自动上传增量数据。">
          <InlineSelect
            value={autoSync}
            onChange={setAutoSync}
            options={[
              { value: 'off', label: '关闭' },
              { value: '1h', label: '每 1 小时' },
              { value: '6h', label: '每 6 小时' },
              { value: '24h', label: '每天' },
            ]}
          />
        </FormRow>
        <FormRow label="最大备份数">
          <InlineSelect
            value={maxBackups}
            onChange={setMaxBackups}
            options={[
              { value: 'unlimited', label: '不限' },
              { value: '5', label: '5 份' },
              { value: '10', label: '10 份' },
              { value: '20', label: '20 份' },
            ]}
          />
        </FormRow>
        <FormRow label="精简备份" desc="仅备份数据库文本，显著加快同步速度。" noBorder>
          <Switch size="sm" checked={slimBackup} onCheckedChange={setSlimBackup} />
        </FormRow>
      </ConfigSection>
    </div>
  );
}

// ===========================
// WebDAV Panel
// ===========================
function WebDAVPanel() {
  const [showPwd, setShowPwd] = useState(false);
  const [url, setUrl] = useState('https://dav.jianguoyun.c');
  const [user, setUser] = useState('sinxu.xsy@gmail.com');
  const [pwd, setPwd] = useState('app-secret-token');
  const [path, setPath] = useState('/cherry-studio');
  const [autoBackup, setAutoBackup] = useState(true);
  const [slimBackup, setSlimBackup] = useState(false);
  const [maxBackups, setMaxBackups] = useState('10');

  return (
    <div className="space-y-3">
      <PanelHeader
        icon="☁️"
        title="WebDAV 同步"
        actions={
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="xs">
              <RefreshCw size={9} />
              <span>检查更新</span>
            </Button>
            <Button size="xs">
              <UploadIcon size={9} />
              <span>立即备份</span>
            </Button>
          </div>
        }
      />

      {/* Connection Status */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-cherry-active-bg border border-cherry-ring rounded-xl">
        <CheckCircle2 size={13} className="text-cherry-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-cherry-primary-dark font-medium">服务已连接</p>
          <p className="text-xs text-cherry-text-muted mt-0.5">上次成功备份：今天 14:30 · 大小 4.2MB</p>
        </div>
        <Button variant="outline" size="xs" className="border-cherry-ring text-cherry-text-muted hover:bg-cherry-active-bg">
          查看日志
        </Button>
      </div>

      <ConfigSection title="服务器配置" hint="推荐使用坚果云或自建 NAS">
        <div className="space-y-2.5">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">WebDAV 地址</label>
            <TextInput value={url} onChange={setUrl} mono />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">用户名</label>
            <TextInput value={user} onChange={setUser} mono />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">密码 / 应用令牌</label>
            <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
              <Input
                type={showPwd ? 'text' : 'password'}
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                className="flex-1 bg-transparent text-xs text-muted-foreground min-w-0 font-mono border-0 h-auto p-0 focus-visible:ring-0"
              />
              <Button variant="ghost" size="icon-xs" onClick={() => setShowPwd(v => !v)} className="text-muted-foreground/50 hover:text-foreground ml-1.5">
                {showPwd ? <EyeOff size={10} /> : <Eye size={10} />}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">存储路径</label>
            <div className="flex items-center gap-1.5">
              <div className="flex-1">
                <TextInput value={path} onChange={setPath} mono />
              </div>
              <Button variant="outline" size="xs" className="flex-shrink-0">
                <Activity size={9} />
                <span>验证连接</span>
              </Button>
            </div>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="备份策略">
        <FormRow label="自动备份" desc="应用关闭时或每隔 1 小时自动上传增量数据。">
          <Switch size="sm" checked={autoBackup} onCheckedChange={setAutoBackup} />
        </FormRow>
        <FormRow label="精简备份 (不含图片/附件)" desc="仅备份数据库文本，显著加快同步速度。">
          <Switch size="sm" checked={slimBackup} onCheckedChange={setSlimBackup} />
        </FormRow>
        <FormRow label="最大保留份数" noBorder>
          <InlineSelect
            value={maxBackups}
            onChange={setMaxBackups}
            options={[
              { value: '5', label: '5 份' },
              { value: '10', label: '10 份' },
              { value: '20', label: '20 份' },
              { value: 'unlimited', label: '不限' },
            ]}
          />
        </FormRow>
      </ConfigSection>
    </div>
  );
}

// ===========================
// Jianguoyun Panel
// ===========================
function JianguoyunPanel() {
  const [showPwd, setShowPwd] = useState(false);
  const [account, setAccount] = useState('');
  const [appPwd, setAppPwd] = useState('');
  const [path, setPath] = useState('/cherry-studio');
  const [autoSync, setAutoSync] = useState(true);

  return (
    <div className="space-y-3">
      <PanelHeader icon="🥜" title="坚果云配置" desc="使用坚果云的 WebDAV 服务进行同步。" />

      <ConfigSection title="账户信息" hint={'请在坚果云设置中生成「应用密码」'}>
        <div className="space-y-2.5">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">坚果云账号</label>
            <TextInput value={account} onChange={setAccount} placeholder="your@email.com" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">应用密码</label>
            <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
              <Input
                type={showPwd ? 'text' : 'password'}
                value={appPwd}
                onChange={e => setAppPwd(e.target.value)}
                placeholder="在坚果云安全设置中生成"
                className="flex-1 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 min-w-0 border-0 h-auto p-0 focus-visible:ring-0"
              />
              <Button variant="ghost" size="icon-xs" onClick={() => setShowPwd(v => !v)} className="text-muted-foreground/50 hover:text-foreground ml-1.5">
                {showPwd ? <EyeOff size={10} /> : <Eye size={10} />}
              </Button>
            </div>
            <a href="#" className="text-xs text-cherry-primary/60 hover:text-cherry-primary transition-colors mt-1 inline-flex items-center gap-1">
              如何获取应用密码？ <ExternalLink size={7} />
            </a>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">同步目录</label>
            <TextInput value={path} onChange={setPath} mono />
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="同步设置">
        <FormRow label="自动同步" desc="每次关闭应用时自动上传。" noBorder>
          <Switch size="sm" checked={autoSync} onCheckedChange={setAutoSync} />
        </FormRow>
      </ConfigSection>

      <div className="flex justify-end">
        <ActionButton variant="primary">保存并验证</ActionButton>
      </div>
    </div>
  );
}

// ===========================
// S3 Panel
// ===========================
function S3Panel() {
  const [apiUrl, setApiUrl] = useState('');
  const [region, setRegion] = useState('');
  const [bucket, setBucket] = useState('');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [backupDir, setBackupDir] = useState('');
  const [autoSync, setAutoSync] = useState('off');
  const [maxBackups, setMaxBackups] = useState('unlimited');
  const [slimBackup, setSlimBackup] = useState(false);

  return (
    <div className="space-y-3">
      <PanelHeader
        icon="🪣"
        title="S3 兼容存储"
        desc={'与 AWS S3 API 兼容的对象存储服务。例如 AWS S3, Cloudflare R2, 阿里云 OSS, 腾讯云 COS 等。'}
      />

      <div className="bg-muted/30 border border-border/50 rounded-xl px-3.5 py-3 space-y-0">
        <FormRow label="API 地址">
          <div className="w-[240px]">
            <TextInput value={apiUrl} onChange={setApiUrl} placeholder="https://s3.example.com" mono />
          </div>
        </FormRow>
        <FormRow label="区域">
          <div className="w-[240px]">
            <TextInput value={region} onChange={setRegion} placeholder={'Region, 例如: us-east-1'} mono />
          </div>
        </FormRow>
        <FormRow label="存储桶">
          <div className="w-[240px]">
            <TextInput value={bucket} onChange={setBucket} placeholder={'Bucket, 例如: example'} mono />
          </div>
        </FormRow>
        <FormRow label="Access Key ID">
          <div className="w-[240px]">
            <TextInput value={accessKeyId} onChange={setAccessKeyId} placeholder="Access Key ID" mono />
          </div>
        </FormRow>
        <FormRow label="Secret Access Key">
          <div className="w-[240px]">
            <div className="flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
              <Input
                type={showSecret ? 'text' : 'password'}
                value={secretKey}
                onChange={e => setSecretKey(e.target.value)}
                placeholder="Secret Access Key"
                className="flex-1 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 min-w-0 font-mono border-0 h-auto p-0 focus-visible:ring-0"
              />
              <Button variant="ghost" size="icon-xs" onClick={() => setShowSecret(v => !v)} className="text-muted-foreground/50 hover:text-foreground ml-1.5">
                {showSecret ? <EyeOff size={10} /> : <Eye size={10} />}
              </Button>
            </div>
          </div>
        </FormRow>
        <FormRow label={'备份目录（可选）'}>
          <div className="w-[240px]">
            <TextInput value={backupDir} onChange={setBackupDir} placeholder={'例如: /cherry-studio'} mono />
          </div>
        </FormRow>
        <FormRow label="备份操作">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="xs">
              <UploadIcon size={9} />
              <span>立即备份</span>
            </Button>
            <Button variant="outline" size="xs">
              <FolderOpen size={9} />
              <span>管理备份</span>
            </Button>
          </div>
        </FormRow>
        <FormRow label="自动同步">
          <InlineSelect
            value={autoSync}
            onChange={setAutoSync}
            options={[
              { value: 'off', label: '关闭' },
              { value: '1h', label: '每小时' },
              { value: '6h', label: '每 6 小时' },
              { value: '24h', label: '每天' },
            ]}
          />
        </FormRow>
        <FormRow label="最大备份数">
          <InlineSelect
            value={maxBackups}
            onChange={setMaxBackups}
            options={[
              { value: 'unlimited', label: '不限' },
              { value: '5', label: '5 份' },
              { value: '10', label: '10 份' },
            ]}
          />
        </FormRow>
        <FormRow label="精简备份" desc="开启后备份时将跳过文件数据..." noBorder>
          <Switch size="sm" checked={slimBackup} onCheckedChange={setSlimBackup} />
        </FormRow>
      </div>
    </div>
  );
}

// ===========================
// Import Panel
// ===========================
function ImportPanel() {
  return (
    <div className="space-y-3">
      <PanelHeader icon="📥" title="导入外部数据" desc="从其他应用导入聊天记录和配置。" />

      <ConfigSection title="导入 ChatGPT 数据">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60">从 ChatGPT 导出的 JSON 文件导入对话记录。</p>
          <Button variant="outline" size="xs" className="flex-shrink-0">
            <UploadIcon size={9} />
            <span>导入文件</span>
          </Button>
        </div>
      </ConfigSection>

      <ConfigSection title="导入 Cherry Studio 备份">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60">恢复之前导出的 Cherry Studio 备份包。</p>
          <Button variant="outline" size="xs" className="flex-shrink-0">
            <UploadIcon size={9} />
            <span>选择备份</span>
          </Button>
        </div>
      </ConfigSection>

      <div className="bg-muted/30 border border-border/50 rounded-xl px-3.5 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle size={11} className="text-muted-foreground/40 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground/40 leading-relaxed">
            导入数据会与当前数据合并，不会覆盖已有内容。建议在导入前先备份当前数据。
          </p>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Export Panel
// ===========================
function ExportPanel() {
  const [exportPath, setExportPath] = useState('~/Downloads/CherryExport');
  const [forceLatex, setForceLatex] = useState(true);
  const [includeModel, setIncludeModel] = useState(true);
  const [smartFilename, setSmartFilename] = useState(true);
  const [normalizeRefs, setNormalizeRefs] = useState(true);
  const [exportImage, setExportImage] = useState(true);
  const [exportMd, setExportMd] = useState(true);
  const [exportNotion, setExportNotion] = useState(true);
  const [exportObsidian, setExportObsidian] = useState(false);
  const [exportWord, setExportWord] = useState(true);
  const [exportPlaintext, setExportPlaintext] = useState(true);

  return (
    <div className="space-y-3">
      <PanelHeader
        icon="📤"
        title="导出设置 (Export)"
        actions={
          <Button variant="outline" size="xs" className="text-muted-foreground/60 hover:text-foreground">
            <RotateCcw size={9} />
            <span>恢复默认</span>
          </Button>
        }
      />

      <ConfigSection title="Markdown 格式配置">
        <div className="space-y-0">
          <FormRow label="默认导出路径" desc="所有导出文件将自动保存到此文件夹。">
            <div className="flex items-center gap-1.5">
              <div className="w-[170px]">
                <TextInput value={exportPath} onChange={setExportPath} mono />
              </div>
              <Button variant="outline" size="xs" className="flex-shrink-0">
                选择
              </Button>
            </div>
          </FormRow>
          <FormRow label="强制使用 LaTeX 公式 ($$)" desc="将所有数学公式转换为标准 LaTeX 格式，便于 Notion 等软件识别。">
            <Switch size="sm" checked={forceLatex} onCheckedChange={setForceLatex} />
          </FormRow>
          <FormRow label="导出时包含模型名称" desc='在文档头部添加 "Model: GPT-4o" 等元数据信息。'>
            <Switch size="sm" checked={includeModel} onCheckedChange={setIncludeModel} />
          </FormRow>
          <FormRow label='使用"快速模型"为消息命名' desc="自动调用小模型生成文件名，而非使用默认的时间戳。">
            <Switch size="sm" checked={smartFilename} onCheckedChange={setSmartFilename} />
          </FormRow>
          <FormRow label="标准化引用格式" desc='将脚注引用转换为标准 Markdown 脚注 [^1]。' noBorder>
            <Switch size="sm" checked={normalizeRefs} onCheckedChange={setNormalizeRefs} />
          </FormRow>
        </div>
      </ConfigSection>

      <ConfigSection title="导出菜单显示" hint="控制在聊天窗口中显示的导出选项">
        <div className="space-y-0">
          {[
            { icon: '🖼', label: '导出为长图片 (Image)', checked: exportImage, onChange: setExportImage },
            { icon: '📝', label: '导出为 Markdown', checked: exportMd, onChange: setExportMd },
            { icon: 'N', label: '导到 Notion', checked: exportNotion, onChange: setExportNotion, isText: true },
            { icon: '💎', label: '导出到 Obsidian (URI)', checked: exportObsidian, onChange: setExportObsidian },
            { icon: '📄', label: '导出为 Word (.docx)', checked: exportWord, onChange: setExportWord },
            { icon: '📋', label: '复制为纯文本', checked: exportPlaintext, onChange: setExportPlaintext },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex items-center justify-between py-[5px]`}>
              <div className="flex items-center gap-2">
                {item.isText ? (
                  <span className="w-4 h-4 rounded bg-muted/50 flex items-center justify-center text-xs text-muted-foreground/60 font-semibold">{item.icon}</span>
                ) : (
                  <span className="text-xs">{item.icon}</span>
                )}
                <span className="text-sm text-muted-foreground font-normal">{item.label}</span>
              </div>
              <Switch size="sm" checked={item.checked} onCheckedChange={item.onChange} />
            </div>
          ))}
        </div>
      </ConfigSection>
    </div>
  );
}

// ===========================
// Notion Panel
// ===========================
function NotionPanel() {
  const [token, setToken] = useState('secret_xxxxxxxx...');
  const [dbId, setDbId] = useState('');
  const [titleField, setTitleField] = useState('Name');
  const [includeThinking, setIncludeThinking] = useState(true);

  return (
    <div className="space-y-3">
      <PanelHeader
        icon="N"
        title="Notion 集成"
        desc="将对话记录一键导出到 Notion 数据库。"
        actions={
          <Button variant="outline" size="xs">
            <BookOpen size={9} />
            <span>查看指南</span>
          </Button>
        }
      />

      {/* Connection Status */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-primary/[0.06] border border-primary/15 rounded-xl">
        <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
        <p className="text-xs text-primary flex-1 font-medium">Notion 已连接</p>
      </div>

      <ConfigSection title="授权配置">
        <div className="space-y-2.5">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Notion Integration Token</label>
            <div className="flex items-center gap-1.5">
              <div className="flex-1">
                <TextInput value={token} onChange={setToken} mono />
              </div>
              <Button variant="outline" size="xs" className="flex-shrink-0">
                验证
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Database ID</label>
            <TextInput value={dbId} onChange={setDbId} placeholder="从 Notion 链接中获取..." mono />
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="字段映射 (Mapping)">
        <FormRow label="标题字段名">
          <div className="w-[120px]">
            <TextInput value={titleField} onChange={setTitleField} />
          </div>
        </FormRow>
        <FormRow label="包含思维链" desc="导出时是否包含 AI 的思考过程。" noBorder>
          <Switch size="sm" checked={includeThinking} onCheckedChange={setIncludeThinking} />
        </FormRow>
      </ConfigSection>
    </div>
  );
}

// ===========================
// Third-party Connect Panel (Generic)
// ===========================
function ThirdPartyPanel({ icon, name, desc, fields }: {
  icon: string;
  name: string;
  desc: string;
  fields: { label: string; placeholder: string; value: string }[];
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.label, f.value]))
  );
  const [connected, setConnected] = useState(false);

  return (
    <div className="space-y-3">
      <PanelHeader icon={icon} title={`${name} 配置`} desc={desc} />

      {connected ? (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-primary/[0.06] border border-primary/15 rounded-xl">
          <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
          <p className="text-xs text-primary flex-1 font-medium">{name} 已连接</p>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-muted/30 border border-border/50 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-foreground/15 flex-shrink-0" />
          <p className="text-xs text-muted-foreground/60 flex-1">未连接</p>
        </div>
      )}

      <ConfigSection title="连接配置">
        <div className="space-y-2.5">
          {fields.map(field => (
            <div key={field.label}>
              <label className="text-sm text-muted-foreground mb-1 block">{field.label}</label>
              <TextInput
                value={values[field.label] || ''}
                onChange={v => setValues(prev => ({ ...prev, [field.label]: v }))}
                placeholder={field.placeholder}
                mono
              />
            </div>
          ))}
        </div>
      </ConfigSection>

      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" size="xs" onClick={() => setConnected(v => !v)}>
          <Activity size={9} />
          <span>检测连接</span>
        </Button>
        <ActionButton variant="primary">保存配置</ActionButton>
      </div>
    </div>
  );
}

// ===========================
// Main: DataSettingsPage
// ===========================
export function DataSettingsPage() {
  const [selectedId, setSelectedId] = useState<DataSubPage>('data-dir');

  const renderConfig = () => {
    switch (selectedId) {
      case 'data-dir': return <DataDirPanel />;
      case 'local-backup': return <LocalBackupPanel />;
      case 'webdav': return <WebDAVPanel />;
      case 'jianguoyun': return <JianguoyunPanel />;
      case 's3': return <S3Panel />;
      case 'import': return <ImportPanel />;
      case 'export': return <ExportPanel />;
      case 'notion': return <NotionPanel />;
      case 'yuque': return (
        <ThirdPartyPanel icon="🦆" name="语雀" desc="将对话记录导出到语雀知识库。"
          fields={[
            { label: 'API Token', placeholder: '在语雀设置中获取', value: '' },
            { label: '知识库 ID', placeholder: '目标知识库的 slug 或 ID', value: '' },
          ]}
        />
      );
      case 'joplin': return (
        <ThirdPartyPanel icon="J" name="Joplin" desc="通过 Joplin Web Clipper API 连接。"
          fields={[
            { label: 'API Token', placeholder: '在 Joplin 选项 → Web Clipper 中获取', value: '' },
            { label: '端口', placeholder: '默认: 41184', value: '41184' },
          ]}
        />
      );
      case 'obsidian': return (
        <ThirdPartyPanel icon="💎" name="Obsidian" desc="通过 Obsidian URI 协议导出笔记。"
          fields={[
            { label: 'Vault 名称', placeholder: '你的 Obsidian Vault 名称', value: '' },
            { label: '默认文件夹', placeholder: '导出到的文件夹路径，例如: CherryStudio', value: '' },
          ]}
        />
      );
      case 'siyuan': return (
        <ThirdPartyPanel icon="📓" name="思源笔记" desc="通过思源笔记 API 连接导出。"
          fields={[
            { label: 'API Token', placeholder: '在思源设置 → 关于 中获取', value: '' },
            { label: 'API 地址', placeholder: '默认: http://127.0.0.1:6806', value: 'http://127.0.0.1:6806' },
          ]}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Middle Column: Navigation */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground/60 font-medium">数据与存储</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin-xs">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              <p className="text-xs text-muted-foreground/40 tracking-wider px-3 pt-2.5 pb-1 font-medium">{group.label}</p>
              <div className="space-y-[2px]">
                {group.items.map(item => {
                  const isSelected = selectedId === item.id;
                  return (
                    <Button size="inline"
                      key={item.id}
                      variant="ghost"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-[8px] rounded-xl transition-all text-left relative ${
                        isSelected
                          ? 'bg-cherry-active-bg'
                          : 'border border-transparent hover:bg-accent/50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                      )}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}>
                          {item.iconType === 'brand' && item.icon ? (
                            <BrandLogo id={item.icon} fallbackLetter={item.icon[0].toUpperCase()} fallbackColor="#6b7280" size={15} />
                          ) : item.lucideIcon ? item.lucideIcon : null}
                        </span>
                        <span className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground font-normal'}`}>
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Config */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          {renderConfig()}
        </div>
      </div>
    </div>
  );
}
