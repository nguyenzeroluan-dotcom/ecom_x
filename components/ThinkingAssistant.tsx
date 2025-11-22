import React, { useState } from 'react';
import { thinkingQuery } from '../services/geminiService';

const ThinkingAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleThink = async () => {
    if (!query.trim()) return;
    setIsThinking(true);
    setResult('');
    try {
      const response = await thinkingQuery(query);
      setResult(response || 'No thoughts generated.');
    } catch (error) {
      console.error("Thinking failed", error);
      setResult("Deep thinking process was interrupted. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl text-white mb-8">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-purple-500/20 rounded-lg mr-4">
            <i className="fas fa-brain text-2xl text-purple-400"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Deep Reasoning Engine</h2>
            <p className="text-slate-400 text-sm">Powered by Gemini 3 Pro with 32k Token Thinking Budget</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a complex question requiring multi-step reasoning (e.g., 'Analyze the market trends for sustainable furniture in 2025 and suggest a pricing strategy')..."
            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none h-32 resize-none"
          />
          <button
            onClick={handleThink}
            disabled={isThinking || !query}
            className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isThinking ? 'Thinking...' : 'Initiate Deep Thought'}
          </button>
        </div>
      </div>

      {(result || isThinking) && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 min-h-[200px]">
          {isThinking ? (
             <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium animate-pulse">Processing complex logic chain...</p>
             </div>
          ) : (
            <div className="prose prose-lg prose-purple max-w-none text-slate-800">
               <div className="whitespace-pre-wrap">{result}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThinkingAssistant;