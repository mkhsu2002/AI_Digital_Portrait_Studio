import React, { useState, useRef, useEffect } from 'react';
import { BACKGROUNDS, BACKGROUND_CATEGORIES } from '../constants';
import { useTranslation } from '../contexts/TranslationContext';

interface BackgroundSelectProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
}

const BackgroundSelect: React.FC<BackgroundSelectProps> = ({ value, onChange, name }) => {
  const { translateOption } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedCategory(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSelectedCategory(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (bg: string) => {
    onChange(bg);
    setIsOpen(false);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const allBackgrounds = BACKGROUNDS.filter(bg => bg !== '自行補充描述');
  const customOption = '自行補充描述';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-left text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition flex items-center justify-between hover:bg-slate-600"
      >
        <span className="truncate">
          {translateOption('background', value) || value}
        </span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {!selectedCategory ? (
            // 第一層：分類選單
            <div className="overflow-y-auto max-h-96">
              <div className="p-2">
                <button
                  onClick={() => handleSelect(customOption)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-700 text-slate-200 text-sm"
                >
                  {customOption}
                </button>
                <div className="border-t border-slate-700 my-2"></div>
                {Object.keys(BACKGROUND_CATEGORIES).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-700 text-slate-200 text-sm flex items-center justify-between"
                  >
                    <span>{category}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
                <div className="border-t border-slate-700 my-2"></div>
                <div className="px-3 py-2 text-xs text-slate-400">
                  快速選擇
                </div>
                {allBackgrounds.slice(0, 5).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => handleSelect(bg)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-700 text-slate-200 text-sm"
                  >
                    {translateOption('background', bg)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // 第二層：該分類下的背景選項
            <div className="overflow-y-auto max-h-96">
              <div className="p-2">
                <button
                  onClick={handleBack}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-700 text-slate-200 text-sm flex items-center gap-2 mb-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>返回</span>
                </button>
                <div className="border-t border-slate-700 my-2"></div>
                <div className="px-3 py-2 text-xs text-slate-400 mb-2">{selectedCategory}</div>
                {BACKGROUND_CATEGORIES[selectedCategory as keyof typeof BACKGROUND_CATEGORIES]?.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => handleSelect(bg)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-700 text-slate-200 text-sm"
                  >
                    {translateOption('background', bg)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 隱藏的 select 元素用於表單提交 */}
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        {BACKGROUNDS.map((bg) => (
          <option key={bg} value={bg}>
            {bg}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BackgroundSelect;


