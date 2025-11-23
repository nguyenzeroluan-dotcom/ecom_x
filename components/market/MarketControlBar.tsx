
import React from 'react';
import { MarketViewMode } from '../../types';

interface MarketControlBarProps {
    resultCount: number;
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    viewMode: MarketViewMode;
    setViewMode: (mode: MarketViewMode) => void;
}

const MarketControlBar: React.FC<MarketControlBarProps> = ({
    resultCount,
    categories,
    selectedCategory,
    onSelectCategory,
    viewMode,
    setViewMode
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 text-sm bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-20 z-40">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
                <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
                <i className="fas fa-chevron-right text-[10px] opacity-50"></i>
                <span className="font-bold text-slate-800 dark:text-white">Marketplace</span>
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden md:block"></div>
            <span className="text-slate-500 hidden md:inline">Showing <span className="font-bold text-primary">{resultCount}</span> results</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                {/* Mobile Category Dropdown (Visible only on small screens) */}
                <div className="lg:hidden flex-1 md:flex-none">
                <select 
                    value={selectedCategory}
                    onChange={(e) => onSelectCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                </div>

                {/* View Mode Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button onClick={() => setViewMode('grid')} title="Grid View" className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><i className="fas fa-th-large"></i></button>
                <button onClick={() => setViewMode('list')} title="List View" className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><i className="fas fa-list"></i></button>
                <button onClick={() => setViewMode('compact')} title="Compact View" className={`p-2.5 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-white dark:bg-slate-600 text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><i className="fas fa-align-justify"></i></button>
                <button onClick={() => setViewMode('flip')} title="3D Flip View" className={`p-2.5 rounded-lg transition-all ${viewMode === 'flip' ? 'bg-white dark:bg-slate-600 text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><i className="fas fa-cube"></i></button>
                </div>
        </div>
    </div>
  );
};

export default MarketControlBar;
