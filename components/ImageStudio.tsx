import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { AspectRatio } from '../types';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const imgData = await generateImage(prompt, ratio);
      setGeneratedImage(imgData);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate image. Please check your API limit or try a different prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <i className="fas fa-magic text-primary mr-2"></i> Creative Studio
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prompt</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the product image you want to create..."
                className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aspect Ratio</label>
              <select
                value={ratio}
                onChange={(e) => setRatio(e.target.value as AspectRatio)}
                className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white"
              >
                {Object.values(AspectRatio).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 flex justify-center items-center"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i> Creating...
                </>
              ) : (
                'Generate Image'
              )}
            </button>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-sm text-indigo-800">
            <i className="fas fa-info-circle mr-1"></i>
            Powered by <strong>Gemini 3 Pro Image</strong>. Use specific details for best results.
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:col-span-2 bg-slate-900 rounded-2xl flex items-center justify-center p-8 min-h-[400px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {generatedImage ? (
          <div className="relative z-10 max-w-full max-h-full shadow-2xl">
             <img 
              src={generatedImage} 
              alt="Generated AI Art" 
              className="max-w-full max-h-[600px] rounded-lg object-contain mx-auto" 
             />
             <a 
               href={generatedImage} 
               download="gemini-creation.png" 
               className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-900 px-4 py-2 rounded-lg font-medium shadow-lg backdrop-blur transition-all"
             >
               <i className="fas fa-download mr-2"></i> Download
             </a>
          </div>
        ) : (
          <div className="text-center text-slate-500 z-10">
            <div className="mb-4">
              <i className="fas fa-image text-6xl opacity-20"></i>
            </div>
            <p>Your masterpiece will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
