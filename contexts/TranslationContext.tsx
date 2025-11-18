import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import type { ReactNode } from "react";
import type { ShotLabelKey } from "../types";

export type Language = "zh" | "en";

type OptionCategory =
  | "clothingStyle"
  | "clothingSeason"
  | "background"
  | "expression"
  | "pose"
  | "lighting"
  | "modelGender";

type OptionLabelMap = Record<OptionCategory, Record<string, string>>;

const optionLabels: Record<Language, OptionLabelMap> = {
  zh: {
    clothingStyle: {
      "街頭風": "街頭風",
      "時尚風": "時尚風",
      "復古風": "復古風",
      "波希米亞風": "波希米亞風",
      "極簡風": "極簡風",
      "前衛風": "前衛風",
      "學院風": "學院風",
      "頹廢風": "頹廢風",
      "戶外休閒風": "戶外休閒風",
      "商務正裝": "商務正裝",
      "運動機能風": "運動機能風",
    },
    clothingSeason: {
      "春": "春",
      "夏": "夏",
      "秋": "秋",
      "冬季寒流": "冬季寒流",
      "冬季下雪": "冬季下雪",
      "高山": "高山",
      "極地": "極地",
      "熱帶": "熱帶",
    },
    background: {
      "陽光普照的地中海海灘": "陽光普照的地中海海灘",
      "充滿霓虹燈的深夜都市街頭": "充滿霓虹燈的深夜都市街頭",
      "極簡風格的裝飾藝術工作室": "極簡風格的裝飾藝術工作室",
      "充滿異國植物的茂密植物園": "充滿異國植物的茂密植物園",
      "擺滿古董書的宏偉圖書館": "擺滿古董書的宏偉圖書館",
      "現代主義風格的混凝土建築": "現代主義風格的混凝土建築",
      "有著復古傢俱的巴黎公寓": "有著復古傢俱的巴黎公寓",
      "薄霧繚繞的寧靜森林": "薄霧繚繞的寧靜森林",
      "紐約街頭風，有黃色計程車": "紐約街頭風，有黃色計程車",
      "懷舊的台灣眷村紅磚牆": "懷舊的台灣眷村紅磚牆",
      "充滿陽光的美式復古咖啡館": "充滿陽光的美式復古咖啡館",
      "台灣阿里山日出雲海": "台灣阿里山日出雲海",
      "台北信義區夜景與101大樓": "台北信義區夜景與101大樓",
      "墾丁南灣沙灘": "墾丁南灣沙灘",
      "花蓮太魯閣國家公園的峽谷": "花蓮太魯閣國家公園的峽谷",
      "京都清水寺櫻花季": "京都清水寺櫻花季",
      "東京澀谷十字路口": "東京澀谷十字路口",
      "北海道雪景中的小樽運河": "北海道雪景中的小樽運河",
      "富士山下的河口湖": "富士山下的河口湖",
      "夏威夷火山口": "夏威夷火山口",
      "北極基地": "北極基地",
      "南極海岸邊": "南極海岸邊",
      "月球表面": "月球表面",
    },
    expression: {
      "微笑": "微笑",
      "嚴肅": "嚴肅",
      "俏皮": "俏皮",
      "自信": "自信",
      "寧靜": "寧靜",
      "神秘": "神秘",
      "喜悅": "喜悅",
    },
    pose: {
      "雙手插口袋，眼神直視鏡頭": "雙手插口袋，眼神直視鏡頭",
      "單手叉腰，展現自信姿態": "單手叉腰，展現自信姿態",
      "自然地走動，身體略微側向鏡頭": "自然地走動，身體略微側向鏡頭",
      "大步向前走，充滿動感": "大步向前走，充滿動感",
      "倚靠在牆上，看向遠方": "倚靠在牆上，看向遠方",
      "側身站立，凸顯服裝剪裁": "側身站立，凸顯服裝剪裁",
      "坐在椅子上，一條腿交叉在另一條腿上": "坐在椅子上，一條腿交叉在另一條腿上",
      "坐在階梯上，姿態放鬆": "坐在階梯上，姿態放鬆",
      "單手輕撫頭髮，面帶微笑": "單手輕撫頭髮，面帶微笑",
      "身體前傾，雙手放在膝蓋上": "身體前傾，雙手放在膝蓋上",
      "回眸一瞥，展現背部線條": "回眸一瞥，展現背部線條",
      "跳躍的瞬間，裙擺飄逸": "跳躍的瞬間，裙擺飄逸",
      "雙臂交叉於胸前，表情酷帥": "雙臂交叉於胸前，表情酷帥",
      "正在使用商品（例如：揹起後背包、戴上帽子）": "正在使用商品（例如：揹起後背包、戴上帽子）",
      "展示商品的細節（例如：指著口袋、拉開拉鍊）": "展示商品的細節（例如：指著口袋、拉開拉鍊）",
    },
    lighting: {
      "光線條件良好的自然光": "光線條件良好的自然光",
      "柔和攝影棚光": "柔和攝影棚光",
      "戶外黃金時刻": "戶外黃金時刻",
      "戲劇性輪廓光": "戲劇性輪廓光",
      "電影感霓虹燈": "電影感霓虹燈",
      "強烈聚光燈": "強烈聚光燈",
      "清晨薄霧光": "清晨薄霧光",
      "高對比黑白光": "高對比黑白光",
      "林布蘭光": "林布蘭光",
      "陰雨天散射光": "陰雨天散射光",
      "正午烈陽硬光": "正午烈陽硬光",
      "雪地反射柔光": "雪地反射柔光",
    },
    modelGender: {
      "女性模特兒": "女性模特兒",
      "男性模特兒": "男性模特兒",
    },
  },
  en: {
    clothingStyle: {
      "街頭風": "Street style",
      "時尚風": "High fashion",
      "復古風": "Vintage style",
      "波希米亞風": "Bohemian",
      "極簡風": "Minimalist",
      "前衛風": "Avant-garde",
      "學院風": "Preppy",
      "頹廢風": "Grunge",
      "戶外休閒風": "Outdoor casual",
      "商務正裝": "Business formal",
      "運動機能風": "Athleisure",
    },
    clothingSeason: {
      "春": "Spring",
      "夏": "Summer",
      "秋": "Autumn",
      "冬季寒流": "Winter cold snap",
      "冬季下雪": "Winter snowy",
      "高山": "Mountain climate",
      "極地": "Polar climate",
      "熱帶": "Tropical climate",
    },
    background: {
      "陽光普照的地中海海灘": "Sunny Mediterranean beach",
      "充滿霓虹燈的深夜都市街頭": "Neon-lit city street at night",
      "極簡風格的裝飾藝術工作室": "Minimalist art-deco studio",
      "充滿異國植物的茂密植物園": "Lush botanical garden with exotic plants",
      "擺滿古董書的宏偉圖書館": "Grand library filled with antique books",
      "現代主義風格的混凝土建築": "Modernist concrete architecture",
      "有著復古傢俱的巴黎公寓": "Parisian apartment with vintage furniture",
      "薄霧繚繞的寧靜森林": "Serene misty forest",
      "紐約街頭風，有黃色計程車": "New York street with yellow cabs",
      "懷舊的台灣眷村紅磚牆": "Retro Taiwanese military dependents' village",
      "充滿陽光的美式復古咖啡館": "Sunlit retro American café",
      "台灣阿里山日出雲海": "Alishan sunrise sea of clouds",
      "台北信義區夜景與101大樓": "Taipei Xinyi skyline with Taipei 101",
      "墾丁南灣沙灘": "Kenting South Bay beach",
      "花蓮太魯閣國家公園的峽谷": "Taroko Gorge in Hualien",
      "京都清水寺櫻花季": "Kyoto Kiyomizu-dera in cherry blossom season",
      "東京澀谷十字路口": "Tokyo Shibuya crossing",
      "北海道雪景中的小樽運河": "Otaru Canal in snowy Hokkaido",
      "富士山下的河口湖": "Lake Kawaguchi beneath Mt. Fuji",
      "夏威夷火山口": "Hawaiian volcanic crater",
      "北極基地": "Arctic research base",
      "南極海岸邊": "Antarctic shoreline",
      "月球表面": "Moon surface",
    },
    expression: {
      "微笑": "Smiling",
      "嚴肅": "Serious",
      "俏皮": "Playful",
      "自信": "Confident",
      "寧靜": "Tranquil",
      "神秘": "Mysterious",
      "喜悅": "Joyful",
    },
    pose: {
      "雙手插口袋，眼神直視鏡頭": "Hands in pockets, looking at the camera",
      "單手叉腰，展現自信姿態": "One hand on hip, confident posture",
      "自然地走動，身體略微側向鏡頭": "Walking naturally, body slightly angled",
      "大步向前走，充滿動感": "Striding forward energetically",
      "倚靠在牆上，看向遠方": "Leaning on a wall, gazing into the distance",
      "側身站立，凸顯服裝剪裁": "Standing sideways to showcase tailoring",
      "坐在椅子上，一條腿交叉在另一條腿上": "Sitting on a chair with legs crossed",
      "坐在階梯上，姿態放鬆": "Sitting on stairs in a relaxed pose",
      "單手輕撫頭髮，面帶微笑": "Touching hair with a gentle smile",
      "身體前傾，雙手放在膝蓋上": "Leaning forward with hands on knees",
      "回眸一瞥，展現背部線條": "Looking back to showcase the back",
      "跳躍的瞬間，裙擺飄逸": "Mid-jump with flowing outfit",
      "雙臂交叉於胸前，表情酷帥": "Arms crossed with a cool expression",
      "正在使用商品（例如：揹起後背包、戴上帽子）": "Using the product (e.g., wearing the backpack)",
      "展示商品的細節（例如：指著口袋、拉開拉鍊）": "Highlighting product details (e.g., pointing at pockets)",
    },
    lighting: {
      "光線條件良好的自然光": "Bright natural light",
      "柔和攝影棚光": "Soft studio lighting",
      "戶外黃金時刻": "Outdoor golden hour",
      "戲劇性輪廓光": "Dramatic rim lighting",
      "電影感霓虹燈": "Cinematic neon lighting",
      "強烈聚光燈": "Strong spotlight",
      "清晨薄霧光": "Early morning misty light",
      "高對比黑白光": "High-contrast monochrome lighting",
      "林布蘭光": "Rembrandt lighting",
      "陰雨天散射光": "Overcast diffused lighting",
      "正午烈陽硬光": "Harsh midday sunlight",
      "雪地反射柔光": "Snow-reflected soft light",
    },
    modelGender: {
      "女性模特兒": "Female model",
      "男性模特兒": "Male model",
    },
  },
};

