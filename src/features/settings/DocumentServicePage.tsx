import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Check, ChevronDown, X,
  Eye, EyeOff, Copy, ExternalLink,
  Activity, FolderOpen, CheckSquare,
  ChevronRight,
} from 'lucide-react';
import { Button, Input, BrandLogo, Typography, Switch } from '@cherry-studio/ui';
import { InlineSelect, ConfigSection, TextInput } from './shared';

// ===========================
// Types
// ===========================
type ProviderCategory = 'ocr' | 'doc-parsing';

interface DocProvider {
  id: string;
  name: string;
  logo: string;
  color: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  category: ProviderCategory;
  enabled: boolean;
  configured: boolean;
}

// ===========================
// Mock Data
// ===========================
const MOCK_DOC_PROVIDERS: DocProvider[] = [
  // OCR
  { id: 'system-ocr', name: 'System OCR', logo: '■', color: '#1a1a1a', subtitle: 'Local Native', badge: 'Native', badgeColor: '#6b7280', category: 'ocr', enabled: true, configured: true },
  { id: 'tesseract', name: 'Tesseract', logo: 'T', color: '#d97706', subtitle: 'Open Source', badge: 'Local', badgeColor: '#10b981', category: 'ocr', enabled: true, configured: true },
  { id: 'paddleocr', name: 'PaddleOCR', logo: 'P', color: '#2563eb', subtitle: 'High Accuracy', category: 'ocr', enabled: false, configured: false },
  // Doc Parsing
  { id: 'mistral', name: 'Mistral', logo: 'M', color: '#f59e0b', subtitle: '强大的文档理解与解析模型。', badge: 'LLM', badgeColor: '#f59e0b', category: 'doc-parsing', enabled: true, configured: true },
  { id: 'mineru', name: 'MinerU', logo: 'U', color: '#6366f1', subtitle: '专注于 PDF 解析与公式提取的开源工具。', category: 'doc-parsing', enabled: false, configured: false },
  { id: 'doc2x', name: 'Doc2x', logo: '2x', color: '#ef4444', subtitle: '高级文档还原引擎', category: 'doc-parsing', enabled: false, configured: false },
];

// ===========================
// Field Label
// ===========================
function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-xs text-muted-foreground">{children}</label>
      {hint && <p className="text-xs text-muted-foreground/40 mt-0.5">{hint}</p>}
    </div>
  );
}

// ===========================
// System OCR Config
// ===========================
function SystemOCRConfig() {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center text-background text-sm flex-shrink-0">■</div>
        <div className="flex-1 min-w-0">
          <Typography variant="subtitle">System OCR</Typography>
          <p className="text-xs text-muted-foreground/60 mt-0.5">原生操作系统 OCR 引擎</p>
        </div>
        <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <ConfigSection title="状态">
        <div className="flex items-start gap-2">
          <CheckSquare size={13} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-primary">检测到 macOS Live Text / Windows OCR 引擎可用。</p>
            <p className="text-xs text-muted-foreground/40 mt-1">系统 OCR 无需配置，直接调用系统底层能力。速度最快但准确率受系统版本影响。</p>
          </div>
        </div>
      </ConfigSection>
    </div>
  );
}

