
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import type { FormDataState, ImageResult, HistoryItem } from './types';
import { CLOTHING_STYLES, EXPRESSIONS, LENSES, LIGHTING_CONDITIONS, ASPECT_RATIOS, BACKGROUNDS, CLOTHING_SEASONS, POSES, MODEL_GENDERS } from './constants';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import PromptDisplay from './components/PromptDisplay';
import HistoryPanel from './components/HistoryPanel';

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
  }, [formData]);

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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      const imagePromises = shotTypes.map(shot => {
        const parts: ({ text: string } | { inlineData: { data: string, mimeType: string }})[] = [];
        
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

        return ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        }).then(response => ({ response, label: shot.label }));
      });

      const responses = await Promise.all(imagePromises);
      const generatedImages = responses.map(({response, label}) => {
          const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);
          if (!imagePart || !imagePart.inlineData) {
              throw new Error('API 未能針對其中一個視角回傳圖片。');
          }
          return {
            src: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
            label,
            videoSrc: null,
            isGeneratingVideo: false,
            videoError: null,
          };
      });
      
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

      // Add to history
      setHistory(prevHistory => {
        const newHistoryItem: HistoryItem = { formData, images: imageResults };
        // Avoid adding a duplicate of the most recent entry.
        if (prevHistory.length > 0 && JSON.stringify(prevHistory[0].formData) === JSON.stringify(formData)) {
            return prevHistory;
        }
        const newHistory = [newHistoryItem, ...prevHistory];
        return newHistory.slice(0, 10);
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '發生未知錯誤，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleGenerateVideo = useCallback(async (index: number) => {
    setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, isGeneratingVideo: true, videoError: null } : img
    ));

    try {
        if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
            await window.aistudio?.openSelectKey();
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
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
            <HistoryPanel history={history} onRestore={handleRestoreHistory} />
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