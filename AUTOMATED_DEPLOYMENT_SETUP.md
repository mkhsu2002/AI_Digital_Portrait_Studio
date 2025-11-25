# 🤖 自動化部署設定完成

## ✅ 已設定的功能

### GitHub Actions Workflows

已建立以下自動化工作流程：

1. **`.github/workflows/ci.yml`** - CI 檢查
   - 每次推送或 PR 時執行
   - 執行 Lint 檢查
   - 執行建置測試

2. **`.github/workflows/deploy.yml`** - GitHub Pages 部署
   - 推送 to `main` 分支時自動部署
   - 包含 Lint、建置、部署步驟

3. **`.github/workflows/deploy-vercel.yml`** - Vercel 部署
   - 推送 to `main` 分支時自動部署到 Vercel

4. **`.github/workflows/deploy-cloudflare.yml`** - Cloudflare Pages 部署
   - 推送 to `main` 分支時自動部署到 Cloudflare

5. **`.github/workflows/auto-format.yml`** - PR 格式檢查
   - PR 時自動檢查程式碼格式

### GitHub 模板

- **Pull Request 模板** - `.github/PULL_REQUEST_TEMPLATE.md`
- **Issue 模板** - Bug 回報和功能建議
- **Dependabot 設定** - 自動更新依賴

---

## 🚀 快速開始

### 步驟 1：設定 GitHub Secrets

前往 GitHub 倉庫 → **Settings** → **Secrets and variables** → **Actions**

新增以下 Secrets：

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_API_KEY (可選)
```

### 步驟 2：啟用 GitHub Pages（如果使用）

1. 前往 **Settings** → **Pages**
2. 選擇 **Source: GitHub Actions**
3. 完成！

### 步驟 3：推送程式碼

```bash
git add .
git commit -m "設定自動化部署"
git push origin main
```

### 步驟 4：查看部署狀態

前往 **Actions** 標籤查看部署進度。

---

## 📋 工作流程說明

### 當您推送程式碼到 `main` 分支時：

1. **自動觸發 CI**
   - ✅ 執行 ESLint 檢查
   - ✅ 檢查程式碼格式
   - ✅ 執行建置測試

2. **自動部署**
   - ✅ GitHub Pages（如果啟用）
   - ✅ Vercel（如果設定 Secrets）
   - ✅ Cloudflare（如果設定 Secrets）

### 當您建立 PR 時：

1. **自動檢查**
   - ✅ 執行 Lint
   - ✅ 檢查格式
   - ✅ 建置測試

---

## 🔧 自訂設定

### 只啟用特定部署方式

**只使用 GitHub Pages**：
- 保留 `.github/workflows/deploy.yml`
- 刪除其他 deploy workflow 檔案

**只使用 Vercel**：
- 保留 `.github/workflows/deploy-vercel.yml`
- 刪除其他 deploy workflow 檔案

**只使用 Cloudflare**：
- 保留 `.github/workflows/deploy-cloudflare.yml`
- 刪除其他 deploy workflow 檔案

### 修改觸發條件

編輯 workflow 檔案中的 `on:` 區塊：

```yaml
on:
  push:
    branches:
      - main
      - develop  # 新增其他分支
```

---

## 📊 監控部署

### 查看部署狀態

1. 前往 GitHub 倉庫
2. 點擊 **Actions** 標籤
3. 查看 workflow 執行狀態

### 查看部署日誌

1. 點擊特定的 workflow run
2. 展開各個步驟
3. 查看詳細日誌

### 部署失敗時

1. 檢查 Actions 日誌中的錯誤訊息
2. 確認所有 Secrets 都已設定
3. 檢查環境變數名稱是否正確

---

## ⚠️ 重要提醒

### API Key 安全性

**所有部署方式都會將環境變數注入到前端程式碼中**，這意味著：

- ⚠️ API Key 會出現在構建後的 JavaScript 檔案中
- ⚠️ 任何人都可以在瀏覽器中查看
- ✅ **建議**：使用 Firebase Cloud Functions 作為 API 代理

### 最佳實踐

1. ✅ 使用 GitHub Secrets 管理敏感資訊
2. ✅ 設定 API Key 的使用限制
3. ✅ 定期監控 API 使用情況
4. ✅ 準備隨時撤銷和重新生成 API Key

---

## 📚 相關文檔

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
- [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) - 快速開始指南
- [SECURITY.md](./SECURITY.md) - 安全部署指南

---

## ✨ 完成！

現在當您推送程式碼到 GitHub 時，會自動：
- ✅ 執行 Lint 檢查
- ✅ 建置專案
- ✅ 部署到選擇的平台

享受自動化部署的便利吧！🎉







