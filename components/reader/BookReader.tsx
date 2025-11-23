
import React, { useState, useEffect, useRef } from 'react';
import { LibraryItem, EBookMetadata } from '../../types';
import { updateReadingProgress } from '../../services/libraryService';
import { getEBookMetadata } from '../../services/ebookService';

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
    const [metadata, setMetadata] = useState<EBookMetadata | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize Content & Metadata
    useEffect(() => {
        const loadBookData = async () => {
            setLoading(true);
            // 1. Try to fetch enhanced metadata
            const meta = await getEBookMetadata(bookItem.product.id);
            setMetadata(meta);

            // 2. Determine content source
            if (meta && meta.format === 'studio' && meta.content_html) {
                setBookContent(meta.content_html);
            } else if (bookItem.product.digital_content) {
                // Fallback to old field
                setBookContent(bookItem.product.digital_content);
            } else {
                setBookContent(`<div class="text-center mt-20">
                    <h1>${bookItem.product.name}</h1>
                    <p>This book has no content uploaded yet.</p>
                </div>`);
            }
            setLoading(false);
        };
        loadBookData();
    }, [bookItem]);

    // Handle Scroll Progress (Studio Mode)
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

    // DRM Styling (Disable Select)
    const drmStyle = metadata?.drm_enabled ? { userSelect: 'none' as const, WebkitUserSelect: 'none' as const } : {};

    // Prevent Context Menu if DRM enabled
    useEffect(() => {
        if (metadata?.drm_enabled) {
            const handleContext = (e: Event) => e.preventDefault();
            document.addEventListener('contextmenu', handleContext);
            return () => document.removeEventListener('contextmenu', handleContext);
        }
    }, [metadata]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-[200] flex items-center justify-center text-white">
                <i className="fas fa-circle-notch fa-spin text-4xl"></i>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col transition-colors duration-300 ${THEMES[theme]}`}>
            
            {/* Top Control Bar */}
            <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center backdrop-blur-md bg-opacity-90 transition-transform duration-300 z-10 ${showControls ? 'translate-y-0' : '-translate-y-full'} ${theme === 'light' || theme === 'sepia' ? 'bg-white/80 border-b border-black/5' : 'bg-black/50 border-b border-white/10'}`}>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h2 className="font-bold text-sm truncate max-w-[60%] font-display">{bookItem.product.name}</h2>
                
                <div className="flex gap-2">
                    {metadata?.format === 'pdf' && metadata.allow_download && (
                        <a 
                            href={metadata.source_url} 
                            download 
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            title="Download PDF"
                        >
                            <i className="fas fa-download"></i>
                        </a>
                    )}
                </div>
            </div>

            {/* Reader Content Area */}
            {metadata?.format === 'pdf' && metadata.source_url ? (
                <div className="flex-1 bg-slate-900 h-full pt-16 pb-0">
                    <iframe 
                        src={`${metadata.source_url}#toolbar=0`} 
                        className="w-full h-full border-none"
                        title="PDF Viewer"
                    />
                    {/* DRM Overlay for PDF to prevent simple drag/drop saving if iframe allows it */}
                    {metadata.drm_enabled && (
                        <div className="absolute inset-0 z-0 pointer-events-none"></div> 
                    )}
                </div>
            ) : (
                <div 
                    ref={contentRef}
                    className="flex-1 overflow-y-auto scroll-smooth no-scrollbar px-6 py-20 md:px-[20%] md:py-24 relative"
                    onClick={toggleControls}
                    onScroll={handleScroll}
                    style={drmStyle}
                >
                    {/* Transparent DRM Overlay to block text selection dragging */}
                    {metadata?.drm_enabled && (
                        <div className="absolute inset-0 z-20 bg-transparent" onClick={(e) => {
                            // Allow clicks to pass through for basic navigation but block drag selection start
                            // Actually, pointer-events-none on overlay defeats the purpose, 
                            // so we handle clicks to toggle controls, but css user-select:none handles the rest.
                        }} />
                    )}

                    <div 
                        className="prose max-w-none prose-lg transition-all duration-300 relative z-10"
                        style={{ 
                            fontSize: `${fontSize}px`, 
                            lineHeight: '1.6',
                            color: 'inherit'
                        }}
                    >
                        {/* Render HTML Content */}
                        <div 
                            className="whitespace-pre-wrap font-serif leading-relaxed" 
                            dangerouslySetInnerHTML={{ __html: bookContent }} 
                        />
                        <div className="h-[30vh]"></div>
                    </div>
                </div>
            )}

            {/* Bottom Control Bar (Only for Studio/Rich Text, or if we want progress for PDF visually) */}
            {metadata?.format !== 'pdf' && (
                <div className={`absolute bottom-0 left-0 right-0 p-6 backdrop-blur-md bg-opacity-95 transition-transform duration-300 z-30 flex flex-col gap-4 shadow-negative-lg ${showControls ? 'translate-y-0' : 'translate-y-full'} ${theme === 'light' || theme === 'sepia' ? 'bg-white/90 border-t border-black/5' : 'bg-black/80 border-t border-white/10'}`}>
                    
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
            )}
        </div>
    );
};

export default BookReader;
