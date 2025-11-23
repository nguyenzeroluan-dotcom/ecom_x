
import React from 'react';
import { Product } from '../../types';

interface CompareFloatingBarProps {
    compareList: Product[];
    onClear: () => void;
    onRunComparison: () => void;
    isComparing: boolean;
}

const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({ 
    compareList, 
    onClear, 
    onRunComparison, 
    isComparing 
}) => {
  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-6 animate-slide-up-toast max-w-2xl w-[90%] ring-1 ring-black/5">
        <div className="flex -space-x-3 pl-2">
            {compareList.map(p => (
                <img key={p.id} src={p.image_url} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 object-cover bg-slate-100 shadow-md" alt={p.name} />
            ))}
        </div>
        <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 dark:text-white">{compareList.length} products selected</p>
            <button onClick={onClear} className="text-xs text-red-500 hover:underline font-medium">Clear all</button>
        </div>
        <button 
            onClick={onRunComparison}
            disabled={compareList.length < 2 || isComparing}
            className="bg-primary hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
        >
            {isComparing ? <><i className="fas fa-spinner fa-spin mr-2"></i> Thinking...</> : <><i className="fas fa-balance-scale mr-2"></i> Compare AI</>}
        </button>
    </div>
  );
};

export default CompareFloatingBar;
