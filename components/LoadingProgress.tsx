import React from 'react';

interface LoadingProgressProps {
  current: number;
  total: number;
  label: string;
  subLabel?: string;
}

/**
 * Loading 進度條組件
 * 用於顯示多步驟操作的進度
 */
export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  current,
  total,
  label,
  subLabel,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-slate-200 font-medium">{label}</span>
        <span className="text-slate-400 text-sm">{current}/{total}</span>
      </div>
      {subLabel && (
        <p className="text-sm text-slate-400">{subLabel}</p>
      )}
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 text-center">
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

export default LoadingProgress;




