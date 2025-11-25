# AI Digital Portrait Studio

**版本：v3.5** | [v3.0 穩定版（stablev3.0 分支）](https://github.com/mkhsu2002/AI_Digital_Portrait_Studio/tree/stablev3.0)

「電商人像攝影棚」是一套基於 React + Vite 的網頁應用，整合 Google Gemini 影像模型與 Firebase 服務，協助品牌快速生成多視角的人像商品圖。專案已開源，歡迎自行部署並依需求調整。
英語說明（English Guide）：[README.en.md](./README.en.md)

## 核心功能

- **多視角影像生成**：一次產出全身、半身、特寫三張圖，並自動套用選定的長寬比。
- **可選參考素材**：支援上傳人物臉孔與商品物件，強化生成一致性。
- **歷史紀錄與還原**：每位登入使用者可保留最近 5 筆生成紀錄，一鍵載入設定。
- **動態影像延伸**：可將任一張圖轉交 Gemini Veo 產生 720p 動態影像。
- **完善帳號體驗**：Firebase Authentication 提供註冊、登入、忘記密碼流程，同時顯示剩餘生成次數。

## 技術概覽

- React 19、TypeScript、Vite 6
- Firebase Authentication、Firestore、Storage
- Google Gemini `gemini-2.5-flash-image` / Veo `veo-3.1-fast-generate-preview`
- Tailwind 風格的原子化樣式（以 `className` 直接撰寫）

## 本地部署流程

1. **取得程式碼**
   ```bash
   git clone https://github.com/mkhsu2002/AI_Digital_Portrait_Studio.git
   cd AI_Digital_Portrait_Studio
   ```
2. **安裝依賴**
   ```bash
   npm install
   ```
3. **設定環境變數**（於專案根目錄建立 `.env.local`）
   ```dotenv
   # Gemini API Key（可選，也可透過瀏覽器擴充功能提供）
   VITE_API_KEY=你的_GEMINI_OR_VEO_API_KEY
   
   # Firebase 設定（必要）
   VITE_FIREBASE_API_KEY=你的_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=你的_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=你的_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID=你的_SENDER_ID
   VITE_FIREBASE_APP_ID=你的_APP_ID
   ```
   
   **📝 v3.5 更新：API Key 管理方式**
   
   自 v3.5 版本起，API Key 的取得與管理已統一改為使用 `ApiKeyContext` 管理：
   - **優先順序**：環境變數 `VITE_API_KEY` > 瀏覽器擴充功能 `window.aistudio`
   - **優點**：統一管理邏輯，易於測試與擴展
   - **向後相容**：現有功能不受影響，只是內部實作改為使用 Context
   - 詳細說明請參考 [API_KEY_CONTEXT_REFACTOR.md](./API_KEY_CONTEXT_REFACTOR.md)
   
4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   伺服器預設位於 `http://localhost:5173`。
5. **建置與預覽正式版**
   ```bash
   npm run build
   npm run preview
   ```

## 🚀 部署指南

### 自動化部署（推薦）

專案已設定 GitHub Actions 自動化部署流程。當您推送程式碼到 `main` 分支時，會自動執行建置和部署。

#### GitHub Pages 部署

**優點**：
- ✅ 完全免費
- ✅ 自動 HTTPS
- ✅ 與 GitHub 整合良好
- ✅ 自動部署（透過 GitHub Actions）

**設定步驟**：

1. **建立 GitHub Actions Workflow**
   
   在專案根目錄建立 `.github/workflows/deploy-pages.yml`：
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches:
         - main
     workflow_dispatch:
   
   permissions:
     contents: read
     pages: write
     id-token: write
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Build
           run: npm run build
           env:
             VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
             VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
             VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
             VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
             VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
             VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
             VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
             VITE_BASE_PATH: ${{ secrets.VITE_BASE_PATH || '/' }}
         
         - name: Setup Pages
           uses: actions/configure-pages@v4
         
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'
     
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

2. **設定 GitHub Secrets**
   - 前往 GitHub 倉庫 → **Settings** → **Secrets and variables** → **Actions**
   - 點擊 **New repository secret**，新增以下 Secrets：
     ```
     VITE_API_KEY=你的_GEMINI_API_KEY（可選）
     VITE_FIREBASE_API_KEY=你的_FIREBASE_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=你的_PROJECT_ID
     VITE_FIREBASE_STORAGE_BUCKET=你的_STORAGE_BUCKET
     VITE_FIREBASE_MESSAGING_SENDER_ID=你的_SENDER_ID
     VITE_FIREBASE_APP_ID=你的_APP_ID
     ```
   - **重要**：如果倉庫名稱不是 `username.github.io`，需要額外設定：
     ```
     VITE_BASE_PATH=/你的倉庫名稱/
     ```
     例如：如果倉庫名稱是 `AI_Digital_Portrait_Studio`，則設定為 `/AI_Digital_Portrait_Studio/`

3. **啟用 GitHub Pages**
   - 前往 **Settings** → **Pages**
   - 在 **Source** 選擇 **GitHub Actions**
   - 儲存設定

4. **推送程式碼**
   ```bash
   git add .
   git commit -m "設定 GitHub Pages 部署"
   git push origin main
   ```

5. **查看部署狀態**
   - 前往 **Actions** 標籤查看部署進度
   - 部署完成後，應用會自動發布到 `https://<username>.github.io/<repository-name>`

**⚠️ 注意事項**：
- GitHub Pages 會將所有環境變數暴露在前端程式碼中
- 建議設定 API Key 的使用限制（配額、IP 限制）
- 詳細安全說明請參考 [SECURITY.md](./SECURITY.md)

---

#### Cloudflare Pages 部署

**優點**：
- ✅ 免費方案
- ✅ 全球 CDN，速度極快
- ✅ 自動 HTTPS
- ✅ 環境變數管理介面友善
- ✅ 自動部署（推送程式碼時）

**設定步驟**：

1. **在 Cloudflare 建立專案**
   - 前往 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 選擇 **Pages** → **Create a project**
   - 選擇 **Connect to Git**
   - 連結您的 GitHub 倉庫
   - 選擇 `main` 分支（或 `dev3.5` 分支）

2. **設定建置設定**
   
   在 Cloudflare Pages 專案設定中，前往 **Builds & deployments**：
   - **Framework preset**: Vite（或留空）
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`（留空也可以，預設就是根目錄）
   - **Node.js version**: 20（或更高）

3. **設定環境變數** ⚠️ **重要：必須手動設定**
   
   **Cloudflare Pages 不會自動填入環境變數**，您需要手動在 Cloudflare Dashboard 中設定。
   
   **設定步驟**：
   1. 前往 **Settings** → **Environment Variables**
   2. 點擊 **Add variable**（新增變數）
   3. 選擇 **Production**（生產環境）
   4. 依序新增以下變數：
   
   **必要變數（Firebase）**：
   ```
   VITE_FIREBASE_API_KEY = 你的_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN = xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = 你的_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET = 你的_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID = 你的_SENDER_ID
   VITE_FIREBASE_APP_ID = 你的_APP_ID
   ```
   
   **可選變數**：
   ```
   VITE_API_KEY = 你的_GEMINI_API_KEY（可選）
   VITE_BASE_PATH = /（通常保持為 /）
   ```
   
   **⚠️ 注意事項**：
   - 變數名稱必須完全正確（必須以 `VITE_` 開頭）
   - 變數值不要包含多餘的空格或引號
   - 設定完成後需要重新部署才會生效
   
   **詳細設定步驟**請參考：[CLOUDFLARE_ENV_SETUP.md](./CLOUDFLARE_ENV_SETUP.md)

4. **分支控制**
   - **生產分支**：`main`（或 `dev3.5`）
   - **自動部署**：已啟用 ✅
   - 每次推送程式碼到生產分支時，Cloudflare 會自動觸發建置和部署

5. **部署**
   - **自動部署**：推送程式碼到 `main` 分支，Cloudflare 會自動部署
   - **手動部署**：在 Cloudflare Dashboard → Pages → 您的專案 → **Create Deployment**

6. **查看部署狀態**
   - 前往 Cloudflare Dashboard → Pages → 您的專案
   - 點擊 **Deployments** 標籤查看部署進度和日誌
   - 部署完成後，應用會自動發布到 `https://<project-name>.pages.dev`

**⚠️ 注意事項**：
- Cloudflare Pages 會將所有環境變數暴露在前端程式碼中
- 建議使用 Cloudflare 的環境變數管理功能，而非 GitHub Secrets
- 確保 `VITE_BASE_PATH` 設為 `/`（除非使用自訂域名且設定子路徑）
- 詳細設定請參考 [cloudflare-pages-setup.md](./cloudflare-pages-setup.md)

---

### 其他部署方式

#### Vercel（推薦）

**優點**：
- ✅ 免費方案
- ✅ 對 Vite 專案支援度最高
- ✅ 自動 HTTPS 和 CDN
- ✅ 環境變數管理介面最佳

**設定步驟**：
1. 前往 [Vercel](https://vercel.com) 註冊並連結 GitHub
2. 點擊 **New Project** → 選擇您的倉庫
3. 在 **Environment Variables** 中設定所有環境變數
4. 點擊 **Deploy**

詳細說明請參考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

#### Firebase Hosting

**優點**：
- ✅ 與 Firebase 服務整合良好
- ✅ 免費方案

**設定步驟**：
```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化 Firebase Hosting
firebase init hosting

# 建置專案
npm run build

# 部署
firebase deploy --only hosting
```

---

### 部署檢查清單

部署前請確認：

- [ ] 所有必要的環境變數都已設定
- [ ] `.env.local` 檔案已加入 `.gitignore`（不會被提交）
- [ ] 已測試本地建置 (`npm run build`)
- [ ] 已選擇部署方式並完成設定
- [ ] 已了解 API Key 會暴露在前端程式碼中

---

### 故障排除

#### GitHub Pages 部署失敗

1. **檢查 Actions 日誌**
   - 前往 **Actions** 標籤查看錯誤訊息

2. **確認 base path 設定**
   - 如果倉庫名稱不是 `username.github.io`，必須設定 `VITE_BASE_PATH`
   - 格式：`/倉庫名稱/`（前後都要有斜線）

3. **確認 Secrets 設定**
   - 檢查所有必要的 Secrets 是否都已設定
   - 確認名稱與 workflow 檔案中一致

#### Cloudflare Pages 部署失敗

1. **檢查建置日誌**
   - 在 Cloudflare Dashboard → Pages → 專案 → Deployments 查看日誌

2. **確認環境變數**
   - 檢查 Cloudflare Pages 專案設定中的環境變數是否正確

3. **確認建置設定**
   - Build command: `npm run build`
   - Build output directory: `dist`

---

### Firebase 設定參數說明

本專案使用 Firebase 提供以下服務：

| 服務 | 用途 | 環境變數 |
|------|------|----------|
| **Authentication** | 使用者認證（登入、註冊、忘記密碼） | `VITE_FIREBASE_API_KEY`<br>`VITE_FIREBASE_AUTH_DOMAIN` |
| **Firestore** | 儲存使用者歷史紀錄、使用次數 | `VITE_FIREBASE_PROJECT_ID` |
| **Storage** | 儲存生成的圖片 | `VITE_FIREBASE_STORAGE_BUCKET` |
| **App Config** | Firebase 應用程式設定 | `VITE_FIREBASE_MESSAGING_SENDER_ID`<br>`VITE_FIREBASE_APP_ID` |

**取得 Firebase 設定參數**：

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇或建立專案
3. 前往 **專案設定**（⚙️） → **一般** 標籤
4. 滾動到 **您的應用程式** 區塊
5. 選擇 Web 應用程式（或建立新的）
6. 複製 Firebase 設定物件中的參數值

**必要參數**（6 個）：
- `VITE_FIREBASE_API_KEY` - Firebase API Key
- `VITE_FIREBASE_AUTH_DOMAIN` - 認證網域（格式：`<project-id>.firebaseapp.com`）
- `VITE_FIREBASE_PROJECT_ID` - 專案 ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Storage 儲存桶（格式：`<project-id>.appspot.com`）
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - 訊息發送者 ID
- `VITE_FIREBASE_APP_ID` - 應用程式 ID

**Firebase 服務設定**：

- **Authentication**：啟用 Email/Password 登入方式
- **Firestore Database**：建立資料庫（建議使用測試模式，然後設定安全規則）
- **Storage**：啟用 Storage，設定安全規則允許已認證使用者上傳/讀取

詳細設定請參考 [Firebase 官方文檔](https://firebase.google.com/docs/web/setup)

---

### 詳細文檔

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
- [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) - 快速開始指南
- [SECURITY.md](./SECURITY.md) - 安全部署指南
- [API_KEY_CONTEXT_REFACTOR.md](./API_KEY_CONTEXT_REFACTOR.md) - API Key 統一管理說明（v3.5）
- [cloudflare-pages-setup.md](./cloudflare-pages-setup.md) - Cloudflare Pages 詳細設定指南
- [CHANGELOG_v3.5.md](./CHANGELOG_v3.5.md) - v3.5 版本改動總結

> 預設的 `main` 分支為每個帳號提供 100 次免費生成額度；若需要無限制使用，請改用 `unlimited_v3.0` 分支部署。

> ⚠️ **安全提醒**：部署到公開平台時，API Key 會暴露在前端程式碼中。建議使用 Firebase Cloud Functions 作為 API 代理，詳見 [SECURITY.md](./SECURITY.md)。

若需協助委外部署或客製化選項開發（例如新增場景、人物姿態)，歡迎聯絡 FlyPig AI
Email: flypig@icareu.tw  / LIND ID: icareuec

## 授權條款

本專案採用 **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** 授權。您可以自由使用、修改與自建部署，但不得將本專案提供之服務轉為收費性商業用途。詳見授權全文：<https://creativecommons.org/licenses/by-nc/4.0/>.
