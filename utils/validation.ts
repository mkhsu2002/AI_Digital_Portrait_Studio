/**
 * 輸入驗證工具函數
 */

// 檔案大小限制（5MB）
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 允許的圖片格式
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// 表單輸入限制
export const MAX_PRODUCT_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;

/**
 * 驗證檔案
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // 檢查檔案大小
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `檔案大小不能超過 ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // 檢查檔案類型
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '只支援 PNG 和 JPEG 格式的圖片',
    };
  }

  return { valid: true };
}

/**
 * 驗證商品名稱
 */
export interface StringValidationResult {
  valid: boolean;
  error?: string;
}

export function validateProductName(name: string): StringValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: '商品名稱不能為空',
    };
  }

  if (trimmed.length > MAX_PRODUCT_NAME_LENGTH) {
    return {
      valid: false,
      error: `商品名稱不能超過 ${MAX_PRODUCT_NAME_LENGTH} 個字元`,
    };
  }

  return { valid: true };
}

/**
 * 驗證補充描述
 */
export function validateDescription(description: string): StringValidationResult {
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `補充描述不能超過 ${MAX_DESCRIPTION_LENGTH} 個字元`,
    };
  }

  return { valid: true };
}

/**
 * 驗證表單資料
 */
import type { FormDataState } from '../types';

export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateFormData(formData: FormDataState): FormValidationResult {
  const errors: Record<string, string> = {};

  // 驗證商品名稱
  const productNameResult = validateProductName(formData.productName);
  if (!productNameResult.valid) {
    errors.productName = productNameResult.error || '';
  }

  // 驗證補充描述
  const descriptionResult = validateDescription(formData.additionalDescription);
  if (!descriptionResult.valid) {
    errors.additionalDescription = descriptionResult.error || '';
  }

  // 驗證參考圖片
  // 注意：這裡只驗證檔案名稱，實際檔案驗證在檔案選擇時進行

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}