interface HeaderTranslations {
  title: string;
  subtitle: string;
  welcome: (email: string) => string;
  credits: (remaining: number | null, isLoading: boolean) => string;
  logout: string;
  languageToggleLabel: string;
}

interface FormTranslations {
  title: string;
  productName: string;
  clothingStyle: string;
  clothingSeason: string;
  faceImage: string;
  objectImage: string;
  background: string;
  additionalDescription: string;
  additionalPlaceholder: string;
  modelGender: string;
  expression: string;
  pose: string;
  lighting: string;
  aspectRatio: string;
  selectFile: string;
  generateButton: string;
  removeFile: string;
  generating: string;
}

interface PromptDisplayTranslations {
  title: string;
  description: string;
  loadingTitle: string;
  loadingNote: string;
  errorTitle: string;
  copyPrompt: string;
  copied: string;
  togglePrompt: string;
  emptyTitle: string;
  emptyDescription: string;
  generateVideo: string;
  generatingVideo: string;
  downloadImageLabel: (label: string) => string;
  downloadVideoLabel: (label: string) => string;
  videoUnsupported: string;
}

interface HistoryTranslations {
  title: string;
  loading: string;
  empty: string;
  restoreLabel: (productName: string) => string;
}

interface AuthTranslations {
  appTitle: string;
  loginTab: string;
  registerTab: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  loginButton: string;
  registerButton: string;
  forgotPassword: string;
  loginSuccess: string;
  registerSuccess: string;
  resetSuccess: string;
  emailRequired: string;
  passwordMismatch: string;
  genericError: string;
  changeToLogin: string;
  changeToRegister: string;
  submitting: string;
}

