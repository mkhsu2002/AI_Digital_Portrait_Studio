import React, { useState } from "react";
import type { ImageResult } from "../types";
import ClipboardIcon from "./icons/ClipboardIcon";
import CheckIcon from "./icons/CheckIcon";
import SpinnerIcon from "./icons/SpinnerIcon";
import DownloadIcon from "./icons/DownloadIcon";
import { useTranslation } from "../contexts/TranslationContext";
import { dataUrlToBlob } from "../utils/imageUtils";
import { loadImageViaCanvas, loadImageViaCanvasWithoutCORS } from "../utils/imageUtils";

interface PromptDisplayProps {
  prompt: string;
  images: ImageResult[];
  isLoading: boolean;
  error: string | null;
  productName: string;
  aspectRatio: string;
}

const PromptDisplay: React.FC<PromptDisplayProps> = React.memo(({
  prompt,
  images,
  isLoading,
  error,
  productName,
  aspectRatio,
}) => {
  const { t, translateShotLabel } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownloadImage = async (image: ImageResult, index: number, shotLabel: string) => {
    try {
      setDownloadingIndex(index);

      let blob: Blob;
      let filename: string;

      // 判斷圖片來源類型
      if (image.src.startsWith("data:")) {
        // Data URL 格式
        blob = dataUrlToBlob(image.src);
        const mimeMatch = image.src.match(/^data:(image\/[a-zA-Z0-9+.+-]+);base64,/);
        const mimeType = mimeMatch?.[1] ?? "image/png";
        const extension = mimeType.split("/")[1]?.toLowerCase() ?? "png";
        filename = `${shotLabel}-${Date.now()}.${extension === "jpeg" ? "jpg" : extension}`;
      } else {
        // URL 格式（Firebase Storage 或其他）
        const isFirebaseStorageUrl = image.src.includes('firebasestorage.googleapis.com');
        
        try {
          // 策略 1：優先嘗試直接 fetch（適用於已設定 CORS 的情況）
          const response = await fetch(image.src, {
            mode: 'cors',
            credentials: 'omit',
          });

          if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
          }

          blob = await response.blob();
        } catch (fetchError) {
          // 策略 2：如果是 Firebase Storage URL 或 CORS 錯誤，使用 Canvas 方式繞過 CORS
          if (isFirebaseStorageUrl || (fetchError instanceof TypeError && fetchError.message.includes('fetch'))) {
            try {
              blob = await loadImageViaCanvas(image.src);
            } catch (canvasError) {
              // 策略 3：如果 Canvas 也失敗，嘗試不使用 CORS
              try {
                blob = await loadImageViaCanvasWithoutCORS(image.src);
              } catch (finalError) {
                throw new Error(
                  `無法下載圖片：${image.src}。` +
                  `這可能是 CORS 設定問題，請檢查 Firebase Storage 的 CORS 設定。`
                );
              }
            }
          } else {
            throw fetchError;
          }
        }
        
        // 從 URL 或 Blob 類型取得副檔名
        const url = new URL(image.src);
        const urlPath = url.pathname;
        const urlExtension = urlPath.split('.').pop()?.toLowerCase();
        const mimeExtension = blob.type?.split('/')[1]?.toLowerCase();
        const extension = urlExtension || mimeExtension || 'png';
        
        filename = `${shotLabel}-${Date.now()}.${extension === "jpeg" ? "jpg" : extension}`;
      }

      // 建立下載連結並觸發下載
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // 使用 encodeURIComponent 處理中文檔名
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // 清理：移除連結並釋放 Blob URL
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('下載圖片失敗:', error);
      alert(error instanceof Error ? error.message : '下載圖片失敗，請稍後再試');
    } finally {
      setDownloadingIndex(null);
    }
  };

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
            const shotLabel = image.labelKey ? translateShotLabel(image.labelKey) : image.label;

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
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold">{shotLabel}</span>
                      </p>
                      {!image.videoSrc && (
                        <button
                          onClick={() => handleDownloadImage(image, index, shotLabel)}
                          disabled={downloadingIndex === index}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                          aria-label={t.promptDisplay.downloadImage}
                        >
                          {downloadingIndex === index ? (
                            <>
                              <SpinnerIcon className="w-4 h-4 animate-spin" />
                              <span>{t.promptDisplay.downloading}</span>
                            </>
                          ) : (
                            <>
                              <DownloadIcon className="w-4 h-4" />
                              <span>{t.promptDisplay.downloadImage}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 text-center">
                      {t.promptDisplay.downloadHint}
                    </p>
                  </div>
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
