
import React from 'react';

interface AISearchBarProps {
    onFocus: () => void;
    onClick: () => void;
}

const AISearchBar: React.FC<AISearchBarProps> = ({ onFocus, onClick }) => {
  return (
    <div className="text-center mb-8 md:mb-12 animate-fade-in-up relative px-2">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 md:mb-4 font-display tracking-tight">Discover with AI</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-6 text-sm md:text-lg">Find exactly what you need using natural language.</p>
        
        <div className="max-w-2xl mx-auto relative group z-30">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full p-1.5 md:p-2 shadow-xl border border-white/50 dark:border-slate-600/50 ring-1 ring-black/5">
                <div className="pl-3 md:pl-4 text-slate-400">
                    <i className="fas fa-sparkles text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"></i>
                </div>
                <input 
                type="text"
                placeholder="Ask: 'A cozy reading chair under $300'"
                onFocus={onFocus}
                className="w-full pl-3 md:pl-4 pr-4 md:pr-6 py-2 md:py-3 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none text-sm md:text-lg" 
                />
                <button 
                onClick={onClick}
                className="bg-primary hover:bg-indigo-600 text-white rounded-full p-2 md:p-3 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 shrink-0"
                >
                    <i className="fas fa-arrow-right text-sm md:text-base"></i>
                </button>
            </div>
        </div>
    </div>
  );
};

export default AISearchBar;
