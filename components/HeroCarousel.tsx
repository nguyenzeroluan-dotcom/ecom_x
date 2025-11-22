
import React, { useState, useEffect } from 'react';

const SLIDES = [
  {
    id: 1,
    title: "The Future of Commerce",
    subtitle: "Experience smart shopping powered by Gemini 3 Pro.",
    bg: "bg-indigo-900",
    pattern: "opacity-30 mix-blend-overlay",
    icon: "fa-robot"
  },
  {
    id: 2,
    title: "Visual Search Revolution",
    subtitle: "Don't know the name? Just upload a photo.",
    bg: "bg-purple-900",
    pattern: "opacity-30 mix-blend-overlay",
    icon: "fa-camera"
  },
  {
    id: 3,
    title: "Deep Reasoning Analysis",
    subtitle: "Let AI solve your complex supply chain problems.",
    bg: "bg-slate-900",
    pattern: "opacity-30 mix-blend-overlay",
    icon: "fa-brain"
  }
];

const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 6000); // Slightly longer duration to read text
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[450px] rounded-b-[3rem] overflow-hidden shadow-2xl mb-12 group mx-0 sm:mx-4 md:mx-8 lg:mx-12 mt-4">
      {SLIDES.map((slide, idx) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${slide.bg}`}
        >
          {/* Abstract Background Pattern with Parallax-like effect on transition */}
          <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] ${slide.pattern} ${idx === current ? 'scale-105' : 'scale-100'} transition-transform duration-[6000ms]`}></div>
          
          {/* Glowing Orb */}
          <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 transition-transform duration-[6000ms] ${idx === current ? 'translate-x-0' : 'translate-x-1/4'}`}></div>
          
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-20 max-w-5xl mx-auto text-center md:text-left items-center md:items-start">
             <div className={`w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-glow transition-all duration-700 delay-100 ${idx === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <i className={`fas ${slide.icon} text-4xl text-white`}></i>
             </div>
             
             <h2 className={`text-4xl md:text-7xl font-bold text-white mb-6 font-display leading-tight tracking-tight transition-all duration-700 delay-200 ${idx === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
               {slide.title}
             </h2>
             
             <p className={`text-lg md:text-2xl text-indigo-100 mb-10 max-w-2xl leading-relaxed transition-all duration-700 delay-300 ${idx === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
               {slide.subtitle}
             </p>
             
             <div className={`flex gap-4 transition-all duration-700 delay-500 ${idx === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
               <button className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center">
                 Explore Now <i className="fas fa-arrow-right ml-2"></i>
               </button>
               <button className="px-10 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm">
                 Watch Demo
               </button>
             </div>
          </div>
        </div>
      ))}

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${idx === current ? 'bg-white w-12' : 'bg-white/40 w-3 hover:bg-white/60'}`}
          />
        ))}
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface dark:from-slate-950 to-transparent z-10 pointer-events-none"></div>
    </div>
  );
};

export default HeroCarousel;
