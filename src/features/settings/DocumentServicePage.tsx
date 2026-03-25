import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Check, ChevronDown, X,
  Eye, EyeOff, Copy, ExternalLink,
  Activity, FolderOpen, CheckSquare,
  ChevronRight,
} from 'lucide-react';
import { BrandLogo } from '@/app/components/ui/BrandLogos';
import { Toggle, InlineSelect, ConfigSection, TextInput } from './shared';

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
      <label className="text-[10px] text-foreground/55">{children}</label>
      {hint && <p className="text-[8px] text-foreground/25 mt-0.5">{hint}</p>}
    </div>
  );
}

// ===========================
// System OCR Config
// ===========================
function SystemOCRConfig() {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-white text-[14px] flex-shrink-0">■</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 600 }}>System OCR</h3>
          <p className="text-[9px] text-foreground/35 mt-0.5">原生操作系统 OCR 引擎</p>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} />
      </div>

      <ConfigSection title="状态">
        <div className="flex items-start gap-2">
          <CheckSquare size={13} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-primary" style={{ fontWeight: 500 }}>检测到 macOS Live Text / Windows OCR 引擎可用。</p>
            <p className="text-[9px] text-foreground/35 mt-1">系统 OCR 无需配置，直接调用系统底层能力。速度最快但准确率受系统版本影响。</p>
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
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[14px] flex-shrink-0" style={{ fontWeight: 700, background: '#d97706' }}>T</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 600 }}>Tesseract OCR</h3>
          <p className="text-[9px] text-foreground/35 mt-0.5">Google 开源的光学字符识别引擎，完全本地运行。</p>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} />
      </div>

      <ConfigSection title="本地环境">
        <div>
          <FieldLabel>执行路径</FieldLabel>
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <TextInput value={binaryPath} onChange={setBinaryPath} />
            </div>
            <button className="px-2.5 py-[5px] rounded-lg border border-border/30 text-[10px] text-foreground/45 hover:text-foreground/65 hover:bg-accent transition-colors flex-shrink-0">
              <FolderOpen size={12} />
            </button>
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
            <div key={lang.id} className="flex items-center gap-1.5 px-2.5 py-[4px] bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg">
              <span className="text-[10px] text-foreground/70" style={{ fontWeight: 500 }}>{lang.name}</span>
              <span className="text-[9px] text-foreground/40">({lang.code})</span>
              <button
                onClick={() => setLangs(prev => prev.filter(l => l.id !== lang.id))}
                className="text-foreground/25 hover:text-foreground/45 transition-colors"
              >
                <X size={9} />
              </button>
            </div>
          ))}
          <button className="flex items-center gap-1 px-2.5 py-[4px] border border-dashed border-foreground/15 rounded-lg text-[10px] text-foreground/35 hover:text-foreground/55 hover:border-foreground/25 transition-colors">
            <Plus size={9} />
            <span>添加语言</span>
          </button>
        </div>
      </ConfigSection>

      <div className="flex justify-end pt-1">
        <button className="px-3.5 py-[5px] rounded-lg text-[10px] text-white bg-cherry-primary hover:bg-cherry-primary-dark transition-colors">
          保存配置
        </button>
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
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[14px] flex-shrink-0" style={{ fontWeight: 700, background: '#2563eb' }}>P</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 600 }}>PaddleOCR</h3>
          <p className="text-[9px] text-foreground/35 mt-0.5">超轻量级 OCR 识别系统</p>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} />
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
        <p className="text-[9px] text-foreground/40 leading-relaxed">
          您可以使用 PaddleOCR 官方支持的 Docker 镜像本地部署，部署后填入 API 地址即可。
        </p>
        <a href="#" className="text-[9px] text-cherry-primary/70 hover:text-cherry-primary transition-colors inline-flex items-center gap-1">
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
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[14px] flex-shrink-0" style={{ fontWeight: 700, background: '#f59e0b' }}>M</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 600 }}>Mistral</h3>
          <p className="text-[9px] text-foreground/35 mt-0.5">文档解析与理解</p>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} />
      </div>

      <ConfigSection title="认证">
        <div>
          <FieldLabel>API 密钥 (API Key)</FieldLabel>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 flex items-center px-2.5 py-[5px] bg-foreground/[0.03] rounded-lg border border-border/30">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="flex-1 bg-transparent text-[10px] text-foreground/60 outline-none min-w-0"
              />
              <button onClick={() => setShowKey(v => !v)} className="text-foreground/20 hover:text-foreground/40 transition-colors ml-1.5">
                {showKey ? <EyeOff size={10} /> : <Eye size={10} />}
              </button>
            </div>
          </div>
          <a href="#" className="text-[9px] text-cherry-primary/70 hover:text-cherry-primary transition-colors mt-1 inline-block">
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
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[14px] flex-shrink-0" style={{ fontWeight: 700, background: '#6366f1' }}>U</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 600 }}>MinerU</h3>
          <p className="text-[9px] text-foreground/35 mt-0.5">OpenDataLab 开源的高质量 PDF 提取工具。</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] text-foreground/40">启用服务</span>
          <Toggle checked={enabled} onChange={setEnabled} />
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
            <div className="flex-1 flex items-center px-2.5 py-[5px] bg-foreground/[0.03] rounded-lg border border-border/30">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="flex-1 bg-transparent text-[10px] text-foreground/60 outline-none min-w-0"
              />
              <button onClick={() => setShowKey(v => !v)} className="text-foreground/20 hover:text-foreground/40 transition-colors ml-1.5">
                {showKey ? <EyeOff size={10} /> : <Eye size={10} />}
              </button>
            </div>
            <button className="px-2.5 py-[5px] rounded-lg border border-border/30 text-[10px] text-foreground/45 hover:text-foreground/65 hover:bg-accent transition-colors flex-shrink-0">
              验证
            </button>
          </div>
          <p className="text-[8px] text-foreground/25 mt-1">MinerU 现在提供每日 500 页的免费额度。</p>
        </div>
        <div className="flex justify-end">
          <button className="flex items-center gap-1.5 px-3 py-[4px] rounded-lg bg-cherry-primary text-white text-[10px] hover:bg-cherry-primary-dark transition-colors">
            <Activity size={9} />
            <span>测试连接</span>
          </button>
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
            <p className="text-[10px] text-foreground/60">公式识别 (Formula OCR)</p>
            <p className="text-[8px] text-foreground/25 mt-0.5">启用 LaTeX 公式转换</p>
          </div>
          <Toggle checked={formulaOcr} onChange={setFormulaOcr} />
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
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[12px] flex-shrink-0" style={{ fontWeight: 700, background: '#ef4444' }}>2x</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 600 }}>Doc2x</h3>
          <p className="text-[9px] text-foreground/35 mt-0.5">高级文档还原引擎</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] text-foreground/40">启用服务</span>
          <Toggle checked={enabled} onChange={setEnabled} />
        </div>
      </div>

      <ConfigSection title="认证">
        <div>
          <FieldLabel>API Key</FieldLabel>
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <TextInput value={apiKey} onChange={setApiKey} placeholder="输入 Doc2X API Key" />
            </div>
            <button className="px-2.5 py-[5px] rounded-lg border border-border/30 text-[10px] text-foreground/45 hover:text-foreground/65 hover:bg-accent transition-colors flex-shrink-0">
              获取 Key
            </button>
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
          <p className="text-[10px] text-foreground/25">选择一个服务查看配置</p>
        </div>
      );
    }
  };

  const renderProviderItem = (provider: DocProvider) => {
    const isSelected = selectedId === provider.id;
    return (
      <button
        key={provider.id}
        onClick={() => setSelectedId(provider.id)}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left relative ${
          isSelected
            ? 'bg-cherry-active-bg'
            : 'border border-transparent hover:bg-foreground/[0.03]'
        }`}
      >
        {isSelected && (
          <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
        )}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ fontWeight: 700, fontSize: provider.logo.length > 1 ? 9 : 12, background: provider.color }}
        >
          {provider.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-[10px] ${isSelected ? 'text-foreground/85' : 'text-foreground/65'}`} style={{ fontWeight: 500 }}>
              {provider.name}
            </p>
            {provider.badge && (
              <span
                className="text-[7px] px-1.5 py-[0.5px] rounded-md border"
                style={{
                  color: provider.badgeColor || '#6b7280',
                  borderColor: `${provider.badgeColor || '#6b7280'}30`,
                  background: `${provider.badgeColor || '#6b7280'}0a`,
                  fontWeight: 500,
                }}
              >
                {provider.badge}
              </span>
            )}
          </div>
          <p className="text-[8px] text-foreground/25 mt-0.5 truncate">{provider.subtitle}</p>
        </div>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          provider.configured ? 'bg-primary' : 'bg-foreground/15'
        }`} />
      </button>
    );
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Middle Column: Service List */}
      <div className="w-[160px] flex-shrink-0 flex flex-col border-r border-foreground/[0.05] min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0">
          <p className="text-[11px] text-foreground/40" style={{ fontWeight: 500 }}>文档服务</p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2.5 pb-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
          <div className="space-y-[2px]">
            {/* OCR Section */}
            <p className="text-[8px] text-foreground/25 tracking-wider px-3 pt-1 pb-1" style={{ fontWeight: 500 }}>OCR</p>
            {ocrProviders.map(provider => {
              const isSelected = selectedId === provider.id;
              return (
                <button
                  key={provider.id}
                  onClick={() => setSelectedId(provider.id)}
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
                    <span className="flex-shrink-0"><BrandLogo id={provider.id} fallbackLetter={provider.logo} fallbackColor={provider.color} size={15} /></span>
                    <span className={`text-[10px] truncate ${isSelected ? 'text-foreground/85' : 'text-foreground/55'}`} style={{ fontWeight: isSelected ? 500 : 400 }}>{provider.name}</span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-foreground/25' : 'text-foreground/10'}`} />
                </button>
              );
            })}

            {/* Doc Parsing Section */}
            <p className="text-[8px] text-foreground/25 tracking-wider px-3 pt-2.5 pb-1" style={{ fontWeight: 500 }}>文档处理</p>
            {docProviders.map(provider => {
              const isSelected = selectedId === provider.id;
              return (
                <button
                  key={provider.id}
                  onClick={() => setSelectedId(provider.id)}
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
                    <span className="flex-shrink-0"><BrandLogo id={provider.id} fallbackLetter={provider.logo} fallbackColor={provider.color} size={15} /></span>
                    <span className={`text-[10px] truncate ${isSelected ? 'text-foreground/85' : 'text-foreground/55'}`} style={{ fontWeight: isSelected ? 500 : 400 }}>{provider.name}</span>
                  </div>
                  <ChevronRight size={9} className={`flex-shrink-0 ${isSelected ? 'text-foreground/25' : 'text-foreground/10'}`} />
                </button>
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
