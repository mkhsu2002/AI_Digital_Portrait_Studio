import React, { useState, useCallback } from "react";
import type { ImageResult } from "../types";
import ClipboardIcon from "./icons/ClipboardIcon";
import CheckIcon from "./icons/CheckIcon";
import SpinnerIcon from "./icons/SpinnerIcon";
import DownloadIcon from "./icons/DownloadIcon";
import { useTranslation } from "../contexts/TranslationContext";

interface PromptDisplayProps {
  prompt: string;
  images: ImageResult[];
  isLoading: boolean;
  error: string | null;
  productName: string;
  onGenerateVideo: (index: number) => void;
  aspectRatio: string;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({
  prompt,
  images,
  isLoading,
  error,
  productName,
  onGenerateVideo,
  aspectRatio,
}) => {
  const { t, translateShotLabel } = useTranslation();
  const supportedVideoRatios = ["16:9", "9:16"];
  const isVideoGenerationSupported = supportedVideoRatios.includes(aspectRatio);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = useCallback(async (fileUrl: string, filename: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [prompt]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <SpinnerIcon className="w-12 h-12 animate-spin text-blue-500" />
          <p className="mt-4 text-lg">{t.promptDisplay.loadingTitle}</p>
          <p className="text-sm">{t.promptDisplay.loadingNote}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-400">
          <div className="text-center">
            <h3 className="text-lg font-semibold">{t.promptDisplay.errorTitle}</h3>
            <p className="mt-2 text-sm bg-red-900/50 p-3 rounded-md">{error}</p>
          </div>
        </div>
      );
    }

    if (images.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-6">
          {images.map((image, index) => {
            const sanitizedProductName = productName.replace(/\s+/g, "_");
            const fileExtension = image.videoSrc ? "mp4" : "jpeg";
            const shotLabel = image.labelKey ? translateShotLabel(image.labelKey) : image.label;
            const filename = `${sanitizedProductName}_${shotLabel}_${Date.now()}.${fileExtension}`;

            return (
              <div
                key={index}
                className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700 flex flex-col"
              >
                <div className="aspect-[3/4] bg-slate-900 flex items-center justify-center">
                  {image.videoSrc ? (
                    <video
                      src={image.videoSrc}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={image.src}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {image.videoError && (
                    <div className="bg-red-900/50 p-2 rounded-md text-red-300 text-xs text-center">
                      {image.videoError}
                    </div>
                  )}
                  {!image.videoSrc && (
                    <button
                      onClick={() => onGenerateVideo(index)}
                      disabled={image.isGeneratingVideo || !isVideoGenerationSupported}
                      title={
                        isVideoGenerationSupported ? undefined : t.promptDisplay.videoUnsupported
                      }
                      className="w-full flex justify-center items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                      {image.isGeneratingVideo ? (
                        <>
                          <SpinnerIcon className="w-5 h-5 animate-spin" />
                          {t.promptDisplay.generatingVideo}
                        </>
                      ) : (
                        t.promptDisplay.generateVideo
                      )}
                    </button>
                  )}
                  {!isVideoGenerationSupported && (
                    <p className="text-xs text-slate-400 text-center">
                      {t.promptDisplay.videoUnsupported}
                    </p>
                  )}
                  <button
                    onClick={() => handleDownload(image.videoSrc || image.src, filename)}
                    className="w-full flex justify-center items-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    {image.videoSrc
                      ? t.promptDisplay.downloadVideoLabel(shotLabel)
                      : t.promptDisplay.downloadImageLabel(shotLabel)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium">{t.promptDisplay.emptyTitle}</h3>
          <p className="mt-1 text-sm">{t.promptDisplay.emptyDescription}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-200">{t.promptDisplay.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{t.promptDisplay.description}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              isCopied
                ? "bg-green-600 text-white focus:ring-green-500"
                : "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500"
            }`}
          >
            {isCopied ? (
              <>
                <CheckIcon className="w-5 h-5 mr-2" />
                {t.promptDisplay.copied}
              </>
            ) : (
              <>
                <ClipboardIcon className="w-5 h-5 mr-2" />
                {t.promptDisplay.copyPrompt}
              </>
            )}
          </button>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg flex-grow overflow-auto min-h-[400px] flex flex-col">
          {renderContent()}
        </div>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-200">
            {t.promptDisplay.togglePrompt}
          </summary>
          <div className="mt-2 bg-slate-900 p-3 rounded-md whitespace-pre-wrap text-slate-300 text-xs leading-relaxed">
            {prompt}
          </div>
        </details>
      </div>
    </div>
  );
};

export default PromptDisplay;
