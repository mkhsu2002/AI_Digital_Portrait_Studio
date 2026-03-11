import { useState, useEffect, useCallback } from 'react';
import { fetchGenerationQuota, consumeGenerationCredit } from '../services/usageService';
import { useAuth } from '../contexts/AuthContext';
import { handleError, logError, ErrorType } from '../utils/errorHandler';

interface UseQuotaReturn {
  remainingCredits: number | null;
  isLoading: boolean;
  error: string | null;
  loadQuota: () => Promise<void>;
  consumeCredit: () => Promise<number | null>;
}

/**
 * Hook for managing generation quota
 */
export const useQuota = (): UseQuotaReturn => {
  const { user } = useAuth();
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuota = useCallback(async () => {
    if (!user) {
      setRemainingCredits(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const usage = await fetchGenerationQuota(user.uid);
      setRemainingCredits(usage.generationCredits);
    } catch (quotaError) {
      const appError = handleError(quotaError, '載入使用次數失敗');
      logError(appError, 'Load Quota');
      setError(appError.userMessage || appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const consumeCredit = useCallback(async (): Promise<number | null> => {
    if (!user) return null;

    try {
      const creditsAfterConsume = await consumeGenerationCredit(user.uid);
      setRemainingCredits(creditsAfterConsume);
      return creditsAfterConsume;
    } catch (consumeError) {
      const appError = handleError(consumeError);
      logError(appError, 'Consume Credit');
      
      if (appError.type === ErrorType.QUOTA || (consumeError instanceof Error && consumeError.message === 'NO_CREDITS')) {
        setRemainingCredits(0);
        throw appError;
      }
      
      throw appError;
    }
  }, [user]);

  useEffect(() => {
    loadQuota();
  }, [loadQuota]);

  return {
    remainingCredits,
    isLoading,
    error,
    loadQuota,
    consumeCredit,
  };
};

