
import React, { useState, useEffect, useRef } from 'react';

interface ImageCarouselProps {
    images: string[];
    alt: string;
    autoPlay?: boolean;
    interval?: number;
    compact?: boolean; // If true, hide thumbnails and use dots (for cards)
}

type MediaType = 'image' | 'video' | 'youtube' | 'vimeo';

const getMediaType = (url: string): MediaType => {
    if (!url) return 'image';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    const ext = url.split('.').pop()?.toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) return 'video';
    if (url.startsWith('data:video/')) return 'video';
    return 'image'; // Default fallthrough
};

const getEmbedUrl = (url: string, type: MediaType): string => {
    if (type === 'youtube') {
        let id = '';
        if (url.includes('youtu.be')) {
            id = url.split('/').pop()?.split('?')[0] || '';
        } else if (url.includes('v=')) {
            id = url.split('v=')[1]?.split('&')[0] || '';
        } else if (url.includes('/embed/')) {
            id = url.split('/embed/')[1]?.split('?')[0] || '';
        }
        return `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0`;
    }
    if (type === 'vimeo') {
        // Handle vimeo.com/ID
        const id = url.split('/').pop();
        if (!url.includes('player.vimeo.com')) {
             return `https://player.vimeo.com/video/${id}`;
        }
    }
    return url;
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt, autoPlay = false, interval = 5000, compact = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    // Filter out empty strings
    const validMedia = images.filter(Boolean);

    // Auto-play logic
    useEffect(() => {
        if (!autoPlay || validMedia.length <= 1 || isPaused) return;
        
        // Check if current slide is a video type; if so, don't auto-advance unless it's just an image thumbnail? 
        // Better: stop auto-play if we are on a video slide to let user watch it.
        const currentType = getMediaType(validMedia[currentIndex]);
        if (currentType !== 'image') return;

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % validMedia.length);
        }, interval);
        return () => clearInterval(timer);
    }, [autoPlay, validMedia, interval, currentIndex, isPaused]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsPaused(true); // User interaction pauses auto-play
    };

    const goToPrevious = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsPaused(true);
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? validMedia.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsPaused(true);
        const isLastSlide = currentIndex === validMedia.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    if (!validMedia || validMedia.length === 0) {
        return <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center"><i className="fas fa-image text-4xl text-slate-300"></i></div>;
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Main Viewer */}
            <div className="relative w-full flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner group min-h-[300px]">
                {validMedia.map((media, index) => {
                    const type = getMediaType(media);
                    const isActive = index === currentIndex;
                    
                    return (
                        <div 
                            key={index}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out flex items-center justify-center ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                        >
                            {type === 'image' ? (
                                <img
                                    src={media}
                                    alt={`${alt} - slide ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : type === 'youtube' || type === 'vimeo' ? (
                                <iframe
                                    src={getEmbedUrl(media, type)}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                // Native Video
                                <video 
                                    src={media} 
                                    controls 
                                    className="w-full h-full object-contain bg-black"
                                    playsInline
                                />
                            )}
                        </div>
                    );
                })}

                {/* Navigation Arrows */}
                {validMedia.length > 1 && (
                    <>
                        <button 
                            onClick={goToPrevious} 
                            className="absolute top-1/2 left-3 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:bg-white dark:hover:bg-black hover:scale-110"
                        >
                            <i className="fas fa-chevron-left text-slate-800 dark:text-white"></i>
                        </button>
                        <button 
                            onClick={goToNext} 
                            className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:bg-white dark:hover:bg-black hover:scale-110"
                        >
                            <i className="fas fa-chevron-right text-slate-800 dark:text-white"></i>
                        </button>
                    </>
                )}

                {/* Compact Dots (Mobile/Card View) */}
                {(compact && validMedia.length > 1) && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {validMedia.map((_, index) => (
                            <div 
                                key={index} 
                                onClick={(e) => { e.stopPropagation(); goToSlide(index); }} 
                                className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-sm ${currentIndex === index ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                            ></div>
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnail Navigation Strip (Desktop/Detail View) */}
            {(!compact && validMedia.length > 1) && (
                <div className="flex gap-3 overflow-x-auto pb-2 px-1 no-scrollbar snap-x">
                    {validMedia.map((media, index) => {
                        const type = getMediaType(media);
                        const isSelected = currentIndex === index;
                        
                        return (
                            <div 
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-2 snap-start
                                    ${isSelected 
                                        ? 'border-primary ring-2 ring-primary/30 scale-105 shadow-md' 
                                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-600'
                                    }
                                `}
                            >
                                {type === 'image' ? (
                                    <img src={media} className="w-full h-full object-cover" alt="thumb" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                                        {type === 'youtube' ? (
                                            <img 
                                                src={`https://img.youtube.com/vi/${media.split('v=')[1]?.split('&')[0] || media.split('/').pop()}/default.jpg`} 
                                                className="w-full h-full object-cover opacity-60" 
                                                alt="video-thumb"
                                            />
                                        ) : (
                                            <i className="fas fa-video text-white/50 text-xl"></i>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                                                <i className="fas fa-play text-white text-[10px] ml-0.5"></i>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
