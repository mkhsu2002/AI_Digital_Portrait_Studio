import {
  addDoc,
  collection,
  limit,
  orderBy,
  query,
  serverTimestamp,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import type { HistoryItem } from "../types";
import { db } from "../firebase";

const getHistoryCollectionRef = (uid: string) => collection(db, "users", uid, "history");

export const fetchUserHistory = async (uid: string): Promise<HistoryItem[]> => {
  const q = query(getHistoryCollectionRef(uid), orderBy("createdAt", "desc"), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      formData: data.formData,
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

