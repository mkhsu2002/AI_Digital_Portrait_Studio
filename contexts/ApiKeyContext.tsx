import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';

// 定義 AIStudio 介面
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

export interface ApiKeyContextValue {
  /**
   * 取得 API Key
   * 優先順序：環境變數 > 手動輸入 > 瀏覽器擴充功能
   */
  getApiKey: () => string;
  
  /**
   * 檢查 API Key 是否可用
   */
  isApiKeyAvailable: () => boolean;
  
  /**
   * 檢查是否使用瀏覽器擴充功能
   */
  isUsingExtension: () => boolean;
  
  /**
   * 檢查擴充功能是否已選擇 API Key（非同步）
   */
  checkExtensionApiKey: () => Promise<boolean>;
  
  /**
   * 開啟擴充功能的 API Key 選擇介面
   */
  openExtensionKeySelector: () => Promise<void>;
  
  /**
   * 取得 API Key 來源類型
   */
  getApiKeySource: () => 'environment' | 'manual' | 'extension' | 'none';
  
  /**
   * 設定手動輸入的 API Key（儲存在 localStorage）
   */
  setManualApiKey: (apiKey: string) => void;
  
  /**
   * 清除手動輸入的 API Key
   */
  clearManualApiKey: () => void;
  
  /**
   * 取得手動輸入的 API Key（不包含完整值，僅顯示部分）
   */
  getManualApiKeyPreview: () => string | null;
}

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined);

/**
 * API Key Context Provider
 * 統一管理 API Key 的取得與使用
 */
const MANUAL_API_KEY_STORAGE_KEY = 'gemini_api_key_manual';

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [manualApiKey, setManualApiKeyState] = useState<string | null>(null);

  // 從 localStorage 載入手動輸入的 API Key
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MANUAL_API_KEY_STORAGE_KEY);
      if (stored) {
        setManualApiKeyState(stored);
      }
    }
  }, []);

  // 檢查瀏覽器擴充功能是否可用
  useEffect(() => {
    if (typeof window !== 'undefined' && window.aistudio) {
      setExtensionAvailable(true);
    }
  }, []);

  /**
   * 取得 API Key
   * 優先順序：環境變數 > 手動輸入 > 瀏覽器擴充功能
   */
  const getApiKey = useCallback((): string => {
    // 優先使用環境變數（部署時設定）
    const envKey = import.meta.env.VITE_API_KEY;
    if (envKey && envKey.trim() !== '') {
      return envKey;
    }
    
    // 其次使用手動輸入的 API Key（儲存在 localStorage）
    if (manualApiKey && manualApiKey.trim() !== '') {
      return manualApiKey;
    }
    
    // 如果有瀏覽器擴充功能，擴充功能會自動處理 API Key
    // 這裡返回空字串，因為擴充功能會自動注入
    if (typeof window !== 'undefined' && window.aistudio) {
      return '';
    }
    
    return '';
  }, [manualApiKey]);

  /**
   * 檢查 API Key 是否可用
   */
  const isApiKeyAvailable = useCallback((): boolean => {
    const envKey = import.meta.env.VITE_API_KEY;
    if (envKey && envKey.trim() !== '') {
      return true;
    }
    
    // 檢查是否有手動輸入的 API Key
    if (manualApiKey && manualApiKey.trim() !== '') {
      return true;
    }
    
    // 檢查是否有瀏覽器擴充功能
    return !!(typeof window !== 'undefined' && window.aistudio);
  }, [manualApiKey]);

  /**
   * 檢查是否使用瀏覽器擴充功能
   */
  const isUsingExtension = useCallback((): boolean => {
    const envKey = import.meta.env.VITE_API_KEY;
    // 如果沒有環境變數，且擴充功能可用，則使用擴充功能
    return !(envKey && envKey.trim() !== '') && !!(typeof window !== 'undefined' && window.aistudio);
  }, []);

  /**
   * 檢查擴充功能是否已選擇 API Key（非同步）
   */
  const checkExtensionApiKey = useCallback(async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        return await window.aistudio.hasSelectedApiKey();
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  /**
   * 開啟擴充功能的 API Key 選擇介面
   */
  const openExtensionKeySelector = useCallback(async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
      } catch (error) {
        console.error('無法開啟擴充功能的 API Key 選擇介面:', error);
        throw error;
      }
    } else {
      throw new Error('瀏覽器擴充功能不可用');
    }
  }, []);

  /**
   * 取得 API Key 來源類型
   */
  const getApiKeySource = useCallback((): 'environment' | 'manual' | 'extension' | 'none' => {
    const envKey = import.meta.env.VITE_API_KEY;
    if (envKey && envKey.trim() !== '') {
      return 'environment';
    }
    
    if (manualApiKey && manualApiKey.trim() !== '') {
      return 'manual';
    }
    
    if (typeof window !== 'undefined' && window.aistudio) {
      return 'extension';
    }
    
    return 'none';
  }, [manualApiKey]);
  
  /**
   * 設定手動輸入的 API Key（儲存在 localStorage）
   */
  const setManualApiKey = useCallback((apiKey: string) => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey) {
      localStorage.setItem(MANUAL_API_KEY_STORAGE_KEY, trimmedKey);
      setManualApiKeyState(trimmedKey);
    } else {
      clearManualApiKey();
    }
  }, []);
  
  /**
   * 清除手動輸入的 API Key
   */
  const clearManualApiKey = useCallback(() => {
    localStorage.removeItem(MANUAL_API_KEY_STORAGE_KEY);
    setManualApiKeyState(null);
  }, []);
  
  /**
   * 取得手動輸入的 API Key 預覽（僅顯示部分）
   */
  const getManualApiKeyPreview = useCallback((): string | null => {
    if (!manualApiKey) return null;
    if (manualApiKey.length <= 8) return manualApiKey;
    return `${manualApiKey.substring(0, 4)}...${manualApiKey.substring(manualApiKey.length - 4)}`;
  }, [manualApiKey]);

  const value = useMemo<ApiKeyContextValue>(
    () => ({
      getApiKey,
      isApiKeyAvailable,
      isUsingExtension,
      checkExtensionApiKey,
      openExtensionKeySelector,
      getApiKeySource,
      setManualApiKey,
      clearManualApiKey,
      getManualApiKeyPreview,
    }),
    [
      getApiKey,
      isApiKeyAvailable,
      isUsingExtension,
      checkExtensionApiKey,
      openExtensionKeySelector,
      getApiKeySource,
      setManualApiKey,
      clearManualApiKey,
      getManualApiKeyPreview,
    ]
  );

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
};

/**
 * Hook to use ApiKeyContext
 * @throws Error if used outside ApiKeyProvider
 */
export const useApiKey = (): ApiKeyContextValue => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within ApiKeyProvider');
  }
  return context;
};

