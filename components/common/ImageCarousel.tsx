
import React, { useState, useEffect } from 'react';

interface ImageCarouselProps {
    images: string[];
    alt: string;
    autoPlay?: boolean;
    interval?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt, autoPlay = false, interval = 3000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!autoPlay || images.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length);
        }, interval);
        return () => clearInterval(timer);
    }, [autoPlay, images, interval]);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    if (!images || images.length === 0) {
        return <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center"><i className="fas fa-image text-4xl text-slate-300"></i></div>;
    }

    return (
        <div className="relative w-full h-full group">
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700 relative">
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`${alt} - slide ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
            </div>

            {/* Controls */}
            {images.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="absolute top-1/2 left-3 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
                        <i className="fas fa-chevron-left text-slate-800 dark:text-white"></i>
                    </button>
                    <button onClick={goToNext} className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
                        <i className="fas fa-chevron-right text-slate-800 dark:text-white"></i>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                            <div key={index} onClick={() => setCurrentIndex(index)} className={`h-2 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-sm ${currentIndex === index ? 'bg-white w-6' : 'bg-white/50 w-2'}`}></div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageCarousel;
