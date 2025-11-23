
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
  const [showMobileAiMenu, setShowMobileAiMenu] = useState(false);
  
  // State for dynamic underline (Desktop)
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);
  
  const aiSuiteItems = [
    { id: ViewState.CHAT, label: 'Chat', icon: 'fa-comments' },
    { id: ViewState.GENERATE, label: 'Studio', icon: 'fa-paint-brush' },
    { id: ViewState.ANALYZE, label: 'Vision', icon: 'fa-eye' },
    { id: ViewState.THINKING, label: 'Think', icon: 'fa-brain' },
  ];

  const navItems = [
    { id: ViewState.HOME, label: 'Market', icon: 'fa-store' },
    { id: 'AI_SUITE', label: 'AI Suite', icon: 'fa-sparkles', dropdown: aiSuiteItems },
    { id: ViewState.LIBRARY, label: 'Library', icon: 'fa-book-reader' },
    ...(isAdmin ? [{ id: ViewState.MANAGER, label: 'Manager', icon: 'fa-tasks' }] : []),
  ];

  // Update underline position (Desktop)
  useEffect(() => {
    const activeItem = navRef.current?.querySelector(`[data-nav-id="${currentView}"]`) as HTMLElement;
    if (activeItem) {
      setIndicatorStyle({
        width: activeItem.offsetWidth,
        left: activeItem.offsetLeft,
      });
    } else {
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
    <>
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
                <div className="bg-gradient-to-br from-primary to-indigo-600 text-white p-1.5 md:p-2 rounded-lg mr-2 md:mr-3 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <i className="fas fa-cube text-lg md:text-xl"></i>
                </div>
                <span className="font-bold text-lg md:text-xl text-slate-800 dark:text-white tracking-tight font-display">Nexus<span className="hidden sm:inline">Commerce</span></span>
              </div>
              
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                 <nav ref={navRef} className="flex items-center space-x-1 mr-4 relative">
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

                        {/* Desktop Dropdown Menu */}
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
                                    onClick={() => { setView(ViewState.LIBRARY); setShowUserMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                 >
                                     <i className="fas fa-book mr-2 text-slate-400"></i> My Library
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

              {/* Mobile Header Elements (Right Side) */}
              <div className="flex md:hidden items-center space-x-1">
                  <button
                      onClick={toggleTheme}
                      className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                      <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                  </button>
                  
                  <button
                      onClick={toggleCommandPalette}
                      className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                      <i className="fas fa-search"></i>
                  </button>

                  <button 
                    onClick={toggleCart}
                    className="relative w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <i className="fas fa-shopping-cart"></i>
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm border border-white dark:border-slate-900 animate-bounce-small">
                        {itemCount}
                        </span>
                    )}
                  </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50 pb-safe">
            <div className="grid grid-cols-5 h-16">
                {/* Home */}
                <button onClick={() => setView(ViewState.HOME)} className={`flex flex-col items-center justify-center space-y-1 ${currentView === ViewState.HOME ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                    <i className={`fas fa-home text-xl ${currentView === ViewState.HOME ? 'animate-bounce-small' : ''}`}></i>
                    <span className="text-[10px] font-medium">Home</span>
                </button>

                {/* Wishlist */}
                <button onClick={toggleWishlistDrawer} className="flex flex-col items-center justify-center space-y-1 text-slate-400 dark:text-slate-500">
                    <div className="relative">
                        <i className="far fa-heart text-xl"></i>
                        {wishlist.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </div>
                    <span className="text-[10px] font-medium">Saved</span>
                </button>

                {/* AI Suite Toggle */}
                <button onClick={() => setShowMobileAiMenu(!showMobileAiMenu)} className="flex flex-col items-center justify-center -mt-5">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform ${showMobileAiMenu ? 'bg-slate-900 text-white rotate-45' : 'bg-gradient-to-br from-primary to-indigo-600 text-white hover:scale-105'}`}>
                        <i className={`fas ${showMobileAiMenu ? 'fa-plus' : 'fa-sparkles'} text-2xl`}></i>
                    </div>
                </button>

                {/* Library */}
                <button onClick={() => setView(ViewState.LIBRARY)} className={`flex flex-col items-center justify-center space-y-1 ${currentView === ViewState.LIBRARY ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                    <i className="fas fa-book-open text-xl"></i>
                    <span className="text-[10px] font-medium">Library</span>
                </button>

                {/* Profile / Login */}
                <button onClick={user ? () => setView(ViewState.PROFILE) : handleUserIconClick} className={`flex flex-col items-center justify-center space-y-1 ${currentView === ViewState.PROFILE ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                    {user ? (
                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`} alt="Me" className={`w-6 h-6 rounded-full object-cover border ${currentView === ViewState.PROFILE ? 'border-primary' : 'border-transparent'}`} />
                    ) : (
                        <i className="fas fa-user-circle text-xl"></i>
                    )}
                    <span className="text-[10px] font-medium">{user ? 'Me' : 'Login'}</span>
                </button>
            </div>
        </div>

        {/* Mobile AI Menu Popup */}
        {showMobileAiMenu && (
            <div className="md:hidden fixed inset-0 z-[45]" onClick={() => setShowMobileAiMenu(false)}>
                <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 border border-slate-100 dark:border-slate-700 animate-slide-up-toast">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-center">AI Power Tools</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {aiSuiteItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => { setView(item.id as ViewState); setShowMobileAiMenu(false); }}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentView === item.id ? 'bg-primary text-white' : 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'}`}>
                                    <i className={`fas ${item.icon}`}></i>
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                            </button>
                        ))}
                    </div>
                    {isAdmin && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <button onClick={() => { setView(ViewState.MANAGER); setShowMobileAiMenu(false); }} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
                                <i className="fas fa-tasks"></i> Store Manager
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </>
  );
};

export default Header;
