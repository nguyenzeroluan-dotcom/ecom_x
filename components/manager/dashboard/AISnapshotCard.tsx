
import React, { useState } from 'react';
import { Product } from '../../../types';
import { generateBusinessSnapshot } from '../../../services/geminiService';

interface AISnapshotCardProps {
    products: Product[];
}

const AISnapshotCard: React.FC<AISnapshotCardProps> = ({ products }) => {
    const [snapshot, setSnapshot] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await generateBusinessSnapshot(products);
            setSnapshot(result);
        } catch (e) {
            console.error(e);
            setSnapshot("Error generating analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center">
                <i className="fas fa-robot text-primary mr-2"></i> AI Business Snapshot
            </h3>
            <p className="text-sm text-slate-500 mb-4 flex-shrink-0">Get a strategic overview of your current inventory.</p>
            
            <div className="flex-grow bg-white dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 min-h-[150px] prose prose-sm dark:prose-invert max-w-none">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <i className="fas fa-spinner fa-spin text-2xl"></i>
                    </div>
                ) : snapshot ? (
                     <div className="whitespace-pre-wrap">{snapshot}</div>
                ) : (
                    <div className="flex items-center justify-center h-full text-center text-slate-400">
                        <p>Click below to generate an AI analysis.</p>
                    </div>
                )}
            </div>
            
            <button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-all shadow-md disabled:opacity-60"
            >
                {isLoading ? 'Analyzing...' : 'Generate Analysis'}
            </button>
        </div>
    );
};

export default AISnapshotCard;
