/**
 * Firebase 診斷工具
 * 用於檢查 Firebase 初始化狀態和環境變數
 */

export interface FirebaseDiagnostics {
  isInitialized: boolean;
  missingVars: string[];
  envStatus: Record<string, { set: boolean; preview: string }>;
  initializationError: Error | null;
}

/**
 * 診斷 Firebase 初始化狀態
 */
export function diagnoseFirebase(): FirebaseDiagnostics {
  const requiredEnvVars = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const envVarMap: Record<string, string> = {
    apiKey: 'VITE_FIREBASE_API_KEY',
    authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
    projectId: 'VITE_FIREBASE_PROJECT_ID',
    storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'VITE_FIREBASE_APP_ID',
  };

  const missingVars: string[] = [];
  const envStatus: Record<string, { set: boolean; preview: string }> = {};

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    const varName = envVarMap[key];
    const isSet = value && value.trim() !== '';
    const preview = isSet 
      ? `${value.substring(0, 20)}${value.length > 20 ? '...' : ''}` 
      : '(未設定)';
    
    envStatus[varName] = { set: isSet, preview };

    if (!isSet) {
      missingVars.push(varName);
    }
  });

  // 檢查 auth 是否初始化（需要動態 import 避免循環依賴）
  let isInitialized = false;
  let initializationError: Error | null = null;

  try {
    // 嘗試檢查 auth 是否可用
    // 注意：這需要在 firebase.ts 初始化後才能正確檢查
    const { auth } = require('../firebase');
    isInitialized = auth !== null && auth !== undefined;
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error('無法檢查 Firebase 初始化狀態');
  }

  return {
    isInitialized,
    missingVars,
    envStatus,
    initializationError,
  };
}

/**
 * 在 Console 中顯示診斷資訊
 */
export function logFirebaseDiagnostics(): void {
  const diagnostics = diagnoseFirebase();
  
  console.group('🔍 Firebase 診斷資訊');
  
  console.log('初始化狀態:', diagnostics.isInitialized ? '✅ 已初始化' : '❌ 未初始化');
  
  if (diagnostics.missingVars.length > 0) {
    console.group('❌ 缺少的環境變數:');
    diagnostics.missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.groupEnd();
  } else {
    console.log('✅ 所有必要的環境變數都已設定');
  }
  
  console.group('環境變數狀態:');
  Object.entries(diagnostics.envStatus).forEach(([varName, status]) => {
    if (status.set) {
      console.log(`  ✅ ${varName}: ${status.preview}`);
    } else {
      console.error(`  ❌ ${varName}: ${status.preview}`);
    }
  });
  console.groupEnd();
  
  if (diagnostics.initializationError) {
    console.error('初始化錯誤:', diagnostics.initializationError);
  }
  
  console.groupEnd();
}


