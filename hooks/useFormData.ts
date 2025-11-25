import { useState, useCallback } from 'react';
import type { FormDataState, ReferenceImageData } from '../types';
import {
  CLOTHING_STYLES,
  CLOTHING_SEASONS,
  MODEL_GENDERS,
  BACKGROUNDS,
  EXPRESSIONS,
  POSES,
  LIGHTING_CONDITIONS,
  ASPECT_RATIOS,
} from '../constants';
import { validateFile } from '../utils/validation';
import { smartCompressImage } from '../utils/imageCompression';
import { handleError, logError } from '../utils/errorHandler';

interface UseFormDataReturn {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleFileRemove: (name: 'faceImage' | 'objectImage') => void;
  resetFormData: () => void;
}

const DEFAULT_FORM_DATA: FormDataState = {
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
};

/**
 * Hook for managing form data
 */
export const useFormData = (initialData?: Partial<FormDataState>): UseFormDataReturn => {
  const [formData, setFormData] = useState<FormDataState>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 驗證檔案
    const validation = validateFile(file);
    if (!validation.valid) {
      const error = handleError(new Error(validation.error || '檔案驗證失敗'));
      logError(error, 'File Validation');
      throw error;
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
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => {
          reject(new Error('無法讀取檔案'));
        };
        reader.readAsDataURL(compressedBlob);
      });

      setFormData((prev) => ({
        ...prev,
        [name]: {
          data: base64String,
          mimeType: compressedBlob.type || file.type,
          name: file.name,
        } as ReferenceImageData,
      }));
    } catch (error) {
      const appError = handleError(error, '檔案處理失敗');
      logError(appError, 'File Processing');
      e.target.value = '';
      throw appError;
    }
  }, []);

  const handleFileRemove = useCallback((name: 'faceImage' | 'objectImage') => {
    setFormData((prev) => ({
      ...prev,
      [name]: null,
    }));
    const input = document.getElementById(name) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
  }, []);

  return {
    formData,
    setFormData,
    handleFormChange,
    handleFileChange,
    handleFileRemove,
    resetFormData,
  };
};

