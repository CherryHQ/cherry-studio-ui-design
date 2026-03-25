// ===========================
// Error Boundary
// ===========================
// Catches rendering errors to prevent white-screen crashes.
// Wrap around <MainContent> or <App> root.

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fallback component. If not provided, uses the built-in error card. */
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in development; in production this could be sent
    // to an error reporting service (Sentry, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-full w-full bg-background">
          <div className="flex flex-col items-center gap-4 max-w-[360px] text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-500/70" />
            </div>

            <div>
              <h3 className="text-[13px] text-foreground/80 mb-1" style={{ fontWeight: 500 }}>
                {'\u9875\u9762\u6e32\u67d3\u51fa\u9519'}
              </h3>
              <p className="text-[11px] text-foreground/40 leading-relaxed">
                {'\u53d1\u751f\u4e86\u610f\u5916\u9519\u8bef\u3002\u8bf7\u5c1d\u8bd5\u91cd\u65b0\u52a0\u8f7d\uff0c\u5982\u679c\u95ee\u9898\u6301\u7eed\u5b58\u5728\uff0c\u8bf7\u8054\u7cfb\u6280\u672f\u652f\u6301\u3002'}
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-3 py-2 text-left">
                <p className="text-[9px] text-foreground/25 mb-1" style={{ fontWeight: 500 }}>
                  {'\u9519\u8bef\u8be6\u60c5'}
                </p>
                <p className="text-[10px] text-red-400/70 break-all" style={{ fontFamily: 'ui-monospace, monospace' }}>
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-4 py-[6px] rounded-lg bg-foreground/[0.06] hover:bg-foreground/[0.1] text-foreground/60 text-[11px] transition-colors"
              style={{ fontWeight: 500 }}
            >
              <RotateCcw size={12} />
              {'\u91cd\u65b0\u52a0\u8f7d'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
