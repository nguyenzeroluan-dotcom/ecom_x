
import React, { useState, useRef } from 'react';
import { analyzeImage } from '../services/geminiService';
import { useModal } from '../contexts/ModalContext';
import { ModalType } from '../types';

const VisionAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { openModal } = useModal();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysis('');
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    try {
      const base64 = await convertToBase64(selectedFile);
      const mimeType = selectedFile.type;
      const prompt = "Analyze this image. Identify the main product, its probable material, style, and estimated price category. Format as markdown.";
      const result = await analyzeImage(base64, mimeType, prompt);
      setAnalysis(result || 'No analysis returned.');
    } catch (error) {
      console.error(error);
      setAnalysis("Failed to analyze the image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFindSimilar = () => {
      // Mock functionality for demo - in real app would query vector DB
      openModal(ModalType.SUCCESS, { title: "Searching Inventory", message: "AI is scanning database for products matching this visual profile... (Feature in Development)" });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      {/* Left: Upload & Preview */}
      <div className="md:w-1/3 p-6 border-r border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
          <i className="fas fa-search text-primary mr-2"></i> Visual Analysis
        </h2>
        
        <div 
          className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            previewUrl ? 'border-primary bg-white dark:bg-slate-800' : 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-indigo-50 dark:hover:bg-slate-800'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-xl" />
          ) : (
            <div className="text-center p-4">
              <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-2"></i>
              <p className="text-sm text-slate-500 font-medium">Click to upload image</p>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        {selectedFile && (
          <div className="mt-6 space-y-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-primary hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md transition-all flex justify-center items-center"
            >
              {isAnalyzing ? <><i className="fas fa-spinner fa-spin mr-2"></i> Analyzing...</> : <><i className="fas fa-bolt mr-2"></i> Analyze Image</>}
            </button>
            {analysis && (
                <button
                    onClick={handleFindSimilar}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white py-3 px-4 rounded-xl font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
                >
                    <i className="fas fa-tags mr-2"></i> Find Similar in Store
                </button>
            )}
          </div>
        )}
      </div>

      {/* Right: Results */}
      <div className="md:w-2/3 p-8 bg-white dark:bg-slate-800 overflow-y-auto max-h-[800px]">
        {analysis ? (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-slate-400 uppercase tracking-wider text-xs font-bold mb-4">Analysis Results</h3>
            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
              {analysis}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-file-alt text-2xl"></i>
            </div>
            <p>Upload an image to see AI insights here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionAnalyzer;
