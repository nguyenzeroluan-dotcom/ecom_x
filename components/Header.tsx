

import React, { useState, useRef, useEffect } from 'react';
import { ViewState, ModalType } from '../types';
import { useCart } from '../contexts/CartContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  toggleCommandPalette: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, toggleCommandPalette }) => {
  const { toggleCart, itemCount } = useCart();
  const { isDarkMode, toggleTheme, wishlist, toggleWishlistDrawer } = usePreferences();
  const { openModal } = useModal();
  const { user, signOut, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // State for dynamic underline
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);
  
  const aiSuiteItems = [
    { id: ViewState.CHAT, label: 'AI Chat', icon: 'fa-comments' },
    { id: ViewState.GENERATE, label: 'Studio', icon: 'fa-paint-brush' },
    { id: ViewState.ANALYZE, label: 'Vision', icon: 'fa-eye' },
    { id: ViewState.THINKING, label: 'Deep Think', icon: 'fa-brain' },
  ];

  const navItems = [
    { id: ViewState.HOME, label: 'Market', icon: 'fa-store' },
    { id: 'AI_SUITE', label: 'AI Suite', icon: 'fa-sparkles', dropdown: aiSuiteItems },
    ...(isAdmin ? [{ id: ViewState.MANAGER, label: 'Manager', icon: 'fa-tasks' }] : []),
  ];

  // Update underline position
  useEffect(() => {
    const activeItem = navRef.current?.querySelector(`[data-nav-id="${currentView}"]`) as HTMLElement;
    if (activeItem) {
      setIndicatorStyle({
        width: activeItem.offsetWidth,
        left: activeItem.offsetLeft,
      });
    } else {
        // Find if current view is in AI Suite
        const isAiView = aiSuiteItems.some(item => item.id === currentView);
        const aiSuiteButton = navRef.current?.querySelector('[data-nav-id="AI_SUITE"]') as HTMLElement;
        if (isAiView && aiSuiteButton) {
            setIndicatorStyle({
                width: aiSuiteButton.offsetWidth,
                left: aiSuiteButton.offsetLeft,
            });
        }
    }
  }, [currentView, navItems]);

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
             <nav ref={navRef} className="hidden xl:flex items-center space-x-1 mr-4 relative">
              {navItems.map((item) => {
                  const isCurrent = currentView === item.id;
                  const isAiSuiteActive = item.id === 'AI_SUITE' && aiSuiteItems.some(sub => sub.id === currentView);
                  const isActive = isCurrent || isAiSuiteActive;

                  if (item.dropdown) {
                      return (
                         <div key={item.id} className="group relative" data-nav-id={item.id}>
                           <button
                             className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                               isActive ? 'text-primary dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                             }`}
                           >
                              <i className={`fas ${item.icon} mr-2 ${isActive ? 'text-primary dark:text-indigo-400' : 'text-slate-400'}`}></i>
                              {item.label}
                              <i className="fas fa-chevron-down ml-2 text-xs opacity-70 group-hover:rotate-180 transition-transform"></i>
                           </button>
                           {/* Dropdown */}
                           <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 transform scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 origin-top z-50">
                               {item.dropdown.map(subItem => (
                                   <button 
                                     key={subItem.id}
                                     onClick={() => setView(subItem.id)}
                                     className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                        currentView === subItem.id ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                     }`}
                                   >
                                      <i className={`fas ${subItem.icon} w-5 text-center text-slate-400`}></i>
                                      {subItem.label}
                                   </button>
                               ))}
                           </div>
                         </div>
                      )
                  }

                  return (
                    <button
                      key={item.id}
                      // FIX: Cast item.id to ViewState to satisfy the setView function's type requirement.
                      onClick={() => setView(item.id as ViewState)}
                      data-nav-id={item.id}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                        isActive ? 'text-primary dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <i className={`fas ${item.icon} mr-2 ${isActive ? 'text-primary dark:text-indigo-400' : 'text-slate-400'}`}></i>
                      {item.label}
                    </button>
                  );
              })}
                <div 
                    className="absolute bottom-[-13px] h-1 bg-primary rounded-full transition-all duration-300"
                    style={indicatorStyle}
                ></div>
            </nav>

            <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-2 ml-2 space-x-1">
                 <div className="relative group">
                     <button
                        onClick={toggleCommandPalette}
                        className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Search & Navigate (Ctrl+K)"
                    >
                        <i className="fas fa-search"></i>
                    </button>
                    <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 hidden md:block bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ctrl+K
                    </div>
                </div>

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
                className="relative w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group"
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
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 animate-scale-in transform origin-top-right z-50">
                             <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                 <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.full_name || 'User'}</p>
                                 <p className="text-xs text-slate-500 truncate">{user.email}</p>
                             </div>
                             <button 
                                onClick={() => { setView(ViewState.PROFILE); setShowUserMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                             >
                                 <i className="fas fa-id-card mr-2 text-slate-400"></i> My Profile
                             </button>
                             <button 
                                onClick={() => { setView(ViewState.ORDERS); setShowUserMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                             >
                                 <i className="fas fa-box mr-2 text-slate-400"></i> My Orders
                             </button>
                             <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
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
      <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex justify-around py-2 overflow-x-auto no-scrollbar px-2">
         {navItems.filter(i => i.id !== 'AI_SUITE').map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`p-2 min-w-[60px] rounded-md flex flex-col items-center flex-shrink-0 ${
                currentView === item.id ? 'text-primary dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <i className={`fas ${item.icon} text-lg mb-1`}></i>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
            <button
              onClick={() => setView(ViewState.CHAT)}
              className={`p-2 min-w-[60px] rounded-md flex flex-col items-center flex-shrink-0 ${
                aiSuiteItems.some(i => i.id === currentView) ? 'text-primary dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <i className={`fas fa-sparkles text-lg mb-1`}></i>
              <span className="text-[10px] font-medium">AI Suite</span>
            </button>
      </div>
    </header>
  );
};

export default Header;
