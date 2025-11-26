# 🔧 部署故障排除指南

## GitHub Pages 常見問題

### 問題 1：頁面顯示空白或 404

**原因**：
- 倉庫名稱不是 `username.github.io`，但沒有設定 `VITE_BASE_PATH`
- 路徑不正確

**解決方案**：

1. **確認倉庫名稱**
   - 如果倉庫名稱是 `AI_Digital_Portrait_Studio`，需要在 GitHub Secrets 中設定：
     ```
     VITE_BASE_PATH=/AI_Digital_Portrait_Studio/
     ```
   - 注意：前後都要有斜線 `/`

2. **檢查 GitHub Pages 設定**
   - 前往 Settings → Pages
   - 確認 Source 選擇的是 "GitHub Actions"
   - 確認分支是 `main`

3. **重新部署**
   ```bash
   # 推送一個空 commit 觸發重新部署
   git commit --allow-empty -m "觸發重新部署"
   git push origin main
   ```

### 問題 2：資源載入失敗（CSS/JS 404）

**原因**：
- Base path 設定不正確
- 建置時沒有使用正確的 base path

**解決方案**：

1. **檢查 vite.config.ts**
   - 確認 `base` 設定正確
   - 確認環境變數 `VITE_BASE_PATH` 已傳遞到建置流程

2. **檢查建置輸出**
   - 查看 `dist/index.html` 中的資源路徑
   - 應該以 base path 開頭（例如：`/AI_Digital_Portrait_Studio/assets/...`）

### 問題 3：環境變數未生效

**原因**：
- Secrets 名稱錯誤
- 環境變數未正確傳遞到建置流程

**解決方案**：

1. **檢查 Secrets 名稱**
   - 確認與 workflow 檔案中的名稱完全一致
   - 注意大小寫

2. **檢查 Actions 日誌**
   - 前往 Actions → 點擊失敗的 workflow
   - 查看 Build 步驟的日誌
   - 確認環境變數是否正確傳遞

---

## Cloudflare Pages 常見問題

### 問題 1：建置失敗

**原因**：
- 環境變數未設定
- Node.js 版本不匹配
- 依賴安裝失敗

**解決方案**：

1. **檢查環境變數**
   - 前往 Cloudflare Dashboard → Pages → 專案 → Settings → Environment Variables
   - 確認所有必要的環境變數都已設定

2. **檢查建置設定**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`（預設）

3. **檢查 Node.js 版本**
   - Cloudflare Pages 預設使用 Node.js 18
   - 如果需要特定版本，可以在 `package.json` 中指定：
     ```json
     {
       "engines": {
         "node": ">=20.0.0"
       }
     }
     ```

### 問題 2：部署後功能異常

**原因**：
- 環境變數未正確設定
- API Key 限制導致請求失敗

**解決方案**：

1. **檢查瀏覽器 Console**
   - 開啟開發者工具
   - 查看是否有錯誤訊息

2. **檢查環境變數**
   - 確認所有環境變數都已正確設定
   - 確認 API Key 有效且有足夠配額

3. **檢查 API Key 限制**
   - 前往 Google Cloud Console
   - 檢查 API Key 的使用限制
   - 確認沒有 IP 或 referrer 限制

---

## 通用問題

### 問題 1：建置時間過長

**原因**：
- 依賴過多
- 沒有使用快取

**解決方案**：

1. **使用 npm ci 而非 npm install**
   - GitHub Actions 已使用 `npm ci`
   - 確保 `package-lock.json` 已提交

2. **啟用快取**
   - GitHub Actions workflow 已啟用 npm 快取
   - Cloudflare Pages 會自動快取 node_modules

### 問題 2：部署後 API 呼叫失敗

**原因**：
- API Key 未設定或無效
- API Key 使用限制

**解決方案**：

1. **檢查 API Key**
   - 確認 API Key 已正確設定
   - 確認 API Key 有效且有配額

2. **檢查 API Key 限制**
   - 確認沒有設定 HTTP referrer 限制
   - 確認 IP 限制不會阻擋部署平台的 IP

### 問題 3：圖片無法顯示

**原因**：
- Base path 設定不正確
- 圖片路徑錯誤

**解決方案**：

1. **檢查圖片路徑**
   - 確認使用相對路徑或正確的 base path
   - 檢查瀏覽器 Network 標籤查看實際請求的 URL

2. **檢查 Firebase Storage**
   - 確認 Firebase Storage 規則允許讀取
   - 確認圖片 URL 正確

---

## 檢查清單

部署前請確認：

- [ ] 所有環境變數都已設定
- [ ] Base path 設定正確（GitHub Pages）
- [ ] 建置設定正確（Cloudflare Pages）
- [ ] 已測試本地建置 (`npm run build`)
- [ ] 已檢查建置輸出 (`dist/` 目錄)
- [ ] API Key 有效且有配額
- [ ] Firebase 設定正確

---

## 取得協助

如果問題仍然存在：

1. **查看日誌**
   - GitHub Actions: Actions 標籤 → 點擊失敗的 workflow
   - Cloudflare Pages: Dashboard → Pages → 專案 → Deployments → 點擊失敗的部署

2. **檢查文檔**
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
   - [SECURITY.md](./SECURITY.md)

3. **建立 Issue**
   - 使用 GitHub Issues 回報問題
   - 附上相關日誌和錯誤訊息









