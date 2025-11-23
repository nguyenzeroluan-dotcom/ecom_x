
import React from 'react';

const ProductSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden h-full flex flex-col shadow-sm relative">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/40 to-transparent animate-shimmer" style={{ transform: 'skewX(-20deg)' }}></div>
        
        <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-700/50 relative"></div>
        <div className="p-5 flex-1 space-y-4">
            <div className="flex justify-between">
                 <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/3"></div>
                 <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-8"></div>
            </div>
            <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
            <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-700/50">
                 <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-20"></div>
            </div>
        </div>
    </div>
);

export default ProductSkeleton;
