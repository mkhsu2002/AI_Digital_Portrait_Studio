/**
 * 重試工具函數
 * 使用 exponential backoff 策略進行重試
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryable?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 秒
  maxDelay: 10000, // 10 秒
  backoffMultiplier: 2,
  retryable: () => true, // 預設所有錯誤都可重試
};

/**
 * 計算延遲時間（exponential backoff）
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelay);
}

/**
 * 重試函數
 * 
 * @param fn 要執行的異步函數
 * @param options 重試選項
 * @returns Promise<T>
 * 
 * @example
 * ```typescript
 * const result = await retry(
 *   () => fetch('/api/data'),
 *   {
 *     maxRetries: 3,
 *     initialDelay: 1000,
 *     retryable: (error) => error instanceof NetworkError
 *   }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 檢查是否應該重試
      if (!opts.retryable(error)) {
        throw error;
      }

      // 如果已經是最後一次嘗試，直接拋出錯誤
      if (attempt === opts.maxRetries) {
        break;
      }

      // 計算延遲時間並等待
      const delay = calculateDelay(attempt, opts);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 判斷錯誤是否為網路錯誤（可重試）
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('Network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND')
    );
  }
  return false;
}

/**
 * 判斷錯誤是否為暫時性錯誤（可重試）
 */
export function isRetryableError(error: unknown): boolean {
  if (isNetworkError(error)) {
    return true;
  }

  // HTTP 5xx 錯誤通常可以重試
  if (error instanceof Response) {
    return error.status >= 500 && error.status < 600;
  }

  // 特定錯誤訊息
  if (error instanceof Error) {
    const retryableMessages = [
      'timeout',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'temporary',
      'rate limit',
    ];
    return retryableMessages.some((msg) =>
      error.message.toLowerCase().includes(msg)
    );
  }

  return false;
}

