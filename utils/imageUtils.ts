/**
 * 圖片處理工具函數
 * 統一管理圖片轉換、上傳等邏輯
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
 * 從 Data URL 或 URL 載入圖片並轉換為 Blob URL
 * 這可以減少記憶體使用，因為 Blob URL 不會將整個圖片載入記憶體
 */
export async function createBlobUrl(imageSrc: string): Promise<string> {
  let blob: Blob;

  if (imageSrc.startsWith("data:")) {
    // Data URL 轉 Blob
    blob = dataUrlToBlob(imageSrc);
  } else {
    // 從 URL 載入
    const response = await fetch(imageSrc);
    if (!response.ok) {
      throw new Error(`Failed to load image: ${response.status} ${response.statusText}`);
    }
    blob = await response.blob();
  }

  return URL.createObjectURL(blob);
}

/**
 * 從 Data URL 或 URL 解析圖片位元組（用於 API 呼叫）
 */
export async function resolveImageBytes(src: string): Promise<{ imageBytes: string; mimeType: string }> {
  if (src.startsWith("data:")) {
    const match = src.match(/^data:(.*);base64,(.*)$/);
    if (!match) {
      throw new Error("Failed to read image data");
    }
    return {
      imageBytes: match[2],
      mimeType: match[1] || "image/jpeg",
    };
  }

  // 從 URL 載入
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  const dataUrl = await blobToBase64(blob);
  const match = dataUrl.match(/^data:(.*);base64,(.*)$/);
  
  if (!match) {
    throw new Error("Failed to read image data");
  }

  return {
    imageBytes: match[2],
    mimeType: match[1] || blob.type || "image/jpeg",
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




