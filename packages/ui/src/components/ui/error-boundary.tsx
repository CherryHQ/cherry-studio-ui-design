"use client"

// ===========================
// Error Boundary
// ===========================
// Catches rendering errors to prevent white-screen crashes.
// Wrap around <MainContent> or <App> root.

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from "../../lib/utils"
import { Button } from './button';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fallback component. If not provided, uses the built-in error card. */
  fallback?: React.ReactNode;
  /** Optional className for the error card container */
  className?: string;
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
        <div data-slot="error-boundary" className={cn('flex items-center justify-center h-full w-full bg-background tracking-[-0.14px]', this.props.className)}>
          <div className="flex flex-col items-center gap-4 max-w-[360px] text-center px-6">
            <div className="w-12 h-12 rounded-[var(--radius-card)] bg-destructive/10 flex items-center justify-center">
              <AlertTriangle size={22} className="text-destructive/70" />
            </div>

            <div>
              <h3 className="text-sm text-foreground/80 mb-1 font-medium">
                {'\u9875\u9762\u6e32\u67d3\u51fa\u9519'}
              </h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                {'\u53d1\u751f\u4e86\u610f\u5916\u9519\u8bef\u3002\u8bf7\u5c1d\u8bd5\u91cd\u65b0\u52a0\u8f7d\uff0c\u5982\u679c\u95ee\u9898\u6301\u7eed\u5b58\u5728\uff0c\u8bf7\u8054\u7cfb\u6280\u672f\u652f\u6301\u3002'}
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-muted/30 border border-border/30 rounded-[var(--radius-button)] px-3 py-2 text-left">
                <p className="text-xs text-foreground/50 mb-1 font-medium">
                  {'\u9519\u8bef\u8be6\u60c5'}
                </p>
                <p className="text-xs text-destructive/70 break-all font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={this.handleReset}
              className="gap-1.5 bg-muted/30 hover:bg-muted/50 text-foreground/60 text-xs"
            >
              <RotateCcw size={12} />
              {'\u91cd\u65b0\u52a0\u8f7d'}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
