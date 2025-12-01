'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Class component for catching React errors
 *
 * Usage:
 * <ErrorBoundary onRetry={() => window.location.reload()}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Store error info in state for debugging
    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // TODO: Log to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional retry handler
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="rounded-2xl bg-[#1E1F20] p-6 border border-red-900/20">
          <div className="flex items-start gap-4">
            {/* Error Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-[#FF3B3B]/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#FF3B3B]"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Error Content */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  Something went wrong
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  We encountered an error while rendering this component. Please try again.
                </p>
              </div>

              {/* Error Details (Dev Mode Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-3 rounded-lg bg-[#131314] border border-gray-800">
                  <p className="text-xs font-mono text-red-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <details className="text-xs font-mono text-gray-500">
                      <summary className="cursor-pointer hover:text-gray-400">
                        Component Stack
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Retry Button */}
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 rounded-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
