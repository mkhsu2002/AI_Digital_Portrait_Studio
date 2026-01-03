/**
 * API 回應型別定義
 */

// Gemini API 回應型別
export interface GeminiImagePart {
  inlineData?: {
    data: string;
    mimeType: string;
  };
  fileData?: {
    fileUri: string;
    mimeType?: string;
  };
  parts?: GeminiImagePart[];
}

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

export interface GeminiCandidate {
  content: {
    parts: GeminiImagePart[];
  };
}

export interface GeminiPromptFeedback {
  blockReason?: string;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

export interface GeminiResponse {
  candidates?: GeminiCandidate[];
  response?: {
    candidates?: GeminiCandidate[];
    inlinedResponses?: Array<{
      response?: {
        candidates?: GeminiCandidate[];
      };
    }>;
  };
  inlinedResponses?: Array<{
    response?: {
      candidates?: GeminiCandidate[];
    };
  }>;
  promptFeedback?: GeminiPromptFeedback;
}

// Veo API 回應型別
export interface VeoVideo {
  uri: string;
}

export interface VeoGeneratedVideo {
  video?: VeoVideo;
}

export interface VeoOperationResponse {
  generatedVideos?: VeoGeneratedVideo[];
}

export interface VeoOperationError {
  message?: string;
  code?: number;
}

export interface VeoOperation {
  done: boolean;
  error?: VeoOperationError;
  response?: VeoOperationResponse;
}

// 型別守衛函數
export function isGeminiResponse(value: unknown): value is GeminiResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    'candidates' in obj ||
    'response' in obj ||
    'inlinedResponses' in obj ||
    'promptFeedback' in obj
  );
}

export function isGeminiImagePart(value: unknown): value is GeminiImagePart {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    'inlineData' in obj ||
    'fileData' in obj ||
    (Array.isArray(obj.parts) && obj.parts.length > 0)
  );
}

export function isVeoOperation(value: unknown): value is VeoOperation {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj.done === 'boolean';
}










