import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { FormDataState, ImageResult } from '../types';
import { useApi } from '../contexts/ApiContext';
import { useTranslation } from '../contexts/TranslationContext';
import { handleError, logError, ErrorType } from '../utils/errorHandler';

interface UseImageGenerationReturn {
  generateImages: (formData: FormDataState) => Promise<ImageResult[] | void>;
  cancel: () => void;
  isLoading: boolean;
  error: string | null;
  images: ImageResult[];
  setImages: React.Dispatch<React.SetStateAction<ImageResult[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Hook for managing image generation
 */
export const useImageGeneration = (): UseImageGenerationReturn => {
  const api = useApi();
  const { translateShotLabel, t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageResult[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateImages = useCallback(
    async (formData: FormDataState): Promise<ImageResult[] | void> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);
      setImages([]);

      try {
        const shotLabels = {
          fullBody: translateShotLabel('fullBody'),
          medium: translateShotLabel('medium'),
          closeUp: translateShotLabel('closeUp'),
        };

        const generatedImages = await api.generateImages(formData, shotLabels, abortController.signal);
        setImages(generatedImages);
        return generatedImages;
      } catch (err: any) {
        if (err.name === 'AbortError' || err.message === 'Request cancelled') {
          return;
        }
        const appError = handleError(err);
        logError(appError, 'Image Generation');
        const errorMessage = appError.userMessage || appError.message || t.errors.general;
        setError(errorMessage);
        throw err;
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [api, translateShotLabel, t]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.blobUrl) {
          URL.revokeObjectURL(img.blobUrl);
        }
      });
    };
  }, [images]);

  return {
    generateImages,
    cancel,
    isLoading,
    error,
    images,
    setImages,
    setError,
  };
};

