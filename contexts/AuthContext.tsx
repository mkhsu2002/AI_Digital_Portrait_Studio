import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { AuthError } from "firebase/auth";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const sanitizeEmail = (email: string) => email.trim().toLowerCase();

const mapAuthError = (error: AuthError): Error => {
  const code = error.code;
  switch (code) {
    case 'auth/invalid-email':
      return new Error('電子郵件格式不正確，請重新輸入。');
    case 'auth/user-disabled':
      return new Error('此帳號已被停用，請聯絡管理員。');
    case 'auth/user-not-found':
      return new Error('找不到相符的帳號，請確認是否已註冊。');
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return new Error('帳號或密碼錯誤，請重新確認。');
    case 'auth/email-already-in-use':
      return new Error('此電子郵件已被註冊，請直接登入或使用其他信箱。');
    case 'auth/weak-password':
      return new Error('密碼強度不足，請至少輸入六個字元。');
    default:
      return new Error(error.message || '操作失敗，請稍後再試。');
  }
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, sanitizeEmail(email), password);
    } catch (err) {
      throw mapAuthError(err as AuthError);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, sanitizeEmail(email), password);
    } catch (err) {
      throw mapAuthError(err as AuthError);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, sanitizeEmail(email));
    } catch (err) {
      throw mapAuthError(err as AuthError);
    }
  };

  const value = useMemo(
    () => ({
      user,
      initializing,
      login,
      register,
      logout,
      resetPassword,
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必須在 AuthProvider 內使用");
  }
  return ctx;
};

