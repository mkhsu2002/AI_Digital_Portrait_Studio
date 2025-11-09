# AI Digital Portrait Studio

以「電商人像攝影棚」為主題的 React + Vite 專案，可透過 Google Gemini 影像生成模型快速產生多視角的人像商品照，並支援歷史紀錄、動態影像生成與即時詠唱複製等功能。以下為完整的程式架構解析與操作教學。

## 功能總覽

- **視覺化參數表單**：以品牌商品、服裝風格、背景、姿勢、光線等維度組合生成提示詞。
- **AI 影像生成**：一次向 Gemini `gemini-2.5-flash-image` 請求三種視角（全身、半身、特寫）圖片。
- **歷史紀錄**：使用 Firebase Firestore 保存每位登入使用者最近 10 次生成的參數與結果，支援一鍵還原。
- **動態影像擴充**：可將任一靜態圖交由 `veo-3.1-fast-generate-preview` 轉為 720p 動態影像（限 16:9 / 9:16）。
- **詠唱管理**：即時顯示、複製完整詠唱內容，方便外部工具或再次調整。
- **帳號系統**：採用 Firebase Authentication 提供電子郵件註冊 / 登入 / 忘記密碼流程。

## 技術架構

- **前端框架**：React 19（Functional Components + Hooks）
- **打包工具**：Vite 6
- **AI SDK**：`@google/genai`
- **身分驗證**：Firebase Authentication
- **資料儲存**：Firebase Firestore（依使用者分開儲存歷史紀錄）
- **語言**：TypeScript
- **狀態管理**：React `useState` / `useEffect` / `useCallback`
- **樣式**：Tailwind 風格的原子化 class（直接寫於 JSX className）

### 主要程式流程

1. `PromptForm` 收集使用者輸入與可選的參考圖片（人物臉孔、商品實物）。
2. `App` 內部 `useEffect` 依據表單狀態組合展示用的完整詠唱。
3. 使用者點擊「產生圖片」後：
   - 依三種視角指令拆分請求。
   - 若包含參考圖片，轉為 Base64 內嵌於請求內容。
   - 呼叫 `GoogleGenAI.models.generateContent` 並彙整結果。
4. 產生的圖片會顯示於 `PromptDisplay`，同時寫入 Firebase Firestore 中的 `users/{uid}/history` 集合。
5. `HistoryPanel` 會即時同步 Firestore 最新資料，並允許一鍵還原表單。
6. 在 `PromptDisplay` 中可下載圖片、觸發動態影像生成或複製詠唱。

### 專案目錄結構

