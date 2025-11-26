# Firebase Storage CORS 設定指南

## 🔧 問題說明

當從 Firebase Storage 下載圖片時遇到 CORS 錯誤，這是因為 Firebase Storage 預設不允許跨域請求。需要設定 CORS 規則來允許圖片下載。

## ✅ 解決方案：設定 Firebase Storage CORS 規則

### 方法 1：使用 gsutil 命令列工具（推薦）

#### 步驟 1：安裝 gsutil

**macOS/Linux：**
```bash
# 使用 Homebrew 安裝
brew install gsutil

# 或使用 pip
pip install gsutil
```

**Windows：**
- 下載並安裝 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

#### 步驟 2：登入 Google Cloud

```bash
gcloud auth login
```

#### 步驟 3：建立 CORS 設定檔案

建立一個名為 `cors.json` 的檔案：

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
```

**更安全的設定（限制特定網域）：**
```json
[
  {
    "origin": [
      "https://portrait.icareu.tw",
      "https://your-username.github.io",
      "https://your-project.pages.dev",
      "http://localhost:3000"
    ],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
```

#### 步驟 4：應用 CORS 設定

```bash
# 替換 your-bucket-name 為您的 Firebase Storage 儲存桶名稱
# 儲存桶名稱格式通常是：your-project-id.appspot.com
gsutil cors set cors.json gs://your-bucket-name
```

**範例：**
```bash
gsutil cors set cors.json gs://makegmailnews.firebasestorage.app
```

#### 步驟 5：驗證設定

```bash
gsutil cors get gs://your-bucket-name
```

### 方法 2：使用 Firebase Console（如果可用）

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案
3. 前往 **Storage** → **Rules**
4. 確認規則允許讀取：
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;  // 允許公開讀取
         allow write: if request.auth != null;  // 僅允許已認證使用者寫入
       }
     }
   }
   ```

**注意**：Firebase Console 可能不提供 CORS 設定介面，建議使用方法 1。

---

## 🔍 檢查 CORS 設定

### 使用瀏覽器開發者工具檢查

1. 開啟瀏覽器開發者工具（F12）
2. 前往 **Network**（網路）標籤
3. 嘗試下載圖片
4. 檢查請求的 **Response Headers**：
   - 應該看到 `Access-Control-Allow-Origin: *` 或您的網域
   - 應該看到 `Access-Control-Allow-Methods: GET, HEAD`

### 使用 curl 測試

```bash
curl -I "https://firebasestorage.googleapis.com/v0/b/your-bucket/o/path/to/image.png?alt=media&token=..."
```

檢查回應標頭中是否包含：
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, HEAD`

---

## 🛠️ 程式碼層面的解決方案

即使設定了 CORS，程式碼中也已經實作了多層級的 fallback 策略：

1. **優先使用 Firebase Storage SDK**：使用 `getBytes` API 下載，完全繞過 CORS
2. **Fallback 到 fetch**：如果 SDK 不可用，嘗試直接 fetch
3. **Fallback 到 Canvas**：如果 fetch 失敗，使用 Canvas 方式載入圖片

這些策略已經實作在 `utils/imageUtils.ts` 的 `downloadImageFromFirebaseStorage` 函數中。

---

## 📝 常見問題

### Q: 設定 CORS 後仍然無法下載？

**A:** 檢查以下項目：
1. 確認 CORS 設定已正確應用（使用 `gsutil cors get` 檢查）
2. 確認 Firebase Storage 規則允許讀取
3. 清除瀏覽器快取後重試
4. 檢查圖片 URL 是否正確

### Q: 如何找到我的 Firebase Storage 儲存桶名稱？

**A:** 
1. 前往 Firebase Console → Storage
2. 查看 URL 或設定頁面
3. 或查看環境變數 `VITE_FIREBASE_STORAGE_BUCKET` 的值

### Q: 設定 `origin: ["*"]` 是否安全？

**A:** 
- `origin: ["*"]` 允許所有網域存取，適合公開資源
- 如果圖片是公開的，這是安全的
- 如果需要限制存取，請使用特定網域列表

---

## 🚀 快速設定指令

```bash
# 1. 建立 CORS 設定檔案
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
EOF

# 2. 應用設定（替換 your-bucket-name）
gsutil cors set cors.json gs://your-bucket-name

# 3. 驗證設定
gsutil cors get gs://your-bucket-name
```

---

**最後更新**：2025-01-27

