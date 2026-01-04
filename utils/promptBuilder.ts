/**
 * Prompt 生成工具函數
 * 統一管理所有 prompt 生成邏輯
 */

import type { FormDataState } from '../types';
import { translateOptionForPrompt } from './promptTranslations';

/**
 * 生成基礎 prompt（用於顯示）
 */
export function buildDisplayPrompt(formData: FormDataState): string {
  const genderText = formData.modelGender === '女性模特兒' ? 'female' : 'male';
  
  // 翻譯所有選項為英文（顯示用）
  const clothingStyleEn = translateOptionForPrompt('clothingStyle', formData.clothingStyle);
  const clothingSeasonEn = translateOptionForPrompt('clothingSeason', formData.clothingSeason);
  const backgroundEn = translateOptionForPrompt('background', formData.background);
  const expressionEn = translateOptionForPrompt('expression', formData.expression);
  const poseEn = translateOptionForPrompt('pose', formData.pose);
  const lightingEn = translateOptionForPrompt('lighting', formData.lighting);
  
  let prompt = `Professional commercial fashion photography featuring '${formData.productName}'.
A ${genderText} model styled in ${clothingStyleEn} fashion, appropriate for ${clothingSeasonEn} season.
Set in ${backgroundEn}, with authentic environmental details and atmosphere.
The model displays ${expressionEn}, ${poseEn}.`;

  if (formData.additionalDescription) {
    prompt += `\nAdditional details: ${formData.additionalDescription}.`;
  }

  if (formData.faceImage) {
    prompt += `\nCRITICAL: The model's face must be identical to the face in the provided reference image.`;
  }

  if (formData.objectImage) {
    prompt += `\nCRITICAL: The scene must prominently feature the object from the provided reference image.`;
  }

  prompt += `\n\nLighting: ${lightingEn}.
Photographic style: Ultra-realistic, 8K resolution, cinematic composition, shallow depth of field with elegant bokeh.
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
  
  // 翻譯所有選項為英文
  const clothingStyleEn = translateOptionForPrompt('clothingStyle', formData.clothingStyle);
  const clothingSeasonEn = translateOptionForPrompt('clothingSeason', formData.clothingSeason);
  const backgroundEn = translateOptionForPrompt('background', formData.background);
  const expressionEn = translateOptionForPrompt('expression', formData.expression);
  const poseEn = translateOptionForPrompt('pose', formData.pose);
  const lightingEn = translateOptionForPrompt('lighting', formData.lighting);
  
  // 構建提示詞
  let prompt = `Professional commercial fashion photography featuring '${formData.productName}'.
A ${genderText} model styled in ${clothingStyleEn} fashion, appropriate for ${clothingSeasonEn} season.
Set in ${backgroundEn}, with authentic environmental details and atmosphere.
The model displays ${expressionEn}, ${poseEn}.`;

  if (formData.additionalDescription) {
    prompt += `\nAdditional details: ${formData.additionalDescription}.`;
  }

  prompt += `\n\nLighting: ${lightingEn}.
Photographic style: Ultra-realistic, 8K resolution, cinematic composition, shallow depth of field with elegant bokeh. This must be a single, full-frame photograph. Do not create collages, diptychs, triptychs, or any split-screen images.
The product '${formData.productName}' should be clearly visible and well-presented.`;

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
    result += "\nCRITICAL INSTRUCTION: The model's facial features, proportions, and expression must exactly match the face in the first provided reference image. Maintain facial identity consistency.";
  }

  if (hasObjectImage) {
    const imageRefText = hasFaceImage ? "second" : "first";
    result += `\nCRITICAL INSTRUCTION: The object/product in the scene must match the ${imageRefText} provided reference image exactly in design, color, texture, and details.`;
  }

  return result;
}