interface ErrorTranslations {
  mustLogin: string;
  missingApiKey: string;
  quotaExhausted: string;
  consumeFailed: string;
  apiNoImage: string;
  imageReadFailed: string;
  imageDownloadFailed: (status: number) => string;
  unknownShotFailure: string;
  general: string;
  videoDownloadFailed: (statusText: string) => string;
  insufficientImages: string;
}

interface AuthErrorTranslations {
  [key: string]: string;
}

interface VideoTranslations {
  unsupportedAspect: string;
  fetchImageFailed: string;
  generateFailed: string;
  missingDownloadLink: string;
}

interface Translations {
  languageName: string;
  toggleLabel: string;
  header: HeaderTranslations;
  form: FormTranslations;
  promptDisplay: PromptDisplayTranslations;
  history: HistoryTranslations;
  auth: AuthTranslations;
  errors: ErrorTranslations;
  video: VideoTranslations;
  authErrors: AuthErrorTranslations;
  shotLabels: Record<ShotLabelKey, string>;
  general: GeneralTranslations;
}

interface GeneralTranslations {
  initializing: string;
}

const quotaReminderZh = `您的免費生成次數已用完。

若生成的作品滿意，歡迎 FB 分享推薦 https://studio.icareu.tw/

本應用服務目前已於 GitHub 免費開源，歡迎自行部署。

使用時請遵守開源協議。

若有委外部署 or 客製化選項需求，請來信 flypig@icareu.tw`;

