# Cloudflare Pages 部署設定指南

本指南說明如何在 Cloudflare Pages 上部署本專案。

---

## 📋 建置設定

在 Cloudflare Pages 設定頁面中，設定以下欄位：

| 設定項目 | 值 |
|---------|---|
| **組建命令（Build Command）** | `npm run build` |
| **組建輸出（Build Output）** | `dist` |
| **根目錄（Root Directory）** | `/`（或留空） |
| **組建系統版本** | 版本 3（建議） |

---

## 🔧 環境變數設定

### ⚠️ 重要說明

**Cloudflare Pages 不會自動填入環境變數**，您需要手動在 Cloudflare Dashboard 中設定。

### 設定位置

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左側選單選擇 **Pages**
3. 點擊您的專案名稱
4. 前往 **Settings**（設定）標籤
5. 滾動到 **Environment Variables**（環境變數）區塊

### 新增環境變數

1. 點擊 **Add variable**（新增變數）
2. 選擇環境：**Production**（生產環境）
3. 輸入變數名稱和值
4. 點擊 **Save**（儲存）

### 必要變數（Firebase）

請依序新增以下 **6 個必要變數**：

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase 認證網域 | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 專案 ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage 儲存桶 | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase 訊息發送者 ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase 應用程式 ID | `1:123456789012:web:abcdef123456` |

### 可選變數

| 變數名稱 | 值 | 說明 |
|---------|---|------|
| `VITE_API_KEY` | 你的 Gemini API Key | 可選，也可透過登入後首頁手動輸入 |
| `VITE_BASE_PATH` | `/` | 除非使用自訂域名且設定子路徑，否則保持為 `/` |

### 取得 Firebase 設定參數

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案
3. 點擊 **專案設定**（⚙️ 圖示）→ **一般** 標籤
4. 滾動到 **您的應用程式** 區塊
5. 選擇 Web 應用程式（或建立新的）
6. 複製 Firebase 設定物件中的參數值

---

## 🚀 部署流程

### 分支控制

- **生產分支**：`main`
- **自動部署**：已啟用 ✅

### 自動部署（推薦）

1. 推送程式碼到 `main` 分支
2. Cloudflare Pages 會自動觸發建置和部署
3. 部署完成後，應用會自動發布

### 手動部署

1. 前往 Cloudflare Dashboard → Pages → 您的專案
2. 點擊 **建立部署**（Create Deployment）
3. 選擇分支和提交

---

## ✅ 部署檢查清單

部署前請確認：

- [ ] 組建命令：`npm run build`
- [ ] 組建輸出：`dist`
- [ ] 所有 6 個 Firebase 環境變數都已設定
- [ ] 變數名稱完全正確（必須以 `VITE_` 開頭）
- [ ] 變數值完整且正確（沒有多餘的空格或引號）
- [ ] 環境選擇為 **Production**（生產環境）
- [ ] `VITE_BASE_PATH` 設為 `/`
- [ ] 生產分支：`main`
- [ ] 自動部署：已啟用

---

## ⚠️ 故障排除

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
- 變數名稱錯誤
- 未選擇正確的環境

**解決方案**：
1. 確認變數名稱完全正確（必須以 `VITE_` 開頭）
2. 確認選擇 **Production** 環境
3. 重新部署以套用變更

### 常見變數名稱錯誤

| 錯誤範例 | 正確範例 |
|---------|---------|
| `FIREBASE_API_KEY` ❌ | `VITE_FIREBASE_API_KEY` ✅ |
| `VITE_FIREBASE_APIKEY` ❌ | `VITE_FIREBASE_API_KEY` ✅ |
| ` AIzaSy... ` ❌（前後有空格） | `AIzaSy...` ✅ |
| `"AIzaSy..."` ❌（包含引號） | `AIzaSy...` ✅ |

---

## 🔍 查看部署狀態

1. 前往 Cloudflare Dashboard → Pages → 您的專案
2. 點擊 **Deployments**（部署）標籤
3. 查看最新的部署狀態和日誌

---

## 📚 相關文檔

- [Cloudflare Pages 官方文檔](https://developers.cloudflare.com/pages/)
- [SECURITY.md](./SECURITY.md) - 安全部署指南

