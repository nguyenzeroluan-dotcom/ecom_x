import React, { useState } from 'react';
import { Product } from '../../types';
import { forecastInventory } from '../../services/geminiService';

interface ForecastManagerProps {
  products: Product[];
}

const ForecastManager: React.FC<ForecastManagerProps> = ({ products }) => {
  const [forecastReport, setForecastReport] = useState('');
  const [isForecasting, setIsForecasting] = useState(false);

  const handleGenerateForecast = async () => {
    setIsForecasting(true);
    try {
      const report = await forecastInventory(products);
      setForecastReport(report || "Analysis failed.");
    } catch (e) {
      console.error(e);
      setForecastReport("Error generating forecast.");
    } finally {
      setIsForecasting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Inventory Forecast</h3>
            <p className="text-sm text-slate-500">Generate strategic insights on stock levels and market trends.</p>
        </div>
        <button 
            onClick={handleGenerateForecast} 
            disabled={isForecasting} 
            className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center mt-3 sm:mt-0"
        >
            {isForecasting ? <><i className="fas fa-spinner fa-spin mr-2"></i> Forecasting...</> : <><i className="fas fa-chart-line mr-2"></i> Generate Report</>}
        </button>
      </div>
      
      {isForecasting ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <i className="fas fa-brain text-4xl text-primary animate-pulse mb-4"></i>
              <p className="font-bold">AI is analyzing inventory data...</p>
              <p className="text-sm">This may take a moment.</p>
          </div>
      ) : (
          <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
            {forecastReport ? <div className="whitespace-pre-wrap">{forecastReport}</div> : 'Report will appear here...'}
          </div>
      )}
    </div>
  );
};

export default ForecastManager;
