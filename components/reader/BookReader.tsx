
import React, { useState, useEffect, useRef } from 'react';
import { LibraryItem } from '../../types';
import { updateReadingProgress } from '../../services/libraryService';

interface BookReaderProps {
    bookItem: LibraryItem;
    onClose: () => void;
}

type ReaderTheme = 'light' | 'sepia' | 'dark' | 'oled';

const THEMES: Record<ReaderTheme, string> = {
    light: 'bg-white text-slate-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'bg-slate-900 text-slate-300',
    oled: 'bg-black text-gray-400'
};

const BookReader: React.FC<BookReaderProps> = ({ bookItem, onClose }) => {
    const [theme, setTheme] = useState<ReaderTheme>('light');
    const [fontSize, setFontSize] = useState(18);
    const [showControls, setShowControls] = useState(true);
    const [progress, setProgress] = useState(bookItem.last_position || 0);
    const contentRef = useRef<HTMLDivElement>(null);
    const [bookContent, setBookContent] = useState<string>('');

    // Initialize Content
    useEffect(() => {
        if (bookItem.product.digital_content) {
            setBookContent(bookItem.product.digital_content);
        } else {
            setBookContent(`# ${bookItem.product.name}\n\nThis is a demo preview. The actual book content was not found in the database. \n\nHowever, you can imagine a beautiful story unfolding here...`);
        }
        
        // Restore scroll position after render
        setTimeout(() => {
            if (contentRef.current) {
                const scrollHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight;
                contentRef.current.scrollTop = (scrollHeight * (bookItem.last_position || 0)) / 100;
            }
        }, 100);
    }, [bookItem]);

    // Handle Scroll Progress
    const handleScroll = () => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            const maxScroll = scrollHeight - clientHeight;
            const currentProgress = (scrollTop / maxScroll) * 100;
            setProgress(currentProgress);
        }
    };

    // Save Progress on Close/Unmount
    useEffect(() => {
        return () => {
            if (progress > 0) {
                updateReadingProgress(bookItem.id, Math.floor(progress));
            }
        };
    }, [progress, bookItem.id]);

    const toggleControls = () => setShowControls(prev => !prev);

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col transition-colors duration-300 ${THEMES[theme]}`}>
            
            {/* Top Control Bar */}
            <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center backdrop-blur-md bg-opacity-90 transition-transform duration-300 z-10 ${showControls ? 'translate-y-0' : '-translate-y-full'} ${theme === 'light' || theme === 'sepia' ? 'bg-white/80 border-b border-black/5' : 'bg-black/50 border-b border-white/10'}`}>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h2 className="font-bold text-sm truncate max-w-[60%] font-display">{bookItem.product.name}</h2>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Reader Content Area */}
            <div 
                ref={contentRef}
                className="flex-1 overflow-y-auto scroll-smooth no-scrollbar px-6 py-20 md:px-[20%] md:py-24"
                onClick={toggleControls}
                onScroll={handleScroll}
            >
                <div 
                    className="prose max-w-none prose-lg transition-all duration-300"
                    style={{ 
                        fontSize: `${fontSize}px`, 
                        lineHeight: '1.6',
                        color: 'inherit' // Inherit from theme container
                    }}
                >
                    <div className="whitespace-pre-wrap font-serif leading-relaxed">
                        {bookContent}
                    </div>
                    <div className="h-[30vh]"></div> {/* Spacer for bottom reading */}
                </div>
            </div>

            {/* Bottom Control Bar */}
            <div className={`absolute bottom-0 left-0 right-0 p-6 backdrop-blur-md bg-opacity-95 transition-transform duration-300 z-10 flex flex-col gap-4 shadow-negative-lg ${showControls ? 'translate-y-0' : 'translate-y-full'} ${theme === 'light' || theme === 'sepia' ? 'bg-white/90 border-t border-black/5' : 'bg-black/80 border-t border-white/10'}`}>
                
                {/* Progress Slider */}
                <div className="flex items-center gap-4 text-xs opacity-80">
                    <span>{Math.round(progress)}%</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={progress} 
                        readOnly
                        className="flex-1 h-1 bg-current rounded-full appearance-none opacity-30"
                    />
                </div>

                {/* Settings */}
                <div className="flex justify-between items-center">
                    {/* Font Size */}
                    <div className="flex items-center gap-4 bg-black/5 dark:bg-white/10 rounded-full px-4 py-2">
                        <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="text-sm font-bold">A-</button>
                        <span className="text-xs opacity-50">Size</span>
                        <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="text-lg font-bold">A+</button>
                    </div>

                    {/* Themes */}
                    <div className="flex gap-2">
                        <button onClick={() => setTheme('light')} className={`w-8 h-8 rounded-full border border-slate-300 bg-white ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}></button>
                        <button onClick={() => setTheme('sepia')} className={`w-8 h-8 rounded-full border border-[#eaddcf] bg-[#f4ecd8] ${theme === 'sepia' ? 'ring-2 ring-primary' : ''}`}></button>
                        <button onClick={() => setTheme('dark')} className={`w-8 h-8 rounded-full border border-slate-700 bg-slate-900 ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}></button>
                        <button onClick={() => setTheme('oled')} className={`w-8 h-8 rounded-full border border-slate-800 bg-black ${theme === 'oled' ? 'ring-2 ring-primary' : ''}`}></button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BookReader;
