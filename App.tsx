
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import type { FormDataState, ImageResult, HistoryItem, HistoryFormData, ShotLabelKey } from './types';
import { CLOTHING_STYLES, EXPRESSIONS, LIGHTING_CONDITIONS, ASPECT_RATIOS, BACKGROUNDS, CLOTHING_SEASONS, POSES, MODEL_GENDERS } from './constants';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import PromptDisplay from './components/PromptDisplay';
import HistoryPanel from './components/HistoryPanel';
import AuthGate from './components/AuthGate';
import { useAuth } from './contexts/AuthContext';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { addHistoryRecord, fetchUserHistory } from './services/historyService';
import { storage } from "./firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { fetchGenerationQuota, consumeGenerationCredit } from './services/usageService';

const GEMINI_API_KEY = import.meta.env.VITE_API_KEY ?? '';

// Fix: Defined the AIStudio interface globally to resolve a TypeScript error
// about subsequent property declarations having conflicting types. This ensures
// the type definition for window.aistudio matches other declarations.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const AppContent: React.FC = () => {
  const { user, initializing } = useAuth();
  const { t, translateOption, translateShotLabel } = useTranslation();
  const [formData, setFormData] = useState<FormDataState>({
    productName: '登山後背包',
    clothingStyle: CLOTHING_STYLES[8], // 戶外休閒風
    clothingSeason: CLOTHING_SEASONS[5], // 高山
    modelGender: MODEL_GENDERS[0],
    background: BACKGROUNDS[11], // 台灣阿里山日出雲海
    expression: EXPRESSIONS[3], // 自信
    pose: POSES[0],
    lighting: LIGHTING_CONDITIONS[0],
    aspectRatio: ASPECT_RATIOS[0],
    faceImage: null,
    objectImage: null,
    additionalDescription: '',
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [isQuotaLoading, setIsQuotaLoading] = useState<boolean>(true);


  useEffect(() => {
    // 此詠唱僅用於顯示和複製。
    // 實際的生成邏輯會為每個鏡頭使用獨立的詠唱。
    const prompt = `A professional fashion photoshoot featuring '${formData.productName}'.
A ${formData.modelGender === '女性模特兒' ? 'female' : 'male'} model with a ${formData.clothingStyle} aesthetic is wearing clothing suitable for the ${formData.clothingSeason}.
The setting is ${formData.background}.
The model has a ${formData.expression} expression and is in a ${formData.pose} pose.${formData.additionalDescription ? `\nAdditional details: ${formData.additionalDescription}.` : ''}
${formData.faceImage ? `\nCRITICAL: The model's face must be identical to the face in the provided reference image.` : ''}
${formData.objectImage ? `\nCRITICAL: The scene must prominently feature the object from the provided reference image.` : ''}
Photographic style: Lit with ${formData.lighting}. The image should be detailed, ultra-realistic, photorealistic, high resolution (8k), cinematic, with a shallow depth of field and beautiful bokeh.
The final output will be a set of three distinct, full-frame images from this scene:
1. A full-body shot.
2. A medium shot (from the waist up).
3. A close-up shot (head and shoulders).`;
    setGeneratedPrompt(prompt);
  }, [formData, user]);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setFormData(prev => ({
                ...prev,
                [name]: {
                    data: base64String,
                    mimeType: file.type,
                    name: file.name,
                },
            }));
        };
        reader.readAsDataURL(file);
    }
  }, []);

  const handleFileRemove = useCallback((name: 'faceImage' | 'objectImage') => {
      setFormData(prev => ({
          ...prev,
          [name]: null,
      }));
      const input = document.getElementById(name) as HTMLInputElement;
      if (input) {
          input.value = '';
      }
  }, []);

  const sanitizeFormDataForHistory = useCallback(
    (data: FormDataState): HistoryFormData => ({
      productName: data.productName,
      clothingStyle: data.clothingStyle,
      clothingSeason: data.clothingSeason,
      modelGender: data.modelGender,
      background: data.background,
      expression: data.expression,
      pose: data.pose,
      lighting: data.lighting,
      aspectRatio: data.aspectRatio,
      additionalDescription: data.additionalDescription,
      faceImage: data.faceImage
        ? {
            name: data.faceImage.name,
            mimeType: data.faceImage.mimeType,
            hasData: !!data.faceImage.data,
          }
        : null,
      objectImage: data.objectImage
        ? {
            name: data.objectImage.name,
            mimeType: data.objectImage.mimeType,
            hasData: !!data.objectImage.data,
          }
        : null,
    }),
    []
  );

  const restoreFormDataFromHistory = useCallback(
    (historyData: HistoryFormData): FormDataState => ({
      productName: historyData.productName,
      clothingStyle: historyData.clothingStyle,
      clothingSeason: historyData.clothingSeason,
      modelGender: historyData.modelGender,
      background: historyData.background,
      expression: historyData.expression,
      pose: historyData.pose,
      lighting: historyData.lighting,
      aspectRatio: historyData.aspectRatio,
      additionalDescription: historyData.additionalDescription,
      faceImage: null,
      objectImage: null,
    }),
    []
  );

  const uploadHistoryImages = useCallback(async (uid: string, images: ImageResult[]): Promise<ImageResult[]> => {
    if (!storage) {
      console.warn("Firebase Storage is not initialised; history items will keep base64 data.");
      return images;
    }

    const timestamp = Date.now();
    const uploadedImages = await Promise.all(
      images.map(async (image, index) => {
        if (!image.src.startsWith("data:")) {
          return image;
        }

        const dataUrlMatch = image.src.match(/^data:(image\/[a-zA-Z0-9+.+-]+);base64,/);
        const mimeTypeFromDataUrl = dataUrlMatch?.[1] ?? "image/png";
        const extensionRaw = mimeTypeFromDataUrl.split("/")[1]?.toLowerCase() ?? "png";
        const extension = extensionRaw === "jpeg" ? "jpg" : extensionRaw;
        const storageRef = ref(storage, `users/${uid}/history/${timestamp}-${index}.${extension}`);

        await uploadString(storageRef, image.src, "data_url");
        const downloadUrl = await getDownloadURL(storageRef);

        return {
          ...image,
          src: downloadUrl,
        };
      })
    );
    return uploadedImages;
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setError(null);

    if (!user) {
      setError(t.errors.mustLogin);
      return;
    }
    if (!GEMINI_API_KEY) {
      setError(t.errors.missingApiKey);
      return;
    }
    if (remainingCredits !== null && remainingCredits <= 0) {
      setError(t.errors.quotaExhausted);
      return;
    }

    let creditsAfterConsume = remainingCredits ?? null;
    try {
      creditsAfterConsume = await consumeGenerationCredit(user.uid);
      setRemainingCredits(creditsAfterConsume);
    } catch (consumeError) {
      if (consumeError instanceof Error && consumeError.message === "NO_CREDITS") {
        setError(t.errors.quotaExhausted);
      } else {
        console.error("Failed to deduct generation credit:", consumeError);
        setError(t.errors.consumeFailed);
      }
      return;
    }

    setIsLoading(true);
    setImages([]);
    
    const basePrompt = `A professional fashion photoshoot featuring '${formData.productName}'.
A ${formData.modelGender === '女性模特兒' ? 'female' : 'male'} model with a ${formData.clothingStyle} aesthetic is wearing clothing suitable for the ${formData.clothingSeason}.
The setting is ${formData.background}.
The model has a ${formData.expression} expression and is in a ${formData.pose} pose.${formData.additionalDescription ? `\nAdditional details: ${formData.additionalDescription}.` : ''}
Photographic style: Lit with ${formData.lighting}. This must be a single, full-frame photograph. The image should be detailed, ultra-realistic, photorealistic, high resolution (8k), cinematic, with a shallow depth of field and beautiful bokeh. Do not create collages, diptychs, triptychs, or any split-screen images.
The final output will be a set of three distinct, full-frame images from this scene:
1. A full-body shot.
2. A medium shot (from the waist up).
3. A close-up shot (head and shoulders).`;

    const shotTypes: { prompt: string; key: ShotLabelKey }[] = [
      { prompt: 'CRITICAL: The photograph MUST be a full-body shot, showing the model from head to toe.', key: 'fullBody' },
      { prompt: 'CRITICAL: The photograph MUST be a medium shot, capturing the model from the waist up.', key: 'medium' },
      { prompt: 'CRITICAL: The photograph MUST be a close-up shot, focusing on the model\'s head and shoulders.', key: 'closeUp' },
    ];
    
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      const appendApiKey = (url: string) => {
        if (!GEMINI_API_KEY) return url;
        return url.includes("?") ? `${url}&key=${GEMINI_API_KEY}` : `${url}?key=${GEMINI_API_KEY}`;
      };

      const blobToBase64 = (blob: Blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (typeof result === "string") {
              const base64 = result.split(",")[1];
              resolve(base64 ?? "");
            } else {
              reject(new Error(t.errors.imageReadFailed));
            }
          };
          reader.onerror = () =>
            reject(reader.error ?? new Error(t.errors.imageReadFailed));
          reader.readAsDataURL(blob);
        });

      const extractCandidates = (rawResponse: any) => {
        if (rawResponse?.candidates) return rawResponse.candidates;
        if (rawResponse?.response?.candidates) return rawResponse.response.candidates;
        if (Array.isArray(rawResponse?.inlinedResponses)) {
          const inlineMatch = rawResponse.inlinedResponses.find(
            (item: any) => item?.response?.candidates?.length
          );
          if (inlineMatch) return inlineMatch.response.candidates;
        }
        if (Array.isArray(rawResponse?.response?.inlinedResponses)) {
          const inlineMatch = rawResponse.response.inlinedResponses.find(
            (item: any) => item?.response?.candidates?.length
          );
          if (inlineMatch) return inlineMatch.response.candidates;
        }
        return undefined;
      };

      const imagePromises = shotTypes.map(async (shot) => {
        const parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [];

        let promptWithInstructions = `${basePrompt}\n${shot.prompt}`;

        if (formData.faceImage) {
          promptWithInstructions += "\nCRITICAL INSTRUCTION: The model's face must be identical to the face in the first provided image.";
          parts.push({
            inlineData: {
              data: formData.faceImage.data,
              mimeType: formData.faceImage.mimeType,
            },
          });
        }
        if (formData.objectImage) {
          const imageRefText = formData.faceImage ? "second" : "first";
          promptWithInstructions += `\nCRITICAL INSTRUCTION: The scene must prominently feature the object from the ${imageRefText} provided image.`;
          parts.push({
            inlineData: {
              data: formData.objectImage.data,
              mimeType: formData.objectImage.mimeType,
            },
          });
        }

        parts.push({ text: promptWithInstructions });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: [{
            role: 'user',
            parts,
          }],
          config: {
            responseModalities: [Modality.IMAGE],
            imageConfig: {
              aspectRatio: formData.aspectRatio,
            },
          },
        });

        const candidates = extractCandidates(response);
        const candidate = candidates?.[0] ?? null;
        const contentParts: any[] | undefined = candidate?.content?.parts;

        if (!contentParts || contentParts.length === 0) {
          const blockReason =
            response.promptFeedback?.blockReason ??
            response.promptFeedback?.safetyRatings?.[0]?.category;
          console.error("Gemini response returned no image content", response);
          throw new Error(blockReason ?? t.errors.apiNoImage);
        }

        const imagePart = contentParts.find(
          (part) => part.inlineData || part.fileData || (Array.isArray(part.parts) && part.parts.length > 0)
        );

        if (!imagePart) {
          console.error("Gemini response did not include an image part", response);
          throw new Error(t.errors.unknownShotFailure);
        }

        if (imagePart.inlineData?.data) {
          return {
            label: translateShotLabel(shot.key),
            labelKey: shot.key,
            mimeType: imagePart.inlineData.mimeType ?? "image/png",
            base64: imagePart.inlineData.data,
          };
        }

        if (imagePart.fileData?.fileUri) {
          const downloadUrl = appendApiKey(imagePart.fileData.fileUri);
          const imageResponse = await fetch(downloadUrl);
          if (!imageResponse.ok) {
            console.error("Failed to download generated image", imageResponse);
            throw new Error(t.errors.imageDownloadFailed(imageResponse.status));
          }
          const blob = await imageResponse.blob();
          const base64 = await blobToBase64(blob);
          const resolvedMimeType =
            imagePart.fileData.mimeType ??
            (blob.type ? blob.type : undefined) ??
            "image/png";
          return {
            label: translateShotLabel(shot.key),
            labelKey: shot.key,
            mimeType: resolvedMimeType,
            base64,
          };
        }

        if (Array.isArray(imagePart.parts)) {
          const nestedInline = imagePart.parts.find((part: any) => part.inlineData);
          if (nestedInline?.inlineData?.data) {
            return {
              label: translateShotLabel(shot.key),
              labelKey: shot.key,
              mimeType: nestedInline.inlineData.mimeType ?? "image/png",
              base64: nestedInline.inlineData.data,
            };
          }
        }

        console.error("Gemini response produced an unrecognised image structure", response);
        throw new Error(t.errors.general);
      });

      const generatedImagesRaw = await Promise.all(imagePromises);
      const generatedImages = generatedImagesRaw.map(({ label, labelKey, mimeType, base64 }) => ({
        src: `data:${mimeType};base64,${base64}`,
        label,
        labelKey,
        videoSrc: null,
        isGeneratingVideo: false,
        videoError: null,
      }));
      
      if (generatedImages.length !== 3) {
        throw new Error(t.errors.insufficientImages);
      }

      const imageResults: ImageResult[] = generatedImages.map(img => ({
        ...img,
        videoSrc: null,
        isGeneratingVideo: false,
        videoError: null,
      }));
      setImages(imageResults);

      let storedImages: ImageResult[] = imageResults;
      try {
        storedImages = await uploadHistoryImages(user.uid, imageResults);
      } catch (uploadError) {
        console.error("Failed to upload history images:", uploadError);
      }
      setImages(storedImages);

      const historySnapshot: HistoryItem = {
        formData: sanitizeFormDataForHistory(formData),
        images: JSON.parse(JSON.stringify(storedImages)),
      };

      setHistory(prevHistory => {
        const newHistory = [historySnapshot, ...prevHistory].slice(0, 5);
        return newHistory;
      });

      try {
        await addHistoryRecord(user.uid, historySnapshot);
      } catch (historyError) {
        console.error("Failed to persist history record:", historyError);
      }

    } catch (err) {
      console.error(err);
      const fallbackError =
        err instanceof Error && err.message ? err.message : t.errors.general;
      setError(fallbackError);
    } finally {
      setIsLoading(false);
    }
  }, [formData, user, uploadHistoryImages, sanitizeFormDataForHistory, remainingCredits, isLoading, t, translateShotLabel]);

  const handleGenerateVideo = useCallback(async (index: number) => {
    const supportedVideoRatios = ["16:9", "9:16"];
    const selectedAspectRatio = formData.aspectRatio;
    if (!supportedVideoRatios.includes(selectedAspectRatio)) {
      setImages((prev) =>
        prev.map((img, i) =>
          i === index
            ? { ...img, isGeneratingVideo: false, videoError: t.video.unsupportedAspect }
            : img
        )
      );
      return;
    }

    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, isGeneratingVideo: true, videoError: null } : img
      )
    );

    try {
      if (!GEMINI_API_KEY) {
        throw new Error(t.errors.missingApiKey);
      }
      if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio?.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const targetImage = images[index];

      const resolveImageBytes = async (src: string) => {
        if (src.startsWith("data:")) {
          const match = src.match(/^data:(.*);base64,(.*)$/);
          if (!match) throw new Error(t.errors.imageReadFailed);
          return {
            imageBytes: match[2],
            mimeType: match[1] || "image/jpeg",
          };
        }
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(t.video.fetchImageFailed);
        }
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              reject(new Error(t.errors.imageReadFailed));
            }
          };
          reader.onerror = () => reject(reader.error ?? new Error(t.errors.imageReadFailed));
          reader.readAsDataURL(blob);
        });
        const match = dataUrl.match(/^data:(.*);base64,(.*)$/);
        if (!match) {
          throw new Error(t.errors.imageReadFailed);
        }
        return {
          imageBytes: match[2],
          mimeType: match[1] || blob.type || "image/jpeg",
        };
      };

      const { imageBytes, mimeType } = await resolveImageBytes(targetImage.src);

      const videoPrompt =
        "Make this a subtle, high-quality cinemagraph. The model's hair and clothing should move slightly in a gentle breeze.";

      let operation = await ai.models.generateVideos({
        model: "veo-3.1-fast-generate-preview",
        prompt: videoPrompt,
        image: {
          imageBytes,
          mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: "720p",
          aspectRatio: formData.aspectRatio,
        },
      });

      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      if (operation.error) {
        throw new Error(operation.error.message || t.video.generateFailed);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        throw new Error(t.video.missingDownloadLink);
      }

      const separator = downloadLink.includes("?") ? "&" : "?";
      const signedUrl = `${downloadLink}${separator}alt=media&key=${GEMINI_API_KEY}`;
      const videoResponse = await fetch(signedUrl);
      if (!videoResponse.ok) {
        throw new Error(t.errors.videoDownloadFailed(videoResponse.statusText));
      }

      const videoBlob = await videoResponse.blob();
      const videoUrl = URL.createObjectURL(videoBlob);

      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isGeneratingVideo: false, videoSrc: videoUrl } : img
        )
      );

    } catch (err: any) {
      let errorMessage =
        err instanceof Error && err.message ? err.message : t.errors.general;
      if (errorMessage.includes("Requested entity was not found")) {
        errorMessage = t.errors.missingApiKey;
      }

      console.error("Video generation error:", err);
      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, isGeneratingVideo: false, videoError: errorMessage } : img
        )
      );
    }
}, [images, formData.aspectRatio, t]);

  const handleRestoreHistory = useCallback((item: HistoryItem) => {
    const restored = restoreFormDataFromHistory(item.formData);
    setFormData(restored);
    setImages([]);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [restoreFormDataFromHistory]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setHistory([]);
        setIsHistoryLoading(false);
        return;
      }
      setIsHistoryLoading(true);
      try {
        const records = await fetchUserHistory(user.uid);
        setHistory(records);
      } catch (err) {
        console.error("Failed to load history records:", err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadHistory();
  }, [user]);

  useEffect(() => {
    const loadQuota = async () => {
      if (!user) {
        setRemainingCredits(null);
        setIsQuotaLoading(false);
        return;
      }
      setIsQuotaLoading(true);
      try {
        const usage = await fetchGenerationQuota(user.uid);
        setRemainingCredits(usage.generationCredits);
      } catch (quotaError) {
        console.error("Failed to load remaining credits:", quotaError);
      } finally {
        setIsQuotaLoading(false);
      }
    };
    loadQuota();
  }, [user]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 text-lg">{t.general.initializing}</p>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header remainingCredits={remainingCredits} isQuotaLoading={isQuotaLoading} />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            <PromptForm 
              formData={formData} 
              onFormChange={handleFormChange}
              onFileChange={handleFileChange}
              onFileRemove={handleFileRemove}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            <HistoryPanel history={history} onRestore={handleRestoreHistory} isLoading={isHistoryLoading} />
          </div>
          <div className="sticky top-8">
            <PromptDisplay 
              prompt={generatedPrompt} 
              images={images}
              isLoading={isLoading}
              error={error}
              productName={formData.productName}
              onGenerateVideo={handleGenerateVideo}
              aspectRatio={formData.aspectRatio}
            />
          </div>
        </main>
        <footer className="text-center py-8 mt-8 text-slate-500 text-sm">
          Copyright 2025 @ <a href="https://flypigai.icareu.tw/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">FlyPig AI</a>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <TranslationProvider>
    <AppContent />
  </TranslationProvider>
);

export default App;