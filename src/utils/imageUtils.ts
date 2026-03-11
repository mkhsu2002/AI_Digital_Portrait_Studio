/**
 * 圖片處理工具函數
 * 統一管理圖片轉換、下載等邏輯
 */

/**
 * Blob 轉 Base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",")[1];
        resolve(base64 ?? "");
      } else {
        reject(new Error("Failed to read image data"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image data"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Base64 轉 Blob
 */
export function base64ToBlob(base64: string, mimeType: string = "image/png"): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Data URL 轉 Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mimeType });
}

/**
 * 使用 Canvas 方式下載圖片
 */
export async function downloadImageViaCanvas(imageUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    const timeout = setTimeout(() => {
      reject(new Error('圖片載入超時（10秒）'));
    }, 10000);
    
    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('無法建立 Canvas context'));
          return;
        }
        
        // 繪製圖片到 Canvas
        ctx.drawImage(img, 0, 0);
        
        // 導出為 Blob（使用 PNG 格式保持品質）
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('無法從 Canvas 導出圖片'));
            }
          },
          'image/png',
          1.0
        );
      } catch (error) {
        reject(new Error('圖片下載失敗'));
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('圖片載入失敗'));
    };
    
    // 開始載入圖片
    img.src = imageUrl;
  });
}

/**
 * 統一的圖片下載函數
 */
export async function downloadImage(imageSrc: string): Promise<Blob> {
  // Data URL 直接轉換
  if (imageSrc.startsWith('data:')) {
    return dataUrlToBlob(imageSrc);
  }
  
  // 其他 URL 使用 Canvas 方式下載
  return downloadImageViaCanvas(imageSrc);
}

/**
 * 從 Data URL 或 URL 解析圖片位元組（用於 API 呼叫）
 * 
 * 注意：此函數用於將圖片轉換為 base64 格式，供 Gemini API 使用
 */
export async function resolveImageBytes(
  src: string
): Promise<{ imageBytes: string; mimeType: string }> {
  // Data URL 直接解析
  if (src.startsWith("data:")) {
    const match = src.match(/^data:(.*);base64,(.*)$/);
    if (!match) {
      throw new Error("無效的 Data URL 格式");
    }
    return {
      imageBytes: match[2],
      mimeType: match[1] || "image/jpeg",
    };
  }

  // 其他 URL 使用 Canvas 方式載入
  const blob = await downloadImageViaCanvas(src);
  
  // 將 Blob 轉換為 base64
  const base64 = await blobToBase64(blob);
  
  return {
    imageBytes: base64,
    mimeType: blob.type || "image/png",
  };
}

/**
 * 從 Data URL 提取 MIME 類型
 */
export function extractMimeTypeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.+-]+);base64,/);
  return match?.[1] ?? "image/png";
}

/**
 * 從 MIME 類型取得檔案副檔名
 */
export function getFileExtensionFromMimeType(mimeType: string): string {
  const extensionRaw = mimeType.split("/")[1]?.toLowerCase() ?? "png";
  return extensionRaw === "jpeg" ? "jpg" : extensionRaw;
}

/**
 * ============================================================
 * 建立縮圖
 * ============================================================
 * 
 * 將 Data URL 圖片縮小到指定尺寸，用於 History 顯示
 * 
 * @param dataUrl - 原圖的 Data URL
 * @param maxSize - 最大邊長（預設 200px）
 * @returns Promise<string> - 縮圖的 Data URL（JPEG 格式）
 */
export async function createThumbnail(dataUrl: string, maxSize: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // 計算縮圖尺寸（保持比例）
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        
        if (width > height) {
          if (width > maxSize) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }
        
        // 建立 Canvas 並繪製縮圖
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('無法建立 Canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 導出為 JPEG（較小的檔案大小）
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnailDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('無法載入圖片'));
    };
    
    img.src = dataUrl;
  });
}
