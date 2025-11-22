
import React, { useState, useEffect } from 'react';

const PromoBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white py-2 px-4 relative shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm">
        <div className="flex items-center gap-2 mb-1 sm:mb-0">
          <span className="bg-white text-red-500 font-bold px-2 py-0.5 rounded text-xs animate-pulse">FLASH SALE</span>
          <span className="font-medium">Get 50% off all AI-generated art prints!</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-1 font-mono font-bold">
            <span>{String(timeLeft.hours).padStart(2, '0')}h</span>:
            <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>:
            <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
          </div>
          <button onClick={() => setIsVisible(false)} className="opacity-80 hover:opacity-100">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
