
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import type { FormDataState, ImageResult, HistoryItem, HistoryFormData } from './types';
import { CLOTHING_STYLES, EXPRESSIONS, LIGHTING_CONDITIONS, ASPECT_RATIOS, BACKGROUNDS, CLOTHING_SEASONS, POSES, MODEL_GENDERS } from './constants';
import Header from './components/Header';
import AuthGate from './components/AuthGate';
import ErrorBoundary from './components/ErrorBoundary';
import SpinnerIcon from './components/icons/SpinnerIcon';

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
import { useAuth } from './contexts/AuthContext';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { ApiProvider, useApi } from './contexts/ApiContext';
import { buildDisplayPrompt } from './utils/promptBuilder';
import { validateFile, validateFormData } from './utils/validation';
import { smartCompressImage } from './utils/imageCompression';
import { logEnvValidation } from './utils/envValidation';
import { useDebounce } from './hooks/useDebounce';

const AppContent: React.FC = () => {
  const { user, initializing } = useAuth();
  const { t, translateOption, translateShotLabel } = useTranslation();
  const api = useApi();
  const [formData, setFormData] = useState<FormDataState>({
    productName: '登山後背包',
    clothingStyle: CLOTHING_STYLES[8], // 戶外休閒風
    clothingSeason: CLOTHING_SEASONS[5], // 高山
    modelGender: MODEL_GENDERS[0],
    background: BACKGROUNDS[11], // 台灣阿里山日出雲海
    expression: EXPRESSIONS[3], // 自信
    pose: POSES[0],
    lighting: LIGHTING_CONDITIONS[0],
    aspectRatio: ASPECT_RATIOS[0],
    faceImage: null,
    objectImage: null,
    additionalDescription: '',
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [isQuotaLoading, setIsQuotaLoading] = useState<boolean>(true);

  // 使用防抖動處理 prompt 生成，減少不必要的重新計算
  const debouncedFormData = useDebounce(formData, 500);

  useEffect(() => {
    // 此詠唱僅用於顯示和複製。
    // 實際的生成邏輯會為每個鏡頭使用獨立的詠唱。
    const prompt = buildDisplayPrompt(debouncedFormData);
    setGeneratedPrompt(prompt);
  }, [debouncedFormData]);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      
      // 驗證檔案
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || '檔案驗證失敗');
        // 清除檔案輸入
        e.target.value = '';
        return;
      }

      try {
        // 壓縮圖片（如果需要）
        const compressedBlob = await smartCompressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
          minSize: 500 * 1024, // 500KB 以下不壓縮
        });

        // 將 Blob 轉換為 base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setFormData(prev => ({
            ...prev,
            [name]: {
              data: base64String,
              mimeType: compressedBlob.type || file.type,
              name: file.name,
            },
          }));
        };
        reader.onerror = () => {
          setError('無法讀取檔案');
        };
        reader.readAsDataURL(compressedBlob);
      } catch (error) {
        console.error('檔案處理錯誤:', error);
        setError(error instanceof Error ? error.message : '檔案處理失敗');
        e.target.value = '';
      }
    }
  }, []);

  const handleFileRemove = useCallback((name: 'faceImage' | 'objectImage') => {
      setFormData(prev => ({
          ...prev,
          [name]: null,
      }));
      const input = document.getElementById(name) as HTMLInputElement;
      if (input) {
          input.value = '';
      }
  }, []);

  const sanitizeFormDataForHistory = useCallback(
    (data: FormDataState): HistoryFormData => ({
      productName: data.productName,
      clothingStyle: data.clothingStyle,
      clothingSeason: data.clothingSeason,
      modelGender: data.modelGender,
      background: data.background,
      expression: data.expression,
      pose: data.pose,
      lighting: data.lighting,
      aspectRatio: data.aspectRatio,
      additionalDescription: data.additionalDescription,
      faceImage: data.faceImage
        ? {
            name: data.faceImage.name,
            mimeType: data.faceImage.mimeType,
            hasData: !!data.faceImage.data,
          }
        : null,
      objectImage: data.objectImage
        ? {
            name: data.objectImage.name,
            mimeType: data.objectImage.mimeType,
            hasData: !!data.objectImage.data,
          }
        : null,
    }),
    []
  );

  const restoreFormDataFromHistory = useCallback(
    (historyData: HistoryFormData): FormDataState => ({
      productName: historyData.productName,
      clothingStyle: historyData.clothingStyle,
      clothingSeason: historyData.clothingSeason,
      modelGender: historyData.modelGender,
      background: historyData.background,
      expression: historyData.expression,
      pose: historyData.pose,
      lighting: historyData.lighting,
      aspectRatio: historyData.aspectRatio,
      additionalDescription: historyData.additionalDescription,
      faceImage: null,
      objectImage: null,
    }),
    []
  );


  const handleGenerate = useCallback(async () => {
    if (isLoading) {
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
    
    if (remainingCredits !== null && remainingCredits <= 0) {
      setError(t.errors.quotaExhausted);
      return;
    }

    let creditsAfterConsume = remainingCredits ?? null;
    try {
      creditsAfterConsume = await api.consumeCredit(user.uid);
      setRemainingCredits(creditsAfterConsume);
    } catch (consumeError) {
      if (consumeError instanceof Error && consumeError.message === "NO_CREDITS") {
        setError(t.errors.quotaExhausted);
      } else {
        console.error("Failed to deduct generation credit:", consumeError);
        setError(t.errors.consumeFailed);
      }
      return;
    }

    setIsLoading(true);
    setImages([]);
    
    try {
      const shotLabels = {
        fullBody: translateShotLabel('fullBody'),
        medium: translateShotLabel('medium'),
        closeUp: translateShotLabel('closeUp'),
      };
      
      const generatedImages = await api.generateImages(formData, shotLabels);
      setImages(generatedImages);

      let storedImages: ImageResult[] = generatedImages;
      try {
        storedImages = await api.uploadHistoryImages(user.uid, generatedImages);
      } catch (uploadError) {
        console.error("Failed to upload history images:", uploadError);
      }
      setImages(storedImages);

      const historySnapshot: HistoryItem = {
        formData: sanitizeFormDataForHistory(formData),
        images: JSON.parse(JSON.stringify(storedImages)),
      };

      setHistory(prevHistory => {
        const newHistory = [historySnapshot, ...prevHistory].slice(0, 5);
        return newHistory;
      });

      try {
        await api.saveHistoryRecord(user.uid, historySnapshot);
      } catch (historyError) {
        console.error("Failed to persist history record:", historyError);
      }

    } catch (err) {
      console.error(err);
      const fallbackError =
        err instanceof Error && err.message ? err.message : t.errors.general;
      setError(fallbackError);
    } finally {
      setIsLoading(false);
    }
  }, [formData, user, remainingCredits, isLoading, t, translateShotLabel, api]);

  const handleGenerateVideo = useCallback(async (index: number) => {
    const supportedVideoRatios = ["16:9", "9:16"];
    const selectedAspectRatio = formData.aspectRatio;
    if (!supportedVideoRatios.includes(selectedAspectRatio)) {
      setImages((prev) =>
        prev.map((img, i) =>
          i === index
            ? { ...img, isGeneratingVideo: false, videoError: t.video.unsupportedAspect }
            : img
        )
      );
      return;
    }

    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, isGeneratingVideo: true, videoError: null } : img
      )
    );

    try {
      const targetImage = images[index];
      const videoUrl = await api.generateVideo(targetImage.src, formData.aspectRatio);

      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isGeneratingVideo: false, videoSrc: videoUrl } : img
        )
      );

    } catch (err: any) {
      let errorMessage =
        err instanceof Error && err.message ? err.message : t.errors.general;
      if (errorMessage.includes("Requested entity was not found")) {
        errorMessage = t.errors.missingApiKey;
      }

      console.error("Video generation error:", err);
      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isGeneratingVideo: false, videoError: errorMessage } : img
        )
      );
    }
  }, [images, formData.aspectRatio, t, api]);

  const handleRestoreHistory = useCallback((item: HistoryItem) => {
    const restored = restoreFormDataFromHistory(item.formData);
    setFormData(restored);
    setImages([]);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [restoreFormDataFromHistory]);

  const handleDeleteHistory = useCallback(async (recordId: string) => {
    if (!user) return;
    
    try {
      await api.deleteHistoryRecord(user.uid, recordId);
      setHistory(prevHistory => prevHistory.filter(item => item.id !== recordId));
    } catch (error) {
      console.error("Failed to delete history record:", error);
      setError(t.errors.general);
    }
  }, [user, api, t]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setHistory([]);
        setIsHistoryLoading(false);
        return;
      }
      setIsHistoryLoading(true);
      try {
        const records = await api.loadUserHistory(user.uid);
        setHistory(records);
      } catch (err) {
        console.error("Failed to load history records:", err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadHistory();
  }, [user, api]);

  useEffect(() => {
    const loadQuota = async () => {
      if (!user) {
        setRemainingCredits(null);
        setIsQuotaLoading(false);
        return;
      }
      setIsQuotaLoading(true);
      try {
        const usage = await api.loadGenerationQuota(user.uid);
        setRemainingCredits(usage.generationCredits);
      } catch (quotaError) {
        console.error("Failed to load remaining credits:", quotaError);
      } finally {
        setIsQuotaLoading(false);
      }
    };
    loadQuota();
  }, [user, api]);

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
        <Header remainingCredits={remainingCredits} isQuotaLoading={isQuotaLoading} />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            <Suspense fallback={<ComponentLoader />}>
              <PromptForm 
                formData={formData} 
                onFormChange={handleFormChange}
                onFileChange={handleFileChange}
                onFileRemove={handleFileRemove}
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            </Suspense>
            <Suspense fallback={<ComponentLoader />}>
              <HistoryPanel 
                history={history} 
                onRestore={handleRestoreHistory}
                onDelete={handleDeleteHistory}
                isLoading={isHistoryLoading} 
              />
            </Suspense>
          </div>
          <div className="sticky top-8">
            <Suspense fallback={<ComponentLoader />}>
              <PromptDisplay 
                prompt={generatedPrompt} 
                images={images}
                isLoading={isLoading}
                error={error}
                productName={formData.productName}
                onGenerateVideo={handleGenerateVideo}
                aspectRatio={formData.aspectRatio}
              />
            </Suspense>
          </div>
        </main>
        <footer className="text-center py-8 mt-8 text-slate-500 text-sm">
          Copyright 2025 @ <a href="https://flypigai.icareu.tw/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">FlyPig AI</a>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <TranslationProvider>
      <ApiProvider>
        <AppContent />
      </ApiProvider>
    </TranslationProvider>
  </ErrorBoundary>
);

export default App;