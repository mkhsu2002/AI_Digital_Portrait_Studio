# 🚀 快速部署指南

## 一鍵設定自動化部署

### 步驟 1：設定 GitHub Secrets

1. 前往您的 GitHub 倉庫
2. 點擊 **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **New repository secret**
4. 新增以下 Secrets：

#### 必要設定（Firebase）
```
名稱: VITE_FIREBASE_API_KEY
值: 您的 Firebase API Key

名稱: VITE_FIREBASE_AUTH_DOMAIN
值: your-project.firebaseapp.com

名稱: VITE_FIREBASE_PROJECT_ID
值: 您的 Firebase Project ID

名稱: VITE_FIREBASE_STORAGE_BUCKET
值: your-project.appspot.com

名稱: VITE_FIREBASE_MESSAGING_SENDER_ID
值: 您的 Sender ID

名稱: VITE_FIREBASE_APP_ID
值: 您的 App ID
```

#### 可選設定（Gemini API）
```
名稱: VITE_API_KEY
值: 您的 Gemini API Key
```

### 步驟 2：選擇部署方式

#### 選項 A：GitHub Pages（最簡單）

1. 前往 **Settings** → **Pages**
2. 在 **Source** 選擇 **GitHub Actions**
3. 完成！推送程式碼到 `main` 分支即可自動部署

**注意**：GitHub Pages 會暴露 API Key 在前端程式碼中

#### 選項 B：Vercel（推薦）

1. 前往 [vercel.com](https://vercel.com) 註冊
2. 點擊 **New Project** → **Import Git Repository**
3. 選擇您的 GitHub 倉庫
4. 在 **Environment Variables** 中設定所有環境變數
5. 點擊 **Deploy**

**優點**：
- 自動 HTTPS
- 全球 CDN
- 環境變數管理更安全

#### 選項 C：Cloudflare Pages

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 選擇 **Pages** → **Create a project**
3. 連結 GitHub 倉庫
4. 在 **Environment Variables** 中設定環境變數
5. 點擊 **Save and Deploy**

### 步驟 3：推送程式碼

```bash
git add .
git commit -m "設定自動化部署"
git push origin main
```

### 步驟 4：查看部署狀態

1. 前往 GitHub 倉庫 → **Actions** 標籤
2. 查看 workflow 執行狀態
3. 等待部署完成

---

## 🔍 檢查清單

部署前請確認：

- [ ] 所有必要的 GitHub Secrets 都已設定
- [ ] `.env.local` 檔案已加入 `.gitignore`（不會被提交）
- [ ] 已選擇部署方式（GitHub Pages / Vercel / Cloudflare）
- [ ] 已測試本地建置 (`npm run build`)

---

## ⚠️ 重要提醒

### API Key 安全性

**所有部署方式都會將 API Key 暴露在前端程式碼中**，因為 Vite 會在構建時將環境變數注入到 JavaScript 檔案中。

**建議**：
1. 設定 API Key 的使用限制（配額、IP 限制）
2. 定期監控 API 使用情況
3. 考慮使用 Firebase Cloud Functions 作為 API 代理

詳細說明請參考 [SECURITY.md](./SECURITY.md)

---

## 🆘 常見問題

### Q: 部署失敗怎麼辦？
A: 
1. 檢查 GitHub Actions 日誌
2. 確認所有 Secrets 都已正確設定
3. 檢查環境變數名稱是否與 workflow 檔案中一致

### Q: 如何停用自動部署？
A: 刪除 `.github/workflows/` 目錄中對應的 workflow 檔案

### Q: 如何只部署特定分支？
A: 修改 workflow 檔案中的 `on.push.branches` 設定

---

## 📚 詳細說明

更多詳細資訊請參考：
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
- [SECURITY.md](./SECURITY.md) - 安全部署指南

