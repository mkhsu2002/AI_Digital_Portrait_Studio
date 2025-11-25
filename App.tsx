import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import AuthGate from './components/AuthGate';
import ErrorBoundary from './components/ErrorBoundary';
import SpinnerIcon from './components/icons/SpinnerIcon';
import { useAuth } from './contexts/AuthContext';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { ApiProvider, useApi } from './contexts/ApiContext';
import { buildDisplayPrompt } from './utils/promptBuilder';
import { validateFormData } from './utils/validation';
import { useDebounce } from './hooks/useDebounce';
import { useFormData } from './hooks/useFormData';
import { useImageGeneration } from './hooks/useImageGeneration';
import { useVideoGeneration } from './hooks/useVideoGeneration';
import { useHistory } from './hooks/useHistory';
import { useQuota } from './hooks/useQuota';
import { handleError, logError } from './utils/errorHandler';

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

  // 使用自訂 Hooks 管理狀態
  const formDataHook = useFormData();
  const { formData } = formDataHook;
  const imageGeneration = useImageGeneration();
  const videoGeneration = useVideoGeneration();
  const history = useHistory();
  const quota = useQuota();

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 使用防抖動處理 prompt 生成，減少不必要的重新計算
  const debouncedFormData = useDebounce(formData, 500);

  useEffect(() => {
    // 此詠唱僅用於顯示和複製。
    // 實際的生成邏輯會為每個鏡頭使用獨立的詠唱。
    const prompt = buildDisplayPrompt(debouncedFormData);
    setGeneratedPrompt(prompt);
  }, [debouncedFormData]);

  // 處理檔案變更錯誤
  const handleFileChangeWithError = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await formDataHook.handleFileChange(e);
      setError(null);
    } catch (err) {
      const appError = handleError(err);
      setError(appError.userMessage || appError.message);
    }
  };

  const handleGenerate = async () => {
    if (imageGeneration.isLoading) {
      return;
    }

    setError(null);

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

    if (quota.remainingCredits !== null && quota.remainingCredits <= 0) {
      setError(t.errors.quotaExhausted);
      return;
    }

    // 扣減使用次數
    try {
      await quota.consumeCredit();
    } catch (consumeError) {
      const appError = handleError(consumeError);
      if (appError.type === 'QUOTA') {
        setError(t.errors.quotaExhausted);
      } else {
        setError(t.errors.consumeFailed);
      }
      return;
    }

    try {
      // 生成圖片
      const generatedImages = await imageGeneration.generateImages(formData);

      // 上傳圖片到 Storage
      let storedImages = generatedImages;
      try {
        storedImages = await api.uploadHistoryImages(user.uid, generatedImages);
      } catch (uploadError) {
        const appError = handleError(uploadError);
        logError(appError, 'Upload History Images');
        // 不中斷流程，繼續使用原始圖片
      }

      imageGeneration.setImages(storedImages);

      // 儲存歷史紀錄
      await history.saveHistoryRecord(formData, storedImages);
    } catch (err) {
      const appError = handleError(err, t.errors.general);
      logError(appError, 'Generate Images');
      setError(appError.userMessage || appError.message);
    }
  };

  const handleGenerateVideo = async (index: number) => {
    await videoGeneration.generateVideo(
      index,
      imageGeneration.images[index].src,
      formData.aspectRatio,
      imageGeneration.images,
      imageGeneration.setImages
    );
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
      <div className="max-w-7xl mx-auto">
        <Header remainingCredits={quota.remainingCredits} isQuotaLoading={quota.isLoading} />
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
                onGenerateVideo={handleGenerateVideo}
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
