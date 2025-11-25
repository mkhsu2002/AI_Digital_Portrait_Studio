/**
 * 環境變數驗證工具
 */

// 必要的環境變數列表
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

// 可選的環境變數（有預設值或可選）
const OPTIONAL_ENV_VARS = [
  'VITE_API_KEY', // Gemini API Key，可透過瀏覽器擴充功能提供
] as const;

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * 驗證環境變數
 */
export function validateEnvVars(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // 檢查必要的環境變數
  REQUIRED_ENV_VARS.forEach((key) => {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  });

  // 檢查可選的環境變數（發出警告）
  OPTIONAL_ENV_VARS.forEach((key) => {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      // 檢查是否有替代方案（如瀏覽器擴充功能）
      if (key === 'VITE_API_KEY') {
        if (typeof window !== 'undefined' && window.aistudio) {
          // 有擴充功能，不需要警告
          return;
        }
      }
      warnings.push(key);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 取得環境變數驗證錯誤訊息
 */
export function getEnvValidationMessage(result: EnvValidationResult): string {
  if (result.valid && result.warnings.length === 0) {
    return '';
  }

  const messages: string[] = [];

  if (result.missing.length > 0) {
    messages.push(
      `缺少必要的環境變數：\n${result.missing.map((key) => `  - ${key}`).join('\n')}\n\n請在 .env.local 檔案中設定這些變數。`
    );
  }

  if (result.warnings.length > 0) {
    messages.push(
      `缺少可選的環境變數：\n${result.warnings.map((key) => `  - ${key}`).join('\n')}\n\n這些變數不是必需的，但建議設定。`
    );
  }

  return messages.join('\n\n');
}

/**
 * 在開發模式下顯示環境變數驗證結果
 */
export function logEnvValidation(): void {
  if (import.meta.env.DEV) {
    const result = validateEnvVars();
    
    if (!result.valid) {
      console.error('❌ 環境變數驗證失敗：');
      console.error(getEnvValidationMessage(result));
    } else if (result.warnings.length > 0) {
      console.warn('⚠️ 環境變數警告：');
      console.warn(getEnvValidationMessage(result));
    } else {
      console.log('✅ 環境變數驗證通過');
    }
  }
}





