

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, PreferencesContextType } from '../types';

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [wishlist, setWishlist] = useState<(string | number)[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexus_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      if (newVal) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('nexus_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('nexus_theme', 'light');
      }
      return newVal;
    });
  };

  const toggleWishlist = (id: string | number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleWishlistDrawer = () => setIsWishlistOpen(prev => !prev);

  const addToCompare = (product: Product) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      if (prev.length >= 3) return [prev[1], prev[2], product]; // Keep max 3, FIFO
      return [...prev, product];
    });
  };

  const removeFromCompare = (id: string | number) => {
    setCompareList(prev => prev.filter(p => p.id !== id));
  };

  const clearCompare = () => setCompareList([]);

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 5); // Keep last 5
    });
  };

  return (
    <PreferencesContext.Provider value={{
      isDarkMode, toggleTheme,
      wishlist, toggleWishlist,
      isWishlistOpen, toggleWishlistDrawer,
      compareList, addToCompare, removeFromCompare, clearCompare,
      recentlyViewed, addToRecentlyViewed
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};