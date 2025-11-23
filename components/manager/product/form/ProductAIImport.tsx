
import React from 'react';

interface ProductAIImportProps {
  onMagicUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzing: boolean;
  magicInputRef: React.RefObject<HTMLInputElement | null>;
}

const ProductAIImport: React.FC<ProductAIImportProps> = ({ onMagicUpload, isAnalyzing, magicInputRef }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
        <i className="fas fa-magic text-9xl"></i>
      </div>
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-2 flex items-center">
          <i className="fas fa-sparkles mr-2 text-yellow-300"></i> AI Auto-Import
        </h3>
        <p className="text-indigo-100 text-sm mb-4">
          Upload a photo and let Gemini Vision auto-fill details.
        </p>
        <button 
          type="button"
          onClick={() => magicInputRef.current?.click()}
          disabled={isAnalyzing}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl py-3 px-4 font-semibold text-white transition-all flex items-center justify-center"
        >
          {isAnalyzing ? <><i className="fas fa-circle-notch fa-spin mr-2"></i> Analyzing...</> : <><i className="fas fa-camera mr-2"></i> Upload & Analyze</>}
        </button>
        <input type="file" ref={magicInputRef} onChange={onMagicUpload} className="hidden" accept="image/*" />
      </div>
    </div>
  );
};

export default ProductAIImport;
