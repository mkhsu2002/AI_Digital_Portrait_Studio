import React, { useState, useCallback } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { useTranslation } from '../contexts/TranslationContext';

interface ApiKeyInputProps {
  onClose?: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onClose }) => {
  const { setManualApiKey, clearManualApiKey, getManualApiKeyPreview, getApiKeySource } = useApiKey();
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentPreview = getManualApiKeyPreview();
  const currentSource = getApiKeySource();

  const handleSave = useCallback(() => {
    setError(null);
    setSuccess(false);

    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      setError('請輸入 API Key');
      return;
    }

    // 基本格式驗證（Gemini API Key 通常以 AIza 開頭）
    if (!trimmedKey.startsWith('AIza') && trimmedKey.length < 20) {
      setError('API Key 格式可能不正確。Gemini API Key 通常以 "AIza" 開頭');
      return;
    }

    try {
      setManualApiKey(trimmedKey);
      setSuccess(true);
      setApiKey('');
      setTimeout(() => {
        setIsVisible(false);
        setSuccess(false);
        onClose?.();
      }, 1500);
    } catch (err) {
      setError('儲存失敗，請稍後再試');
    }
  }, [apiKey, setManualApiKey, onClose]);

  const handleClear = useCallback(() => {
    clearManualApiKey();
    setApiKey('');
    setError(null);
    setSuccess(false);
    setIsVisible(false);
    onClose?.();
  }, [clearManualApiKey, onClose]);

  const handleToggle = useCallback(() => {
    setIsVisible((prev) => !prev);
    setError(null);
    setSuccess(false);
  }, []);

  if (!isVisible) {
    return (
      <div className="relative">
        <button
          onClick={handleToggle}
          className="bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-2"
          title={currentSource === 'manual' ? `已設定手動 API Key: ${currentPreview}` : '設定 API Key'}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          {currentSource === 'manual' ? (
            <span className="text-green-400">API Key 已設定</span>
          ) : (
            <span>設定 API Key</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">設定 Gemini API Key</h3>
          <button
            onClick={() => {
              setIsVisible(false);
              setError(null);
              setSuccess(false);
              onClose?.();
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {currentSource === 'manual' && currentPreview && (
          <div className="mb-3 p-2 bg-slate-900/50 rounded border border-green-500/30">
            <p className="text-xs text-slate-400 mb-1">目前設定的 API Key：</p>
            <p className="text-xs font-mono text-green-400">{currentPreview}</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError(null);
              }}
              placeholder="輸入您的 Gemini API Key"
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
            <p className="mt-1 text-xs text-slate-400">
              取得 API Key：{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 text-xs px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 text-xs px-3 py-2 rounded-md">
              API Key 已儲存！
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
            >
              儲存
            </button>
            {currentSource === 'manual' && (
              <button
                onClick={handleClear}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
              >
                清除
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              ⚠️ API Key 會儲存在瀏覽器的 localStorage 中，僅供您在此裝置使用。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;