// ===========================
// Tesseract OCR Config
// ===========================
function TesseractConfig() {
  const [enabled, setEnabled] = useState(true);
  const [binaryPath, setBinaryPath] = useState('/usr/local/bin/tesseract');
  const [tessdata, setTessdata] = useState('/usr/local/share/tessdata');
  const [langs, setLangs] = useState([
    { id: 'eng', name: 'English', code: 'eng' },
    { id: 'chi_sim', name: 'Simplified Chinese', code: 'chi_sim' },
  ]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-background text-sm font-bold flex-shrink-0 bg-accent-amber">T</div>
        <div className="flex-1 min-w-0">
          <Typography variant="subtitle">Tesseract OCR</Typography>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Google 开源的光学字符识别引擎，完全本地运行。</p>
        </div>
        <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <ConfigSection title="本地环境">
        <div>
          <FieldLabel>执行路径</FieldLabel>
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <TextInput value={binaryPath} onChange={setBinaryPath} />
            </div>
            <Button variant="outline" size="icon-sm" className="flex-shrink-0">
              <FolderOpen size={12} />
            </Button>
          </div>
        </div>
        <div>
          <FieldLabel>Tessdata 路径</FieldLabel>
          <TextInput value={tessdata} onChange={setTessdata} />
        </div>
      </ConfigSection>

      <ConfigSection title="语言包">
        <div className="flex flex-wrap gap-1.5">
          {langs.map(lang => (
            <div key={lang.id} className="flex items-center gap-1.5 px-2.5 py-[4px] bg-muted/50 border border-border/50 rounded-lg">
              <span className="text-xs font-medium text-foreground">{lang.name}</span>
              <span className="text-xs text-muted-foreground/60">({lang.code})</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setLangs(prev => prev.filter(l => l.id !== lang.id))}
                className="text-muted-foreground/40 hover:text-foreground"
              >
                <X size={9} />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="xs" className="border-dashed border-border/50 text-muted-foreground/40 hover:text-foreground hover:border-border">
            <Plus size={9} />
            <span>添加语言</span>
          </Button>
        </div>
      </ConfigSection>

      <div className="flex justify-end pt-1">
        <Button variant="default" size="xs">
          保存配置
        </Button>
      </div>
    </div>
  );
}

// ===========================
// PaddleOCR Config
// ===========================
function PaddleOCRConfig() {
  const [enabled, setEnabled] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:8866/predict/ocr_system');
  const [accessKey, setAccessKey] = useState('');

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-background text-sm font-bold flex-shrink-0 bg-accent-blue">P</div>
        <div className="flex-1 min-w-0">
          <Typography variant="subtitle">PaddleOCR</Typography>
          <p className="text-xs text-muted-foreground/60 mt-0.5">超轻量级 OCR 识别系统</p>
        </div>
        <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <ConfigSection title="API 连接">
        <div>
          <FieldLabel>API URL</FieldLabel>
          <TextInput value={apiUrl} onChange={setApiUrl} />
        </div>
        <div>
          <FieldLabel hint="若服务开启了鉴权，请填入 Key">访问密钥（可选）</FieldLabel>
          <TextInput value={accessKey} onChange={setAccessKey} placeholder="若服务开启了鉴权，请填入 Key" />
        </div>
      </ConfigSection>

      <ConfigSection title="说明">
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          您可以使用 PaddleOCR 官方支持的 Docker 镜像本地部署，部署后填入 API 地址即可。
        </p>
        <a href="#" className="text-xs text-cherry-primary/70 hover:text-cherry-primary transition-colors inline-flex items-center gap-1">
          查看 Docker 部署文档
          <ExternalLink size={8} />
        </a>
      </ConfigSection>
    </div>
  );
}

// ===========================
// Mistral Config
// ===========================
function MistralConfig() {
  const [enabled, setEnabled] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••');
  const [baseUrl, setBaseUrl] = useState('https://api.mistral.ai/v1');
  const [model, setModel] = useState('mistral-embed');

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-background text-sm font-bold flex-shrink-0 bg-accent-amber">M</div>
        <div className="flex-1 min-w-0">
          <Typography variant="subtitle">Mistral</Typography>
          <p className="text-xs text-muted-foreground/60 mt-0.5">文档解析与理解</p>
        </div>
        <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <ConfigSection title="认证">
        <div>
          <FieldLabel>API 密钥 (API Key)</FieldLabel>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="flex-1 bg-transparent text-xs text-muted-foreground border-0 shadow-none h-auto p-0 min-w-0"
              />
              <Button variant="ghost" size="icon-xs" onClick={() => setShowKey(v => !v)} className="text-muted-foreground/50 hover:text-foreground ml-1.5">
                {showKey ? <EyeOff size={10} /> : <Eye size={10} />}
              </Button>
            </div>
          </div>
          <a href="#" className="text-xs text-cherry-primary/70 hover:text-cherry-primary transition-colors mt-1 inline-block">
            点击这里获取密钥
          </a>
        </div>
        <div>
          <FieldLabel>API 地址 (Base URL)</FieldLabel>
          <TextInput value={baseUrl} onChange={setBaseUrl} />
        </div>
      </ConfigSection>

      <ConfigSection title="模型参数">
        <div>
          <FieldLabel>解析模型</FieldLabel>
          <InlineSelect
            value={model}
            onChange={setModel}
            options={[
              { value: 'mistral-embed', label: 'mistral-embed' },
              { value: 'mistral-small', label: 'mistral-small' },
              { value: 'mistral-large', label: 'mistral-large' },
            ]}
          />
        </div>
      </ConfigSection>
    </div>
  );
}

