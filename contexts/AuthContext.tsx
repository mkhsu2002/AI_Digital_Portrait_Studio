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
  const knownCode = error.code ?? "auth/generic";
  switch (knownCode) {
    case "auth/invalid-email":
    case "auth/user-disabled":
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/email-already-in-use":
    case "auth/weak-password":
      return new Error(knownCode);
    default:
      return new Error("auth/generic");
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
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

