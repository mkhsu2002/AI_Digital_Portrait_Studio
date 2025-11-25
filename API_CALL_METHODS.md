# API 呼叫方式分析

## 📊 總覽

這個專案使用了 **4 種不同的 API 呼叫方式**：

---

## 1️⃣ Google Gemini SDK（官方 SDK）

### 使用位置
- `App.tsx` - 圖片生成與影片生成

### 呼叫方式
```typescript
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// 方式 1: 圖片生成
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-image",
  contents: [{
    role: 'user',
    parts: [
      { inlineData: { data: base64, mimeType: "image/png" } },
      { text: prompt }
    ],
  }],
  config: {
    responseModalities: [Modality.IMAGE],
    imageConfig: { aspectRatio: "16:9" },
  },
});

// 方式 2: 影片生成（異步操作）
let operation = await ai.models.generateVideos({
  model: "veo-3.1-fast-generate-preview",
  prompt: videoPrompt,
  image: { imageBytes, mimeType },
  config: {
    numberOfVideos: 1,
    resolution: "720p",
    aspectRatio: "16:9",
  },
});

// 方式 3: 查詢影片生成狀態（輪詢）
while (!operation.done) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  operation = await ai.operations.getVideosOperation({ operation });
}
```

### 特點
- ✅ 使用官方 SDK，型別安全
- ✅ 支援複雜的請求結構（多模態輸入）
- ✅ 支援異步操作（影片生成需要輪詢）

---

## 2️⃣ 原生 Fetch API（HTTP 請求）

### 使用位置
- `App.tsx` - 下載生成的圖片/影片

### 呼叫方式
```typescript
// 方式 1: 下載 Gemini 生成的圖片
const downloadUrl = appendApiKey(imagePart.fileData.fileUri);
const imageResponse = await fetch(downloadUrl);
const blob = await imageResponse.blob();

// 方式 2: 下載 Veo 生成的影片
const signedUrl = `${downloadLink}?alt=media&key=${GEMINI_API_KEY}`;
const videoResponse = await fetch(signedUrl);
const videoBlob = await videoResponse.blob();

// 方式 3: 從 URL 載入圖片（用於影片生成）
const response = await fetch(imageSrc);
const blob = await response.blob();
```

### 特點
- ✅ 簡單直接，無需額外套件
- ✅ 用於下載資源（圖片、影片）
- ⚠️ 需要手動處理錯誤與回應格式
- ⚠️ API Key 直接附加在 URL 中（安全性問題）

### 注意事項
```typescript
// 手動附加 API Key 的輔助函數
const appendApiKey = (url: string) => {
  if (!GEMINI_API_KEY) return url;
  return url.includes("?") 
    ? `${url}&key=${GEMINI_API_KEY}` 
    : `${url}?key=${GEMINI_API_KEY}`;
};
```

---

## 3️⃣ Firebase SDK（Firestore & Storage）

### 使用位置
- `services/historyService.ts` - 歷史紀錄管理
- `services/usageService.ts` - 使用次數管理
- `App.tsx` - 圖片上傳至 Storage

### Firestore 呼叫方式

#### 讀取資料
```typescript
import { getDocs, getDoc, query, orderBy, limit } from "firebase/firestore";

// 方式 1: 查詢多筆文件（歷史紀錄）
const q = query(
  collection(db, "users", uid, "history"),
  orderBy("createdAt", "desc"),
  limit(5)
);
const snapshot = await getDocs(q);

// 方式 2: 讀取單一文件（使用次數）
const snapshot = await getDoc(doc(db, "users", uid));
```

#### 寫入資料
```typescript
import { addDoc, setDoc, update, serverTimestamp } from "firebase/firestore";

// 方式 1: 新增文件（歷史紀錄）
await addDoc(collection(db, "users", uid, "history"), {
  formData: item.formData,
  images: item.images,
  createdAt: serverTimestamp(),
});

// 方式 2: 設定文件（建立使用者文件）
await setDoc(doc(db, "users", uid), {
  generationCredits: DEFAULT_GENERATION_CREDITS,
  totalGenerated: 0,
  createdAt: serverTimestamp(),
});
```

