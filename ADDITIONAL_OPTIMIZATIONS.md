# 🚀 額外優化建議項目

基於專案分析，以下是建議的額外優化項目，按照優先級和實作難度分類：

---

## 🔴 高優先級（影響穩定性與安全性）

### 1. **輸入驗證與檔案限制**
**問題**：
- 表單輸入只有基本的 HTML5 驗證
- 沒有檔案大小限制（可能造成記憶體問題）
- 沒有檔案格式驗證
- 沒有輸入長度限制

**建議實作**：
```typescript
// utils/validation.ts
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '檔案大小不能超過 5MB' };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: '只支援 PNG 和 JPEG 格式' };
  }
  return { valid: true };
}

export function validateProductName(name: string): { valid: boolean; error?: string } {
  if (!name.trim()) {
    return { valid: false, error: '商品名稱不能為空' };
  }
  if (name.length > 100) {
    return { valid: false, error: '商品名稱不能超過 100 個字元' };
  }
  return { valid: true };
}
```

**影響**：防止無效輸入、減少記憶體使用、提升使用者體驗

---

### 2. **環境變數驗證**
**問題**：
- 應用啟動時沒有驗證必要的環境變數
- 缺少環境變數時錯誤訊息不明確

**建議實作**：
```typescript
// utils/envValidation.ts
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export function validateEnvVars(): { valid: boolean; missing: string[] } {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !import.meta.env[key]
  );
  return {
    valid: missing.length === 0,
    missing,
  };
}
```

**影響**：提早發現配置問題、提供明確的錯誤訊息

---

### 3. **圖片壓縮與優化**
**問題**：
- 上傳的參考圖片沒有壓縮
- Base64 圖片可能很大，造成記憶體和網路問題

**建議實作**：
```typescript
// utils/imageCompression.ts
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, file.type, quality);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

**影響**：減少記憶體使用、加快上傳速度、改善效能

---

## 🟡 中優先級（改善使用者體驗與效能）

### 4. **程式碼分割（Code Splitting）**
**問題**：
- 所有組件都在初始載入時載入
- 首屏載入時間可能較長

**建議實作**：
```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const PromptForm = lazy(() => import('./components/PromptForm'));
const PromptDisplay = lazy(() => import('./components/PromptDisplay'));
const HistoryPanel = lazy(() => import('./components/HistoryPanel'));

// 使用 Suspense 包裹
<Suspense fallback={<LoadingSpinner />}>
  <PromptForm ... />
</Suspense>
```

**影響**：減少初始載入時間、改善首屏效能

---

### 5. **防抖動（Debounce）處理**
**問題**：
- Prompt 預覽在每次輸入時都會重新計算
- 可能造成不必要的重新渲染

**建議實作**：
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 在 App.tsx 中使用
const debouncedFormData = useDebounce(formData, 500);
useEffect(() => {
  const prompt = buildDisplayPrompt(debouncedFormData);
  setGeneratedPrompt(prompt);
}, [debouncedFormData]);
```

**影響**：減少不必要的計算、改善效能

---

### 6. **Loading 狀態改善**
**問題**：
- Loading 狀態只有簡單的 spinner
- 沒有進度指示或階段性提示

