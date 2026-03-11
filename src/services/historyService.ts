import {
  addDoc,
  collection,
  limit,
  orderBy,
  query,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  DocumentData,
} from "firebase/firestore";
import type { HistoryItem, HistoryFormData } from "../types";
import { db } from "../firebase";

const getHistoryCollectionRef = (uid: string) => collection(db, "users", uid, "history");

const normalizeHistoryFormData = (raw: DocumentData | undefined): HistoryFormData => {
  const faceImageRaw = raw?.faceImage;
  const objectImageRaw = raw?.objectImage;

  const toMetadata = (input: any) =>
    input
      ? {
          name: input.name ?? "",
          mimeType: input.mimeType ?? "image/png",
          hasData: input.hasData ?? Boolean(input.data),
        }
      : null;

  return {
    productName: raw?.productName ?? "",
    clothingStyle: raw?.clothingStyle ?? "",
    clothingSeason: raw?.clothingSeason ?? "",
    modelGender: raw?.modelGender ?? "",
    background: raw?.background ?? "",
    expression: raw?.expression ?? "",
    pose: raw?.pose ?? "",
    lighting: raw?.lighting ?? "",
    aspectRatio: raw?.aspectRatio ?? "",
    additionalDescription: raw?.additionalDescription ?? "",
    faceImage: toMetadata(faceImageRaw),
    objectImage: toMetadata(objectImageRaw),
  };
};

export const fetchUserHistory = async (uid: string): Promise<HistoryItem[]> => {
  const q = query(getHistoryCollectionRef(uid), orderBy("createdAt", "desc"), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      formData: normalizeHistoryFormData(data.formData),
      images: data.images,
      createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
    } as HistoryItem;
  });
};

export const addHistoryRecord = async (uid: string, item: HistoryItem): Promise<void> => {
  await addDoc(getHistoryCollectionRef(uid), {
    formData: item.formData,
    images: item.images,
    createdAt: serverTimestamp(),
  });
};

export const deleteHistoryRecord = async (uid: string, recordId: string): Promise<void> => {
  const recordRef = doc(db, "users", uid, "history", recordId);
  await deleteDoc(recordRef);
};

