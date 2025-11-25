/**
 * 統一錯誤處理機制
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  QUOTA = 'QUOTA',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  retryable: boolean;
  userMessage?: string; // 友善的使用者訊息
}

/**
 * 處理錯誤並轉換為 AppError
 */
export function handleError(error: unknown, userMessage?: string): AppError {
  // 網路錯誤
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: '網路連線失敗',
      originalError: error,
      retryable: true,
      userMessage: userMessage || '網路連線失敗，請檢查您的網路連線後重試',
    };
  }

  // HTTP 錯誤
  if (error instanceof Response) {
    if (error.status >= 500 && error.status < 600) {
      return {
        type: ErrorType.API,
        message: `伺服器錯誤: ${error.status}`,
        originalError: error,
        retryable: true,
        userMessage: userMessage || '伺服器暫時無法回應，請稍後再試',
      };
    }
    if (error.status === 401 || error.status === 403) {
      return {
        type: ErrorType.AUTH,
        message: `認證錯誤: ${error.status}`,
        originalError: error,
        retryable: false,
        userMessage: userMessage || '認證失敗，請重新登入',
      };
    }
  }

  // Error 物件
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // API 相關錯誤
    if (
      errorMessage.includes('api') ||
      errorMessage.includes('gemini') ||
      errorMessage.includes('veo') ||
      errorMessage.includes('request failed')
    ) {
      return {
        type: ErrorType.API,
        message: error.message,
        originalError: error,
        retryable: true,
        userMessage: userMessage || 'API 呼叫失敗，請稍後再試',
      };
    }

    // 驗證錯誤
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('required')
    ) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        originalError: error,
        retryable: false,
        userMessage: userMessage || error.message,
      };
    }

    // 配額錯誤
    if (
      errorMessage.includes('quota') ||
      errorMessage.includes('credits') ||
      errorMessage.includes('no_credits') ||
      errorMessage === 'no_credits'
    ) {
      return {
        type: ErrorType.QUOTA,
        message: error.message,
        originalError: error,
        retryable: false,
        userMessage: userMessage || '您的免費生成次數已用完',
      };
    }

    // 認證錯誤
    if (
      errorMessage.includes('auth') ||
      errorMessage.includes('login') ||
      errorMessage.includes('unauthorized')
    ) {
      return {
        type: ErrorType.AUTH,
        message: error.message,
        originalError: error,
        retryable: false,
        userMessage: userMessage || '請先登入後再使用',
      };
    }

    // 網路相關錯誤
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('enotfound')
    ) {
      return {
        type: ErrorType.NETWORK,
        message: error.message,
        originalError: error,
        retryable: true,
        userMessage: userMessage || '網路連線失敗，請檢查您的網路連線後重試',
      };
    }

    // 其他 Error
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      originalError: error,
      retryable: false,
      userMessage: userMessage || error.message,
    };
  }

  // 未知錯誤
  return {
    type: ErrorType.UNKNOWN,
    message: '發生未知錯誤',
    originalError: error,
    retryable: false,
    userMessage: userMessage || '發生未知錯誤，請稍後再試',
  };
}

/**
 * 判斷錯誤是否可重試
 */
export function isRetryableErrorType(error: AppError): boolean {
  return error.retryable;
}

/**
 * 取得錯誤的使用者友善訊息
 */
export function getUserFriendlyMessage(error: AppError): string {
  return error.userMessage || error.message;
}

/**
 * 記錄錯誤（開發模式）
 */
export function logError(error: AppError, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(`[${error.type}] ${context || 'Error'}:`, {
      message: error.message,
      userMessage: error.userMessage,
      originalError: error.originalError,
    });
  }
}


