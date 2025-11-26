import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import AuthGate from './components/AuthGate';
import ErrorBoundary from './components/ErrorBoundary';
import SpinnerIcon from './components/icons/SpinnerIcon';
import { useAuth } from './contexts/AuthContext';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { ApiKeyProvider, useApiKey } from './contexts/ApiKeyContext';
import { ApiProvider, useApi } from './contexts/ApiContext';
import ApiKeyInput from './components/ApiKeyInput';
import { buildDisplayPrompt } from './utils/promptBuilder';
import { validateFormData } from './utils/validation';
import { useDebounce } from './hooks/useDebounce';
import { useFormData } from './hooks/useFormData';
import { useImageGeneration } from './hooks/useImageGeneration';
import { useHistory } from './hooks/useHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { handleError, logError } from './utils/errorHandler';
import FirebaseErrorDisplay from './components/FirebaseErrorDisplay';
import ErrorToast from './components/ErrorToast';
import { firebaseDiagnostics } from './firebase';

// 程式碼分割：延遲載入主要組件
const PromptForm = lazy(() => import('./components/PromptForm'));
const PromptDisplay = lazy(() => import('./components/PromptDisplay'));
const HistoryPanel = lazy(() => import('./components/HistoryPanel'));

// Loading 組件
const ComponentLoader: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <SpinnerIcon className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

