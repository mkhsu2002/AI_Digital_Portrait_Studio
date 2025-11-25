import React, { useState, useCallback } from "react";
import type { ImageResult } from "../types";
import ClipboardIcon from "./icons/ClipboardIcon";
import CheckIcon from "./icons/CheckIcon";
import SpinnerIcon from "./icons/SpinnerIcon";
import DownloadIcon from "./icons/DownloadIcon";
import { useTranslation } from "../contexts/TranslationContext";

interface PromptDisplayProps {
  prompt: string;
  images: ImageResult[];
  isLoading: boolean;
  error: string | null;
  productName: string;
  onGenerateVideo: (index: number) => void;
  aspectRatio: string;
}

const PromptDisplay: React.FC<PromptDisplayProps> = React.memo(({
  prompt,
  images,
  isLoading,
  error,
  productName,
  onGenerateVideo,
  aspectRatio,
}) => {
  const { t, translateShotLabel } = useTranslation();
  const supportedVideoRatios = ["16:9", "9:16"];
  const isVideoGenerationSupported = supportedVideoRatios.includes(aspectRatio);
  const [isCopied, setIsCopied] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  // 從頁面上已載入的圖片元素讀取（完全繞過 CORS）
  const loadImageFromDOM = useCallback(async (imageSrc: string, index: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // 嘗試找到頁面上對應的 img 元素
      // 方法 1：使用 data attribute 或特定選擇器
      const imgSelector = `img[data-image-index="${index}"]`;
      let targetImg = document.querySelector(imgSelector) as HTMLImageElement;
      
      // 方法 2：如果找不到，遍歷所有圖片元素尋找匹配的 src
      if (!targetImg) {
        const imgElements = document.querySelectorAll('img');
        const baseUrl = imageSrc.split('?')[0]; // 移除 query string 進行比對
        
        for (const img of imgElements) {
          const imgSrc = img.src.split('?')[0];
          // 比對 URL（考慮可能的編碼差異）
          if (img.src === imageSrc || imgSrc === baseUrl || img.src.includes(baseUrl)) {
            targetImg = img as HTMLImageElement;
            break;
          }
        }
      }
      
      // 如果找到已載入的圖片元素，直接從它讀取
      if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetImg.naturalWidth;
          canvas.height = targetImg.naturalHeight;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('無法建立 Canvas 上下文');
          }
          
          // 從已載入的圖片元素繪製到 canvas（不會觸發 CORS）
          ctx.drawImage(targetImg, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('無法轉換 Canvas 為 Blob'));
            }
          }, 'image/jpeg', 0.95);
          return;
        } catch (error) {
          // 如果從 DOM 讀取失敗，繼續嘗試其他方式
          console.warn('無法從 DOM 讀取圖片，嘗試其他方式:', error);
        }
      }
      
      // 如果找不到或讀取失敗，使用傳統方式
      reject(new Error('無法從 DOM 讀取圖片'));
    });
  }, []);

  // 透過 Canvas 載入圖片（繞過 CORS）- 必須在 handleDownload 之前定義
  const loadImageViaCanvas = useCallback(async (imageSrc: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // 先嘗試不設定 crossOrigin（某些情況下可能有效）
      let triedWithoutCORS = false;
      
      const tryLoad = (useCORS: boolean) => {
        if (useCORS) {
          img.crossOrigin = 'anonymous';
        } else {
          img.removeAttribute('crossOrigin');
        }
        
        // 設定超時（15 秒）
        const timeout = setTimeout(() => {
          if (!triedWithoutCORS && useCORS) {
            // 如果 CORS 方式失敗，嘗試不使用 CORS
            triedWithoutCORS = true;
            tryLoad(false);
          } else {
            reject(new Error('圖片載入超時，請檢查網路連線或稍後再試'));
          }
        }, 15000);
        
        img.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('無法建立 Canvas 上下文'));
              return;
            }
            
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('無法轉換 Canvas 為 Blob'));
              }
            }, 'image/jpeg', 0.95);
          } catch (error) {
            reject(error instanceof Error ? error : new Error('未知錯誤'));
          }
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          if (!triedWithoutCORS && useCORS) {
            // 如果 CORS 方式失敗，嘗試不使用 CORS
            triedWithoutCORS = true;
            tryLoad(false);
          } else {
            reject(new Error('圖片載入失敗，可能是 CORS 設定問題'));
          }
        };
        
        img.src = imageSrc;
      };
      
      // 先嘗試使用 CORS
      tryLoad(true);
    });
  }, []);

  const handleDownload = useCallback(async (fileUrl: string, filename: string, index: number) => {
    setDownloadingIndex(index);
    try {
      let blob: Blob;

      // 處理 data URL
      if (fileUrl.startsWith("data:")) {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`下載失敗: ${response.status} ${response.statusText}`);
        }
        blob = await response.blob();
      } 
      // 處理 Firebase Storage URL 或一般 URL（使用多層備援策略）
      else {
        const isFirebaseStorageUrl = fileUrl.includes('firebasestorage.googleapis.com');
        let lastError: Error | null = null;
        
        // 策略 1：優先從頁面上已載入的圖片元素讀取（完全繞過 CORS）
        try {
          blob = await loadImageFromDOM(fileUrl, index);
        } catch (domError) {
          lastError = domError instanceof Error ? domError : new Error(String(domError));
          
          // 策略 2：嘗試直接 fetch（適用於已設定 CORS 的情況）
          try {
            const response = await fetch(fileUrl, {
              mode: 'cors',
              credentials: 'omit',
              headers: {
                'Accept': isFirebaseStorageUrl ? 'image/*' : '*/*',
              },
            });
            
            if (!response.ok) {
              throw new Error(`下載失敗: ${response.status} ${response.statusText}`);
            }
            
            blob = await response.blob();
          } catch (fetchError) {
            lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
            
            // 策略 3：如果 fetch 失敗，嘗試使用 Canvas 方式（繞過 CORS）
            try {
              blob = await loadImageViaCanvas(fileUrl);
            } catch (canvasError) {
              // 所有策略都失敗
              throw new Error(
                `下載失敗：無法載入圖片。` +
                `原因：${lastError.message}。` +
                `\n\n建議解決方案：` +
                `\n1. 檢查 Firebase Storage 的 CORS 設定` +
                `\n2. 或等待圖片完全載入後再下載` +
                `\n3. 或使用瀏覽器的「另存圖片」功能`
              );
            }
          }
        }
      }

      // 建立下載連結
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Failed to download file:", err);
      const errorMessage = err instanceof Error ? err.message : '下載失敗，請稍後再試';
      alert(`下載失敗：${errorMessage}`);
    } finally {
      setDownloadingIndex(null);
    }
  }, [loadImageViaCanvas, loadImageFromDOM]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [prompt]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
          <SpinnerIcon className="w-12 h-12 animate-spin text-blue-500" />
          <div className="text-center">
            <p className="text-lg font-medium">{t.promptDisplay.loadingTitle}</p>
            <p className="text-sm mt-2">{t.promptDisplay.loadingNote}</p>
          </div>
          {/* 如果有進度資訊，可以在這裡顯示 */}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
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
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              {t.promptDisplay.errorTitle}
            </h3>
            <p className="text-sm text-slate-300 bg-red-900/30 border border-red-800/50 p-4 rounded-lg mb-4 whitespace-pre-wrap break-words">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                返回表單
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                重新載入頁面
              </button>
            </div>
            {import.meta.env.DEV && (
              <details className="mt-4">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                  開發模式：顯示詳細錯誤
                </summary>
                <pre className="mt-2 text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-auto max-h-40">
                  {error}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    if (images.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-6">
          {images.map((image, index) => {
            const sanitizedProductName = productName.replace(/\s+/g, "_");
            const fileExtension = image.videoSrc ? "mp4" : "jpeg";
            const shotLabel = image.labelKey ? translateShotLabel(image.labelKey) : image.label;
            const filename = `${sanitizedProductName}_${shotLabel}_${Date.now()}.${fileExtension}`;

            return (
              <div
                key={index}
                className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700 flex flex-col"
              >
                <div className="aspect-[3/4] bg-slate-900 flex items-center justify-center">
                  {image.videoSrc ? (
                    <video
                      src={image.videoSrc}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={image.src}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      data-image-index={index}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        // 如果 CORS 失敗，移除 crossOrigin 屬性重試
                        const img = e.currentTarget;
                        if (img.crossOrigin === 'anonymous') {
                          img.removeAttribute('crossOrigin');
                          img.src = image.src; // 重新載入
                        }
                      }}
                    />
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {image.videoError && (
                    <div className="bg-red-900/50 p-2 rounded-md text-red-300 text-xs text-center">
                      {image.videoError}
                    </div>
                  )}
                  {!image.videoSrc && (
                    <button
                      onClick={() => onGenerateVideo(index)}
                      disabled={image.isGeneratingVideo || !isVideoGenerationSupported}
                      title={
                        isVideoGenerationSupported ? undefined : t.promptDisplay.videoUnsupported
                      }
                      className="w-full flex justify-center items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                      {image.isGeneratingVideo ? (
                        <>
                          <SpinnerIcon className="w-5 h-5 animate-spin" />
                          {t.promptDisplay.generatingVideo}
                        </>
                      ) : (
                        t.promptDisplay.generateVideo
                      )}
                    </button>
                  )}
                  {!isVideoGenerationSupported && (
                    <p className="text-xs text-slate-400 text-center">
                      {t.promptDisplay.videoUnsupported}
                    </p>
                  )}
                  <button
                    onClick={() => handleDownload(image.videoSrc || image.src, filename, index)}
                    disabled={downloadingIndex === index}
                    className="w-full flex justify-center items-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {downloadingIndex === index ? (
                      <>
                        <SpinnerIcon className="w-5 h-5 animate-spin" />
                        <span>下載中...</span>
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="w-5 h-5" />
                        {image.videoSrc
                          ? t.promptDisplay.downloadVideoLabel(shotLabel)
                          : t.promptDisplay.downloadImageLabel(shotLabel)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium">{t.promptDisplay.emptyTitle}</h3>
          <p className="mt-1 text-sm">{t.promptDisplay.emptyDescription}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-200">{t.promptDisplay.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{t.promptDisplay.description}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              isCopied
                ? "bg-green-600 text-white focus:ring-green-500"
                : "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500"
            }`}
          >
            {isCopied ? (
              <>
                <CheckIcon className="w-5 h-5 mr-2" />
                {t.promptDisplay.copied}
              </>
            ) : (
              <>
                <ClipboardIcon className="w-5 h-5 mr-2" />
                {t.promptDisplay.copyPrompt}
              </>
            )}
          </button>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg flex-grow overflow-auto min-h-[400px] flex flex-col">
          {renderContent()}
        </div>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-200">
            {t.promptDisplay.togglePrompt}
          </summary>
          <div className="mt-2 bg-slate-900 p-3 rounded-md whitespace-pre-wrap text-slate-300 text-xs leading-relaxed">
            {prompt}
          </div>
        </details>
      </div>
    </div>
  );
});

PromptDisplay.displayName = 'PromptDisplay';

export default PromptDisplay;
