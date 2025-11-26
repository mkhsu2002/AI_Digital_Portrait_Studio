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
 * 從 Firebase Storage URL 提取路徑
 */
function extractStoragePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Firebase Storage URL 格式：https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token=...
    const pathMatch = urlObj.pathname.match(/\/v0\/b\/[^/]+\/o\/(.+)/);
    if (pathMatch) {
      // 解碼 URL 編碼的路徑
      return decodeURIComponent(pathMatch[1]);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 使用 Firebase Storage SDK 下載圖片（避免 CORS 問題）
 */
export async function downloadImageFromFirebaseStorage(
  url: string,
  storageInstance?: any
): Promise<Blob> {
  // 如果提供了 storage 實例，使用 SDK 下載
  if (storageInstance) {
    try {
      const path = extractStoragePathFromUrl(url);
      if (path) {
        // 動態導入 Firebase Storage 函數
        const { ref, getBytes } = await import('firebase/storage');
        const storageRef = ref(storageInstance, path);
        const bytes = await getBytes(storageRef);
        
        // 從 URL 取得 MIME 類型
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const extension = pathname.split('.').pop()?.toLowerCase() || 'png';
        const mimeType = extension === 'jpg' || extension === 'jpeg' 
          ? 'image/jpeg' 
          : extension === 'png' 
          ? 'image/png' 
          : 'image/png';
        
        // 將 bytes 轉換為 Blob
        return new Blob([bytes], { type: mimeType });
      }
    } catch (sdkError) {
      console.warn('Firebase Storage SDK 下載失敗，嘗試其他方式:', sdkError);
      // 繼續執行 fallback 策略
    }
  }

  // 回退策略 1：嘗試直接 fetch（不設定 mode: 'cors'，某些情況下可能有效）
  try {
    const response = await fetch(url, {
      credentials: 'omit',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (fetchError) {
    // 回退策略 2：使用 Canvas 方式（不設定 crossOrigin）
    try {
      return await loadImageViaCanvasWithoutCORS(url);
    } catch (canvasError1) {
      // 回退策略 3：使用 Canvas 方式（設定 crossOrigin）
      try {
        return await loadImageViaCanvas(url);
      } catch (canvasError2) {
        throw new Error(
          `無法下載圖片：所有下載方式都失敗。` +
          `請檢查 Firebase Storage 的 CORS 設定。` +
          `建議在 Firebase Console 中設定 CORS 規則以允許圖片下載。`
        );
      }
    }
  }
}

/**
 * 從 Data URL 或 URL 解析圖片位元組（用於 API 呼叫）
 * 支援 Firebase Storage URL（優先使用 fetch，失敗時使用 Canvas 繞過 CORS）
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

  // 檢查是否是 Firebase Storage URL
  const isFirebaseStorageUrl = src.includes('firebasestorage.googleapis.com');
  
  // 從 URL 載入
  let blob: Blob;
  let lastError: Error | null = null;
  
  // 策略 1：優先嘗試直接 fetch（適用於已設定 CORS 的情況）
  try {
    const response = await fetch(src, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'image/*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    
    blob = await response.blob();
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
    
    // 策略 2：如果是 Firebase Storage URL 或 CORS 錯誤，嘗試使用 Canvas 方式
    if (isFirebaseStorageUrl || (error instanceof TypeError && error.message.includes('fetch'))) {
      try {
        blob = await loadImageViaCanvas(src);
      } catch (canvasError) {
        // 策略 3：如果 Canvas 也失敗，嘗試不設定 crossOrigin（某些情況下可能有效）
        try {
          blob = await loadImageViaCanvasWithoutCORS(src);
        } catch (finalError) {
          // 所有策略都失敗，拋出原始錯誤
          throw new Error(
            `無法載入圖片：${src}。` +
            `原因：${lastError.message}。` +
            `這可能是 CORS 設定問題，請檢查 Firebase Storage 的 CORS 設定。`
          );
        }
      }
    } else {
      throw lastError;
    }
  }

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
 * 透過 Canvas 載入圖片（繞過 CORS 限制）
 * 適用於 Firebase Storage 或其他有 CORS 限制的圖片資源
 */
export async function loadImageViaCanvas(imageSrc: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let triedWithoutCORS = false;
    
    const tryLoad = (useCORS: boolean) => {
      if (useCORS) {
        img.crossOrigin = 'anonymous';
      } else {
        img.removeAttribute('crossOrigin');
      }
      
      // 設定超時（10 秒）
      const timeout = setTimeout(() => {
        if (!triedWithoutCORS && useCORS) {
          // 如果 CORS 方式失敗，嘗試不使用 CORS
          triedWithoutCORS = true;
          tryLoad(false);
        } else {
          reject(new Error('圖片載入超時，可能是網路連線問題或 CORS 設定不正確'));
        }
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // 繪製圖片到 canvas
          ctx.drawImage(img, 0, 0);
          
          // 轉換為 Blob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          }, 'image/jpeg', 0.95);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Unknown error'));
        }
      };
      
      img.onerror = (event) => {
        clearTimeout(timeout);
        if (!triedWithoutCORS && useCORS) {
          // 如果 CORS 方式失敗，嘗試不使用 CORS
          triedWithoutCORS = true;
          tryLoad(false);
        } else {
          const errorMsg = `無法載入圖片：${imageSrc}。這可能是 CORS 設定問題。`;
          console.error('Image load error:', event);
          reject(new Error(errorMsg));
        }
      };
      
      // 設定圖片來源（觸發載入）
      img.src = imageSrc;
    };
    
    // 先嘗試使用 CORS
    tryLoad(true);
  });
}

/**
 * 透過 Canvas 載入圖片（不設定 crossOrigin，某些情況下可能有效）
 */
export async function loadImageViaCanvasWithoutCORS(imageSrc: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 不設定 crossOrigin，某些伺服器可能允許這種方式
    
    const timeout = setTimeout(() => {
      reject(new Error('圖片載入超時'));
    }, 10000);
    
    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/jpeg', 0.95);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unknown error'));
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('無法載入圖片'));
    };
    
    img.src = imageSrc;
  });
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





