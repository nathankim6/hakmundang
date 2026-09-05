
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-soft">
          <div className="glass-card p-8 max-w-md w-full">
            <h1 className="text-xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-4">
              애플리케이션에서 오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.
            </p>
            <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-800 overflow-auto max-h-[200px] mb-4">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
