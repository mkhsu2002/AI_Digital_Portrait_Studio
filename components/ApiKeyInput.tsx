import React, { useState, useCallback, useEffect } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { useTranslation } from '../contexts/TranslationContext';

interface ApiKeyInputProps {
  onClose?: () => void;
  showOnMount?: boolean; // 是否在掛載時自動顯示
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onClose, showOnMount = false }) => {
  const { setManualApiKey, clearManualApiKey, getManualApiKeyPreview, getApiKeySource, isApiKeyAvailable } = useApiKey();
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentPreview = getManualApiKeyPreview();
  const currentSource = getApiKeySource();

  // 如果沒有 API Key 且 showOnMount 為 true，自動顯示對話框
  useEffect(() => {
    if (showOnMount && !isApiKeyAvailable()) {
      setIsVisible(true);
    }
  }, [showOnMount, isApiKeyAvailable]);

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

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setError(null);
    setSuccess(false);
    setApiKey('');
    onClose?.();
  }, [onClose]);

  const handleToggle = useCallback(() => {
    setIsVisible((prev) => !prev);
    setError(null);
    setSuccess(false);
  }, []);

  // 如果不需要顯示模態對話框，顯示小按鈕
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

  // 全螢幕模態對話框
  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* 對話框內容 */}
        <div 
          className="bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-indigo-900/95 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-purple-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 關閉按鈕 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-purple-200 hover:text-white transition-colors"
            aria-label="關閉"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 鑰匙圖標 */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
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
            </div>
          </div>

          {/* 標題 */}
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            Setup Gemini API
          </h2>

          {/* 說明文字 */}
          <div className="space-y-2 mb-6 text-center">
            <p className="text-purple-100 text-sm">
              為了確保安全，請使用您自己的 API Key。
            </p>
            <p className="text-purple-100 text-sm">
              您的 Key 只會儲存在瀏覽器中，不會上傳至伺服器。
            </p>
          </div>

          {/* API Key 輸入框 */}
          <div className="mb-6">
            <label className="block text-purple-200 text-sm font-medium mb-2">
              GEMINI API KEY
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(null);
                }}
                placeholder="輸入您的 Gemini API Key"
                className="w-full bg-purple-900/50 border border-purple-600/50 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                aria-label={showPassword ? "隱藏" : "顯示"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.906 5.06l-3.59-3.59" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* 成功訊息 */}
          {success && (
            <div className="mb-4 bg-green-500/20 border border-green-500/50 text-green-200 text-sm px-4 py-2 rounded-lg">
              API Key 已儲存！
            </div>
          )}

          {/* 開始使用按鈕 */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mb-4"
          >
            開始使用
          </button>

          {/* 取得 API Key 連結 */}
          <div className="text-center">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-200 hover:text-white text-sm underline transition-colors"
            >
              還沒有 Key? 點此免費獲取
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApiKeyInput;
