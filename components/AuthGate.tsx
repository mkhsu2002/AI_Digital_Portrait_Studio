import React, { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const AuthGate: React.FC = () => {
  const { login, register, resetPassword } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setMessage(null);
      setIsSubmitting(true);
      try {
        if (isLoginMode) {
          await login(email, password);
          setMessage("登入成功！");
        } else {
          if (password !== confirmPassword) {
            throw new Error("兩次輸入的密碼不一致，請重新確認。");
          }
          await register(email, password);
          setMessage("註冊成功，已自動登入。");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "操作失敗，請稍後再試。";
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, confirmPassword, isLoginMode, login, register]
  );

  const handleResetPassword = useCallback(async () => {
    if (!email) {
      setError("請先輸入您的電子郵件地址。");
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await resetPassword(email);
      setMessage("已寄出密碼重設郵件，請檢查您的收件匣。");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "無法寄出重設郵件，請稍後再試。";
      setError(errorMessage);
    }
  }, [email, resetPassword]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          電商人像攝影棚
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
              登入
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                !isLoginMode
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-100"
              }`}
              onClick={() => setIsLoginMode(false)}
            >
              註冊
            </button>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              電子郵件
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
              密碼
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
                確認密碼
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
            {isSubmitting ? "請稍候..." : isLoginMode ? "登入" : "註冊帳號"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
          onClick={handleResetPassword}
        >
          忘記密碼？寄送重設連結
        </button>
      </div>
    </div>
  );
};

export default AuthGate;

