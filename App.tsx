
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import type { FormDataState, ImageResult, HistoryItem } from './types';
import { CLOTHING_STYLES, EXPRESSIONS, LENSES, LIGHTING_CONDITIONS, ASPECT_RATIOS, BACKGROUNDS, CLOTHING_SEASONS, POSES, MODEL_GENDERS } from './constants';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import PromptDisplay from './components/PromptDisplay';
import HistoryPanel from './components/HistoryPanel';
import AuthGate from './components/AuthGate';
import { useAuth } from './contexts/AuthContext';
import { addHistoryRecord, fetchUserHistory } from './services/historyService';

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

const App: React.FC = () => {
  const { user, initializing } = useAuth();
  const [formData, setFormData] = useState<FormDataState>({
    productName: '登山後背包',
    clothingStyle: CLOTHING_STYLES[8], // 戶外休閒風
    clothingSeason: CLOTHING_SEASONS[5], // 高山
    modelGender: MODEL_GENDERS[0],
    background: BACKGROUNDS[11], // 台灣阿里山日出雲海
    expression: EXPRESSIONS[3], // 自信
    pose: POSES[0],
    lens: LENSES[1], // 50mm
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


  useEffect(() => {
    // 此詠唱僅用於顯示和複製。
    // 實際的生成邏輯會為每個鏡頭使用獨立的詠唱。
    const prompt = `A professional fashion photoshoot featuring '${formData.productName}'.
A ${formData.modelGender === '女性模特兒' ? 'female' : 'male'} model with a ${formData.clothingStyle} aesthetic is wearing clothing suitable for the ${formData.clothingSeason}.
The setting is ${formData.background}.
The model has a ${formData.expression} expression and is in a ${formData.pose} pose.${formData.additionalDescription ? `\nAdditional details: ${formData.additionalDescription}.` : ''}
${formData.faceImage ? `\nCRITICAL: The model's face must be identical to the face in the provided reference image.` : ''}
${formData.objectImage ? `\nCRITICAL: The scene must prominently feature the object from the provided reference image.` : ''}
Photographic style: Shot on a ${formData.lens} lens with ${formData.lighting}. The image should be detailed, ultra-realistic, photorealistic, high resolution (8k), cinematic, with a shallow depth of field and beautiful bokeh.
Image composition: The image must have a ${formData.aspectRatio} aspect ratio.
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

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setImages([]);
    
    if (!user) {
      setError('請先登入後再產生圖片。');
      setIsLoading(false);
      return;
    }
    if (!GEMINI_API_KEY) {
      setError('尚未設定 Gemini API Key，請於環境變數新增 VITE_API_KEY。');
      setIsLoading(false);
      return;
    }
    const basePrompt = `A professional fashion photoshoot featuring '${formData.productName}'.
A ${formData.modelGender === '女性模特兒' ? 'female' : 'male'} model with a ${formData.clothingStyle} aesthetic is wearing clothing suitable for the ${formData.clothingSeason}.
The setting is ${formData.background}.
The model has a ${formData.expression} expression and is in a ${formData.pose} pose.${formData.additionalDescription ? `\nAdditional details: ${formData.additionalDescription}.` : ''}
Photographic style: Shot on a ${formData.lens} lens with ${formData.lighting}. This must be a single, full-frame photograph. The image should be detailed, ultra-realistic, photorealistic, high resolution (8k), cinematic, with a shallow depth of field and beautiful bokeh. Do not create collages, diptychs, triptychs, or any split-screen images.
Image composition: The image must have a ${formData.aspectRatio} aspect ratio.`;

    const shotTypes = [
      { prompt: 'CRITICAL: The photograph MUST be a full-body shot, showing the model from head to toe.', label: '全身' },
      { prompt: 'CRITICAL: The photograph MUST be a medium shot, capturing the model from the waist up.', label: '半身' },
      { prompt: 'CRITICAL: The photograph MUST be a close-up shot, focusing on the model\'s head and shoulders.', label: '特寫' },
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
              reject(new Error("無法讀取圖片資料。"));
            }
          };
          reader.onerror = () => reject(reader.error ?? new Error("讀取圖片資料時發生錯誤。"));
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
          contents: { parts },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });

        const candidates = extractCandidates(response);
        const candidate = candidates?.[0] ?? null;
        const contentParts: any[] | undefined = candidate?.content?.parts;

        if (!contentParts || contentParts.length === 0) {
          const blockReason =
            response.promptFeedback?.blockReason ??
            response.promptFeedback?.safetyRatings?.[0]?.category;
          console.error("Gemini 回傳內容缺少圖片資料", response);
          throw new Error(
            blockReason
              ? `模型拒絕生成圖片：${blockReason}。`
              : "API 未回傳任何圖片資料，請稍後再試。"
          );
        }

        const imagePart = contentParts.find(
          (part) => part.inlineData || part.fileData || (Array.isArray(part.parts) && part.parts.length > 0)
        );

        if (!imagePart) {
          console.error("Gemini 回傳內容缺少 image part", response);
          throw new Error("API 未能針對其中一個視角回傳圖片。");
        }

        if (imagePart.inlineData?.data) {
          return {
            label: shot.label,
            mimeType: imagePart.inlineData.mimeType ?? "image/png",
            base64: imagePart.inlineData.data,
          };
        }

        if (imagePart.fileData?.fileUri) {
          const downloadUrl = appendApiKey(imagePart.fileData.fileUri);
          const imageResponse = await fetch(downloadUrl);
          if (!imageResponse.ok) {
            console.error("下載 Gemini 圖片失敗", imageResponse);
            throw new Error(`無法下載生成圖片（HTTP ${imageResponse.status}）。`);
          }
          const blob = await imageResponse.blob();
          const base64 = await blobToBase64(blob);
          const resolvedMimeType =
            imagePart.fileData.mimeType ??
            (blob.type ? blob.type : undefined) ??
            "image/png";
          return {
            label: shot.label,
            mimeType: resolvedMimeType,
            base64,
          };
        }

        if (Array.isArray(imagePart.parts)) {
          const nestedInline = imagePart.parts.find((part: any) => part.inlineData);
          if (nestedInline?.inlineData?.data) {
            return {
              label: shot.label,
              mimeType: nestedInline.inlineData.mimeType ?? "image/png",
              base64: nestedInline.inlineData.data,
            };
          }
        }

        console.error("Gemini 回傳內容未識別的圖片結構", response);
        throw new Error("無法解析模型回傳的圖片資料。");
      });

      const generatedImagesRaw = await Promise.all(imagePromises);
      const generatedImages = generatedImagesRaw.map(({ label, mimeType, base64 }) => ({
        src: `data:${mimeType};base64,${base64}`,
        label,
        videoSrc: null,
        isGeneratingVideo: false,
        videoError: null,
      }));
      
      if (generatedImages.length !== 3) {
        throw new Error('圖片生成數量不足，請重試。');
      }

      const imageResults: ImageResult[] = generatedImages.map(img => ({
        ...img,
        videoSrc: null,
        isGeneratingVideo: false,
        videoError: null,
      }));
      setImages(imageResults);

      let storedImages: ImageResult[] = [];
      try {
        storedImages = await uploadHistoryImages(user.uid, imageResults);
      } catch (uploadError) {
        console.error("上傳歷史圖片失敗：", uploadError);
        throw new Error("圖片儲存失敗，請稍後再試。");
      }

      const historySnapshot: HistoryItem = {
        formData: JSON.parse(JSON.stringify(formData)),
        images: JSON.parse(JSON.stringify(imageResults)),
      };

      setHistory(prevHistory => {
        const newHistory = [historySnapshot, ...prevHistory].slice(0, 10);
        return newHistory;
      });

      addHistoryRecord(user.uid, historySnapshot).catch((historyError) => {
        console.error('儲存歷史紀錄失敗：', historyError);
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '發生未知錯誤，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  }, [formData, user]);

  const handleGenerateVideo = useCallback(async (index: number) => {
    setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, isGeneratingVideo: true, videoError: null } : img
    ));

    try {
        if (!GEMINI_API_KEY) {
            throw new Error('尚未設定 Gemini API Key，請於環境變數新增 VITE_API_KEY。');
        }
        if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
            await window.aistudio?.openSelectKey();
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const targetImage = images[index];
        const base64Data = targetImage.src.split(',')[1];
        const mimeType = targetImage.src.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
        
        const videoPrompt = "Make this a subtle, high-quality cinemagraph. The model's hair and clothing should move slightly in a gentle breeze.";

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: videoPrompt,
            image: {
                imageBytes: base64Data,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: formData.aspectRatio,
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        if (operation.error) {
            throw new Error(operation.error.message || '影片生成過程中發生錯誤。');
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error('無法取得影片下載連結。');
        }

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY!}`);
        if (!videoResponse.ok) {
            throw new Error(`下載影片失敗: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        setImages(prev => prev.map((img, i) => 
            i === index ? { ...img, isGeneratingVideo: false, videoSrc: videoUrl } : img
        ));

    } catch (err: any) {
        let errorMessage = err instanceof Error ? err.message : '發生未知錯誤，請稍後再試。';
        if (errorMessage.includes("Requested entity was not found")) {
            errorMessage = "API 金鑰驗證失敗，請重新選擇您的 API 金鑰後再試一次。";
        }
        
        console.error("Video generation error:", err);
        setImages(prev => prev.map((img, i) => 
            i === index ? { ...img, isGeneratingVideo: false, videoError: errorMessage } : img
        ));
    }
}, [images, formData.aspectRatio]);

  const handleRestoreHistory = useCallback((item: HistoryItem) => {
    setFormData(item.formData);
    setImages(item.images);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
        console.error('載入歷史紀錄失敗：', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadHistory();
  }, [user]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 text-lg">初始化中...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
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

export default App;