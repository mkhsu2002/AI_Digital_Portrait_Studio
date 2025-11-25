import React from 'react';
import { auth } from '../firebase';

interface FirebaseErrorDisplayProps {
  missingVars?: string[];
  initializationError?: Error | null;
}

const FirebaseErrorDisplay: React.FC<FirebaseErrorDisplayProps> = ({ 
  missingVars = [], 
  initializationError 
}) => {
  // 檢查環境變數狀態
  const envStatus = {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const hasError = !auth || missingVars.length > 0 || initializationError;

  if (!hasError) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-slate-800 rounded-xl border border-red-500/50 p-8 shadow-lg">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold text-red-400 mb-2">
              Firebase 初始化失敗
            </h1>
            <p className="text-slate-300 mb-4">
              應用程式無法啟動，因為 Firebase 未正確初始化。請檢查環境變數設定。
            </p>
          </div>
        </div>

        {missingVars.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-red-300 mb-3">
              缺少必要的環境變數：
            </h2>
            <ul className="list-disc list-inside space-y-1 text-slate-300 mb-4">
              {missingVars.map((varName) => (
                <li key={varName} className="font-mono text-sm">
                  {varName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {initializationError && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-red-300 mb-3">
              初始化錯誤：
            </h2>
            <div className="bg-slate-900 rounded-md p-4 mb-4">
              <p className="text-red-200 font-mono text-sm">
                {initializationError.message}
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-yellow-300 mb-3">
            當前環境變數狀態：
          </h2>
          <div className="bg-slate-900 rounded-md p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400">環境變數</th>
                  <th className="text-left py-2 px-3 text-slate-400">狀態</th>
                  <th className="text-left py-2 px-3 text-slate-400">值預覽</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(envStatus).map(([key, value]) => {
                  const isSet = value && value.trim() !== '';
                  const preview = isSet 
                    ? `${value.substring(0, 20)}${value.length > 20 ? '...' : ''}` 
                    : '(未設定)';
                  
                  return (
                    <tr key={key} className="border-b border-slate-800">
                      <td className="py-2 px-3 font-mono text-slate-300">{key}</td>
                      <td className="py-2 px-3">
                        {isSet ? (
                          <span className="text-green-400">✓ 已設定</span>
                        ) : (
                          <span className="text-red-400">✗ 未設定</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-slate-400">
                        {preview}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-700 rounded-md p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">
            解決步驟：
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>
              <strong>檢查部署平台的環境變數設定</strong>
              <ul className="list-disc list-inside ml-6 mt-1 text-sm text-slate-400">
                <li>
                  <strong>Cloudflare Pages</strong>：前往 Settings → Environment Variables
                </li>
                <li>
                  <strong>GitHub Pages</strong>：前往 Settings → Secrets and variables → Actions
                </li>
                <li>
                  <strong>Vercel</strong>：前往 Settings → Environment Variables
                </li>
              </ul>
            </li>
            <li>
              <strong>確認所有 6 個 Firebase 環境變數都已設定</strong>
              <ul className="list-disc list-inside ml-6 mt-1 text-sm text-slate-400">
                <li>VITE_FIREBASE_API_KEY</li>
                <li>VITE_FIREBASE_AUTH_DOMAIN</li>
                <li>VITE_FIREBASE_PROJECT_ID</li>
                <li>VITE_FIREBASE_STORAGE_BUCKET</li>
                <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
                <li>VITE_FIREBASE_APP_ID</li>
              </ul>
            </li>
            <li>
              <strong>確認環境變數名稱正確</strong>（必須以 <code className="bg-slate-800 px-1 rounded">VITE_</code> 開頭）
            </li>
            <li>
              <strong>確認環境變數值完整且正確</strong>（沒有多餘的空格或引號）
            </li>
            <li>
              <strong>重新部署應用程式</strong>（推送新的 commit 或手動觸發部署）
            </li>
          </ol>
        </div>

        <div className="flex gap-4">
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            前往 Firebase Console
          </a>
          <a
            href="./FIREBASE_CONFIG_REFERENCE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            查看設定指南
          </a>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseErrorDisplay;


