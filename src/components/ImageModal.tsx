import React, { useEffect } from "react";
import type { ImageResult } from "../types";
import DownloadIcon from "./icons/DownloadIcon";
import SpinnerIcon from "./icons/SpinnerIcon";
import { useTranslation } from "../contexts/TranslationContext";
import { downloadImage } from "../utils/imageUtils";

interface ImageModalProps {
  image: ImageResult | null;
  shotLabel: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, shotLabel, onClose }) => {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = React.useState(false);

  // 按 ESC 鍵關閉 Modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (image) {
      document.addEventListener("keydown", handleEscape);
      // 防止背景滾動
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [image, onClose]);

  const handleDownload = async () => {
    if (!image) return;

    try {
      setIsDownloading(true);
      const blob = await downloadImage(image.src);

      const extension = blob.type?.split("/")[1]?.toLowerCase() || "png";
      const filename = `${shotLabel}-${Date.now()}.${extension === "jpeg" ? "jpg" : extension}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("下載圖片失敗:", error);
      alert(error instanceof Error ? error.message : "下載圖片失敗，請稍後再試");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      style={{ touchAction: "none" }}
    >
      <div
        className="relative max-w-[95vw] max-h-[95vh] flex flex-col items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "auto" }}
      >
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={t.promptDisplay.closeModal || "關閉"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 圖片容器 */}
        <div className="relative flex items-center justify-center bg-slate-900/50 rounded-lg overflow-hidden">
          <img
            src={image.src}
            alt={shotLabel}
            className="max-w-full max-h-[85vh] object-contain"
            style={{ userSelect: "none" }}
            draggable={false}
          />
        </div>

        {/* 下載按鈕 */}
        <div className="mt-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-base font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black/90"
            aria-label={t.promptDisplay.downloadImage}
          >
            {isDownloading ? (
              <>
                <SpinnerIcon className="w-5 h-5 animate-spin" />
                <span>{t.promptDisplay.downloading}</span>
              </>
            ) : (
              <>
                <DownloadIcon className="w-5 h-5" />
                <span>{t.promptDisplay.downloadImage}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