**建議實作**：
```typescript
// components/LoadingProgress.tsx
interface LoadingProgressProps {
  current: number;
  total: number;
  label: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  current,
  total,
  label,
}) => {
  const percentage = (current / total) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span>{label}</span>
        <span>{current}/{total}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

**影響**：更好的使用者體驗、明確的進度回饋

---

### 7. **本地快取機制**
**問題**：
- 歷史紀錄每次都從 Firestore 讀取
- 沒有本地快取減少讀取次數

**建議實作**：
```typescript
// hooks/useLocalCache.ts
export function useLocalCache<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const getCache = useCallback((): T | null => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  }, [key, ttl]);

  const setCache = useCallback((data: T) => {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  }, [key]);

  return { getCache, setCache };
}
```

**影響**：減少 Firestore 讀取次數、加快載入速度

---

### 8. **無障礙功能（A11y）改善**
**問題**：
- 缺少 ARIA 標籤
- 鍵盤導航支援不足
- 缺少焦點管理

**建議實作**：
- 為所有互動元素加入 `aria-label`
- 實作鍵盤快捷鍵（如 Enter 提交、Esc 關閉）
- 改善焦點管理（focus trap）
- 加入 skip navigation 連結

**影響**：提升無障礙性、符合 WCAG 標準

---

## 🟢 低優先級（功能增強）

### 9. **PWA 支援**
**問題**：
- 無法離線使用
- 無法安裝為應用程式

**建議實作**：
- 加入 `manifest.json`
- 實作 Service Worker
- 快取靜態資源
- 離線頁面支援

**影響**：提升使用者體驗、支援離線使用

---

### 10. **批量操作**
**問題**：
- 只能一次刪除一個歷史紀錄
- 沒有批量選擇功能

**建議實作**：
- 加入多選模式
- 批量刪除功能
- 批量匯出功能

**影響**：提升操作效率

---

### 11. **搜尋與篩選**
**問題**：
- 歷史紀錄沒有搜尋功能
- 無法按條件篩選

**建議實作**：
```typescript
// hooks/useHistorySearch.ts
export function useHistorySearch(history: HistoryItem[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterOptions>({});

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // 搜尋商品名稱
      if (searchTerm && !item.formData.productName.includes(searchTerm)) {
        return false;
      }
      // 篩選條件
      if (filter.clothingStyle && item.formData.clothingStyle !== filter.clothingStyle) {
        return false;
      }
      // ... 其他篩選條件
      return true;
    });
  }, [history, searchTerm, filter]);

  return { searchTerm, setSearchTerm, filter, setFilter, filteredHistory };
}
```

**影響**：提升歷史紀錄管理效率

---

### 12. **匯出功能**
**問題**：
- 無法匯出歷史紀錄
- 無法備份設定

**建議實作**：
```typescript
// utils/export.ts
export function exportHistory(history: HistoryItem[]): void {
  const dataStr = JSON.stringify(history, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `history-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
```

**影響**：資料備份、分享設定

---

### 13. **鍵盤快捷鍵**
**問題**：
- 沒有鍵盤快捷鍵支援
- 操作效率可以提升

**建議實作**：
```typescript
// hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: 生成圖片
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // 觸發生成
      }
      // Esc: 清除錯誤
      if (e.key === 'Escape') {
        // 清除錯誤狀態
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

**影響**：提升操作效率、改善使用者體驗

---

### 14. **錯誤日誌與監控**
**問題**：
- 錯誤只記錄在 console
- 沒有錯誤追蹤機制

**建議實作**：
- 整合 Sentry 或類似服務
- 記錄錯誤到 Firebase
- 錯誤統計與分析

**影響**：快速發現問題、改善穩定性

---

### 15. **效能監控**
**問題**：
- 沒有效能指標追蹤
- 無法了解使用者體驗

**建議實作**：
- 整合 Web Vitals
- 追蹤 API 回應時間
- 記錄使用者操作

**影響**：了解效能瓶頸、持續優化

---

## 🛠️ 開發工具優化

### 16. **ESLint + Prettier**
**問題**：
- 沒有程式碼格式化規範
- 沒有靜態檢查

**建議實作**：
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

**影響**：程式碼品質、一致性

---

### 17. **測試覆蓋**
**問題**：
- 完全沒有測試
- 重構風險高

**建議實作**：
- Vitest 單元測試
- React Testing Library 組件測試
- 關鍵業務邏輯測試

**影響**：提升程式碼品質、減少 bug

---

### 18. **CI/CD 流程**
**問題**：
- 沒有自動化測試
- 沒有自動部署

**建議實作**：
- GitHub Actions
- 自動測試
- 自動部署到 Vercel/Cloudflare

**影響**：提升開發效率、減少人為錯誤

---

## 📊 優先級建議

### 立即實作（本週）
1. ✅ 輸入驗證與檔案限制
2. ✅ 環境變數驗證
3. ✅ 圖片壓縮

### 短期實作（本月）
4. ✅ 程式碼分割
5. ✅ 防抖動處理
6. ✅ Loading 狀態改善
7. ✅ ESLint + Prettier

### 長期規劃（下季度）
8. ✅ PWA 支援
9. ✅ 測試覆蓋
10. ✅ 錯誤監控
11. ✅ 效能監控

---

## 💡 實作建議

建議按照以下順序實作：
1. **安全性優先**：輸入驗證、環境變數驗證
2. **效能優化**：程式碼分割、防抖動、圖片壓縮
3. **使用者體驗**：Loading 改善、快捷鍵、搜尋功能
4. **開發工具**：ESLint、測試、CI/CD

每個項目都可以獨立實作，不會影響現有功能。





