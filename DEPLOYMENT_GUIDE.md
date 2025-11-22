# 🚀 自動化部署指南

本專案已設定 GitHub Actions 自動化部署流程。當您推送程式碼到 GitHub 時，會自動執行建置和部署。

---

## 📋 部署選項

專案提供了三種部署方式的 GitHub Actions workflow：

### 1. GitHub Pages（預設）
**檔案**：`.github/workflows/deploy.yml`

**特點**：
- ✅ 免費
- ✅ 自動部署到 `https://<username>.github.io/<repository-name>`
- ⚠️ 注意：GitHub Pages 會暴露所有環境變數在前端程式碼中

**設定步驟**：
1. 前往 GitHub 倉庫 → Settings → Pages
2. 選擇 Source: "GitHub Actions"
3. 在 Settings → Secrets and variables → Actions 中設定以下 Secrets：
   - `VITE_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### 2. Vercel（推薦）
**檔案**：`.github/workflows/deploy-vercel.yml`

**特點**：
- ✅ 免費方案
- ✅ 自動 HTTPS
- ✅ 全球 CDN
- ✅ 環境變數管理更安全

**設定步驟**：
1. 前往 [Vercel](https://vercel.com) 註冊帳號
2. 連結 GitHub 倉庫
3. 在 Vercel Dashboard 中設定環境變數
4. 取得 Vercel Token 和 Project ID
5. 在 GitHub Secrets 中設定：
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### 3. Cloudflare Pages
**檔案**：`.github/workflows/deploy-cloudflare.yml`

**特點**：
- ✅ 免費方案
- ✅ 快速 CDN
- ✅ 環境變數管理

**設定步驟**：
1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 建立 Pages 專案
3. 取得 API Token 和 Account ID
4. 在 GitHub Secrets 中設定：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_PROJECT_NAME`

---

## 🔧 設定 GitHub Secrets

### 步驟 1：前往 Secrets 設定頁面
1. 開啟 GitHub 倉庫
2. 點擊 **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **New repository secret**

### 步驟 2：新增必要的 Secrets

#### Firebase 設定（必要）
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Gemini API Key（可選，但建議設定）
```
VITE_API_KEY=your_gemini_api_key
```

#### Vercel（如果使用 Vercel 部署）
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

#### Cloudflare（如果使用 Cloudflare 部署）
```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_PROJECT_NAME=your_project_name
```

---

## 🚀 自動部署流程

### 當您推送程式碼到 `main` 分支時：

1. **自動觸發 CI/CD**
   - 執行 Lint 檢查
   - 執行建置測試
   - 建置專案

2. **自動部署**
   - GitHub Pages：自動部署到 `gh-pages` 分支
   - Vercel：自動部署到生產環境
   - Cloudflare：自動部署到 Pages

### 工作流程狀態
- 前往 GitHub 倉庫 → **Actions** 標籤
- 查看每次推送的執行狀態
- 查看建置日誌和錯誤訊息

---

## 📝 使用方式

### 啟用特定部署方式

#### 啟用 GitHub Pages
1. 確保 `.github/workflows/deploy.yml` 存在
2. 在 GitHub 設定中啟用 Pages
3. 推送程式碼到 `main` 分支

#### 啟用 Vercel
1. 確保 `.github/workflows/deploy-vercel.yml` 存在
2. 設定 Vercel Secrets
3. 推送程式碼到 `main` 分支

#### 啟用 Cloudflare
1. 確保 `.github/workflows/deploy-cloudflare.yml` 存在
2. 設定 Cloudflare Secrets
3. 推送程式碼到 `main` 分支

### 停用特定部署方式
刪除或重新命名對應的 workflow 檔案即可。

---

## ⚠️ 重要安全提醒

### API Key 安全性

**GitHub Pages 部署**：
- ⚠️ **所有環境變數都會暴露在前端程式碼中**
- ⚠️ 任何人都可以在瀏覽器中查看您的 API Key
- ✅ **建議**：使用 Firebase Cloud Functions 作為 API 代理

**Vercel/Cloudflare 部署**：
- ✅ 環境變數在構建時注入，但仍會出現在前端程式碼中
- ✅ 建議設定 API Key 的使用限制
- ✅ 定期輪換 API Key

### 最佳實踐
1. **不要**在公開倉庫中提交 `.env` 檔案
2. **使用** GitHub Secrets 管理敏感資訊
3. **設定** API Key 的使用限制（配額、IP 限制）
4. **監控** API 使用情況
5. **準備**隨時撤銷和重新生成 API Key

---

## 🔍 故障排除

### 建置失敗
1. 檢查 GitHub Actions 日誌
2. 確認所有必要的 Secrets 都已設定
3. 檢查環境變數名稱是否正確

### 部署失敗
1. 確認部署平台的權限設定
2. 檢查 API Token 是否有效
3. 查看部署日誌中的錯誤訊息

### 環境變數未生效
1. 確認 Secrets 名稱與 workflow 檔案中的名稱一致
2. 重新觸發 workflow（可以推送一個空 commit）
3. 檢查環境變數是否正確設定

---

## 📚 相關資源

- [GitHub Actions 文件](https://docs.github.com/en/actions)
- [GitHub Pages 文件](https://docs.github.com/en/pages)
- [Vercel 文件](https://vercel.com/docs)
- [Cloudflare Pages 文件](https://developers.cloudflare.com/pages)

---

## 💡 建議

1. **優先使用 Vercel**：對 Vite 專案支援最好，設定最簡單
2. **設定環境變數限制**：在 Google Cloud Console 中設定 API Key 限制
3. **監控部署狀態**：定期檢查 Actions 執行結果
4. **使用分支保護**：設定 main 分支保護規則，確保程式碼品質