```
AI_Digital_Portrait_Studio/
├─ App.tsx                # 核心邏輯：狀態、AI 請求、歷史紀錄、Firebase 整合
├─ index.tsx              # React 進入點
├─ index.html             # Vite 入口 HTML
├─ components/            # UI 組件
│  ├─ AuthGate.tsx        # 登入 / 註冊 / 忘記密碼介面
│  ├─ Header.tsx
│  ├─ PromptForm.tsx      # 表單輸入與檔案上傳
│  ├─ PromptDisplay.tsx   # 生成結果、下載、動態影像
│  ├─ HistoryPanel.tsx    # 歷史紀錄列表
│  ├─ InputGroup.tsx      # 通用表單包裝
│  └─ icons/              # SVG 圖示（Clipboard、Download…）
├─ constants.ts           # 下拉選單使用的靜態選項
├─ contexts/
│  └─ AuthContext.tsx     # Firebase Auth 狀態管理
├─ firebase.ts            # Firebase 初始化
├─ services/
│  └─ historyService.ts   # Firestore 讀寫封裝
├─ types.ts               # TypeScript 型別定義
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

## 環境需求

- Node.js 18 或以上（Windows 建議使用 PowerShell 或 Windows Terminal）
- 一組有效的 Google AI Studio API Key（支援 Gemini 影像與 Veo 影片）
- 一組 Firebase 專案憑證（Authentication + Firestore 已啟用）
- 建議安裝 npm 9+ 以獲得較佳相容性

## 安裝與執行步驟（Windows 範例）

1. **下載專案**
   ```powershell
   git clone <repo-url> AI_Digital_Portrait_Studio
   cd AI_Digital_Portrait_Studio
   ```

2. **安裝依賴**
   ```powershell
   npm install
   ```

3. **設定環境變數**
   - 建立 `.env` 或 `.env.local` 檔案（Vite 預設會讀取 `VITE_` 前綴變數）：
     ```
     API_KEY=YOUR_GEMINI_OR_VEO_KEY
     VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
     VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
     VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
     VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
     VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
     VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
     ```
   - 若想以系統環境變數方式設定，可在 PowerShell 執行：
     ```powershell
     setx API_KEY "YOUR_GEMINI_OR_VEO_KEY"
     setx VITE_FIREBASE_API_KEY "YOUR_FIREBASE_API_KEY"
     setx VITE_FIREBASE_AUTH_DOMAIN "YOUR_FIREBASE_AUTH_DOMAIN"
     setx VITE_FIREBASE_PROJECT_ID "YOUR_FIREBASE_PROJECT_ID"
     setx VITE_FIREBASE_STORAGE_BUCKET "YOUR_FIREBASE_STORAGE_BUCKET"
     setx VITE_FIREBASE_MESSAGING_SENDER_ID "YOUR_FIREBASE_MESSAGING_SENDER_ID"
     setx VITE_FIREBASE_APP_ID "YOUR_FIREBASE_APP_ID"
     ```
     （重新打開終端才會生效）
   - 部署於 Vercel 時，請在 Project Settings → Environment Variables 介面填入同名變數並觸發重新部署。

4. **啟動開發伺服器**
   ```powershell
   npm run dev
   ```
   預設於 `http://localhost:5173` 執行（終端會提示確切網址）。

5. **建置正式版**
   ```powershell
   npm run build
   npm run preview  # 驗證建置結果
   ```

## 操作教學

0. **登入 / 註冊**：首次進入會看到 Firebase 驗證頁面，請輸入電子郵件與密碼完成註冊或登入；忘記密碼可寄送重設連結。
1. **輸入基本資訊**：在「品牌商品名稱」、「服裝風格」、「背景環境」等欄位填入需求。
2. **上傳參考圖（選用）**：
   - `特定人物臉孔`：AI 會盡量重現該臉孔。
   - `特定物品`：確保商品或道具被清楚呈現。
3. **設定細節**：如表情、姿勢、鏡頭焦段、光線、長寬比等。
4. **補充描述**：可加入特殊要求（例：眼睛顏色、背景元素）。
5. **按下「產生圖片」**：等待完成後，結果將以卡片形式顯示。
6. **管理結果**：
   - 點擊「下載」取得 JPEG（或影片）。
   - 選擇「生成動態影像」將圖片轉為短影片（僅支援 16:9 / 9:16 長寬比）。
   - 展開「詠唱內容」或使用「複製詠唱」快速取得提示詞。
7. **重用歷史紀錄**：於左側「歷史紀錄」挑選任一紀錄即可還原表單與預覽，歷史資料會依 Firebase 帳號獨立保存。

## 開發與擴充建議

- **代理服務**：建議使用 Cloud Functions / Cloud Run 建立 API 代理，避免前端直接曝露 Gemini API Key。
- **權限控管**：在 Firestore Security Rules 中限制 `users/{uid}/history` 只能由 `request.auth.uid == uid` 存取。
- **錯誤處理**：目前以訊息彈出為主，可整合全域通知系統提昇使用體驗。
- **樣式系統**：如要強化主題，可導入 Tailwind CSS 或其他設計系統。
- **自動化部署**：已實測可透過 Vercel 部署；若要改用 Firebase Hosting 或 Google Cloud Run，可沿用同組環境變數並視需求調整 build 指令。

## 授權

未明確標註授權，預設遵循專案擁有者之使用許可。若需公開發行，請先與原作者確認。*** End Patch
