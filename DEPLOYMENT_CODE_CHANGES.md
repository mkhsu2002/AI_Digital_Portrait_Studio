# 🔧 部署相關程式碼變更說明

## 📝 針對 GitHub Pages 和 Cloudflare Pages 的程式碼調整

### 1. Vite 配置更新 (`vite.config.ts`)

#### 變更內容
- ✅ 加入 `base` 配置支援
- ✅ 支援透過環境變數 `VITE_BASE_PATH` 設定 base path
- ✅ 優化建置設定（code splitting、source map）

#### 原因
- **GitHub Pages**：如果倉庫名稱不是 `username.github.io`，應用會部署在子路徑下（例如：`/AI_Digital_Portrait_Studio/`），需要設定 base path
- **Cloudflare Pages**：通常不需要 base path，但支援透過環境變數設定

#### 影響
- ✅ 正確處理資源路徑（CSS、JS、圖片）
- ✅ 避免 404 錯誤
- ✅ 改善建置效能（code splitting）

---

### 2. GitHub Actions Workflow 更新

#### `.github/workflows/deploy.yml`

**變更內容**：
1. ✅ 加入 `VITE_BASE_PATH` 環境變數支援
2. ✅ 自動建立 `404.html` 檔案（處理 SPA 路由）

**原因**：
- GitHub Pages 需要 `404.html` 來處理 SPA 的路由
- Base path 需要透過環境變數傳遞到建置流程

#### `.github/workflows/deploy-cloudflare.yml`

**變更內容**：
1. ✅ 加入 `VITE_BASE_PATH` 環境變數支援（預設為 `/`）

**原因**：
- 保持一致性
- 支援特殊部署需求（如自訂域名子路徑）

---

### 3. 404.html 處理

#### 變更內容
- ✅ 在 GitHub Pages 部署時自動複製 `index.html` 為 `404.html`

#### 原因
- GitHub Pages 使用 `404.html` 處理不存在的路徑
- 對於 SPA（單頁應用），所有路徑都應該導向 `index.html`

---

## 🎯 使用說明

### GitHub Pages Base Path 設定

#### 情況 1：倉庫名稱是 `username.github.io`
- **不需要設定** `VITE_BASE_PATH`
- 應用會部署在根路徑：`https://username.github.io/`

#### 情況 2：倉庫名稱不是 `username.github.io`
- **必須設定** `VITE_BASE_PATH`
- 格式：`/倉庫名稱/`（前後都要有斜線）
- 範例：如果倉庫名稱是 `AI_Digital_Portrait_Studio`，設定為 `/AI_Digital_Portrait_Studio/`
- 應用會部署在：`https://username.github.io/AI_Digital_Portrait_Studio/`

#### 設定方式
1. 前往 GitHub 倉庫 → Settings → Secrets and variables → Actions
2. 新增 Secret：
   ```
   名稱: VITE_BASE_PATH
   值: /你的倉庫名稱/
   ```

### Cloudflare Pages Base Path 設定

#### 預設情況
- **不需要設定** `VITE_BASE_PATH`（預設為 `/`）
- 應用會部署在根路徑

#### 特殊情況
- 如果使用自訂域名且設定子路徑，才需要設定
- 設定方式：在 Cloudflare Pages 專案設定中的 Environment Variables 新增 `VITE_BASE_PATH`

---

## 🔍 檢查清單

部署前請確認：

### GitHub Pages
- [ ] 已確認倉庫名稱
- [ ] 如果倉庫名稱不是 `username.github.io`，已設定 `VITE_BASE_PATH`
- [ ] 所有必要的 Secrets 都已設定
- [ ] GitHub Pages 已啟用（Settings → Pages → Source: GitHub Actions）

### Cloudflare Pages
- [ ] 所有必要的環境變數都已設定
- [ ] 建置設定正確（Build command: `npm run build`，Output directory: `dist`）
- [ ] Node.js 版本符合需求（預設 18，可在 `package.json` 中指定）

---

## 📊 程式碼變更摘要

| 檔案 | 變更類型 | 說明 |
|------|---------|------|
| `vite.config.ts` | 修改 | 加入 base path 支援和建置優化 |
| `.github/workflows/deploy.yml` | 修改 | 加入 base path 環境變數和 404.html 處理 |
| `.github/workflows/deploy-cloudflare.yml` | 修改 | 加入 base path 環境變數支援 |
| `README.md` | 修改 | 加入詳細的部署指南 |

---

## ⚠️ 注意事項

1. **Base Path 格式**
   - 必須以 `/` 開頭和結尾
   - 例如：`/AI_Digital_Portrait_Studio/` ✅
   - 錯誤：`AI_Digital_Portrait_Studio` ❌

2. **環境變數優先級**
   - GitHub Secrets 中的 `VITE_BASE_PATH` 會覆蓋預設值
   - 如果未設定，預設為 `/`

3. **測試建議**
   - 部署前先測試本地建置：`npm run build`
   - 檢查 `dist/index.html` 中的資源路徑是否正確
   - 使用 `npm run preview` 測試建置結果

---

## 🚀 快速測試

### 測試 Base Path 設定

```bash
# 設定環境變數
export VITE_BASE_PATH=/AI_Digital_Portrait_Studio/

# 建置專案
npm run build

# 檢查建置輸出
cat dist/index.html | grep -E '(href|src)='

# 應該看到路徑以 /AI_Digital_Portrait_Studio/ 開頭
```

---

## 📚 相關文檔

- [README.md](./README.md) - 主要部署指南
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
- [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md) - 故障排除指南









