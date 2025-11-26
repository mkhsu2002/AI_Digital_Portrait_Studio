import React, { useState, useEffect } from "react";
import type { HistoryItem } from "../types";
import HistoryIcon from "./icons/HistoryIcon";
import { useTranslation } from "../contexts/TranslationContext";
import { downloadImageFromFirebaseStorage } from "../utils/imageUtils";
import { storage } from "../firebase";

interface HistoryPanelProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  isLoading?: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = React.memo(({ history, onRestore, onDelete, isLoading = false }) => {
  const { t, translateOption } = useTranslation();
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // 將 Firebase Storage URL 轉換為 Blob URL 以避免 CORS 問題
  useEffect(() => {
    const loadImageUrls = async () => {
      const urls: Record<string, string> = {};
      
      await Promise.all(
        history.map(async (item) => {
          const imageSrc = item.images[0]?.src;
          if (!imageSrc) return;
          
          if (imageSrc.startsWith("data:")) {
            // Data URL 直接使用
            urls[item.id || ''] = imageSrc;
          } else if (imageSrc.includes('firebasestorage.googleapis.com')) {
            // Firebase Storage URL，使用 SDK 載入並轉換為 Blob URL
            try {
              const blob = await downloadImageFromFirebaseStorage(imageSrc, storage);
              urls[item.id || ''] = URL.createObjectURL(blob);
            } catch (error) {
              console.error('Failed to load image:', error);
              // 如果載入失敗，使用原始 URL
              urls[item.id || ''] = imageSrc;
            }
          } else {
            // 其他 URL 直接使用
            urls[item.id || ''] = imageSrc;
          }
        })
      );
      
      setImageUrls(urls);
    };

    if (history.length > 0) {
      loadImageUrls();
    }

    // 清理 Blob URL
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [history]);

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-semibold mb-4 text-slate-200">{t.history.title}</h2>
      {isLoading ? (
        <p className="text-slate-500 text-center py-4">{t.history.loading}</p>
      ) : history.length === 0 ? (
        <p className="text-slate-500 text-center py-4">{t.history.empty}</p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {history.map((item, index) => {
            const styleLabel = translateOption("clothingStyle", item.formData.clothingStyle);
            const backgroundLabel = translateOption("background", item.formData.background);
            return (
              <li key={item.id || index}>
                <div className="flex items-center gap-2 group">
                  <button
                    onClick={() => onRestore(item)}
                    className="flex-1 flex items-center gap-4 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-left"
                    aria-label={t.history.restoreLabel(item.formData.productName)}
                  >
                    <img
                      src={imageUrls[item.id || ''] || item.images[0]?.src || ""}
                      alt={item.formData.productName}
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-slate-600"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        // 如果載入失敗，嘗試使用原始 URL
                        const originalSrc = item.images[0]?.src;
                        if (originalSrc && (e.target as HTMLImageElement).src !== originalSrc) {
                          (e.target as HTMLImageElement).src = originalSrc;
                        }
                      }}
                    />
                    <div className="flex-grow overflow-hidden">
                      <p className="font-semibold text-slate-200 truncate">{item.formData.productName}</p>
                      <p className="text-sm text-slate-400 truncate">{`${styleLabel}, ${backgroundLabel}`}</p>
                    </div>
                    <div className="flex-shrink-0 text-slate-500 group-hover:text-blue-400 transition-colors">
                      <HistoryIcon className="w-6 h-6" />
                    </div>
                  </button>
                  {onDelete && item.id && (
                    <button
                      onClick={() => onDelete(item.id!)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label="刪除紀錄"
                      title="刪除紀錄"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

HistoryPanel.displayName = 'HistoryPanel';

export default HistoryPanel;
