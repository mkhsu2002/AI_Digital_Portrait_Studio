# GitHub Pages 設定指南

## ⚠️ 重要：啟用 GitHub Pages

如果遇到 "Get Pages site failed" 錯誤，請按照以下步驟啟用 GitHub Pages：

### 步驟 1：啟用 GitHub Pages

1. 前往 GitHub 倉庫頁面
2. 點擊 **Settings**（設定）
3. 在左側選單中找到 **Pages**（頁面）
4. 在 **Source**（來源）區塊：
   - 選擇 **GitHub Actions**（不是 Branch）
   - 確認 **Branch** 設定為 `main`（如果顯示）
5. 點擊 **Save**（儲存）

### 步驟 2：確認 Secrets 已設定

前往 **Settings** → **Secrets and variables** → **Actions**，確認以下 Secrets 已設定：

- ✅ `VITE_FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `VITE_FIREBASE_APP_ID`
- ✅ `VITE_BASE_PATH`（如果倉庫名稱不是 `username.github.io`）

### 步驟 3：檢查部署狀態

1. 前往 **Actions** 標籤
2. 查看最新的 "Deploy to GitHub Pages" 工作流程
3. 確認部署是否成功

### 步驟 4：訪問您的網站

部署成功後，網站會發布到：
- 如果倉庫名稱是 `username.github.io`：`https://username.github.io`
- 如果倉庫名稱是其他名稱：`https://username.github.io/repository-name`

---

## 🔧 故障排除

### 問題：仍然顯示 "Get Pages site failed"

**解決方法**：
1. 確認已按照步驟 1 啟用 GitHub Pages
2. 確認 Source 選擇的是 **GitHub Actions**（不是 Branch）
3. 等待幾分鐘後重新觸發部署（推送一個空 commit 或手動觸發）

### 問題：部署成功但網站顯示 404

**可能原因**：`VITE_BASE_PATH` 設定錯誤

**解決方法**：
- 如果倉庫名稱是 `AI_Digital_Portrait_Studio`，設定 `VITE_BASE_PATH=/AI_Digital_Portrait_Studio/`
- 注意：前後都要有斜線 `/`
- 如果倉庫名稱是 `username.github.io`，設定 `VITE_BASE_PATH=/` 或留空

### 問題：資源載入失敗（CSS/JS 404）

**解決方法**：
- 檢查 `VITE_BASE_PATH` 是否正確設定
- 確認建置輸出中的資源路徑是否正確
- 清除瀏覽器快取後重新載入

---

**最後更新**：2025-01-27

