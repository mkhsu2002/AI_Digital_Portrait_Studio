import { GoogleGenAI } from "@google/genai";
import { FormDataState } from "../types";

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export async function enhanceDescription(
  currentDescription: string,
  formData: FormDataState,
  apiKey: string
): Promise<AIResponse> {
  if (!apiKey) {
    return { success: false, error: "API key is missing" };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // 建立 Context 提示，讓模型知道目前的設定
    const contextPrompt = `
You are an expert AI image prompt engineer. 
Your task is to generate or enhance the "additional description" part of an image generation prompt.
Keep the output concise, using mostly English nouns, adjectives, and short phrases suitable for image generation models. Avoid full sentences like "The image shows...".
Focus ONLY on returning the enhanced description text, nothing else. No markdown formatting, no explanations.

Current Image Context:
- Subject: ${formData.productName || "Unknown"}
- Style: ${formData.clothingStyle}
- Season: ${formData.clothingSeason}
- Background: ${formData.background}
- Model Gender: ${formData.modelGender}
- Expression: ${formData.expression}
- Pose: ${formData.pose}
- Lighting: ${formData.lighting}
`;

    let userInstruction = "";
    if (currentDescription && currentDescription.trim() !== "") {
      userInstruction = `
The user has provided the following draft description: "${currentDescription}"
Please enhance, expand, and translate it into a professional, comma-separated English prompt segment that fits the context above. Add complementary visual details that make the image more striking.
`;
    } else {
      userInstruction = `
The user left the additional description blank.
Please generate a creative, surprising, and high-quality visual description (properties, textures, micro-details, complementary colors) that fits the context perfectly and elevates the image quality. Return a comma-separated English prompt segment.
`;
    }

    const fullPrompt = `${contextPrompt}\n${userInstruction}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    });

    if (response.text) {
      return { success: true, content: response.text.trim() };
    } else {
      return { success: false, error: "No text returned from API" };
    }
  } catch (error: any) {
    console.error("AI Enhancement Error:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
}
