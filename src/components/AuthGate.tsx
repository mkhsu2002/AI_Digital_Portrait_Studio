import React, { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/TranslationContext";

const AuthGate: React.FC = () => {
  const { login, register, resetPassword } = useAuth();
  const { t, toggleLanguage } = useTranslation();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authErrors } = t;

  const resolveAuthError = useCallback(
    (err: unknown): string => {
      if (err instanceof Error && err.message) {
        return authErrors[err.message] ?? err.message ?? t.auth.genericError;
      }
      return t.auth.genericError;
    },
    [authErrors, t.auth.genericError]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setMessage(null);
      setIsSubmitting(true);
      try {
        if (isLoginMode) {
          await login(email, password);
          setMessage(t.auth.loginSuccess);
        } else {
          if (password !== confirmPassword) {
            throw new Error(t.auth.passwordMismatch);
          }
          await register(email, password);
          setMessage(t.auth.registerSuccess);
        }
      } catch (err: unknown) {
        setError(resolveAuthError(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [confirmPassword, email, isLoginMode, login, password, register, resolveAuthError, t.auth.loginSuccess, t.auth.passwordMismatch, t.auth.registerSuccess]
  );

  const handleResetPassword = useCallback(async () => {
    if (!email) {
      setError(t.auth.emailRequired);
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await resetPassword(email);
      setMessage(t.auth.resetSuccess);
    } catch (err) {
      setError(resolveAuthError(err));
    }
  }, [email, resetPassword, resolveAuthError, t.auth.emailRequired, t.auth.resetSuccess]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-lg relative">
        <button
          type="button"
          onClick={toggleLanguage}
          className="absolute top-4 right-4 text-xs font-semibold text-slate-200 bg-slate-700/70 border border-slate-600 rounded-lg px-3 py-1 hover:bg-slate-600 transition-colors"
        >
          {t.toggleLabel}
        </button>
        <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          {t.auth.appTitle}
        </h1>
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md border border-slate-700 bg-slate-900/60 p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                isLoginMode
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-100"
              }`}
              onClick={() => setIsLoginMode(true)}
            >
              {t.auth.loginTab}
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                !isLoginMode
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-100"
              }`}
              onClick={() => setIsLoginMode(false)}
            >
              {t.auth.registerTab}
            </button>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t.auth.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t.auth.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t.auth.confirmPasswordLabel}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                minLength={6}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 text-sm px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-200 text-sm px-3 py-2 rounded-md">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {isSubmitting ? t.auth.submitting : isLoginMode ? t.auth.loginButton : t.auth.registerButton}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
          onClick={handleResetPassword}
        >
          {t.auth.forgotPassword}
        </button>
      </div>
    </div>
  );
};

export default AuthGate;
