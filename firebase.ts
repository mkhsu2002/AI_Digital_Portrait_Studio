import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// 驗證必要的環境變數
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 檢查是否有缺少的環境變數
const missingVars: string[] = [];
const envVarMap: Record<string, string> = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value || value.trim() === '') {
    missingVars.push(envVarMap[key] || `VITE_FIREBASE_${key.toUpperCase()}`);
  }
});

if (missingVars.length > 0) {
  const errorMessage = `
❌ Firebase 環境變數設定錯誤！

缺少以下必要的環境變數：
${missingVars.map(v => `  - ${v}`).join('\n')}

請確認：
1. 在部署平台（GitHub Pages/Cloudflare Pages/Vercel）中已設定所有 Firebase 環境變數
2. 環境變數名稱正確（必須以 VITE_ 開頭）
3. 環境變數值不為空

詳細說明請參考：
- README.md 中的「Firebase 設定參數說明」
- FIREBASE_CONFIG_REFERENCE.md
  `;
  
  console.error(errorMessage);
  
  // 在開發模式下顯示更詳細的錯誤
  if (import.meta.env.DEV) {
    console.error('當前環境變數狀態：', {
      VITE_FIREBASE_API_KEY: requiredEnvVars.apiKey ? '已設定' : '❌ 未設定',
      VITE_FIREBASE_AUTH_DOMAIN: requiredEnvVars.authDomain ? '已設定' : '❌ 未設定',
      VITE_FIREBASE_PROJECT_ID: requiredEnvVars.projectId ? '已設定' : '❌ 未設定',
      VITE_FIREBASE_STORAGE_BUCKET: requiredEnvVars.storageBucket ? '已設定' : '❌ 未設定',
      VITE_FIREBASE_MESSAGING_SENDER_ID: requiredEnvVars.messagingSenderId ? '已設定' : '❌ 未設定',
      VITE_FIREBASE_APP_ID: requiredEnvVars.appId ? '已設定' : '❌ 未設定',
    });
  }
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId,
};

let app;
let authInstance;
let dbInstance;
let storageInstance: FirebaseStorage | null = null;

try {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  
  try {
    storageInstance = getStorage(app);
  } catch (err) {
    console.error("Firebase Storage 初始化失敗，請確認已設定 storageBucket。", err);
  }
} catch (error) {
  const errorMessage = `
❌ Firebase 初始化失敗！

錯誤訊息：${error instanceof Error ? error.message : '未知錯誤'}

可能的原因：
1. Firebase API Key 無效或格式錯誤
2. Firebase 專案設定不正確
3. 環境變數值包含多餘的空格或引號

請檢查：
1. Firebase Console → 專案設定 → 一般 → 您的應用程式
2. 確認複製的 API Key 完整且正確
3. 確認環境變數值沒有多餘的空格或引號

詳細說明請參考 FIREBASE_CONFIG_REFERENCE.md
  `;
  
  console.error(errorMessage);
  console.error('Firebase 初始化錯誤詳情：', error);
  
  // 即使初始化失敗，也導出 null 值，避免應用程式完全崩潰
  // 組件應該檢查這些值是否為 null
  authInstance = null as any;
  dbInstance = null as any;
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

// 導出診斷資訊供組件使用
export const firebaseDiagnostics = {
  isInitialized: authInstance !== null && dbInstance !== null,
  missingVars: [...missingVars], // 複製陣列避免引用問題
  hasInitializationError: authInstance === null || dbInstance === null,
};

// 導出診斷資訊
export const firebaseDiagnostics = {
  isInitialized: authInstance !== null && dbInstance !== null,
  missingVars,
  hasInitializationError: authInstance === null || dbInstance === null,
};

