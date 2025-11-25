import { useState, useCallback } from 'react';
import type { FormDataState, ImageResult } from '../types';
import { useApi } from '../contexts/ApiContext';
import { useTranslation } from '../contexts/TranslationContext';
import { handleError, logError, ErrorType } from '../utils/errorHandler';

interface UseImageGenerationReturn {
  generateImages: (formData: FormDataState) => Promise<ImageResult[]>;
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

  const generateImages = useCallback(
    async (formData: FormDataState): Promise<ImageResult[]> => {
      setIsLoading(true);
      setError(null);
      setImages([]);

      try {
        const shotLabels = {
          fullBody: translateShotLabel('fullBody'),
          medium: translateShotLabel('medium'),
          closeUp: translateShotLabel('closeUp'),
        };

        const generatedImages = await api.generateImages(formData, shotLabels);
        setImages(generatedImages);
        return generatedImages;
      } catch (err) {
        const appError = handleError(err, t.errors.general);
        logError(appError, 'Image Generation');
        setError(appError.userMessage || appError.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api, translateShotLabel, t]
  );

  return {
    generateImages,
    isLoading,
    error,
    images,
    setImages,
    setError,
  };
};

