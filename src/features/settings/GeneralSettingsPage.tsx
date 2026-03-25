import React, { useState } from 'react';
import {
  Palette, Monitor, ShieldCheck, Code2,
  ChevronRight, ChevronDown, Check, ExternalLink, Info,
} from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import { useSettings } from '@/app/context/SettingsContext';
import { Toggle, FormRow, SectionHeader } from './shared';

// ===========================
// Types
// ===========================
type SubPage = 'appearance' | 'system' | 'privacy' | 'custom-css';

// ===========================
// Shared UI
// ===========================
function SelectField({ value, options, onChange, width }: {
  value: string;
  options: { value: string; label: string; icon?: string }[];
  onChange: (v: string) => void;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const selected = options.find(o => o.value === value);
  return (
    <div ref={ref} className="relative" style={{ width: width || 'auto' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border text-[10px] transition-colors justify-between ${
          open ? 'border-foreground/20 bg-accent text-foreground/70' : 'border-border/40 text-foreground/55 hover:border-foreground/15'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selected?.icon && <span className="text-[11px]">{selected.icon}</span>}
          {selected?.label || value}
        </span>
        <ChevronDown size={9} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-full min-w-[130px] bg-popover border border-border rounded-lg shadow-lg p-0.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-2.5 py-[5px] rounded-md text-[10px] transition-colors flex items-center justify-between gap-2 ${
                value === opt.value ? 'bg-accent text-foreground/75' : 'text-foreground/55 hover:bg-accent/50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {opt.icon && <span className="text-[11px]">{opt.icon}</span>}
                {opt.label}
              </span>
              {value === opt.value && <Check size={9} className="text-cherry-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <h3 className="text-[13px] text-foreground/80 mb-3" style={{ fontWeight: 500 }}>{'外观与显示'}</h3>

      <FormRow label={'语言 (Language)'} desc={'设置应用程序显示的语言。'}>
        <SelectField
          value={settings.language}
          onChange={v => updateSetting('language', v)}
          width="140px"
          options={[
            { value: 'zh-CN', label: '简体中文', icon: '🇨🇳' },
            { value: 'zh-TW', label: '繁體中文', icon: '🇹🇼' },
            { value: 'en', label: 'English', icon: '🇺🇸' },
            { value: 'ja', label: '日本語', icon: '🇯🇵' },
          ]}
        />
      </FormRow>

      <FormRow label="应用主题">
        <SelectField
          value={settings.theme}
          onChange={v => updateSetting('theme', v as 'light' | 'dark' | 'system')}
          width="130px"
          options={[
            { value: 'light', label: '浅色', icon: '☀️' },
            { value: 'dark', label: '深色', icon: '🌙' },
            { value: 'system', label: '跟随系统', icon: '💻' },
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
                className="absolute top-1/2 w-[16px] h-[16px] rounded-full bg-white shadow-lg ring-1 ring-black/5 pointer-events-none transition-[left] duration-150"
                style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)' }}
              />
            );
          })()}
        </div>
      </FormRow>

      <FormRow label="透明窗口效果" desc={'启用亚克力或云母背景效果 (需重启)。'}>
        <Toggle checked={settings.transparency} onChange={v => updateSetting('transparency', v)} />
      </FormRow>

      <FormRow label="界面缩放" desc={'调整 UI 元素的大小。'}>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-foreground/50 tabular-nums w-[32px] text-right">{settings.zoom}%</span>
          <input
            type="range"
            min={75}
            max={150}
            step={5}
            value={settings.zoom}
            onChange={e => updateSetting('zoom', Number(e.target.value))}
            className="w-[100px] h-[3px] accent-blue-500 appearance-auto cursor-pointer"
          />
        </div>
      </FormRow>

      <FormRow label="全局字体">
        <SelectField
          value={settings.globalFont}
          onChange={v => updateSetting('globalFont', v)}
          width="130px"
          options={[
            { value: 'system', label: '系统默认' },
            { value: 'inter', label: 'Inter' },
            { value: 'noto-sans', label: 'Noto Sans' },
            { value: 'pingfang', label: '苹方' },
          ]}
        />
      </FormRow>

      <FormRow label="代码字体" noBorder>
        <SelectField
          value={settings.codeFont}
          onChange={v => updateSetting('codeFont', v)}
          width="140px"
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
        <Toggle checked={settings.launchAtLogin} onChange={v => updateSetting('launchAtLogin', v)} />
      </FormRow>
      <FormRow label="启动时最小化到托盘">
        <Toggle checked={settings.minimizeToTray} onChange={v => updateSetting('minimizeToTray', v)} />
      </FormRow>
      <FormRow label="关闭主面板时最小化" desc="点击关闭按钮不会退出程序">
        <Toggle checked={settings.closeToTray} onChange={v => updateSetting('closeToTray', v)} />
      </FormRow>
      <FormRow label="显示托盘图标" noBorder>
        <Toggle checked={settings.showTrayIcon} onChange={v => updateSetting('showTrayIcon', v)} />
      </FormRow>

      <div className="mt-3" />

      {/* Network & Performance */}
      <SectionHeader title="网络与性能" />
      <FormRow label="代理模式" desc="配置应用的网络连接方式">
        <SelectField
          value={settings.proxyMode}
          onChange={v => updateSetting('proxyMode', v)}
          width="120px"
          options={[
            { value: 'system', label: '系统代理' },
            { value: 'none', label: '无代理' },
            { value: 'custom', label: '自定义' },
          ]}
        />
      </FormRow>
      <FormRow label="禁用硬件加速" desc="如果遇到显示问题，尝试开启此项">
        <Toggle checked={settings.hwAccel} onChange={v => updateSetting('hwAccel', v)} />
      </FormRow>

      <div className="mt-3" />

      {/* Spell check */}
      <SectionHeader title="拼写检查" />
      <FormRow label="启用拼写检查" noBorder>
        <Toggle checked={settings.spellCheck} onChange={v => updateSetting('spellCheck', v)} />
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
        <Toggle checked={settings.anonymousData} onChange={v => updateSetting('anonymousData', v)} />
      </FormRow>

      <div className="mt-4" />

      {/* Developer mode */}
      <SectionHeader title="开发者模式" />
      <FormRow label="启用开发者模式" desc="开启后将显示调试工具和高级日志" noBorder>
        <Toggle checked={settings.devMode} onChange={v => updateSetting('devMode', v)} />
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
        <h3 className="text-[13px] text-foreground/80" style={{ fontWeight: 500 }}>{'自定义 CSS'}</h3>
        <button className="flex items-center gap-1 text-[10px] text-cherry-primary hover:text-cherry-primary-dark transition-colors">
          <span>获取样式代码</span>
          <ExternalLink size={9} />
        </button>
      </div>

      <p className="text-[10px] text-foreground/40 mb-3">{'在此处输入 CSS 代码可覆盖默认界面样式。'}</p>

      <textarea
        value={settings.customCSS}
        onChange={e => updateSetting('customCSS', e.target.value)}
        spellCheck={false}
        className="w-full h-[260px] px-4 py-3 bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl text-[11px] text-foreground/60 outline-none resize-y font-mono leading-relaxed placeholder:text-foreground/15 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20 focus:border-foreground/[0.12] transition-colors"
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
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-foreground/[0.05] min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0">
          <p className="text-[11px] text-foreground/40" style={{ fontWeight: 500 }}>通用配置</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
          <div className="space-y-[2px]">
            {NAV_ITEMS.map(item => {
              const isSelected = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-[8px] rounded-xl transition-all text-left relative ${
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
                    <span className={`text-[10px] truncate ${isSelected ? 'text-foreground/85' : 'text-foreground/55'}`} style={{ fontWeight: isSelected ? 500 : 400 }}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-foreground/25' : 'text-foreground/10'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Config */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex-1 overflow-y-auto px-7 py-5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}
