# 部署設定檢查清單

## 📋 GitHub Pages 部署檢查

### ✅ 必要設定步驟

1. **建立 GitHub Actions Workflow**
   - ✅ 檔案已建立：`.github/workflows/deploy-pages.yml`
   - 確認檔案存在於倉庫中

2. **設定 GitHub Secrets**
   - 前往 GitHub 倉庫 → **Settings** → **Secrets and variables** → **Actions**
   - 確認以下 Secrets 已設定：
     - [ ] `VITE_FIREBASE_API_KEY`
     - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
     - [ ] `VITE_FIREBASE_PROJECT_ID`
     - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
     - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - [ ] `VITE_FIREBASE_APP_ID`
     - [ ] `VITE_API_KEY`（可選）
     - [ ] `VITE_BASE_PATH`（如果倉庫名稱不是 `username.github.io`）

3. **啟用 GitHub Pages**
   - 前往 **Settings** → **Pages**
   - 確認 **Source** 選擇為 **GitHub Actions**
   - 確認 **Branch** 設定為 `main`
   - 儲存設定

4. **檢查部署狀態**
   - 前往 **Actions** 標籤
   - 查看最新的 "Deploy to GitHub Pages" 工作流程
   - 確認是否有錯誤訊息

### 🔍 常見問題排查

#### 問題 1：工作流程沒有觸發
**可能原因**：
- 檔案路徑錯誤（應為 `.github/workflows/deploy-pages.yml`）
- 分支名稱不是 `main`
- 工作流程語法錯誤

**解決方法**：
```bash
# 確認檔案存在
ls -la .github/workflows/deploy-pages.yml

# 檢查 YAML 語法
# 可以在 GitHub Actions 頁面查看錯誤訊息
```

#### 問題 2：建置失敗
**可能原因**：
- 缺少必要的環境變數
- Node.js 版本不匹配
- 依賴安裝失敗

**解決方法**：
- 檢查 GitHub Secrets 是否全部設定
- 確認 `package.json` 中的 Node.js 版本要求
- 查看 Actions 日誌中的錯誤訊息

#### 問題 3：部署成功但網站無法訪問
**可能原因**：
- `VITE_BASE_PATH` 設定錯誤
- GitHub Pages 設定錯誤
- 路由問題

**解決方法**：
- 確認 `VITE_BASE_PATH` 是否正確設定
  - 如果倉庫名稱是 `AI_Digital_Portrait_Studio`，應設定為 `/AI_Digital_Portrait_Studio/`
  - 如果倉庫名稱是 `username.github.io`，應設定為 `/` 或留空
- 檢查 GitHub Pages 設定中的 URL
- 確認 `vite.config.ts` 中的 `base` 設定

---

## 📋 Vercel 部署檢查

### ✅ 必要設定步驟

1. **建立 Vercel 專案**
   - 前往 [Vercel Dashboard](https://vercel.com/dashboard)
   - 點擊 **Add New Project**
   - 選擇 GitHub 倉庫
   - 確認專案已連結

2. **設定環境變數**
   - 在 Vercel Dashboard → 專案 → **Settings** → **Environment Variables**
   - 新增以下環境變數：
     - [ ] `VITE_FIREBASE_API_KEY`
     - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
     - [ ] `VITE_FIREBASE_PROJECT_ID`
     - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
     - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - [ ] `VITE_FIREBASE_APP_ID`
     - [ ] `VITE_API_KEY`（可選）

3. **設定 GitHub Secrets（用於自動部署）**
   - 前往 GitHub 倉庫 → **Settings** → **Secrets and variables** → **Actions**
   - 取得 Vercel Token：
     - 前往 Vercel Dashboard → **Settings** → **Tokens**
     - 建立新的 Token
   - 取得 Vercel Project ID：
     - 前往 Vercel Dashboard → 專案 → **Settings** → **General**
     - 複製 **Project ID**
   - 取得 Vercel Org ID：
     - 前往 Vercel Dashboard → **Settings** → **General**
     - 複製 **Team ID**（或個人帳號的 ID）
   - 在 GitHub Secrets 中新增：
     - [ ] `VERCEL_TOKEN`
     - [ ] `VERCEL_ORG_ID`
     - [ ] `VERCEL_PROJECT_ID`

4. **確認配置檔案**
   - ✅ `vercel.json` 已建立
   - 確認檔案內容正確

5. **檢查部署狀態**
   - 前往 **Actions** 標籤
   - 查看最新的 "Deploy to Vercel" 工作流程
   - 或在 Vercel Dashboard 查看部署狀態

### 🔍 常見問題排查

#### 問題 1：Vercel CLI 認證失敗
**可能原因**：
- `VERCEL_TOKEN` 無效或過期
- `VERCEL_ORG_ID` 或 `VERCEL_PROJECT_ID` 錯誤

**解決方法**：
- 重新產生 Vercel Token
- 確認 Org ID 和 Project ID 正確
- 檢查 Token 權限是否足夠

#### 問題 2：環境變數未正確載入
**可能原因**：
- 環境變數未在 Vercel Dashboard 中設定
- 環境變數名稱錯誤（必須以 `VITE_` 開頭）

**解決方法**：
- 在 Vercel Dashboard 中確認所有環境變數已設定
- 確認變數名稱完全正確
- 重新部署專案

#### 問題 3：建置失敗
**可能原因**：
- Node.js 版本不匹配
- 依賴安裝失敗
- 建置指令錯誤

**解決方法**：
- 檢查 `vercel.json` 中的設定
- 確認 `package.json` 中的腳本正確
- 查看 Vercel 部署日誌

---

## 🔧 快速修復指令

### 測試 GitHub Pages 部署
```bash
# 1. 確認工作流程檔案存在
ls -la .github/workflows/deploy-pages.yml

# 2. 檢查 YAML 語法（需要安裝 yamllint）
yamllint .github/workflows/deploy-pages.yml

# 3. 手動觸發部署
# 在 GitHub Actions 頁面點擊 "Run workflow"
```

### 測試 Vercel 部署
```bash
# 1. 確認配置檔案存在
ls -la vercel.json

# 2. 本地測試 Vercel 部署
npm install -g vercel
vercel login
vercel --prod
```

---

## 📝 檢查清單總結

### GitHub Pages
- [ ] `.github/workflows/deploy-pages.yml` 檔案存在
- [ ] 所有必要的 GitHub Secrets 已設定
- [ ] GitHub Pages 已啟用並設定為 GitHub Actions
- [ ] `VITE_BASE_PATH` 正確設定（如果需要）
- [ ] 最新推送已觸發部署工作流程

### Vercel
- [ ] `.github/workflows/deploy-vercel.yml` 檔案存在
- [ ] `vercel.json` 檔案存在
- [ ] Vercel 專案已建立並連結 GitHub 倉庫
- [ ] 所有環境變數已在 Vercel Dashboard 中設定
- [ ] GitHub Secrets（VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID）已設定
- [ ] 最新推送已觸發部署工作流程

---

**最後更新**：2025-01-27

