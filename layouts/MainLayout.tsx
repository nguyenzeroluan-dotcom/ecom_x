
import React from 'react';
import Header from '../components/Header';
import { ViewState } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  toggleCommandPalette: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentView, setView, toggleCommandPalette }) => {
  const isManagerView = currentView === ViewState.MANAGER;
  const isReaderView = currentView === ViewState.READER;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans">
      {!isManagerView && !isReaderView && <Header currentView={currentView} setView={setView} toggleCommandPalette={toggleCommandPalette} />}
      <main className="transition-opacity duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
