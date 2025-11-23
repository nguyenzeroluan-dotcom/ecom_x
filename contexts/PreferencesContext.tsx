
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, PreferencesContextType } from '../types';
import { useAuth } from './AuthContext';
import { fetchWishlistItems, addWishlistItem, removeWishlistItem, syncLocalWishlistToDB } from '../services/wishlistService';

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
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

  // Wishlist Logic: Load from LocalStorage initially
  useEffect(() => {
    const savedWishlist = localStorage.getItem('nexus_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse local wishlist");
      }
    }
  }, []);

  // Wishlist Logic: Sync with DB when User Logs In
  useEffect(() => {
    const syncWishlist = async () => {
      if (user) {
        const localWishlistStr = localStorage.getItem('nexus_wishlist');
        let localIds: (string | number)[] = [];
        if (localWishlistStr) {
            try {
                localIds = JSON.parse(localWishlistStr);
            } catch (e) {}
        }

        let syncSuccess = true;
        // 1. Sync local items to DB first
        if (localIds.length > 0) {
            syncSuccess = await syncLocalWishlistToDB(user.id, localIds);
            // Only clear local storage if sync succeeded
            if (syncSuccess) {
                localStorage.removeItem('nexus_wishlist'); 
            }
        }

        // 2. Fetch unified list from DB
        try {
            const dbItems = await fetchWishlistItems(user.id);
            // Merge logic: if DB has items, use them. 
            // If DB is empty but we failed to sync, keep local items in UI so user doesn't see empty list.
            if (dbItems.length > 0) {
                setWishlist(dbItems);
            } else if (!syncSuccess && localIds.length > 0) {
                // Keep using local IDs in state if DB sync failed
                setWishlist(localIds);
            } else {
                setWishlist([]);
            }
        } catch (e) {
            console.error("Failed to fetch DB wishlist:", e);
        }
      }
    };

    syncWishlist();
  }, [user]);

  // Persist to LocalStorage (Only if Guest)
  useEffect(() => {
    if (!user) {
        localStorage.setItem('nexus_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

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

  const toggleWishlist = async (id: string | number) => {
    // Optimistic update for UI responsiveness
    const isAdding = !wishlist.includes(id);
    setWishlist(prev => isAdding ? [...prev, id] : prev.filter(i => i !== id));

    if (user) {
        // If logged in, sync to DB
        try {
            if (isAdding) {
                await addWishlistItem(user.id, id);
            } else {
                await removeWishlistItem(user.id, id);
            }
        } catch (e) {
            console.error("Wishlist DB sync failed:", e);
            // Revert optimistic update on failure
            setWishlist(prev => isAdding ? prev.filter(i => i !== id) : [...prev, id]);
        }
    }
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
