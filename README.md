# AI Digital Portrait Studio

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
   VITE_API_KEY=你的_GEMINI_OR_VEO_API_KEY
   VITE_FIREBASE_API_KEY=你的_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=你的_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=你的_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID=你的_SENDER_ID
   VITE_FIREBASE_APP_ID=你的_APP_ID
   ```
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

## 推薦部署方式

- **Vercel**：對 Vite 專案支援度高，只需在專案設定中填入上述環境變數即可完成部署。
- **Google Cloud（Cloud Run / Firebase Hosting）**：適合與 Firebase 服務同屬專案管理，部署前請先執行 `npm run build`，再將 `dist` 或 SSR 結果上傳。

> 預設的 `main` 分支為每個帳號提供 100 次免費生成額度；若需要無限制使用，請改用 `unlimited_v3.0` 分支部署。

若需協助委外部署或客製化選項開發（例如新增場景、人物姿態)，歡迎聯絡 FlyPig AI
Email: flypig@icareu.tw  / LIND ID: icareuec

## 授權條款

本專案採用 **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** 授權。您可以自由使用、修改與自建部署，但不得將本專案提供之服務轉為收費性商業用途。詳見授權全文：<https://creativecommons.org/licenses/by-nc/4.0/>.
