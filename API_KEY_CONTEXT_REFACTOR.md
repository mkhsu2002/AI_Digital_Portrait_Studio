# API Key 統一管理重構說明

## 📋 改動概述

將 API Key 的取得與管理邏輯統一改為使用 Context 管理，提升程式碼的可維護性與一致性。

## 🎯 改動目標

1. **統一 API Key 管理**：將分散的 API Key 取得邏輯集中到單一 Context
2. **提升程式碼可維護性**：減少重複程式碼，統一管理邏輯
3. **改善擴展性**：方便未來新增 API Key 來源（如後端 API、使用者設定等）

## 📁 新增檔案

### `contexts/ApiKeyContext.tsx`

建立新的 Context 來統一管理 API Key：

**主要功能**：
- `getApiKey()`: 取得 API Key（優先順序：環境變數 > 瀏覽器擴充功能）
- `isApiKeyAvailable()`: 檢查 API Key 是否可用
- `isUsingExtension()`: 檢查是否使用瀏覽器擴充功能
- `checkExtensionApiKey()`: 檢查擴充功能是否已選擇 API Key（非同步）
- `openExtensionKeySelector()`: 開啟擴充功能的 API Key 選擇介面
- `getApiKeySource()`: 取得 API Key 來源類型（'environment' | 'extension' | 'none'）

**API Key 取得優先順序**：
1. 環境變數 `VITE_API_KEY`（部署時設定）
2. 瀏覽器擴充功能 `window.aistudio`（開發時使用）

## 🔄 修改檔案

### `contexts/ApiContext.tsx`

**主要變更**：
- ✅ 移除模組級別的 `getApiKey()` 函數
- ✅ 使用 `useApiKey()` hook 來取得 API Key
- ✅ 更新所有使用 API Key 的地方：
  - `checkApiKeyAvailable()`: 使用 `apiKeyContext.isApiKeyAvailable()`
  - `getGeminiClient()`: 使用 `apiKeyContext.getApiKey()` 和 `apiKeyContext.isUsingExtension()`
  - `downloadResource()`: 使用 `apiKeyContext.getApiKey()`
  - `generateImages()`: 使用 `apiKeyContext.isUsingExtension()`、`apiKeyContext.checkExtensionApiKey()`、`apiKeyContext.openExtensionKeySelector()`
  - `generateVideo()`: 使用 `apiKeyContext.isUsingExtension()`、`apiKeyContext.checkExtensionApiKey()`、`apiKeyContext.openExtensionKeySelector()`

### `App.tsx`

**主要變更**：
- ✅ 加入 `ApiKeyProvider` import
- ✅ 在 `ApiProvider` 外層包裝 `ApiKeyProvider`（確保依賴順序正確）

**Provider 層級結構**：
```
ErrorBoundary
  └── TranslationProvider
      └── ApiKeyProvider  ← 新增
          └── ApiProvider
              └── AppContent
```

## 🔍 使用方式

### 在其他組件中使用 API Key

```typescript
import { useApiKey } from './contexts/ApiKeyContext';

const MyComponent = () => {
  const apiKeyContext = useApiKey();
  
  // 取得 API Key
  const apiKey = apiKeyContext.getApiKey();
  
  // 檢查 API Key 是否可用
  const isAvailable = apiKeyContext.isApiKeyAvailable();
  
  // 檢查是否使用擴充功能
  const usingExtension = apiKeyContext.isUsingExtension();
  
  // 取得 API Key 來源
  const source = apiKeyContext.getApiKeySource(); // 'environment' | 'extension' | 'none'
  
  // 檢查擴充功能是否已選擇 API Key（非同步）
  const hasKey = await apiKeyContext.checkExtensionApiKey();
  
  // 開啟擴充功能的 API Key 選擇介面
  await apiKeyContext.openExtensionKeySelector();
};
```

### 在 ApiContext 中使用

```typescript
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiKeyContext = useApiKey();
  
  const getApiKey = () => apiKeyContext.getApiKey();
  const isApiKeyAvailable = () => apiKeyContext.isApiKeyAvailable();
  // ...
};
```

## ✅ 優點

1. **統一管理**：所有 API Key 相關邏輯集中在 `ApiKeyContext`
2. **易於測試**：可以輕鬆 mock `ApiKeyContext` 進行測試
3. **易於擴展**：未來可以輕鬆新增其他 API Key 來源（如後端 API、使用者設定等）
4. **型別安全**：完整的 TypeScript 型別定義
5. **清晰的 API**：提供明確的方法來檢查和管理 API Key

## 🔄 遷移檢查清單

- [x] 建立 `ApiKeyContext.tsx`
- [x] 更新 `ApiContext.tsx` 使用新的 Context
- [x] 更新 `App.tsx` 加入 `ApiKeyProvider`
- [x] 移除 `ApiContext.tsx` 中的 `getApiKey()` 函數
- [x] 更新所有使用 API Key 的地方
- [x] 檢查 linting 錯誤
- [x] 確保 Provider 層級順序正確

## 📝 注意事項

1. **Provider 順序**：`ApiKeyProvider` 必須在 `ApiProvider` 之前，因為 `ApiProvider` 依賴 `ApiKeyContext`
2. **環境變數**：環境變數 `VITE_API_KEY` 仍然是可選的，如果沒有設定，會嘗試使用瀏覽器擴充功能
3. **向後相容**：現有的功能不受影響，只是內部實作改為使用 Context

## 🚀 未來改進建議

1. **API Key 快取**：可以考慮在 Context 中快取 API Key，避免重複取得
2. **API Key 驗證**：可以加入 API Key 格式驗證
3. **多 API Key 支援**：可以支援多個 API Key（如 Gemini API Key 和 Veo API Key）
4. **API Key 更新通知**：當 API Key 變更時，可以通知相關組件




