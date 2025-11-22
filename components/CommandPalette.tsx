
import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect: (view: ViewState) => void;
}

const ALL_COMMANDS = [
  { id: ViewState.HOME, label: 'Marketplace', icon: 'fa-store', keywords: 'home shop products buy' },
  { id: ViewState.CHAT, label: 'AI Shopping Chat', icon: 'fa-comments', keywords: 'assistant help support' },
  { id: ViewState.GENERATE, label: 'AI Image Studio', icon: 'fa-paint-brush', keywords: 'create generate art' },
  { id: ViewState.ANALYZE, label: 'Vision Analyzer', icon: 'fa-eye', keywords: 'search image picture' },
  { id: ViewState.THINKING, label: 'Deep Think Engine', icon: 'fa-brain', keywords: 'reasoning analysis' },
  { id: ViewState.ORDERS, label: 'My Orders', icon: 'fa-box-open', keywords: 'history purchases tracking' },
  { id: ViewState.PROFILE, label: 'My Profile', icon: 'fa-user-circle', keywords: 'account settings dashboard' },
  { id: ViewState.MANAGER, label: 'Admin Manager', icon: 'fa-tasks', keywords: 'dashboard products users' },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, setIsOpen, onSelect }) => {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = search 
    ? ALL_COMMANDS.filter(cmd => 
        cmd.label.toLowerCase().includes(search.toLowerCase()) || 
        cmd.keywords.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_COMMANDS;

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setSearch('');
    }
    setActiveIndex(0);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % filteredCommands.length);
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        }
        if (e.key === 'Enter' && filteredCommands[activeIndex]) {
            onSelect(filteredCommands[activeIndex].id);
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filteredCommands, onSelect, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh] animate-fade-in" style={{ animationDuration: '0.2s' }}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      <div className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in" style={{ animationDuration: '0.2s' }}>
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
            placeholder="Search products or navigate..."
            className="w-full pl-12 pr-4 py-4 bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none text-lg"
          />
        </div>
        <div className="border-t border-slate-100 dark:border-slate-700 max-h-[40vh] overflow-y-auto custom-scrollbar">
          {filteredCommands.length > 0 ? (
            <ul>
              {filteredCommands.map((cmd, idx) => (
                <li key={cmd.id}>
                  <button
                    onClick={() => onSelect(cmd.id)}
                    className={`w-full text-left flex items-center gap-4 px-4 py-3 transition-colors ${activeIndex === idx ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                  >
                    <i className={`fas ${cmd.icon} w-6 text-center ${activeIndex === idx ? 'text-primary' : 'text-slate-400'}`}></i>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{cmd.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center text-slate-400">
                <p>No results found.</p>
            </div>
          )}
        </div>
         <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 flex justify-between">
            <div>
                <kbd className="font-sans font-semibold">↑</kbd> <kbd className="font-sans font-semibold">↓</kbd> to navigate
            </div>
            <div>
                <kbd className="font-sans font-semibold">Enter</kbd> to select
            </div>
             <div>
                <kbd className="font-sans font-semibold">Esc</kbd> to close
            </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
