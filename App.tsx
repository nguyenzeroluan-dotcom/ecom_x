
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
import AccessDeniedView from './views/AccessDeniedView';
import { ViewState } from './types';
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

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const { isAdmin } = useAuth();

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const renderContent = () => {
    switch (view) {
      case ViewState.HOME:
        return <MarketView />;
      case ViewState.CHAT:
        return <div className="max-w-4xl mx-auto px-4 py-8"><ChatBot /></div>;
      case ViewState.GENERATE:
        return <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)]"><ImageStudio /></div>;
      case ViewState.ANALYZE:
        return <div className="max-w-6xl mx-auto px-4 py-8"><VisionAnalyzer /></div>;
      case ViewState.THINKING:
        return <div className="max-w-7xl mx-auto px-4 py-8"><ThinkingAssistant /></div>;
      case ViewState.MANAGER:
        return isAdmin ? <ManagerView /> : <AccessDeniedView setView={setView} />;
      case ViewState.CHECKOUT:
        return <CheckoutView setView={setView} />;
      case ViewState.ORDERS:
        return <OrdersView setView={setView} />;
      case ViewState.PROFILE:
        return <UserProfileView setView={setView} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout currentView={view} setView={setView}>
      <PromoBanner />
      <div className="min-h-screen flex flex-col dark:bg-slate-900 transition-colors duration-300">
        <div className="flex-grow">
          {renderContent()}
        </div>
        <Footer setView={setView} />
      </div>
      <ModalRoot />
      <CartDrawer setView={setView} />
      <WishlistDrawer />
      <ToastContainer />
      <FloatingAIButton setView={setView} currentView={view} />
      <BackToTop />
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