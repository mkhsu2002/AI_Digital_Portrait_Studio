import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

let storagePromise: Promise<FirebaseStorage | null> | null = null;

export const ensureStorage = async (): Promise<FirebaseStorage | null> => {
  if (!app.options.storageBucket) {
    console.warn("Firebase Storage 未設定 storageBucket，跳過初始化。");
    return null;
  }

  if (!storagePromise) {
    storagePromise = (async () => {
      try {
        const { getStorage } = await import("firebase/storage");
        return getStorage(app);
      } catch (err) {
        console.warn("Firebase Storage 初始化失敗。請確認配置是否完整。", err);
        return null;
      }
    })();
  }

  return storagePromise;
};

