import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import ApiKeyInput from './ApiKeyInput';

interface HeaderProps {
  remainingCredits: number | null;
  isQuotaLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ remainingCredits, isQuotaLoading }) => {
  const { user, logout } = useAuth();
  const { t, toggleLanguage } = useTranslation();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          {t.header.title}
        </h1>
        <p className="mt-2 text-lg text-slate-400 max-w-2xl">
          {t.header.subtitle}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
        <button
          onClick={toggleLanguage}
          className="self-center sm:self-auto bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
        >
          {t.header.languageToggleLabel}
        </button>
        {user && (
          <>
            <ApiKeyInput />
            <div className="self-center sm:self-auto bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 flex flex-col sm:flex-row gap-2 sm:items-center">
              <div>
                <p className="font-semibold">{t.header.welcome(user.email ?? "")}</p>
                <p className="text-slate-400 text-xs">
                  {t.header.credits(remainingCredits, isQuotaLoading)}
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-slate-700 hover:bg-slate-600 transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                {t.header.logout}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;