const quotaReminderEn = `Your free generation credits are used up.

If you like the results, please share them on Facebook to recommend https://studio.icareu.tw/

This application is open sourced on GitHub—feel free to self-host.

Please comply with the open-source license.

For deployment or customization services, email flypig@icareu.tw`;

const translations: Record<Language, Translations> = {
  zh: {
    "languageName": "繁體中文",
    "toggleLabel": "English",
    header: {
      "title": "電商人像攝影棚 v3.0",
      "subtitle": "專為電商產業所設計，一鍵生成專業人像攝影照",
      welcome: (email) => `歡迎，${email}`,
      credits: (remaining, isLoading) =>
        isLoading
          ? "讀取中..."
          : `剩餘生成次數：${remaining ?? 0}（每位新註冊使用者僅享 100 次）`,
      "logout": "登出",
      "languageToggleLabel": "English",
    },
    form: {
      "title": "客製化您的詠唱",
      "productName": "品牌商品名稱",
      "clothingStyle": "服裝風格",
      "clothingSeason": "服裝季節",
      "faceImage": "特定人物臉孔 (可選)",
      "objectImage": "特定物品 (可選)",
      "background": "背景環境描述",
      "additionalDescription": "補充描述 (可選)",
      "additionalPlaceholder": "例如：模特兒有著藍色眼睛和金色長髮、背景中有一隻黑色的貓",
      "modelGender": "模特兒性別",
      "expression": "表情描述",
      "pose": "人物姿勢",
      "lighting": "光線描述",
      "aspectRatio": "圖片長寬比",
      "selectFile": "選擇檔案...",
      "generateButton": "產生圖片",
      "removeFile": "移除檔案",
      "generating": "正在產生圖片...",
    },
    promptDisplay: {
      "title": "產生結果",
      "description": "AI 產生的三種不同視角圖片",
      "loadingTitle": "正在產生三種不同視角的圖片...",
      "loadingNote": "這可能需要一點時間，請稍候。",
      "errorTitle": "產生失敗",
      "copyPrompt": "複製詠唱",
      "copied": "已複製！",
      "togglePrompt": "顯示/隱藏詠唱內容",
      "emptyTitle": "圖片將會顯示在這裡",
      "emptyDescription": "點擊「產生圖片」按鈕開始。",
      "generateVideo": "生成動態影像",
      "generatingVideo": "正在生成動畫...",
      downloadImageLabel: (label) => `下載圖片 (${label})`,
      downloadVideoLabel: (label) => `下載影片 (${label})`,
      "videoUnsupported": "動態影像目前僅支援 16:9 或 9:16，請調整圖片長寬比後再試。",
    },
    history: {
      "title": "歷史紀錄",
      "loading": "載入中...",
      "empty": "尚無歷史紀錄。產生圖片後，紀錄將會顯示於此。",
      restoreLabel: (productName: string) => `還原紀錄：${productName}`,
    },
    auth: {
      "appTitle": "電商人像攝影棚",
      "loginTab": "登入",
      "registerTab": "註冊",
      "emailLabel": "電子郵件",
      "passwordLabel": "密碼",
      "confirmPasswordLabel": "確認密碼",
      "loginButton": "登入",
      "registerButton": "註冊帳號",
      "forgotPassword": "忘記密碼？寄送重設連結",
      "loginSuccess": "登入成功！",
      "registerSuccess": "註冊成功，已自動登入。",
      "resetSuccess": "已寄出密碼重設郵件，請檢查您的收件匣。",
      "emailRequired": "請先輸入您的電子郵件地址。",
      "passwordMismatch": "兩次輸入的密碼不一致，請重新確認。",
      "genericError": "操作失敗，請稍後再試。",
      "changeToLogin": "已有帳號？登入",
      "changeToRegister": "沒有帳號？立即註冊",
      "submitting": "請稍候...",
    },
    errors: {
      "mustLogin": "請先登入後再產生圖片。",
      "missingApiKey": "尚未設定 Gemini API Key，請於環境變數新增 VITE_API_KEY。",
      quotaExhausted: quotaReminderZh,
      "consumeFailed": "無法確認生成次數，請稍後再試。",
      "apiNoImage": "API 未回傳任何圖片資料，請稍後再試。",
      "imageReadFailed": "無法讀取圖片資料。",
      imageDownloadFailed: (status) => `無法下載生成圖片（HTTP ${status}）。`,
      "unknownShotFailure": "API 未能針對其中一個視角回傳圖片。",
      "general": "發生未知錯誤，請稍後再試。",
      videoDownloadFailed: (statusText) => `下載影片失敗: ${statusText}`,
      "insufficientImages": "圖片生成數量不足，請重試。",
    },
    video: {
      "unsupportedAspect": "此長寬比不支援動態影像，請調整為 16:9 或 9:16 後再試。",
      "fetchImageFailed": "下載圖片失敗，無法生成動畫。",
      "generateFailed": "影片生成過程中發生錯誤。",
      "missingDownloadLink": "無法取得影片下載連結。",
    },
    authErrors: {
      "auth/invalid-email": "電子郵件格式不正確，請重新輸入。",
      "auth/user-disabled": "此帳號已被停用，請聯絡管理員。",
      "auth/user-not-found": "找不到相符的帳號，請確認是否已註冊。",
      "auth/wrong-password": "帳號或密碼錯誤，請重新確認。",
      "auth/invalid-credential": "帳號或密碼錯誤，請重新確認。",
      "auth/email-already-in-use": "此電子郵件已被註冊，請直接登入或使用其他信箱。",
      "auth/weak-password": "密碼強度不足，請至少輸入六個字元。",
      "auth/generic": "操作失敗，請稍後再試。",
    },
    shotLabels: {
      "fullBody": "全身",
      "medium": "半身",
      "closeUp": "特寫",
    },
    general: {
      "initializing": "初始化中...",
    },
  },
  en: {
    "languageName": "English",
    "toggleLabel": "中文",
    header: {
      "title": "AI Digital Portrait Studio v3.0",
      "subtitle": "Designed for e-commerce—generate professional portrait shots in one click",
      welcome: (email) => `Welcome, ${email}`,
      credits: (remaining, isLoading) =>
        isLoading
          ? "Loading credits..."
          : `Remaining credits: ${remaining ?? 0} (each new user receives 100 free generations)`,
      "logout": "Sign out",
      "languageToggleLabel": "中文",
    },
    form: {
      "title": "Customize Your Prompt",
      "productName": "Product name",
      "clothingStyle": "Clothing style",
      "clothingSeason": "Season / climate",
      "faceImage": "Reference face (optional)",
      "objectImage": "Reference object (optional)",
      "background": "Background description",
      "additionalDescription": "Additional details (optional)",
      "additionalPlaceholder":
        "Example: the model has blue eyes and long blonde hair; a black cat appears in the background.",
      "modelGender": "Model gender",
      "expression": "Facial expression",
      "pose": "Pose",
      "lighting": "Lighting",
      "aspectRatio": "Image aspect ratio",
      "selectFile": "Choose file...",
      "generateButton": "Generate images",
      "removeFile": "Remove file",
      "generating": "Generating...",
    },
    promptDisplay: {
      "title": "Generation Results",
      "description": "Three different viewpoints generated by AI",
      "loadingTitle": "Generating three unique perspectives...",
      "loadingNote": "This may take a moment. Please hold on.",
      "errorTitle": "Generation failed",
      "copyPrompt": "Copy prompt",
      "copied": "Copied!",
      "togglePrompt": "Show / hide prompt",
      "emptyTitle": "Images will appear here",
      "emptyDescription": "Click “Generate images” to get started.",
      "generateVideo": "Create motion clip",
      "generatingVideo": "Rendering animation...",
      downloadImageLabel: (label) => `Download image (${label})`,
      downloadVideoLabel: (label) => `Download video (${label})`,
      "videoUnsupported": "Motion clips support only 16:9 or 9:16. Please adjust the aspect ratio.",
    },
    history: {
      "title": "History",
      "loading": "Loading history...",
      "empty": "No history yet. Generate an image and your records will appear here.",
      restoreLabel: (productName: string) => `Restore record: ${productName}`,
    },
    auth: {
      "appTitle": "AI Digital Portrait Studio",
      "loginTab": "Sign in",
      "registerTab": "Register",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "confirmPasswordLabel": "Confirm password",
      "loginButton": "Sign in",
      "registerButton": "Create account",
      "forgotPassword": "Forgot password? Send reset link",
      "loginSuccess": "Signed in successfully!",
      "registerSuccess": "Registration complete. You are now signed in.",
      "resetSuccess": "Password reset email sent. Please check your inbox.",
      "emailRequired": "Please enter your email address first.",
      "passwordMismatch": "Passwords do not match. Please double-check.",
      "genericError": "The request failed. Please try again later.",
      "changeToLogin": "Already have an account? Sign in",
      "changeToRegister": "Need an account? Register now",
      "submitting": "Please wait...",
    },
    errors: {
      "mustLogin": "Please sign in before generating images.",
      "missingApiKey": "Gemini API key is missing. Define VITE_API_KEY in your environment variables.",
      quotaExhausted: quotaReminderEn,
      "consumeFailed": "Unable to verify remaining credits. Please try again later.",
      "apiNoImage": "The API returned no image data. Please try again later.",
      "imageReadFailed": "Failed to read the image data.",
      imageDownloadFailed: (status) =>
        `Unable to download one of the generated images (HTTP ${status}).`,
      "unknownShotFailure": "The API failed to return an image for one of the viewpoints.",
      "general": "An unexpected error occurred. Please try again later.",
      videoDownloadFailed: (statusText) => `Failed to download video: ${statusText}`,
      "insufficientImages": "Not enough images were generated. Please try again.",
    },
    video: {
      "unsupportedAspect":
        "Motion clips support only 16:9 or 9:16. Please adjust the aspect ratio and try again.",
      "fetchImageFailed": "Failed to download the image required for animation.",
      "generateFailed": "Video generation failed.",
      "missingDownloadLink": "Unable to retrieve the video download link.",
    },
    authErrors: {
      "auth/invalid-email": "The email address format is invalid.",
      "auth/user-disabled": "This account has been disabled. Please contact support.",
      "auth/user-not-found": "No account found. Please sign up first.",
      "auth/wrong-password": "Incorrect email or password. Please try again.",
      "auth/invalid-credential": "Incorrect email or password. Please try again.",
      "auth/email-already-in-use": "This email is already registered. Please sign in.",
      "auth/weak-password": "Password is too weak. Please use at least six characters.",
      "auth/generic": "The request failed. Please try again later.",
    },
    shotLabels: {
      "fullBody": "Full body",
      "medium": "Medium shot",
      "closeUp": "Close-up",
    },
    general: {
      "initializing": "Initializing...",
    },
  },
};

interface TranslationContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  translateOption: (category: OptionCategory, value: string) => string;
  translateShotLabel: (key: ShotLabelKey) => string;
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("zh");

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "zh" ? "en" : "zh"));
  }, []);

  const value = useMemo<TranslationContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: translations[language],
      translateOption: (category, value) =>
        optionLabels[language][category][value] ?? value,
      translateShotLabel: (key) => translations[language].shotLabels[key] ?? key,
    }),
    [language]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslation = (): TranslationContextValue => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation 必須在 TranslationProvider 內使用");
  }
  return context;
};

