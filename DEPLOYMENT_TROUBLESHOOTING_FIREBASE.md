# Firebase 部署錯誤排除指南

## 🔴 常見錯誤：`Firebase: Error (auth/invalid-api-key)`

### 錯誤症狀

- 頁面完全空白，沒有任何內容
- 瀏覽器 Console 顯示：`Uncaught FirebaseError: Firebase: Error (auth/invalid-api-key)`
- 應用程式無法啟動

### 可能原因

1. **環境變數未正確設定**
   - 部署平台（GitHub Pages/Cloudflare Pages/Vercel）中未設定 Firebase 環境變數
   - 環境變數名稱錯誤（缺少 `VITE_` 前綴）
   - 環境變數值為空或包含多餘的空格/引號

2. **建置時環境變數未注入**
   - GitHub Actions workflow 中未正確傳遞環境變數
   - Cloudflare Pages 建置時環境變數未載入

3. **Firebase API Key 格式錯誤**
   - API Key 不完整（被截斷）
   - 複製時包含多餘的空格或換行符號
   - 使用了錯誤的 API Key（例如：使用了其他專案的 API Key）

---

## ✅ 解決步驟

### 步驟 1：檢查環境變數設定

#### GitHub Pages

1. 前往 GitHub 倉庫 → **Settings** → **Secrets and variables** → **Actions**
2. 確認以下 Secrets 都已設定：
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   ```
3. 檢查 Secret 值：
   - 點擊 Secret 名稱查看（不會顯示完整值，但可以確認是否存在）
   - 確認值不為空
   - 確認沒有多餘的空格或引號

#### Cloudflare Pages

1. 前往 Cloudflare Dashboard → **Pages** → 您的專案
2. 前往 **Settings** → **Environment Variables**
3. 確認所有 Firebase 環境變數都已設定（選擇 **Production** 環境）
4. 檢查變數值：
   - 確認值完整且正確
   - 確認沒有多餘的空格或引號
   - 確認變數名稱正確（必須以 `VITE_` 開頭）

#### Vercel

1. 前往 Vercel Dashboard → 您的專案
2. 前往 **Settings** → **Environment Variables**
3. 確認所有 Firebase 環境變數都已設定
4. 選擇正確的環境（Production/Preview/Development）

---

### 步驟 2：驗證 Firebase API Key

1. **前往 Firebase Console**
   - 前往 [Firebase Console](https://console.firebase.google.com/)
   - 選擇您的專案

2. **檢查 API Key**
   - 前往 **專案設定**（⚙️） → **一般** 標籤
   - 滾動到 **您的應用程式** 區塊
   - 選擇 Web 應用程式
   - 複製 `apiKey` 的值

3. **驗證 API Key 格式**
   - Firebase API Key 通常以 `AIza` 開頭
   - 長度約為 39 個字元
   - 確認沒有多餘的空格或換行符號

4. **重新設定環境變數**
   - 刪除舊的環境變數
   - 重新新增，確保值完整且正確

---

### 步驟 3：檢查建置日誌

#### GitHub Pages

1. 前往 GitHub 倉庫 → **Actions** 標籤
2. 點擊最新的 workflow 執行
3. 檢查 **Build** 步驟的日誌
4. 尋找以下訊息：
   - 環境變數載入訊息
   - Firebase 初始化錯誤
   - 建置錯誤

#### Cloudflare Pages

1. 前往 Cloudflare Dashboard → **Pages** → 您的專案
2. 點擊 **Deployments** 標籤
3. 點擊最新的部署
4. 查看 **Build Logs**
5. 尋找錯誤訊息

---

### 步驟 4：驗證環境變數在建置時可用

#### 方法 1：在建置腳本中加入檢查

在 `package.json` 中加入建置前檢查：

```json
{
  "scripts": {
    "prebuild": "node scripts/check-env.js",
    "build": "vite build"
  }
}
```

建立 `scripts/check-env.js`：

```javascript
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missing = requiredVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ 缺少必要的環境變數：');
  missing.forEach(key => console.error(`  - ${key}`));
  process.exit(1);
}

console.log('✅ 所有必要的環境變數都已設定');
```

#### 方法 2：在 GitHub Actions 中加入檢查

在 workflow 檔案中加入：

```yaml
- name: Check environment variables
  run: |
    if [ -z "${{ secrets.VITE_FIREBASE_API_KEY }}" ]; then
      echo "❌ VITE_FIREBASE_API_KEY 未設定"
      exit 1
    fi
    echo "✅ 環境變數檢查通過"
```

---

### 步驟 5：清除快取並重新部署

1. **清除瀏覽器快取**
   - 按 `Ctrl+Shift+Delete`（Windows）或 `Cmd+Shift+Delete`（Mac）
   - 清除快取和 Cookie

2. **清除部署平台快取**
   - **GitHub Pages**：重新觸發 workflow（推送新的 commit）
   - **Cloudflare Pages**：前往 **Settings** → **Builds & deployments** → **Clear build cache**
   - **Vercel**：前往 **Deployments** → 選擇部署 → **Redeploy**

3. **重新部署**
   - 推送新的 commit 觸發重新部署
   - 或手動觸發部署

---

## 🔍 除錯技巧

### 1. 檢查建置後的程式碼

1. 下載建置後的檔案（從部署平台下載）
2. 搜尋 `VITE_FIREBASE_API_KEY`
3. 確認環境變數是否被正確替換

### 2. 使用瀏覽器開發者工具

1. 開啟瀏覽器開發者工具（F12）
2. 前往 **Console** 標籤
3. 輸入：`import.meta.env`
4. 檢查環境變數值

### 3. 檢查網路請求

1. 開啟瀏覽器開發者工具
2. 前往 **Network** 標籤
3. 重新載入頁面
4. 檢查 Firebase 相關請求是否失敗

---

## 📋 檢查清單

部署前請確認：

- [ ] 所有 6 個 Firebase 環境變數都已設定
- [ ] 環境變數名稱正確（必須以 `VITE_` 開頭）
- [ ] 環境變數值完整且正確（沒有多餘的空格或引號）
- [ ] Firebase API Key 格式正確（以 `AIza` 開頭，約 39 個字元）
- [ ] 建置日誌中沒有錯誤訊息
- [ ] 已清除快取並重新部署
- [ ] 瀏覽器 Console 中沒有 Firebase 錯誤

---

## 🆘 仍然無法解決？

如果以上步驟都無法解決問題，請：

1. **收集錯誤資訊**
   - 截圖瀏覽器 Console 的完整錯誤訊息
   - 截圖建置日誌
   - 記錄部署平台和分支名稱

2. **檢查相關文件**
   - [FIREBASE_CONFIG_REFERENCE.md](./FIREBASE_CONFIG_REFERENCE.md) - Firebase 設定參數參考
   - [README.md](./README.md) - 部署指南
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南

3. **建立 Issue**
   - 前往 GitHub 倉庫建立 Issue
   - 提供詳細的錯誤資訊和步驟

---

## 📚 相關文件

- [Firebase 官方文檔](https://firebase.google.com/docs/web/setup)
- [Vite 環境變數文檔](https://vitejs.dev/guide/env-and-mode.html)
- [FIREBASE_CONFIG_REFERENCE.md](./FIREBASE_CONFIG_REFERENCE.md) - Firebase 設定參數參考


