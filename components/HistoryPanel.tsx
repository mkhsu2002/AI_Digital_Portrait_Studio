import React from "react";
import type { HistoryItem } from "../types";
import HistoryIcon from "./icons/HistoryIcon";
import { useTranslation } from "../contexts/TranslationContext";

interface HistoryPanelProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  isLoading?: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = React.memo(({ history, onRestore, onDelete, isLoading = false }) => {
  const { t, translateOption } = useTranslation();

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
                    {/* 使用縮圖 URL（來自 Firebase Storage）或佔位圖 */}
                    {(item.thumbnailUrls?.[0] || item.images[0]?.src) ? (
                      <img
                        src={item.thumbnailUrls?.[0] || item.images[0]?.src || ""}
                        alt={item.formData.productName}
                        className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-slate-600"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-slate-600 flex-shrink-0 border border-slate-600 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
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
