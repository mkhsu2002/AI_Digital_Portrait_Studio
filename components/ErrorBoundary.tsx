import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from '../contexts/TranslationContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800 rounded-xl border border-red-500/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              {t.errors.general || '發生錯誤'}
            </h2>
            <p className="text-slate-300 mb-4">
              {error?.message || '應用程式發生未預期的錯誤'}
            </p>
            {process.env.NODE_ENV === 'development' && error?.stack && (
              <details className="mb-4">
                <summary className="cursor-pointer text-slate-400 hover:text-slate-200 mb-2">
                  錯誤詳情（開發模式）
                </summary>
                <pre className="bg-slate-900 p-4 rounded-md overflow-auto text-xs text-slate-300">
                  {error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={onReset}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 函數式包裝器，方便在函數組件中使用
export const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;




