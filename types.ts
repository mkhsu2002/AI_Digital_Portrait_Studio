export interface FormDataState {
  productName: string;
  clothingStyle: string;
  clothingSeason: string;
  modelGender: string;
  background: string;
  expression: string;
  pose: string;
  lens: string;
  lighting: string;
  aspectRatio: string;
  faceImage: { data: string; mimeType: string; name: string; } | null;
  objectImage: { data: string; mimeType: string; name: string; } | null;
  additionalDescription: string;
}

export interface ImageResult {
  src: string;
  label: string;
  videoSrc: string | null;
  isGeneratingVideo: boolean;
  videoError: string | null;
}

export interface HistoryItem {
  id?: string;
  formData: FormDataState;
  images: ImageResult[];
  createdAt?: number;
}
