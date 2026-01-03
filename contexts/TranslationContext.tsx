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
      "時尚風": "時尚風",
      "極簡風（Uniqlo 風格）": "極簡風（Uniqlo 風格）",
      "商務正裝": "商務正裝",
      "街頭風": "街頭風",
      "復古風": "復古風",
      "學院風": "學院風",
      "運動機能風": "運動機能風",
      "戶外休閒風": "戶外休閒風",
      "優雅正裝": "優雅正裝",
      "休閒商務風": "休閒商務風",
      "日系簡約風": "日系簡約風",
      "韓系時尚風": "韓系時尚風",
      "歐美高街風": "歐美高街風",
      "波希米亞風": "波希米亞風",
      "自行補充描述": "自行補充描述",
    },
    clothingSeason: {
      "春": "春",
      "夏": "夏",
      "秋": "秋",
      "冬": "冬",
      "春季過渡": "春季過渡",
      "夏季清涼": "夏季清涼",
      "秋季微涼": "秋季微涼",
      "冬季保暖": "冬季保暖",
      "四季通用": "四季通用",
      "室內空調環境": "室內空調環境",
      "自行補充描述": "自行補充描述",
    },
    background: {
      "時尚攝影棚（純色背景）": "時尚攝影棚（純色背景）",
      "極簡風格的工作室（白色背景）": "極簡風格的工作室（白色背景）",
      "商業攝影棚（灰色背景）": "商業攝影棚（灰色背景）",
      "充滿陽光的美式復古咖啡館": "充滿陽光的美式復古咖啡館",
      "現代簡約的辦公室": "現代簡約的辦公室",
      "優雅的客廳環境": "優雅的客廳環境",
      "時尚咖啡館": "時尚咖啡館",
      "陽光普照的地中海海灘": "陽光普照的地中海海灘",
      "充滿霓虹燈的深夜都市街頭": "充滿霓虹燈的深夜都市街頭",
      "充滿異國植物的茂密植物園": "充滿異國植物的茂密植物園",
      "擺滿古董書的宏偉圖書館": "擺滿古董書的宏偉圖書館",
      "現代主義風格的混凝土建築": "現代主義風格的混凝土建築",
      "有著復古傢俱的巴黎公寓": "有著復古傢俱的巴黎公寓",
      "薄霧繚繞的寧靜森林": "薄霧繚繞的寧靜森林",
      "紐約街頭風，有黃色計程車": "紐約街頭風，有黃色計程車",
      "懷舊的台灣眷村紅磚牆": "懷舊的台灣眷村紅磚牆",
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
      "自行補充描述": "自行補充描述",
    },
    expression: {
      "自信，眼神直視鏡頭": "自信，眼神直視鏡頭",
      "自然微笑，眼神直視鏡頭": "自然微笑，眼神直視鏡頭",
      "優雅微笑，眼神直視鏡頭": "優雅微笑，眼神直視鏡頭",
      "專業嚴肅，眼神直視鏡頭": "專業嚴肅，眼神直視鏡頭",
      "親切友好，眼神直視鏡頭": "親切友好，眼神直視鏡頭",
      "自信，眼神看向商品": "自信，眼神看向商品",
      "自然，眼神看向遠方": "自然，眼神看向遠方",
      "自行補充描述": "自行補充描述",
    },
    pose: {
      "雙手自然下垂，正面站立，眼神直視鏡頭": "雙手自然下垂，正面站立，眼神直視鏡頭",
      "單手叉腰，展現自信姿態，眼神直視鏡頭": "單手叉腰，展現自信姿態，眼神直視鏡頭",
      "側身站立，凸顯服裝剪裁，眼神看向鏡頭": "側身站立，凸顯服裝剪裁，眼神看向鏡頭",
      "雙手插口袋，自然站立，眼神直視鏡頭": "雙手插口袋，自然站立，眼神直視鏡頭",
      "單手輕撫頭髮，優雅姿態，眼神直視鏡頭": "單手輕撫頭髮，優雅姿態，眼神直視鏡頭",
      "坐在椅子上，一條腿交叉在另一條腿上，優雅坐姿": "坐在椅子上，一條腿交叉在另一條腿上，優雅坐姿",
      "自然地走動，身體略微側向鏡頭": "自然地走動，身體略微側向鏡頭",
      "正在使用商品（例如：揹起後背包、戴上帽子）": "正在使用商品（例如：揹起後背包、戴上帽子）",
      "展示商品的細節（例如：指著口袋、拉開拉鍊）": "展示商品的細節（例如：指著口袋、拉開拉鍊）",
      "雙手交叉於身前，優雅站立": "雙手交叉於身前，優雅站立",
      "單手扶腰，側身回眸，展現服裝背面": "單手扶腰，側身回眸，展現服裝背面",
      "雙手自然擺放，正面坐姿": "雙手自然擺放，正面坐姿",
      "自行補充描述": "自行補充描述",
    },
    lighting: {
      "柔和攝影棚光（商業攝影標準）": "柔和攝影棚光（商業攝影標準）",
      "自然窗光（柔和均勻）": "自然窗光（柔和均勻）",
      "戶外黃金時刻（日出日落）": "戶外黃金時刻（日出日落）",
      "均勻柔光（無陰影）": "均勻柔光（無陰影）",
      "側光（展現質感與層次）": "側光（展現質感與層次）",
      "林布蘭光（經典人像光）": "林布蘭光（經典人像光）",
      "蝴蝶光（正面均勻光）": "蝴蝶光（正面均勻光）",
      "輪廓光（背景分離）": "輪廓光（背景分離）",
      "高調光（明亮清新）": "高調光（明亮清新）",
      "低調光（質感深沉）": "低調光（質感深沉）",
      "自然散射光（陰天柔光）": "自然散射光（陰天柔光）",
      "室內暖光（氛圍感）": "室內暖光（氛圍感）",
      "雪地反射柔光": "雪地反射柔光",
      "正午烈陽硬光": "正午烈陽硬光",
      "雲霧陰雨情境": "雲霧陰雨情境",
      "自行補充描述": "自行補充描述",
    },
    modelGender: {
      "女性模特兒": "女性模特兒",
      "男性模特兒": "男性模特兒",
    },
  },
  en: {
    clothingStyle: {
      "時尚風": "High fashion",
      "極簡風（Uniqlo 風格）": "Minimalist (Uniqlo style)",
      "商務正裝": "Business formal",
      "街頭風": "Street style",
      "復古風": "Vintage style",
      "學院風": "Preppy",
      "運動機能風": "Athleisure",
      "戶外休閒風": "Outdoor casual",
      "優雅正裝": "Elegant formal",
      "休閒商務風": "Smart casual",
      "日系簡約風": "Japanese minimalist",
      "韓系時尚風": "Korean fashion",
      "歐美高街風": "High street fashion",
      "波希米亞風": "Bohemian",
      "自行補充描述": "Custom description",
    },
    clothingSeason: {
      "春": "Spring",
      "夏": "Summer",
      "秋": "Autumn",
      "冬": "Winter",
      "春季過渡": "Spring transition",
      "夏季清涼": "Summer cool",
      "秋季微涼": "Autumn mild",
      "冬季保暖": "Winter warm",
      "四季通用": "All seasons",
      "室內空調環境": "Indoor climate-controlled",
      "自行補充描述": "Custom description",
    },
    background: {
      "台灣阿里山日出雲海": "Alishan sunrise sea of clouds",
      "台北信義區夜景與101大樓": "Taipei Xinyi skyline with Taipei 101",
      "墾丁南灣沙灘": "Kenting South Bay beach",
      "花蓮太魯閣國家公園的峽谷": "Taroko Gorge in Hualien",
      "懷舊的台灣眷村紅磚牆": "Retro Taiwanese military dependents' village",
      "九份老街夜景": "Jiufen old street at night",
      "日月潭湖光山色": "Sun Moon Lake scenery",
      "京都清水寺櫻花季": "Kyoto Kiyomizu-dera in cherry blossom season",
      "東京澀谷十字路口": "Tokyo Shibuya crossing",
      "北海道雪景中的小樽運河": "Otaru Canal in snowy Hokkaido",
      "富士山下的河口湖": "Lake Kawaguchi beneath Mt. Fuji",
      "大阪道頓堀夜景": "Osaka Dotonbori at night",
      "奈良公園與鹿群": "Nara Park with deer",
      "沖繩海灘": "Okinawa beach",
      "陽光普照的地中海海灘": "Sunny Mediterranean beach",
      "有著復古傢俱的巴黎公寓": "Parisian apartment with vintage furniture",
      "倫敦大笨鐘與泰晤士河": "London Big Ben and Thames",
      "羅馬競技場": "Roman Colosseum",
      "威尼斯運河": "Venice canals",
      "希臘聖托里尼島": "Santorini, Greece",
      "瑞士阿爾卑斯山": "Swiss Alps",
      "紐約街頭風，有黃色計程車": "New York street with yellow cabs",
      "夏威夷火山口": "Hawaiian volcanic crater",
      "洛杉磯好萊塢標誌": "Los Angeles Hollywood sign",
      "舊金山金門大橋": "San Francisco Golden Gate Bridge",
      "加拿大班夫國家公園": "Canadian Banff National Park",
      "巴西里約熱內盧海灘": "Rio de Janeiro beach, Brazil",
      "首爾明洞購物街": "Seoul Myeongdong shopping street",
      "新加坡濱海灣花園": "Singapore Gardens by the Bay",
      "泰國曼谷大皇宮": "Bangkok Grand Palace, Thailand",
      "越南下龍灣": "Ha Long Bay, Vietnam",
      "印尼峇里島海灘": "Bali beach, Indonesia",
      "馬來西亞雙子星塔": "Petronas Twin Towers, Malaysia",
      "時尚攝影棚（純色背景）": "Fashion photography studio (solid color background)",
      "極簡風格的工作室（白色背景）": "Minimalist studio (white background)",
      "商業攝影棚（灰色背景）": "Commercial photography studio (gray background)",
      "充滿陽光的美式復古咖啡館": "Sunlit retro American café",
      "現代簡約的辦公室": "Modern minimalist office",
      "優雅的客廳環境": "Elegant living room",
      "時尚咖啡館": "Fashion café",
      "極簡風格的裝飾藝術工作室": "Minimalist art-deco studio",
      "擺滿古董書的宏偉圖書館": "Grand library filled with antique books",
      "現代主義風格的混凝土建築": "Modernist concrete architecture",
      "工業風咖啡館": "Industrial-style café",
      "薄霧繚繞的寧靜森林": "Serene misty forest",
      "充滿異國植物的茂密植物園": "Lush botanical garden with exotic plants",
      "北極基地": "Arctic research base",
      "南極海岸邊": "Antarctic shoreline",
      "沙漠景觀": "Desert landscape",
      "充滿霓虹燈的深夜都市街頭": "Neon-lit city street at night",
      "時尚攝影棚（純色背景）": "Fashion photography studio (solid color background)",
      "極簡風格的工作室（白色背景）": "Minimalist studio (white background)",
      "商業攝影棚（灰色背景）": "Commercial photography studio (gray background)",
      "現代簡約的辦公室": "Modern minimalist office",
      "優雅的客廳環境": "Elegant living room",
      "時尚咖啡館": "Fashion café",
      "自行補充描述": "Custom description",
    },
    expression: {
      "自信，眼神直視鏡頭": "Confident, looking at camera",
      "自然微笑，眼神直視鏡頭": "Natural smile, looking at camera",
      "優雅微笑，眼神直視鏡頭": "Elegant smile, looking at camera",
      "專業嚴肅，眼神直視鏡頭": "Professional serious, looking at camera",
      "親切友好，眼神直視鏡頭": "Friendly, looking at camera",
      "自信，眼神看向商品": "Confident, looking at product",
      "自然，眼神看向遠方": "Natural, looking into distance",
      "自行補充描述": "Custom description",
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
      "雙手插後口袋，展現休閒感": "Hands in back pockets, casual vibe",
      "單手扶牆，側身站立": "One hand on wall, standing sideways",
      "自行補充描述": "Custom description",
    },
    lighting: {
      "柔和攝影棚光（商業攝影標準）": "Soft studio lighting (commercial photography standard)",
      "自然窗光（柔和均勻）": "Natural window light (soft and even)",
      "戶外黃金時刻（日出日落）": "Outdoor golden hour (sunrise/sunset)",
      "均勻柔光（無陰影）": "Even soft light (shadowless)",
      "側光（展現質感與層次）": "Side lighting (showcasing texture and depth)",
      "林布蘭光（經典人像光）": "Rembrandt lighting (classic portrait light)",
      "蝴蝶光（正面均勻光）": "Butterfly lighting (even front light)",
      "輪廓光（背景分離）": "Rim lighting (background separation)",
      "高調光（明亮清新）": "High-key lighting (bright and fresh)",
      "低調光（質感深沉）": "Low-key lighting (deep texture)",
      "自然散射光（陰天柔光）": "Natural diffused light (overcast soft light)",
      "室內暖光（氛圍感）": "Indoor warm light (atmospheric)",
      "雪地反射柔光": "Snow-reflected soft light",
      "正午烈陽硬光": "Harsh midday sunlight",
      "雲霧陰雨情境": "Cloudy misty rainy atmosphere",
      "自行補充描述": "Custom description",
    },
    modelGender: {
      "女性模特兒": "Female model",
      "男性模特兒": "Male model",
    },
  },
};

