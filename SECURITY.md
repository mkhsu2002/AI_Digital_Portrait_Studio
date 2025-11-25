# 🔒 API Key 安全指南

## ⚠️ 重要安全警告

**請勿將 API Key 直接提交到公開的 Git 倉庫！**

當專案被 fork 並部署到 GitHub Pages、Cloudflare Pages 或其他公開平台時，**所有環境變數都會暴露在瀏覽器中**。任何人都可以在瀏覽器開發者工具中查看您的 API Key。

---

## 🛡️ 安全部署方式

### 方式 1：使用平台環境變數（推薦用於公開部署）

#### GitHub Pages
GitHub Pages **不支援環境變數**，因此不建議直接部署包含 API Key 的前端應用。

#### Cloudflare Pages
1. 前往 Cloudflare Dashboard → Pages → 您的專案
2. 進入 **Settings** → **Environment Variables**
3. 新增 `VITE_API_KEY` 等環境變數
4. 重新部署專案

**注意**：即使使用環境變數，在 Cloudflare Pages 上部署的應用，環境變數仍會被打包到前端程式碼中，可能被查看。

#### Vercel
1. 前往 Vercel Dashboard → 專案 → Settings → Environment Variables
2. 新增環境變數（選擇對應的環境：Production、Preview、Development）
3. 重新部署

**注意**：Vercel 的環境變數在構建時會被注入，但仍會出現在前端程式碼中。

---

### 方式 2：使用 Firebase Cloud Functions（最安全）

**這是推薦的方式**，可以完全避免在前端暴露 API Key。

#### 步驟 1：建立 Cloud Functions

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 初始化 Functions
firebase init functions

# 選擇 TypeScript
```

#### 步驟 2：建立 API 代理函數

```typescript
// functions/src/index.ts
import * as functions from "firebase-functions";
import { GoogleGenAI } from "@google/genai";

// API Key 儲存在 Firebase Functions 環境變數中（不會暴露給前端）
const GEMINI_API_KEY = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;

export const generateImages = functions.https.onCall(async (data, context) => {
  // 驗證使用者身份
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { formData, shotLabels } = data;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  // 呼叫 Gemini API
  // ... 生成圖片邏輯 ...
  
  return { images: generatedImages };
});
```

#### 步驟 3：設定環境變數

```bash
# 設定 Firebase Functions 環境變數（不會暴露給前端）
firebase functions:config:set gemini.api_key="YOUR_API_KEY"
```

#### 步驟 4：更新前端 API Context

```typescript
// contexts/ApiContext.tsx
const generateImages = async (formData: FormDataState, shotLabels: Record<ShotLabelKey, string>) => {
  // 呼叫 Cloud Functions 而非直接呼叫 Gemini API
  const functions = getFunctions();
  const generateImagesFunction = httpsCallable(functions, 'generateImages');
  
  const result = await generateImagesFunction({
    formData,
    shotLabels,
  });
  
  return result.data.images;
};
```

---

### 方式 3：使用瀏覽器擴充功能（開發用）

專案已支援透過 `window.aistudio` 擴充功能提供 API Key，這適合開發環境使用，但不適合生產環境。

---

## 📋 檢查清單

在部署前，請確認：

- [ ] `.env` 和 `.env.local` 檔案已加入 `.gitignore`
- [ ] 沒有在程式碼中硬編碼 API Key
- [ ] 沒有在 commit 訊息中洩露 API Key
- [ ] 如果使用公開 Git 倉庫，已使用 Cloud Functions 或其他後端代理
- [ ] 已檢查 `dist/` 目錄中沒有包含 API Key（如果有的話，不要提交）

---

## 🔍 如何檢查 API Key 是否外洩

### 1. 檢查 Git 歷史記錄

```bash
# 搜尋 Git 歷史中是否包含 API Key
git log -p -S "YOUR_API_KEY" --all

# 如果發現外洩，立即撤銷並重新生成 API Key
```

### 2. 檢查已部署的應用

1. 開啟瀏覽器開發者工具（F12）
2. 前往 **Sources** 或 **Network** 標籤
3. 搜尋您的 API Key
4. 如果找到，表示已外洩，請立即撤銷並重新生成

### 3. 使用 GitHub Secret Scanning

GitHub 會自動掃描公開倉庫中的 API Key，如果發現會發送通知。

---

## 🚨 如果 API Key 已外洩

1. **立即撤銷 API Key**
   - 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
   - 刪除或重新生成受影響的 API Key

2. **檢查使用記錄**
   - 查看 API 使用記錄，確認是否有異常使用
   - 如有異常，考慮設定使用限制

3. **更新所有部署**
   - 更新所有環境中的 API Key
   - 重新部署應用

---

## 📚 參考資源

- [Firebase Cloud Functions 文件](https://firebase.google.com/docs/functions)
- [Vercel 環境變數文件](https://vercel.com/docs/concepts/projects/environment-variables)
- [Cloudflare Pages 環境變數文件](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

## 💡 最佳實踐

1. **永遠不要**在前端程式碼中硬編碼 API Key
2. **永遠不要**將 `.env` 檔案提交到 Git
3. **優先使用**後端代理（Cloud Functions）處理敏感 API 呼叫
4. **定期輪換** API Key
5. **設定使用限制**（配額、IP 限制等）
6. **監控使用情況**，發現異常立即處理

---

**記住**：前端應用中的所有程式碼和環境變數都是公開可見的。如果必須在前端使用 API Key，請確保：
- 設定嚴格的 API Key 使用限制
- 定期監控使用情況
- 準備好隨時撤銷和重新生成




