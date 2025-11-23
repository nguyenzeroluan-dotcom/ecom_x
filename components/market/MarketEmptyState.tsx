
import React from 'react';

interface MarketEmptyStateProps {
    onReset: () => void;
}

const MarketEmptyState: React.FC<MarketEmptyStateProps> = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 animate-scale-in">
        <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 animate-bounce-small relative">
            <i className="fas fa-search text-5xl text-slate-300 dark:text-slate-600"></i>
            <div className="absolute top-0 right-0 text-2xl">🤔</div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">No matches found</h3>
        <p className="text-slate-500 max-w-xs text-center mb-6">We couldn't find any products matching your current filters.</p>
        <button onClick={onReset} className="px-6 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Clear Filters
        </button>
    </div>
  );
};

export default MarketEmptyState;
