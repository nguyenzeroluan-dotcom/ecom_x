
import React, { useState } from 'react';
import { ViewState, ModalType } from '../types';
import { useCart } from '../contexts/CartContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const { toggleCart, itemCount } = useCart();
  const { isDarkMode, toggleTheme, wishlist, toggleWishlistDrawer } = usePreferences();
  const { openModal } = useModal();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: ViewState.HOME, label: 'Market', icon: 'fa-store' },
    { id: ViewState.CHAT, label: 'AI Chat', icon: 'fa-comments' },
    { id: ViewState.GENERATE, label: 'Studio', icon: 'fa-paint-brush' },
    { id: ViewState.ANALYZE, label: 'Vision', icon: 'fa-eye' },
    { id: ViewState.THINKING, label: 'Deep Think', icon: 'fa-brain' },
    { id: ViewState.ORDERS, label: 'Orders', icon: 'fa-box-open' },
    { id: ViewState.MANAGER, label: 'Manager', icon: 'fa-tasks' },
  ];

  const handleUserIconClick = () => {
      if (user) {
          setShowUserMenu(!showUserMenu);
      } else {
          openModal(ModalType.AUTH);
      }
  };

  const handleLogout = () => {
      signOut();
      setShowUserMenu(false);
      setView(ViewState.HOME);
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
            <div className="bg-gradient-to-br from-primary to-indigo-600 text-white p-2 rounded-lg mr-3 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <i className="fas fa-cube text-xl"></i>
            </div>
            <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight font-display">NexusCommerce</span>
          </div>
          
          <div className="flex items-center gap-1">
            <nav className="hidden xl:flex space-x-1 mr-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                    currentView === item.id
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <i className={`fas ${item.icon} mr-2 ${currentView === item.id ? 'text-primary dark:text-primary-400' : 'text-slate-400'}`}></i>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-2 ml-2 space-x-1">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Toggle Dark Mode"
                >
                    <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>

                {/* Wishlist Toggle */}
                <button
                    onClick={toggleWishlistDrawer}
                    className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-full transition-all relative"
                    title="Wishlist"
                >
                    <i className="far fa-heart text-lg"></i>
                    {wishlist.length > 0 && (
                         <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                </button>

                {/* Cart Toggle */}
                <button 
                onClick={toggleCart}
                className="relative w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all group"
                >
                <i className="fas fa-shopping-cart text-lg group-hover:scale-110 transition-transform"></i>
                {itemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm border-2 border-white dark:border-slate-900 transform scale-100 animate-bounce-small">
                    {itemCount}
                    </span>
                )}
                </button>

                {/* User Profile Toggle */}
                <div className="relative ml-1">
                    <button 
                        onClick={handleUserIconClick}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary focus:outline-none transition-all"
                    >
                        {user ? (
                            <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && user && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 animate-fade-in-up transform origin-top-right z-50">
                             <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                 <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.full_name || 'User'}</p>
                                 <p className="text-xs text-slate-500 truncate">{user.email}</p>
                             </div>
                             <button 
                                onClick={() => { setView(ViewState.PROFILE); setShowUserMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                             >
                                 <i className="fas fa-id-card mr-2 text-slate-400"></i> My Profile
                             </button>
                             <button 
                                onClick={() => { setView(ViewState.ORDERS); setShowUserMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                             >
                                 <i className="fas fa-box mr-2 text-slate-400"></i> My Orders
                             </button>
                             <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                                 <button 
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                 >
                                     <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
                                 </button>
                             </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between py-2 overflow-x-auto no-scrollbar px-2">
         {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`p-2 min-w-[60px] rounded-md flex flex-col items-center flex-shrink-0 ${
                currentView === item.id ? 'text-primary dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <i className={`fas ${item.icon} text-lg mb-1`}></i>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
      </div>
    </header>
  );
};

export default Header;
