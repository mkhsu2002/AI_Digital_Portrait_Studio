import React, { useEffect } from 'react';
import { useTranslation } from '../contexts/TranslationContext';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  onRetry?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  onClose,
  onRetry,
  autoClose = false,
  autoCloseDelay = 5000,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-md w-full bg-red-900/95 border border-red-700 rounded-lg shadow-xl p-4 animate-slide-in-right"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-sm font-semibold text-red-200 mb-1">
            {t.promptDisplay.errorTitle || '發生錯誤'}
          </h3>
          <p className="text-sm text-red-100 break-words whitespace-pre-wrap">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-xs font-semibold text-red-200 hover:text-white underline transition-colors"
            >
              重試
            </button>
          )}
          {import.meta.env.DEV && (
            <details className="mt-2">
              <summary className="text-xs text-red-300 cursor-pointer hover:text-red-100">
                開發模式：顯示詳細錯誤
              </summary>
              <pre className="mt-2 text-xs text-red-200 bg-red-950/50 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(message, null, 2)}
              </pre>
            </details>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-red-400 hover:text-red-200 transition-colors"
          aria-label="關閉"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;