const AppContent: React.FC = () => {
  const { user, initializing } = useAuth();
  const { t } = useTranslation();
  const api = useApi();
  const { isApiKeyAvailable } = useApiKey();

  // 使用自訂 Hooks 管理狀態
  const formDataHook = useFormData();
  const { formData } = formDataHook;
  const imageGeneration = useImageGeneration();
  const history = useHistory();

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // 使用防抖動處理 prompt 生成，減少不必要的重新計算
  const debouncedFormData = useDebounce(formData, 500);

  useEffect(() => {
    // 此詠唱僅用於顯示和複製。
    // 實際的生成邏輯會為每個鏡頭使用獨立的詠唱。
    const prompt = buildDisplayPrompt(debouncedFormData);
    setGeneratedPrompt(prompt);
  }, [debouncedFormData]);

  // 檢查是否需要顯示 API Key 設定對話框
  useEffect(() => {
    if (user && !initializing && !isApiKeyAvailable()) {
      // 延遲顯示，讓頁面先載入
      const timer = setTimeout(() => {
        setShowApiKeyModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, initializing]); // 移除 isApiKeyAvailable，因為它是函數

  // 處理檔案變更錯誤
  const handleFileChangeWithError = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await formDataHook.handleFileChange(e);
      setError(null);
      setShowErrorToast(false);
    } catch (err) {
      const appError = handleError(err);
      const errorMessage = appError.userMessage || appError.message;
      setError(errorMessage);
      setShowErrorToast(true);
    }
  };

  const handleGenerate = async () => {
    if (imageGeneration.isLoading) {
      return;
    }

    setError(null);
    setShowErrorToast(false);

    // 驗證表單資料
    const formValidation = validateFormData(formData);
    if (!formValidation.valid) {
      const firstError = Object.values(formValidation.errors)[0];
      setError(firstError || '表單驗證失敗');
      return;
    }

    if (!user) {
      setError(t.errors.mustLogin);
      return;
    }

    if (!api.checkApiKeyAvailable()) {
      setError(t.errors.missingApiKey);
      return;
    }

    // v3.5: 已移除使用額度限制，使用者可使用自己的 API Key 無限制生成

    try {
      // 生成圖片（保留在本地，Data URL 格式）
      const generatedImages = await imageGeneration.generateImages(formData);

      // 顯示生成的圖片（本地 Data URL）
      imageGeneration.setImages(generatedImages);

      // 上傳縮圖到 Firebase Storage（供 History 顯示）
      let thumbnailUrls: string[] = [];
      try {
        thumbnailUrls = await api.uploadHistoryThumbnails(user.uid, generatedImages);
      } catch (uploadError) {
        const appError = handleError(uploadError);
        logError(appError, 'Upload History Thumbnails');
        // 不中斷流程，History 會顯示佔位圖
      }

      // 儲存歷史紀錄（包含縮圖 URL）
      await history.saveHistoryRecord(formData, generatedImages, thumbnailUrls);
    } catch (err) {
      const appError = handleError(err);
      logError(appError, 'Generate Images');
      // 使用更具體的錯誤訊息，如果沒有則使用通用訊息
      const errorMessage = appError.userMessage || appError.message || t.errors.general;
      setError(errorMessage);
      setShowErrorToast(true);
    }
  };


  const handleRestoreHistory = (item: typeof history.history[0]) => {
    const restored = history.restoreFormDataFromHistory(item.formData);
    formDataHook.setFormData(restored);
    imageGeneration.setImages([]);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (recordId: string) => {
    try {
      await history.deleteHistoryRecord(recordId);
    } catch (error) {
      const appError = handleError(error);
      setError(appError.userMessage || appError.message);
    }
  };

  // 鍵盤快捷鍵支援（放在 handleGenerate 定義之後）
  useKeyboardShortcuts({
    'ctrl+enter': handleGenerate,
    'meta+enter': handleGenerate,
  });

  // 檢查 Firebase 初始化狀態
  if (firebaseDiagnostics.hasInitializationError || firebaseDiagnostics.missingVars.length > 0) {
    return (
      <FirebaseErrorDisplay
        missingVars={firebaseDiagnostics.missingVars}
        initializationError={
          firebaseDiagnostics.hasInitializationError
            ? new Error('Firebase 初始化失敗，請檢查環境變數設定')
            : null
        }
      />
    );
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 text-lg">{t.general.initializing}</p>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans p-4 sm:p-6 md:p-8">
      {/* API Key 設定模態對話框 */}
      {showApiKeyModal && (
        <ApiKeyInput
          showOnMount={true}
          onClose={() => setShowApiKeyModal(false)}
        />
      )}
      {showErrorToast && error && (
        <ErrorToast
          message={error}
          onClose={() => {
            setShowErrorToast(false);
            setError(null);
          }}
          onRetry={imageGeneration.isLoading ? undefined : handleGenerate}
          autoClose={true}
          autoCloseDelay={8000}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            <Suspense fallback={<ComponentLoader />}>
              <PromptForm
                formData={formData}
                onFormChange={formDataHook.handleFormChange}
                onFileChange={handleFileChangeWithError}
                onFileRemove={formDataHook.handleFileRemove}
                onGenerate={handleGenerate}
                isLoading={imageGeneration.isLoading}
              />
            </Suspense>
            <Suspense fallback={<ComponentLoader />}>
              <HistoryPanel
                history={history.history}
                onRestore={handleRestoreHistory}
                onDelete={handleDeleteHistory}
                isLoading={history.isLoading}
              />
            </Suspense>
          </div>
          <div className="sticky top-8">
            <Suspense fallback={<ComponentLoader />}>
              <PromptDisplay
                prompt={generatedPrompt}
                images={imageGeneration.images}
                isLoading={imageGeneration.isLoading}
                error={error || imageGeneration.error}
                productName={formData.productName}
                aspectRatio={formData.aspectRatio}
              />
            </Suspense>
          </div>
        </main>
        <footer className="text-center py-8 mt-8 text-slate-500 text-sm">
          Copyright 2025 @{' '}
          <a
            href="https://flypigai.icareu.tw/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            FlyPig AI
          </a>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <TranslationProvider>
      <ApiKeyProvider>
        <ApiProvider>
          <AppContent />
        </ApiProvider>
      </ApiKeyProvider>
    </TranslationProvider>
  </ErrorBoundary>
);

export default App;
