
import React, { useState, useEffect, useRef } from 'react';
import { LibraryItem, EBookMetadata, Product } from '../../types';
import { updateReadingProgress } from '../../services/libraryService';
import { getEBookMetadata } from '../../services/ebookService';
import { useCart } from '../../contexts/CartContext';

interface BookReaderProps {
    bookItem?: LibraryItem;
    product?: Product; // For preview mode
    onClose: () => void;
    mode?: 'read' | 'preview';
}

type ReaderTheme = 'light' | 'sepia' | 'dark' | 'oled';

const THEMES: Record<ReaderTheme, string> = {
    light: 'bg-white text-slate-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'bg-slate-900 text-slate-300',
    oled: 'bg-black text-gray-400'
};

const BookReader: React.FC<BookReaderProps> = ({ bookItem, product: previewProduct, onClose, mode = 'read' }) => {
    const [theme, setTheme] = useState<ReaderTheme>('light');
    const [fontSize, setFontSize] = useState(18);
    const [showControls, setShowControls] = useState(true);
    const [progress, setProgress] = useState(bookItem?.last_position || 0);
    const contentRef = useRef<HTMLDivElement>(null);
    const [bookContent, setBookContent] = useState<string>('');
    const [metadata, setMetadata] = useState<EBookMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    
    const { addToCart } = useCart();

    // Determine the active product ID and Name
    const targetProduct = bookItem?.product || previewProduct;
    const productId = targetProduct?.id;

    // Initialize Content & Metadata
    useEffect(() => {
        const loadBookData = async () => {
            if (!productId) return;
            setLoading(true);
            
            // 1. Try to fetch enhanced metadata
            // If in preview mode, we might assume metadata is passed, but fetching ensures freshness
            const meta = await getEBookMetadata(productId);
            setMetadata(meta);

            // 2. Determine content source
            if (meta && meta.format === 'studio' && meta.content_html) {
                if (mode === 'preview' && meta.preview_percentage) {
                    // Smart Truncation for Preview
                    const content = meta.content_html;
                    // Crude estimation: split by words or characters. 
                    // For HTML, this is tricky, so we use a character limit approximation.
                    const limit = Math.floor(content.length * (meta.preview_percentage / 100));
                    setBookContent(content.substring(0, limit) + "...");
                } else {
                    setBookContent(meta.content_html);
                }
            } else if (targetProduct?.digital_content) {
                // Fallback to old field
                setBookContent(targetProduct.digital_content);
            } else {
                setBookContent(`<div class="text-center mt-20">
                    <h1>${targetProduct?.name}</h1>
                    <p>This book has no content uploaded yet.</p>
                </div>`);
            }
            setLoading(false);
        };
        loadBookData();
    }, [productId, mode, targetProduct]);

    // Handle Scroll Progress (Studio Mode)
    const handleScroll = () => {
        if (contentRef.current && mode === 'read') {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            const maxScroll = scrollHeight - clientHeight;
            const currentProgress = (scrollTop / maxScroll) * 100;
            setProgress(currentProgress);
        }
    };

    // Save Progress on Close/Unmount (Only in Read Mode)
    useEffect(() => {
        return () => {
            if (mode === 'read' && bookItem && progress > 0) {
                updateReadingProgress(bookItem.id, Math.floor(progress));
            }
        };
    }, [progress, bookItem, mode]);

    const toggleControls = () => setShowControls(prev => !prev);

    // DRM Styling (Disable Select)
    const drmStyle = (metadata?.drm_enabled || mode === 'preview') 
        ? { userSelect: 'none' as const, WebkitUserSelect: 'none' as const } 
        : {};

    // Prevent Context Menu if DRM enabled or Preview
    useEffect(() => {
        if (metadata?.drm_enabled || mode === 'preview') {
            const handleContext = (e: Event) => e.preventDefault();
            document.addEventListener('contextmenu', handleContext);
            return () => document.removeEventListener('contextmenu', handleContext);
        }
    }, [metadata, mode]);

    const handleBuyNow = () => {
        if (targetProduct) {
            addToCart(targetProduct);
            onClose();
        }
    };

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
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 className="font-bold text-sm truncate max-w-[200px] md:max-w-md font-display">{targetProduct?.name}</h2>
                        {mode === 'preview' && <span className="text-xs font-bold text-primary uppercase tracking-wider">Free Preview ({metadata?.preview_percentage || 10}%)</span>}
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {mode === 'read' && metadata?.format === 'pdf' && metadata.allow_download && (
                        <a 
                            href={metadata.source_url} 
                            download 
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            title="Download PDF"
                        >
                            <i className="fas fa-download"></i>
                        </a>
                    )}
                    {mode === 'preview' && (
                        <button 
                            onClick={handleBuyNow}
                            className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition-all animate-pulse"
                        >
                            Buy Now ${targetProduct?.price}
                        </button>
                    )}
                </div>
            </div>

            {/* Reader Content Area */}
            {metadata?.format === 'pdf' && metadata.source_url ? (
                <div className="flex-1 bg-slate-900 h-full pt-16 pb-0 overflow-hidden relative">
                    {/* Preview Overlay for PDF */}
                    {mode === 'preview' && (
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none flex items-end justify-center pb-8">
                             <div className="pointer-events-auto text-center">
                                <p className="text-white font-bold mb-2 text-shadow">Preview Mode</p>
                                <button onClick={handleBuyNow} className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
                                    Unlock Full Book
                                </button>
                             </div>
                        </div>
                    )}

                    <object 
                        data={`${metadata.source_url}#toolbar=0&navpanes=0&scrollbar=0`} 
                        type="application/pdf"
                        className="w-full h-full block"
                    >
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-900">
                            <i className="fas fa-file-pdf text-5xl mb-4 opacity-50"></i>
                            <p className="text-lg font-medium mb-2">Unable to display PDF.</p>
                            <button onClick={handleBuyNow} className="text-primary hover:underline">Purchase to download</button>
                        </div>
                    </object>
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
                    {(metadata?.drm_enabled || mode === 'preview') && (
                        <div className="absolute inset-0 z-20 bg-transparent" />
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
                        
                        {/* Fade Out Effect for Studio Preview */}
                        {mode === 'preview' && (
                            <div className={`absolute bottom-0 left-0 right-0 h-[60vh] z-30 flex flex-col items-center justify-end pb-20 bg-gradient-to-t ${theme === 'dark' || theme === 'oled' ? 'from-slate-900' : theme === 'sepia' ? 'from-[#f4ecd8]' : 'from-white'} via-transparent to-transparent`}>
                                <div className="text-center p-8 backdrop-blur-sm bg-white/10 dark:bg-black/30 rounded-2xl border border-white/20 shadow-2xl max-w-md mx-4 animate-fade-in-up">
                                    <i className="fas fa-lock text-4xl mb-4 text-primary"></i>
                                    <h3 className="text-2xl font-bold mb-2">Enjoying this sample?</h3>
                                    <p className="opacity-80 mb-6">Purchase the full version to continue reading.</p>
                                    <button 
                                        onClick={handleBuyNow}
                                        className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg shadow-glow hover:scale-105 transition-transform"
                                    >
                                        Unlock Full Access - ${targetProduct?.price}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="h-[30vh]"></div>
                    </div>
                </div>
            )}

            {/* Bottom Control Bar (Read Mode Only) */}
            {mode === 'read' && metadata?.format !== 'pdf' && (
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
