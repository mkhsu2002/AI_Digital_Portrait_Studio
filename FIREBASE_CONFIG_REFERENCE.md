# Firebase 設定參數參考

## 📋 Firebase 環境變數清單

本專案使用 Firebase 提供認證、資料庫和儲存服務，需要以下環境變數：

### 必要參數（6 個）

| 環境變數名稱 | Firebase 設定欄位 | 說明 | 範例值 |
|-------------|------------------|------|--------|
| `VITE_FIREBASE_API_KEY` | `apiKey` | Firebase API Key，用於初始化 Firebase SDK | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` | 認證網域，用於 Firebase Authentication | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | Firebase 專案 ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | Storage 儲存桶，用於儲存圖片 | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | 訊息發送者 ID，用於 Firebase Cloud Messaging | `123456789012` |
| `VITE_FIREBASE_APP_ID` | `appId` | Firebase 應用程式 ID | `1:123456789012:web:abcdef123456` |

---

## 🔍 在專案中的使用位置

### 1. Firebase 初始化 (`firebase.ts`)

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

### 2. 環境變數驗證 (`utils/envValidation.ts`)

所有 Firebase 參數都被列為**必要環境變數**：

```typescript
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;
```

### 3. 服務使用

| Firebase 服務 | 使用位置 | 用途 |
|--------------|---------|------|
| **Authentication** | `contexts/AuthContext.tsx` | 使用者登入、註冊、登出、忘記密碼 |
| **Firestore** | `services/historyService.ts`<br>`services/usageService.ts` | 儲存歷史紀錄、使用次數 |
| **Storage** | `contexts/ApiContext.tsx` | 上傳生成的圖片 |

---

## 📝 取得 Firebase 設定參數

### 步驟 1：前往 Firebase Console

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 登入您的 Google 帳號

### 步驟 2：建立或選擇專案

1. 點擊 **新增專案**（或選擇現有專案）
2. 輸入專案名稱
3. 選擇是否啟用 Google Analytics（可選）
4. 點擊 **建立專案**

### 步驟 3：新增 Web 應用程式

1. 在專案概覽頁面，點擊 **Web** 圖示（`</>`）
2. 輸入應用程式暱稱（例如：`AI Digital Portrait Studio`）
3. **可選**：設定 Firebase Hosting
4. 點擊 **註冊應用程式**

### 步驟 4：複製設定參數

Firebase 會顯示類似以下的設定物件：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

將這些值對應到環境變數：

```dotenv
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## ⚙️ Firebase 服務設定

### 1. Authentication（認證）

**啟用 Email/Password 登入**：

1. 前往 Firebase Console → **Authentication** → **Sign-in method**
2. 點擊 **Email/Password**
3. 啟用 **Email/Password** 提供者
4. 點擊 **儲存**

**設定授權網域**（如果需要）：

1. 前往 **Authentication** → **Settings** → **Authorized domains**
2. 確認您的網域已列在其中（`localhost` 和 `*.firebaseapp.com` 預設已授權）

### 2. Firestore Database（資料庫）

**建立資料庫**：

1. 前往 Firebase Console → **Firestore Database**
2. 點擊 **建立資料庫**
3. 選擇 **以測試模式啟動**（開發階段）
4. 選擇資料庫位置（建議選擇離使用者最近的區域）
5. 點擊 **啟用**

**設定安全規則**（生產環境）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 使用者只能讀寫自己的資料
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**資料結構**：

```
users/
  {userId}/
    generationCredits: number
    totalGenerated: number
    totalShares: number
    createdAt: timestamp
    updatedAt: timestamp
  {userId}/
    history/
      {historyId}/
        formData: object
        images: array
        createdAt: timestamp
```

### 3. Storage（儲存）

**啟用 Storage**：

1. 前往 Firebase Console → **Storage**
2. 點擊 **開始使用**
3. 選擇 **以測試模式啟動**（開發階段）
4. 選擇儲存位置（建議與 Firestore 相同）
5. 點擊 **完成**

**設定安全規則**（生產環境）：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 使用者只能上傳/讀取自己的檔案
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**儲存結構**：

```
users/
  {userId}/
    history/
      {timestamp}-{index}.{extension}
```

---

## 🔒 安全建議

1. **環境變數保護**
   - 不要將 `.env.local` 檔案提交到 Git
   - 使用部署平台的環境變數管理功能

2. **Firebase 安全規則**
   - 生產環境務必設定 Firestore 和 Storage 安全規則
   - 確保使用者只能存取自己的資料

3. **API Key 限制**
   - 在 Firebase Console → **專案設定** → **一般** → **您的應用程式**
   - 點擊應用程式 → **應用程式限制** → 設定 HTTP 參照來源限制

---

## 📚 相關文件

- [Firebase 官方文檔](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication 文檔](https://firebase.google.com/docs/auth)
- [Firestore 文檔](https://firebase.google.com/docs/firestore)
- [Firebase Storage 文檔](https://firebase.google.com/docs/storage)
- [SECURITY.md](./SECURITY.md) - 安全部署指南

---

## ✅ 檢查清單

部署前請確認：

- [ ] 已建立 Firebase 專案
- [ ] 已新增 Web 應用程式
- [ ] 已複製所有 6 個 Firebase 設定參數
- [ ] 已啟用 Authentication（Email/Password）
- [ ] 已建立 Firestore Database
- [ ] 已啟用 Storage
- [ ] 已設定 Firestore 安全規則（生產環境）
- [ ] 已設定 Storage 安全規則（生產環境）
- [ ] 所有環境變數都已正確設定


