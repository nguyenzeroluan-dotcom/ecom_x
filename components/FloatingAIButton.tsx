
import React from 'react';
import { ViewState } from '../types';

interface FloatingAIButtonProps {
  setView: (view: ViewState) => void;
  currentView: ViewState;
}

const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ setView, currentView }) => {
  if (currentView === ViewState.CHAT) return null;

  return (
    <button
      onClick={() => setView(ViewState.CHAT)}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center text-white transform hover:scale-110 transition-all duration-300 group hover:rotate-12"
      title="Chat with AI"
    >
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 animate-ping"></div>
      <i className="fas fa-sparkles text-2xl"></i>
      <span className="absolute right-full mr-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-x-2 group-hover:translate-x-0">
        Ask AI Assistant
      </span>
    </button>
  );
};

export default FloatingAIButton;
