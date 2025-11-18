import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const DEFAULT_GENERATION_CREDITS = 100;

interface UsageDoc {
  generationCredits: number;
  totalGenerated: number;
  totalShares: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const getUsageDocRef = (uid: string) => doc(db, "users", uid);

const ensureDocExists = async (uid: string): Promise<UsageDoc> => {
  const usageRef = getUsageDocRef(uid);
  const snapshot = await getDoc(usageRef);
  if (snapshot.exists()) {
    const data = snapshot.data() as Partial<UsageDoc>;
    return {
      generationCredits: data.generationCredits ?? DEFAULT_GENERATION_CREDITS,
      totalGenerated: data.totalGenerated ?? 0,
      totalShares: data.totalShares ?? 0,
    };
  }

  const payload: UsageDoc = {
    generationCredits: DEFAULT_GENERATION_CREDITS,
    totalGenerated: 0,
    totalShares: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(usageRef, payload);
  return {
    generationCredits: DEFAULT_GENERATION_CREDITS,
    totalGenerated: 0,
    totalShares: 0,
  };
};

export const fetchGenerationQuota = async (uid: string) => {
  return ensureDocExists(uid);
};

export const consumeGenerationCredit = async (uid: string) => {
  const usageRef = getUsageDocRef(uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(usageRef);

    if (!snapshot.exists()) {
      const remaining = DEFAULT_GENERATION_CREDITS - 1;
      transaction.set(usageRef, {
        generationCredits: remaining,
        totalGenerated: 1,
        totalShares: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return remaining;
    }

    const data = snapshot.data() as Partial<UsageDoc>;
    const currentCredits = data.generationCredits ?? DEFAULT_GENERATION_CREDITS;

    if (currentCredits <= 0) {
      throw new Error("NO_CREDITS");
    }

    transaction.update(usageRef, {
      generationCredits: currentCredits - 1,
      totalGenerated: (data.totalGenerated ?? 0) + 1,
      updatedAt: serverTimestamp(),
    });

    return currentCredits - 1;
  });
};

export const rewardCreditForShare = async (uid: string) => {
  const usageRef = getUsageDocRef(uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(usageRef);
    if (!snapshot.exists()) {
      const credits = DEFAULT_GENERATION_CREDITS + 1;
      transaction.set(usageRef, {
        generationCredits: credits,
        totalGenerated: 0,
        totalShares: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return credits;
    }

    const data = snapshot.data() as Partial<UsageDoc>;
    const credits = (data.generationCredits ?? 0) + 1;
    transaction.update(usageRef, {
      generationCredits: credits,
      totalShares: (data.totalShares ?? 0) + 1,
      updatedAt: serverTimestamp(),
    });
    return credits;
  });
};

