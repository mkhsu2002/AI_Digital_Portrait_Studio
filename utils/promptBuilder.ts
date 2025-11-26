/**
 * Prompt 生成工具函數
 * 統一管理所有 prompt 生成邏輯
 */

import type { FormDataState } from '../types';

/**
 * 生成基礎 prompt（用於顯示）
 */
export function buildDisplayPrompt(formData: FormDataState): string {
  const genderText = formData.modelGender === '女性模特兒' ? 'female' : 'male';
  
  let prompt = `A professional fashion photoshoot featuring '${formData.productName}'.
A ${genderText} model with a ${formData.clothingStyle} aesthetic is wearing clothing suitable for the ${formData.clothingSeason}.
The setting is ${formData.background}.
The model has a ${formData.expression} expression and is in a ${formData.pose} pose.`;

  if (formData.additionalDescription) {
    prompt += `\nAdditional details: ${formData.additionalDescription}.`;
  }

  if (formData.faceImage) {
    prompt += `\nCRITICAL: The model's face must be identical to the face in the provided reference image.`;
  }

  if (formData.objectImage) {
    prompt += `\nCRITICAL: The scene must prominently feature the object from the provided reference image.`;
  }

  prompt += `\nPhotographic style: Lit with ${formData.lighting}. The image should be detailed, ultra-realistic, photorealistic, high resolution (8k), cinematic, with a shallow depth of field and beautiful bokeh.
The final output will be a set of three distinct, full-frame images from this scene:
1. A full-body shot.
2. A medium shot (from the waist up).
3. A close-up shot (head and shoulders).`;

  return prompt;
}

/**
 * 生成用於 API 呼叫的基礎 prompt
 */
export function buildApiBasePrompt(formData: FormDataState): string {
  const genderText = formData.modelGender === '女性模特兒' ? 'female' : 'male';
  
  let prompt = `A professional fashion photoshoot featuring '${formData.productName}'.
A ${genderText} model with a ${formData.clothingStyle} aesthetic is wearing clothing suitable for the ${formData.clothingSeason}.
The setting is ${formData.background}.
The model has a ${formData.expression} expression and is in a ${formData.pose} pose.`;

  if (formData.additionalDescription) {
    prompt += `\nAdditional details: ${formData.additionalDescription}.`;
  }

  prompt += `\nPhotographic style: Lit with ${formData.lighting}. This must be a single, full-frame photograph. The image should be detailed, ultra-realistic, photorealistic, high resolution (8k), cinematic, with a shallow depth of field and beautiful bokeh. Do not create collages, diptychs, triptychs, or any split-screen images.
The final output will be a set of three distinct, full-frame images from this scene:
1. A full-body shot.
2. A medium shot (from the waist up).
3. A close-up shot (head and shoulders).`;

  return prompt;
}

/**
 * 為特定視角添加指令
 */
export function addShotInstruction(basePrompt: string, shotType: 'fullBody' | 'medium' | 'closeUp'): string {
  const instructions = {
    fullBody: 'CRITICAL: The photograph MUST be a full-body shot, showing the model from head to toe.',
    medium: 'CRITICAL: The photograph MUST be a medium shot, capturing the model from the waist up.',
    closeUp: 'CRITICAL: The photograph MUST be a close-up shot, focusing on the model\'s head and shoulders.',
  };

  return `${basePrompt}\n${instructions[shotType]}`;
}

/**
 * 為參考圖片添加指令
 */
export function addReferenceImageInstructions(
  prompt: string,
  hasFaceImage: boolean,
  hasObjectImage: boolean
): string {
  let result = prompt;

  if (hasFaceImage) {
    result += "\nCRITICAL INSTRUCTION: The model's face must be identical to the face in the first provided image.";
  }

  if (hasObjectImage) {
    const imageRefText = hasFaceImage ? "second" : "first";
    result += `\nCRITICAL INSTRUCTION: The scene must prominently feature the object from the ${imageRefText} provided image.`;
  }

  return result;
}