// ===========================
// MinerU Config
// ===========================
function MinerUConfig() {
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('sk-...');
  const [showKey, setShowKey] = useState(false);
  const [endpoint, setEndpoint] = useState('https://u.opendatalab.com/api/v1');
  const [parseMode, setParseMode] = useState('auto');
  const [formulaOcr, setFormulaOcr] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-background text-sm font-bold flex-shrink-0 bg-accent-indigo">U</div>
        <div className="flex-1 min-w-0">
          <Typography variant="subtitle">MinerU</Typography>
          <p className="text-xs text-muted-foreground/60 mt-0.5">OpenDataLab 开源的高质量 PDF 提取工具。</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground/60">启用服务</span>
          <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      <ConfigSection title="连接设置">
        <div>
          <FieldLabel>API 地址 (Base URL)</FieldLabel>
          <TextInput value={endpoint} onChange={setEndpoint} />
        </div>
        <div>
          <FieldLabel>API 密钥 (Token)</FieldLabel>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 flex items-center px-2.5 py-[5px] bg-muted/30 rounded-lg border border-border/30">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="flex-1 bg-transparent text-xs text-muted-foreground border-0 shadow-none h-auto p-0 min-w-0"
              />
              <Button variant="ghost" size="icon-xs" onClick={() => setShowKey(v => !v)} className="text-muted-foreground/50 hover:text-foreground ml-1.5">
                {showKey ? <EyeOff size={10} /> : <Eye size={10} />}
              </Button>
            </div>
            <Button variant="outline" size="xs" className="flex-shrink-0">
              验证
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/40 mt-1">MinerU 现在提供每日 500 页的免费额度。</p>
        </div>
        <div className="flex justify-end">
          <Button variant="default" size="xs">
            <Activity size={9} />
            <span>测试连接</span>
          </Button>
        </div>
      </ConfigSection>

      <ConfigSection title="处理参数">
        <div>
          <FieldLabel>解析模式</FieldLabel>
          <InlineSelect
            value={parseMode}
            onChange={setParseMode}
            options={[
              { value: 'auto', label: 'Auto (智能识别)' },
              { value: 'high', label: 'High Quality (慢，支持复杂排版)' },
              { value: 'fast', label: 'Fast (快速，简单文档)' },
            ]}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">公式识别 (Formula OCR)</p>
            <p className="text-xs text-muted-foreground/40 mt-0.5">启用 LaTeX 公式转换</p>
          </div>
          <Switch size="sm" checked={formulaOcr} onCheckedChange={setFormulaOcr} />
        </div>
      </ConfigSection>
    </div>
  );
}

// ===========================
// Doc2x Config
// ===========================
function Doc2xConfig() {
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('https://v2.doc2x.noedgeai.com');
  const [outputFormat, setOutputFormat] = useState('markdown');
  const [concurrency, setConcurrency] = useState('5');

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-background text-sm font-bold flex-shrink-0 bg-destructive">2x</div>
        <div className="flex-1 min-w-0">
          <Typography variant="subtitle">Doc2x</Typography>
          <p className="text-xs text-muted-foreground/60 mt-0.5">高级文档还原引擎</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground/60">启用服务</span>
          <Switch size="sm" checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      <ConfigSection title="认证">
        <div>
          <FieldLabel>API Key</FieldLabel>
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <TextInput value={apiKey} onChange={setApiKey} placeholder="输入 Doc2X API Key" />
            </div>
            <Button variant="outline" size="xs" className="flex-shrink-0">
              获取 Key
            </Button>
          </div>
        </div>
        <div>
          <FieldLabel>API Base URL</FieldLabel>
          <TextInput value={endpoint} onChange={setEndpoint} />
        </div>
      </ConfigSection>

      <ConfigSection title="输出配置">
        <div>
          <FieldLabel>输出格式</FieldLabel>
          <InlineSelect
            value={outputFormat}
            onChange={setOutputFormat}
            options={[
              { value: 'markdown', label: 'Markdown (推荐)' },
              { value: 'latex', label: 'LaTeX' },
              { value: 'docx', label: 'DOCX' },
            ]}
          />
        </div>
        <div>
          <FieldLabel hint="同时处理的文档页数上限。">并发限制</FieldLabel>
          <TextInput value={concurrency} onChange={setConcurrency} />
        </div>
      </ConfigSection>
    </div>
  );
}

