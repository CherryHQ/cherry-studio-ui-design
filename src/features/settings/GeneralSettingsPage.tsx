import React, { useState } from 'react';
import {
  Palette, Monitor, ShieldCheck, Code2,
  ChevronRight, ExternalLink,
} from 'lucide-react';
import { Button, InlineSelect as UIInlineSelect, Slider, Textarea, Typography, Switch } from '@cherry-studio/ui';
import { useSettings } from '@/app/context/SettingsContext';
import { FormRow, SectionHeader } from './shared';

// ===========================
// Types
// ===========================
type SubPage = 'appearance' | 'system' | 'privacy' | 'custom-css';

// ===========================
// Nav config
// ===========================
interface NavItem {
  id: SubPage;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'appearance', label: '显示与语言', icon: <Palette size={14} /> },
  { id: 'system', label: '系统与启动', icon: <Monitor size={14} /> },
  { id: 'privacy', label: '隐私与高级', icon: <ShieldCheck size={14} /> },
  { id: 'custom-css', label: '自定义 CSS', icon: <Code2 size={14} /> },
];

// ===========================
// Theme color presets (matches ACCENT_MAP in SettingsContext)
// ===========================
const THEME_COLORS = [
  { id: 'blue',   color: '#3B82F6' },
  { id: 'indigo', color: '#6366F1' },
  { id: 'violet', color: '#6D28D9' },
  { id: 'purple', color: '#8B5CF6' },
  { id: 'pink',   color: '#EC4899' },
  { id: 'coral',  color: '#FF5470' },
  { id: 'amber',  color: '#F59E0B' },
  { id: 'green',  color: '#00b96b' },
  { id: 'teal',   color: '#14B8A6' },
  { id: 'sky',    color: '#0EA5E9' },
  { id: 'marine', color: '#0284C7' },
];

// Fine-grained gradient stops for smooth rendering (not selectable)
const GRADIENT_STOPS = [
  '#3B82F6', '#4F6AF3', '#6366F1', '#6847E5',
  '#6D28D9', '#7C42E8', '#8B5CF6', '#B44EC8',
  '#EC4899', '#F44E85', '#FF5470', '#FF7940',
  '#F59E0B', '#C8A820', '#7AB340', '#00b96b',
  '#0AB98A', '#14B8A6', '#11AFC8', '#0EA5E9',
  '#0895D8', '#0284C7',
];

// ===========================
// Panel: Appearance
// ===========================
function AppearancePanel() {
  const { settings, updateSetting } = useSettings();

  return (
    <div>
      <Typography variant="subtitle" className="mb-3">{'外观与显示'}</Typography>

      <FormRow label={'语言 (Language)'} desc={'设置应用程序显示的语言。'}>
        <UIInlineSelect
          value={settings.language}
          onChange={v => updateSetting('language', v)}
          options={[
            { value: 'zh-CN', label: '简体中文' },
            { value: 'zh-TW', label: '繁體中文' },
            { value: 'en', label: 'English' },
            { value: 'ja', label: '日本語' },
          ]}
        />
      </FormRow>

      <FormRow label="应用主题">
        <UIInlineSelect
          value={settings.theme}
          onChange={v => updateSetting('theme', v as 'light' | 'dark' | 'system')}
          options={[
            { value: 'light', label: '浅色' },
            { value: 'dark', label: '深色' },
            { value: 'system', label: '跟随系统' },
          ]}
        />
      </FormRow>

      <FormRow label="主题颜色">
        <div
          className="relative w-[200px] h-[20px] rounded-full cursor-pointer select-none"
          style={{
            background: `linear-gradient(to right, ${GRADIENT_STOPS.map((c, i) => `${c} ${(i / (GRADIENT_STOPS.length - 1)) * 100}%`).join(', ')})`,
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const idx = Math.round(x * (THEME_COLORS.length - 1));
            updateSetting('accentColor', THEME_COLORS[idx].id);
          }}
        >
          {(() => {
            const idx = THEME_COLORS.findIndex(c => c.id === settings.accentColor);
            const pct = idx >= 0 ? (idx / (THEME_COLORS.length - 1)) * 100 : 0;
            return (
              <div
                className="absolute top-1/2 w-[16px] h-[16px] rounded-full bg-background shadow-lg ring-1 ring-ring/5 pointer-events-none transition-[left] duration-150"
                style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)' }}
              />
            );
          })()}
        </div>
      </FormRow>

      <FormRow label="透明窗口效果" desc={'启用亚克力或云母背景效果 (需重启)。'}>
        <Switch size="sm" checked={settings.transparency} onCheckedChange={v => updateSetting('transparency', v)} />
      </FormRow>

      <FormRow label="界面缩放" desc={'调整 UI 元素的大小。'}>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-muted-foreground/60 tabular-nums w-[32px] text-right">{settings.zoom}%</span>
          <Slider
            min={75}
            max={150}
            step={5}
            value={[settings.zoom]}
            onValueChange={([v]) => updateSetting('zoom', v)}
            className="w-[100px]"
          />
        </div>
      </FormRow>

      <FormRow label="全局字体">
        <UIInlineSelect
          value={settings.globalFont}
          onChange={v => updateSetting('globalFont', v)}
          options={[
            { value: 'system', label: '系统默认' },
            { value: 'inter', label: 'Inter' },
            { value: 'noto-sans', label: 'Noto Sans' },
            { value: 'pingfang', label: '苹方' },
          ]}
        />
      </FormRow>

      <FormRow label="代码字体" noBorder>
        <UIInlineSelect
          value={settings.codeFont}
          onChange={v => updateSetting('codeFont', v)}
          options={[
            { value: 'jetbrains', label: 'JetBrains Mono' },
            { value: 'fira', label: 'Fira Code' },
            { value: 'cascadia', label: 'Cascadia Code' },
            { value: 'source-code', label: 'Source Code Pro' },
          ]}
        />
      </FormRow>
    </div>
  );
}

