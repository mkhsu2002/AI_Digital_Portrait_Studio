export interface ReferenceImageData {
  data: string;
  mimeType: string;
  name: string;
}

export interface FormDataState {
  productName: string;
  clothingStyle: string;
  clothingSeason: string;
  modelGender: string;
  background: string;
  expression: string;
  pose: string;
  lighting: string;
  aspectRatio: string;
  imageModel: string;
  faceImage: ReferenceImageData | null;
  objectImage: ReferenceImageData | null;
  additionalDescription: string;
}

export interface HistoryImageMetadata {
  name: string;
  mimeType: string;
  hasData: boolean;
}

export interface HistoryFormData {
  productName: string;
  clothingStyle: string;
  clothingSeason: string;
  modelGender: string;
  background: string;
  expression: string;
  pose: string;
  lighting: string;
  aspectRatio: string;
  imageModel: string;
  additionalDescription: string;
  faceImage: HistoryImageMetadata | null;
  objectImage: HistoryImageMetadata | null;
}

export type ShotLabelKey = "fullBody" | "medium" | "closeUp";

export interface ImageResult {
  src: string;
  label: string;
  labelKey?: ShotLabelKey;
  videoSrc: string | null;
  isGeneratingVideo: boolean;
  videoError: string | null;
}

export interface HistoryItem {
  id?: string;
  formData: HistoryFormData;
  images: ImageResult[];
  /** 縮圖 URL 陣列（存放於 Firebase Storage，供 History 顯示） */
  thumbnailUrls?: string[];
  createdAt?: number;
}
