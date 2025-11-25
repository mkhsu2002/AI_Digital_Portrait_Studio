/**
 * 圖片壓縮工具函數
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/png' | 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  outputFormat: 'image/jpeg',
};

/**
 * 壓縮圖片
 * 
 * @param file 原始圖片檔案
 * @param options 壓縮選項
 * @returns 壓縮後的 Blob
 */
export function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 計算縮放比例
          if (width > height) {
            if (width > opts.maxWidth) {
              height = (height * opts.maxWidth) / width;
              width = opts.maxWidth;
            }
          } else {
            if (height > opts.maxHeight) {
              width = (width * opts.maxHeight) / height;
              height = opts.maxHeight;
            }
          }

          // 設定 canvas 尺寸
          canvas.width = width;
          canvas.height = height;

          // 繪製圖片
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('無法取得 canvas context'));
            return;
          }

          // 使用高品質縮放
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // 轉換為 Blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('圖片壓縮失敗'));
              }
            },
            opts.outputFormat,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('無法載入圖片'));
      };

      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('無法讀取檔案'));
      }
    };

    reader.onerror = () => {
      reject(new Error('無法讀取檔案'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 檢查圖片是否需要壓縮
 */
export function shouldCompressImage(file: File, maxSize: number = 1024 * 1024): boolean {
  return file.size > maxSize;
}

/**
 * 智能壓縮：只在需要時壓縮
 */
export async function smartCompressImage(
  file: File,
  options: CompressionOptions & { minSize?: number } = {}
): Promise<Blob> {
  const { minSize = 1024 * 1024, ...compressionOptions } = options;

  // 如果檔案小於最小大小，直接返回
  if (file.size <= minSize) {
    return file;
  }

  // 否則進行壓縮
  return compressImage(file, compressionOptions);
}

/**
 * 將 Blob 轉換為 File（用於上傳）
 */
export function blobToFile(blob: Blob, fileName: string, mimeType: string): File {
  return new File([blob], fileName, { type: mimeType });
}