// 背景分類翻譯
const backgroundCategoryLabels: Record<Language, Record<string, string>> = {
  zh: {
    "台灣": "台灣",
    "日本": "日本",
    "歐洲": "歐洲",
    "美洲": "美洲",
    "其他亞洲": "其他亞洲",
    "室內/工作室": "室內/工作室",
    "自然環境": "自然環境",
    "都市街景": "都市街景",
  },
  en: {
    "台灣": "Taiwan",
    "日本": "Japan",
    "歐洲": "Europe",
    "美洲": "Americas",
    "其他亞洲": "Other Asia",
    "室內/工作室": "Indoor/Studio",
    "自然環境": "Natural Environment",
    "都市街景": "Urban Street",
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
  back: string;
  quickSelect: string;
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
  downloadImage: string;
  downloading: string;
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
      "title": "電商人像攝影棚 v3.8",
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
      "back": "返回",
      "quickSelect": "快速選擇",
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
      "downloadHint": "💡 提示：在圖片上按右鍵選擇「另存圖片」即可下載",
      "downloadImage": "下載圖片",
      "downloading": "下載中...",
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
      "title": "AI Digital Portrait Studio v3.8",
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
      "back": "Back",
      "quickSelect": "Quick Select",
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
      "emptyDescription": "Click \"Generate images\" to get started.",
      "downloadHint": "💡 Tip: Right-click on the image and select \"Save image as\" to download",
      "downloadImage": "Download image",
      "downloading": "Downloading...",
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
  translateCategory: (category: string) => string;
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
      translateCategory: (category) =>
        backgroundCategoryLabels[language][category] ?? category,
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

