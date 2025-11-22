# Cloudflare Pages 部署設定指南

## 📋 Cloudflare Pages 建置設定

根據您的 Cloudflare Pages 設定頁面，請按照以下步驟設定：

### 1. 組建組態（Build Configuration）

在 Cloudflare Pages 設定頁面中，設定以下欄位：

#### 組建命令（Build Command）
```
npm run build
```

#### 組建輸出（Build Output）
```
dist
```

#### 根目錄（Root Directory）
```
/
```
（留空也可以，預設就是根目錄）

---

### 2. 環境變數設定

前往 **變數和祕密**（Variables and Secrets）區塊，新增以下環境變數：

#### 必要變數（Firebase）
```
VITE_FIREBASE_API_KEY = 你的_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN = xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = 你的_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET = 你的_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID = 你的_SENDER_ID
VITE_FIREBASE_APP_ID = 你的_APP_ID
```

#### 可選變數（Gemini API）
```
VITE_API_KEY = 你的_GEMINI_API_KEY
```

#### Base Path（重要）
```
VITE_BASE_PATH = /
```
**注意**：Cloudflare Pages 通常不需要 base path，設定為 `/` 即可。只有在使用自訂域名且設定子路徑時才需要修改。

---

### 3. 分支控制

- **生產分支**：`main`
- **自動部署**：已啟用 ✅

---

### 4. 組建系統版本

建議使用 **版本 3**（已顯示在您的設定中）

---

## 🚀 部署流程

### 自動部署（推薦）

1. 推送程式碼到 `main` 分支
2. Cloudflare Pages 會自動觸發建置和部署
3. 部署完成後，應用會自動發布

### 手動部署

如果需要手動觸發部署：
1. 前往 Cloudflare Dashboard → Pages → 您的專案
2. 點擊 **建立部署**（Create Deployment）
3. 選擇分支和提交

---

## ⚠️ 常見問題

### 問題 1：建置失敗

**原因**：
- 環境變數未設定
- 建置命令或輸出目錄設定錯誤

**解決方案**：
1. 檢查所有環境變數是否都已設定
2. 確認建置命令：`npm run build`
3. 確認建置輸出：`dist`

### 問題 2：部署後頁面空白

**原因**：
- Base path 設定不正確
- 資源路徑錯誤

**解決方案**：
1. 確認 `VITE_BASE_PATH` 設為 `/`
2. 清除瀏覽器快取
3. 檢查建置日誌中的錯誤訊息

### 問題 3：環境變數未生效

**原因**：
- 環境變數名稱錯誤
- 未選擇正確的環境（生產/預覽）

**解決方案**：
1. 確認環境變數名稱與程式碼中使用的完全一致
2. 確認選擇的環境是「生產」（Production）
3. 重新部署以套用變更

---

## 📊 檢查清單

部署前請確認：

- [ ] 組建命令：`npm run build`
- [ ] 組建輸出：`dist`
- [ ] 根目錄：`/`（或留空）
- [ ] 所有必要的環境變數都已設定
- [ ] `VITE_BASE_PATH` 設為 `/`
- [ ] 生產分支：`main`
- [ ] 自動部署：已啟用

---

## 🔍 查看部署狀態

1. 前往 Cloudflare Dashboard → Pages → 您的專案
2. 點擊 **部署**（Deployments）標籤
3. 查看最新的部署狀態和日誌

---

## 📚 相關文檔

- [Cloudflare Pages 官方文檔](https://developers.cloudflare.com/pages/)
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
- [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md) - 故障排除指南

