import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  testing?: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  total,
  testing = 0,
  showLabels = true,
  size = 'md',
  className = '',
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const testingPercentage = total > 0 ? Math.round((testing / total) * 100) : 0;

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-center text-xs font-mono mb-1.5 text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-200">{percentage}%</span>
            <span>({completed}/{total} Completed)</span>
          </span>
          {testing > 0 && (
            <span className="text-purple-400 font-medium">
              {testing} in testing
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 ${heightStyles[size]}`}>
        {/* Completed portion */}
        <div
          className="bg-emerald-500 transition-all duration-300 rounded-l-full"
          style={{ width: `${percentage}%` }}
        />
        {/* Testing portion (visible but distinct, NOT counted as completed) */}
        {testingPercentage > 0 && (
          <div
            className="bg-purple-500/70 transition-all duration-300"
            style={{ width: `${testingPercentage}%` }}
            title={`${testing} items currently in testing`}
          />
        )}
      </div>
    </div>
  );
};