#### 交易操作
```typescript
import { runTransaction } from "firebase/firestore";

// 使用交易確保資料一致性（扣除使用次數）
return runTransaction(db, async (transaction) => {
  const snapshot = await transaction.get(doc(db, "users", uid));
  const currentCredits = snapshot.data()?.generationCredits ?? 0;
  
  if (currentCredits <= 0) {
    throw new Error("NO_CREDITS");
  }
  
  transaction.update(doc(db, "users", uid), {
    generationCredits: currentCredits - 1,
    updatedAt: serverTimestamp(),
  });
  
  return currentCredits - 1;
});
```

### Storage 呼叫方式
```typescript
import { ref, uploadString, getDownloadURL } from "firebase/storage";

// 方式 1: 上傳圖片（base64 轉 data URL）
const storageRef = ref(storage, `users/${uid}/history/${timestamp}-${index}.jpg`);
await uploadString(storageRef, imageSrc, "data_url");

// 方式 2: 取得下載 URL
const downloadUrl = await getDownloadURL(storageRef);
```

### 特點
- ✅ 即時同步（Firestore）
- ✅ 交易支援（確保資料一致性）
- ✅ 自動處理認證與權限
- ✅ 離線支援（Firestore）

---

## 4️⃣ Window API（瀏覽器擴充功能）

### 使用位置
- `App.tsx` - 檢查 AI Studio 擴充功能

### 呼叫方式
```typescript
// 全域型別定義
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

// 使用方式
if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
  await window.aistudio?.openSelectKey();
}
```

### 特點
- ✅ 與瀏覽器擴充功能整合
- ⚠️ 需要使用者安裝擴充功能
- ⚠️ 型別需要手動定義

---

## 📈 使用統計

| API 呼叫方式 | 使用次數 | 主要用途 |
|-------------|---------|---------|
| Google Gemini SDK | 2 種方法 | 圖片生成、影片生成 |
| Fetch API | 3 處 | 下載圖片、下載影片、載入圖片 |
| Firebase Firestore | 6 種方法 | 讀取/寫入/更新/交易 |
| Firebase Storage | 2 種方法 | 上傳、取得 URL |
| Window API | 2 種方法 | 擴充功能整合 |

---

## 🔍 發現的問題

### 1. **API Key 暴露在前端**
```typescript
// ❌ 問題：API Key 直接在前端程式碼中使用
const GEMINI_API_KEY = import.meta.env.VITE_API_KEY ?? '';
const signedUrl = `${downloadLink}?alt=media&key=${GEMINI_API_KEY}`;
```
**建議**：將敏感 API 呼叫移至後端（Cloud Functions）

### 2. **缺乏統一的 API 客戶端**
- 每種 API 呼叫方式都是獨立實作
- 沒有統一的錯誤處理機制
- 沒有請求重試邏輯

**建議**：建立統一的 API 客戶端封裝層

### 3. **錯誤處理不一致**
- Gemini SDK 使用 try-catch
- Fetch API 需要手動檢查 `response.ok`
- Firebase 錯誤處理方式不同

**建議**：統一錯誤處理機制

---

## 💡 優化建議

### 建議 1: 建立統一的 API 客戶端
```typescript
// services/apiClient.ts
class ApiClient {
  private geminiClient: GoogleGenAI;
  
  async generateImage(prompt: string, config: ImageConfig) {
    // 統一的圖片生成邏輯
  }
  
  async generateVideo(imageSrc: string, config: VideoConfig) {
    // 統一的影片生成邏輯
  }
  
  async downloadResource(url: string) {
    // 統一的資源下載邏輯
  }
}
```

### 建議 2: 將敏感 API 移至後端
- 使用 Firebase Cloud Functions 作為 API 代理
- 在前端只呼叫 Cloud Functions
- API Key 儲存在後端環境變數中

### 建議 3: 加入請求重試機制
```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 📝 總結

這個專案使用了 **4 種不同的 API 呼叫方式**：
1. ✅ **Google Gemini SDK** - 官方 SDK，用於 AI 功能
2. ✅ **Fetch API** - 原生 HTTP 請求，用於資源下載
3. ✅ **Firebase SDK** - Firestore 與 Storage，用於資料儲存
4. ✅ **Window API** - 瀏覽器擴充功能整合

**主要問題**：
- API Key 暴露在前端
- 缺乏統一的 API 客戶端
- 錯誤處理不一致

**建議優先處理**：
1. 建立統一的 API 客戶端封裝層
2. 將敏感 API 呼叫移至後端
3. 實作統一的錯誤處理與重試機制







