import { useState, useEffect } from 'react';

/**
 * 防抖動 Hook
 * 
 * @param value 要防抖動的值
 * @param delay 延遲時間（毫秒），預設 300ms
 * @returns 防抖動後的值
 * 
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // 只有在使用者停止輸入 500ms 後才會執行
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 設定計時器
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函數：如果 value 或 delay 改變，清除之前的計時器
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}




