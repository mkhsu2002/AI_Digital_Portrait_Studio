import React from 'react';
import type { HistoryItem } from '../types';
import HistoryIcon from './icons/HistoryIcon';

interface HistoryPanelProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRestore }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-semibold mb-4 text-slate-200">歷史紀錄</h2>
      {history.length === 0 ? (
        <p className="text-slate-500 text-center py-4">尚無歷史紀錄。產生圖片後，紀錄將會顯示於此。</p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {history.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => onRestore(item)}
                className="w-full flex items-center gap-4 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-left group"
                aria-label={`還原紀錄：${item.formData.productName}`}
              >
                <img 
                  src={item.images[0].src} 
                  alt={item.formData.productName} 
                  className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-slate-600"
                />
                <div className="flex-grow overflow-hidden">
                  <p className="font-semibold text-slate-200 truncate">{item.formData.productName}</p>
                  <p className="text-sm text-slate-400 truncate">{`${item.formData.clothingStyle}, ${item.formData.background}`}</p>
                </div>
                <div className="flex-shrink-0 text-slate-500 group-hover:text-blue-400 transition-colors">
                  <HistoryIcon className="w-6 h-6" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPanel;
