
import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import ChatBot from './components/ChatBot';
import ImageStudio from './components/ImageStudio';
import VisionAnalyzer from './components/VisionAnalyzer';
import ThinkingAssistant from './components/ThinkingAssistant';
import ManagerView from './views/ManagerView';
import MarketView from './views/MarketView';
import CheckoutView from './views/CheckoutView';
import OrdersView from './views/OrdersView';
import UserProfileView from './views/UserProfileView';
import LibraryView from './views/LibraryView';
import AccessDeniedView from './views/AccessDeniedView';
import { ViewState, LibraryItem } from './types';
import { ModalProvider } from './contexts/ModalContext';
import ModalRoot from './components/modals/ModalRoot';
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './components/cart/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import { NotificationProvider } from './contexts/NotificationContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ToastContainer from './components/common/ToastContainer';
import Footer from './components/common/Footer';
import PromoBanner from './components/PromoBanner';
import FloatingAIButton from './components/FloatingAIButton';
import BackToTop from './components/common/BackToTop';
import CommandPalette from './components/CommandPalette';
import BookReader from './components/reader/BookReader';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const { isAdmin } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [readingBook, setReadingBook] = useState<LibraryItem | null>(null);

  // Global key listener for Command Palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);


  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const handleOpenBook = (item: LibraryItem) => {
      setReadingBook(item);
      setView(ViewState.READER);
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.HOME:
        return <MarketView setView={setView} />;
      case ViewState.CHAT:
        return <div className="max-w-4xl mx-auto px-4 py-8"><ChatBot /></div>;
      case ViewState.GENERATE:
        return <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)]"><ImageStudio /></div>;
      case ViewState.ANALYZE:
        return <div className="max-w-6xl mx-auto px-4 py-8"><VisionAnalyzer /></div>;
      case ViewState.THINKING:
        return <div className="max-w-7xl mx-auto px-4 py-8"><ThinkingAssistant /></div>;
      case ViewState.MANAGER:
        return isAdmin ? <ManagerView setView={setView} /> : <AccessDeniedView setView={setView} />;
      case ViewState.CHECKOUT:
        return <CheckoutView setView={setView} />;
      case ViewState.ORDERS:
        return <OrdersView setView={setView} />;
      case ViewState.PROFILE:
        return <UserProfileView setView={setView} />;
      case ViewState.LIBRARY:
        return <LibraryView setView={setView} onReadBook={handleOpenBook} />;
      case ViewState.READER:
        return readingBook ? <BookReader bookItem={readingBook} onClose={() => setView(ViewState.LIBRARY)} /> : <LibraryView setView={setView} onReadBook={handleOpenBook} />;
      default:
        return null;
    }
  };

  const handlePaletteSelect = (selectedView: ViewState) => {
    setView(selectedView);
    setIsCommandPaletteOpen(false);
  };
  
  const isManagerView = view === ViewState.MANAGER;
  const isReaderView = view === ViewState.READER;

  return (
    <MainLayout currentView={view} setView={setView} toggleCommandPalette={() => setIsCommandPaletteOpen(true)}>
      {!isReaderView && (
          <>
            <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen} onSelect={handlePaletteSelect} />
            {!isManagerView && <PromoBanner />}
          </>
      )}
      
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isReaderView ? 'bg-transparent' : 'dark:bg-slate-900'}`}>
        <div className="flex-grow">
          {renderContent()}
        </div>
        {!isManagerView && !isReaderView && <Footer setView={setView} />}
      </div>
      
      <ModalRoot />
      <CartDrawer setView={setView} />
      <WishlistDrawer />
      <ToastContainer />
      {!isManagerView && !isReaderView && <FloatingAIButton setView={setView} currentView={view} />}
      {!isManagerView && !isReaderView && <BackToTop />}
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <PreferencesProvider>
          <ModalProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </ModalProvider>
        </PreferencesProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