// ===========================
// Panel: System & Startup
// ===========================
function SystemPanel() {
  const { settings, updateSetting } = useSettings();

  return (
    <div>
      {/* Startup & Tray */}
      <SectionHeader title="启动与托盘" />
      <FormRow label="开机自动启动">
        <Switch size="sm" checked={settings.launchAtLogin} onCheckedChange={v => updateSetting('launchAtLogin', v)} />
      </FormRow>
      <FormRow label="启动时最小化到托盘">
        <Switch size="sm" checked={settings.minimizeToTray} onCheckedChange={v => updateSetting('minimizeToTray', v)} />
      </FormRow>
      <FormRow label="关闭主面板时最小化" desc="点击关闭按钮不会退出程序">
        <Switch size="sm" checked={settings.closeToTray} onCheckedChange={v => updateSetting('closeToTray', v)} />
      </FormRow>
      <FormRow label="显示托盘图标" noBorder>
        <Switch size="sm" checked={settings.showTrayIcon} onCheckedChange={v => updateSetting('showTrayIcon', v)} />
      </FormRow>

      <div className="mt-3" />

      {/* Network & Performance */}
      <SectionHeader title="网络与性能" />
      <FormRow label="代理模式" desc="配置应用的网络连接方式">
        <UIInlineSelect
          value={settings.proxyMode}
          onChange={v => updateSetting('proxyMode', v)}
          options={[
            { value: 'system', label: '系统代理' },
            { value: 'none', label: '无代理' },
            { value: 'custom', label: '自定义' },
          ]}
        />
      </FormRow>
      <FormRow label="禁用硬件加速" desc="如果遇到显示问题，尝试开启此项">
        <Switch size="sm" checked={settings.hwAccel} onCheckedChange={v => updateSetting('hwAccel', v)} />
      </FormRow>

      <div className="mt-3" />

      {/* Spell check */}
      <SectionHeader title="拼写检查" />
      <FormRow label="启用拼写检查" noBorder>
        <Switch size="sm" checked={settings.spellCheck} onCheckedChange={v => updateSetting('spellCheck', v)} />
      </FormRow>
    </div>
  );
}

// ===========================
// Panel: Privacy & Advanced
// ===========================
function PrivacyPanel() {
  const { settings, updateSetting } = useSettings();

  return (
    <div>
      {/* Privacy */}
      <SectionHeader title="隐私设置" />
      <FormRow label="匿名发送错误报告和数据统计" desc="帮助我们改进软件稳定性" noBorder>
        <Switch size="sm" checked={settings.anonymousData} onCheckedChange={v => updateSetting('anonymousData', v)} />
      </FormRow>

      <div className="mt-4" />

      {/* Developer mode */}
      <SectionHeader title="开发者模式" />
      <FormRow label="启用开发者模式" desc="开启后将显示调试工具和高级日志" noBorder>
        <Switch size="sm" checked={settings.devMode} onCheckedChange={v => updateSetting('devMode', v)} />
      </FormRow>
    </div>
  );
}

// ===========================
// Panel: Custom CSS
// ===========================
function CustomCSSPanel() {
  const { settings, updateSetting } = useSettings();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Typography variant="subtitle">{'自定义 CSS'}</Typography>
        <Button variant="ghost" size="xs" className="text-cherry-primary hover:text-cherry-primary-dark">
          <span>获取样式代码</span>
          <ExternalLink size={9} />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground/60 mb-3">{'在此处输入 CSS 代码可覆盖默认界面样式。'}</p>

      <Textarea
        value={settings.customCSS}
        onChange={e => updateSetting('customCSS', e.target.value)}
        spellCheck={false}
        className="w-full h-[260px] px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-xs text-muted-foreground outline-none resize-y font-mono leading-relaxed placeholder:text-muted-foreground/60 scrollbar-thin focus:border-border transition-colors"
      />
    </div>
  );
}

// ===========================
// Main: GeneralSettingsPage
// ===========================
export function GeneralSettingsPage() {
  const [selectedId, setSelectedId] = useState<SubPage>('appearance');

  const renderPanel = () => {
    switch (selectedId) {
      case 'appearance': return <AppearancePanel />;
      case 'system': return <SystemPanel />;
      case 'privacy': return <PrivacyPanel />;
      case 'custom-css': return <CustomCSSPanel />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Middle Column: Navigation */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground/60 font-medium">通用配置</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin-xs">
          <div className="space-y-[2px]">
            {NAV_ITEMS.map(item => {
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
                    <span className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}>{item.icon}</span>
                    <span className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Config */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex-1 overflow-y-auto px-7 py-5 scrollbar-thin">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}
