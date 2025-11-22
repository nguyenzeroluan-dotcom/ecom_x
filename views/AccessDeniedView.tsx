
import React from 'react';
import { ViewState } from '../types';

interface AccessDeniedViewProps {
  setView: (view: ViewState) => void;
}

const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ setView }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4 animate-fade-in">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-lock text-4xl text-red-500"></i>
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">Access Denied</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        You do not have the required permissions to access this page. This area is restricted to administrators only.
      </p>
      <button
        onClick={() => setView(ViewState.HOME)}
        className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-indigo-600 transition-all flex items-center gap-2"
      >
        <i className="fas fa-home"></i> Return to Homepage
      </button>
    </div>
  );
};

export default AccessDeniedView;