// ===========================
// Main: DocumentServicePage
// ===========================
export function DocumentServicePage() {
  const [selectedId, setSelectedId] = useState<string>('system-ocr');
  const [providers] = useState(MOCK_DOC_PROVIDERS);

  const ocrProviders = providers.filter(p => p.category === 'ocr');
  const docProviders = providers.filter(p => p.category === 'doc-parsing');

  const renderConfig = () => {
    switch (selectedId) {
      case 'system-ocr': return <SystemOCRConfig />;
      case 'tesseract': return <TesseractConfig />;
      case 'paddleocr': return <PaddleOCRConfig />;
      case 'mistral': return <MistralConfig />;
      case 'mineru': return <MinerUConfig />;
      case 'doc2x': return <Doc2xConfig />;
      default: return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground/40">选择一个服务查看配置</p>
        </div>
      );
    }
  };

  const renderProviderItem = (provider: DocProvider) => {
    const isSelected = selectedId === provider.id;
    return (
      <Button variant="ghost" size="inline"
        key={provider.id}
        onClick={() => setSelectedId(provider.id)}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left relative ${
          isSelected
            ? 'bg-cherry-active-bg'
            : 'border border-transparent hover:bg-accent/50'
        }`}
      >
        {isSelected && (
          <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
        )}
        <BrandLogo id={provider.id} fallbackLetter={provider.logo} fallbackColor={provider.color} size={28} className="rounded-lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
              {provider.name}
            </p>
            {provider.badge && (
              <span
                className="text-xs px-1.5 py-[0.5px] rounded-md border font-medium"
                style={{
                  color: provider.badgeColor || '#6b7280',
                  borderColor: `${provider.badgeColor || '#6b7280'}30`,
                  background: `${provider.badgeColor || '#6b7280'}0a`,
                }}
              >
                {provider.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/40 mt-0.5 truncate">{provider.subtitle}</p>
        </div>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          provider.configured ? 'bg-primary' : 'bg-foreground/15'
        }`} />
      </Button>
    );
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Middle Column: Service List */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-border/30 min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0">
          <p className="text-xs font-medium text-muted-foreground/60">文档服务</p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin-xs">
          <div className="space-y-[2px]">
            {/* OCR Section */}
            <p className="text-xs text-muted-foreground/40 tracking-wider px-3 pt-1 pb-1 font-medium">OCR</p>
            {ocrProviders.map(provider => {
              const isSelected = selectedId === provider.id;
              return (
                <Button variant="ghost" size="inline"
                  key={provider.id}
                  onClick={() => setSelectedId(provider.id)}
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
                    <span className="flex-shrink-0"><BrandLogo id={provider.id} fallbackLetter={provider.logo} fallbackColor={provider.color} size={15} /></span>
                    <span className={`text-xs truncate ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{provider.name}</span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
                </Button>
              );
            })}

            {/* Doc Parsing Section */}
            <p className="text-xs text-muted-foreground/40 tracking-wider px-3 pt-2.5 pb-1 font-medium">文档处理</p>
            {docProviders.map(provider => {
              const isSelected = selectedId === provider.id;
              return (
                <Button variant="ghost" size="inline"
                  key={provider.id}
                  onClick={() => setSelectedId(provider.id)}
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
                    <span className="flex-shrink-0"><BrandLogo id={provider.id} fallbackLetter={provider.logo} fallbackColor={provider.color} size={15} /></span>
                    <span className={`text-xs truncate ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{provider.name}</span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-muted-foreground/40' : 'text-muted-foreground/50'}`} />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Config Panel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {renderConfig()}
      </div>
    </div>
  );
}
