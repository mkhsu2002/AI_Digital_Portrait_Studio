import { useState, useEffect, useCallback } from 'react';
import type { HistoryItem, HistoryFormData, FormDataState } from '../types';
import { useApi } from '../contexts/ApiContext';
import { useAuth } from '../contexts/AuthContext';
import { handleError, logError } from '../utils/errorHandler';

interface UseHistoryReturn {
  history: HistoryItem[];
  isLoading: boolean;
  error: string | null;
  loadHistory: () => Promise<void>;
  saveHistoryRecord: (formData: FormDataState, images: HistoryItem['images']) => Promise<void>;
  deleteHistoryRecord: (recordId: string) => Promise<void>;
  sanitizeFormDataForHistory: (data: FormDataState) => HistoryFormData;
  restoreFormDataFromHistory: (historyData: HistoryFormData) => FormDataState;
}

/**
 * Hook for managing history records
 */
export const useHistory = (): UseHistoryReturn => {
  const api = useApi();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const records = await api.loadUserHistory(user.uid);
      setHistory(records);
    } catch (err) {
      const appError = handleError(err, '載入歷史紀錄失敗');
      logError(appError, 'Load History');
      setError(appError.userMessage || appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, api]);

  const saveHistoryRecord = useCallback(
    async (formData: FormDataState, images: HistoryItem['images']) => {
      if (!user) return;

      try {
        const historySnapshot: HistoryItem = {
          formData: sanitizeFormDataForHistory(formData),
          images: JSON.parse(JSON.stringify(images)),
        };

        setHistory((prevHistory) => {
          const newHistory = [historySnapshot, ...prevHistory].slice(0, 5);
          return newHistory;
        });

        await api.saveHistoryRecord(user.uid, historySnapshot);
      } catch (err) {
        const appError = handleError(err, '儲存歷史紀錄失敗');
        logError(appError, 'Save History');
        // 不顯示錯誤給使用者，因為這不影響主要功能
        console.error('Failed to persist history record:', err);
      }
    },
    [user, api, sanitizeFormDataForHistory]
  );

  const deleteHistoryRecord = useCallback(
    async (recordId: string) => {
      if (!user) return;

      try {
        await api.deleteHistoryRecord(user.uid, recordId);
        setHistory((prevHistory) => prevHistory.filter((item) => item.id !== recordId));
      } catch (err) {
        const appError = handleError(err, '刪除歷史紀錄失敗');
        logError(appError, 'Delete History');
        throw appError;
      }
    },
    [user, api]
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    isLoading,
    error,
    loadHistory,
    saveHistoryRecord,
    deleteHistoryRecord,
    sanitizeFormDataForHistory,
    restoreFormDataFromHistory,
  };
};


