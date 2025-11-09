import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          電商人像攝影棚 v3.0
        </h1>
        <p className="mt-2 text-lg text-slate-400 max-w-2xl">
          專為電商產業所設計，一鍵生成專業人像攝影照
        </p>
      </div>
      {user && (
        <div className="self-center sm:self-auto bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 flex flex-col sm:flex-row gap-2 sm:items-center">
          <div>
            <p className="font-semibold">歡迎，{user.email}</p>
            <p className="text-slate-400 text-xs">您的歷史紀錄將與此帳號綁定。</p>
          </div>
          <button
            onClick={logout}
            className="bg-slate-700 hover:bg-slate-600 transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            登出
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;