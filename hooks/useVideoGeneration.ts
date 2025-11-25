import { useCallback } from 'react';
import type { ImageResult } from '../types';
import { useApi } from '../contexts/ApiContext';
import { useTranslation } from '../contexts/TranslationContext';
import { handleError, logError } from '../utils/errorHandler';

interface UseVideoGenerationReturn {
  generateVideo: (
    imageIndex: number,
    imageSrc: string,
    aspectRatio: string,
    images: ImageResult[],
    setImages: React.Dispatch<React.SetStateAction<ImageResult[]>>
  ) => Promise<void>;
}

/**
 * Hook for managing video generation
 */
export const useVideoGeneration = (): UseVideoGenerationReturn => {
  const api = useApi();
  const { t } = useTranslation();

  const generateVideo = useCallback(
    async (
      imageIndex: number,
      imageSrc: string,
      aspectRatio: string,
      images: ImageResult[],
      setImages: React.Dispatch<React.SetStateAction<ImageResult[]>>
    ): Promise<void> => {
      const supportedVideoRatios = ['16:9', '9:16'];
      
      if (!supportedVideoRatios.includes(aspectRatio)) {
        setImages((prev) =>
          prev.map((img, i) =>
            i === imageIndex
              ? { ...img, isGeneratingVideo: false, videoError: t.video.unsupportedAspect }
              : img
          )
        );
        return;
      }

      // 設定載入狀態
      setImages((prev) =>
        prev.map((img, i) =>
          i === imageIndex ? { ...img, isGeneratingVideo: true, videoError: null } : img
        )
      );

      try {
        const videoUrl = await api.generateVideo(imageSrc, aspectRatio);

        setImages((prev) =>
          prev.map((img, i) =>
            i === imageIndex ? { ...img, isGeneratingVideo: false, videoSrc: videoUrl } : img
          )
        );
      } catch (err: unknown) {
        let errorMessage = t.errors.general;
        
        if (err instanceof Error) {
          const appError = handleError(err);
          logError(appError, 'Video Generation');
          
          if (appError.message.includes('Requested entity was not found')) {
            errorMessage = t.errors.missingApiKey;
          } else {
            errorMessage = appError.userMessage || appError.message;
          }
        }

        setImages((prev) =>
          prev.map((img, i) =>
            i === imageIndex ? { ...img, isGeneratingVideo: false, videoError: errorMessage } : img
          )
        );
      }
    },
    [api, t]
  );

  return {
    generateVideo,
  };
};

