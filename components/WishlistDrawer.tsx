
import React, { useEffect, useState } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import { getProducts } from '../services/supabaseClient';

const WishlistDrawer: React.FC = () => {
  const { isWishlistOpen, toggleWishlistDrawer, wishlist, toggleWishlist } = usePreferences();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      const all = await getProducts();
      setProducts(all);
    };
    load();
  }, []);

  useEffect(() => {
    setWishlistItems(products.filter(p => wishlist.includes(p.id)));
  }, [products, wishlist]);

  if (!isWishlistOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-[60] backdrop-blur-sm animate-fade-in" onClick={toggleWishlistDrawer}></div>
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 z-[70] shadow-2xl transform transition-transform duration-300 flex flex-col animate-slide-in-right border-l border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center font-display">
            <i className="fas fa-heart text-red-500 mr-2"></i> Wishlist 
            <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full">{wishlist.length} items</span>
          </h2>
          <button onClick={toggleWishlistDrawer} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {wishlistItems.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <i className="far fa-heart text-5xl opacity-20"></i>
                <p>Your wishlist is empty.</p>
                <button onClick={toggleWishlistDrawer} className="text-primary font-bold text-sm hover:underline">
                  Go explore products
                </button>
             </div>
          ) : (
            wishlistItems.map(item => (
              <div key={item.id} className="flex gap-4 animate-fade-in group relative">
                 <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 text-sm">{item.name}</h3>
                      <p className="text-slate-500 text-xs mt-1">{item.category}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">${Number(item.price).toFixed(2)}</span>
                      <button 
                        onClick={() => { addToCart(item); toggleWishlistDrawer(); }}
                        className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary transition-colors shadow-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                 </div>
                 <button 
                   onClick={() => toggleWishlist(item.id)}
                   className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500"
                 >
                   <i className="fas fa-times"></i>
                 </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistDrawer;
