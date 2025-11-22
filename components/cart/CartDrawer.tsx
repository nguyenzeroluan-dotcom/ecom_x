
import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { ViewState, Product } from '../../types';
import { getProducts } from '../../services/supabaseClient';
import { getCartUpsell } from '../../services/geminiService';

interface CartDrawerProps {
    setView?: (view: ViewState) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ setView }) => {
  const { items, isOpen, toggleCart, removeFromCart, updateQuantity, cartTotal, clearCart, addToCart } = useCart();
  const [recommendation, setRecommendation] = useState<Product | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);

  const handleCheckout = () => {
      if (setView) {
          setView(ViewState.CHECKOUT);
          toggleCart();
      }
  };

  // AI Upsell Logic
  useEffect(() => {
    const fetchRecommendation = async () => {
      if (items.length > 0 && isOpen) {
        setLoadingRec(true);
        try {
          const allProducts = await getProducts();
          const rec = await getCartUpsell(items, allProducts);
          setRecommendation(rec);
        } catch (e) {
          console.error("Upsell failed", e);
        } finally {
          setLoadingRec(false);
        }
      } else {
        setRecommendation(null);
      }
    };
    fetchRecommendation();
  }, [isOpen, items.length]);

  const FREE_SHIPPING_THRESHOLD = 500;
  const progress = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = FREE_SHIPPING_THRESHOLD - cartTotal;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-[60] backdrop-blur-sm animate-fade-in" onClick={toggleCart}></div>
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 z-[70] shadow-2xl transform transition-transform duration-300 flex flex-col animate-slide-in-right border-l border-slate-100 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center font-display">
            Your Cart <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full">{items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
          </h2>
          <button onClick={toggleCart} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {items.length > 0 && (
           <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold mb-2">
                  <span className={progress === 100 ? "text-green-600" : "text-slate-600 dark:text-slate-400"}>
                      {progress === 100 ? "🎉 Free Shipping Unlocked!" : `Spend $${remaining.toFixed(2)} more for Free Shipping`}
                  </span>
                  <span className="text-slate-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                     className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-green-500" : "bg-primary"}`} 
                     style={{ width: `${progress}%` }}
                  ></div>
              </div>
           </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6">
              <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center animate-pulse-slow">
                <i className="fas fa-shopping-bag text-5xl text-slate-300 dark:text-slate-600"></i>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Your cart is empty</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm max-w-[200px] mx-auto">Looks like you haven't discovered our smart products yet.</p>
              </div>
              <button onClick={toggleCart} className="bg-slate-900 dark:bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-primary transition-all">
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Items */}
              {items.map(item => (
                <div key={item.id} className="flex gap-4 animate-fade-in group">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 text-sm">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                              <i className="fas fa-times"></i>
                          </button>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">{item.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                       <p className="text-slate-900 dark:text-white font-bold">${Number(item.price).toFixed(2)}</p>
                       <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-primary rounded-l-lg transition-colors">-</button>
                          <span className="px-2 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[1.5rem] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-primary rounded-r-lg transition-colors">+</button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Recommendation Block */}
              {loadingRec && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 animate-pulse">
                    <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase mb-2">
                       <i className="fas fa-sparkles"></i> AI Finding Match...
                    </div>
                    <div className="h-12 bg-indigo-200/20 rounded-lg"></div>
                </div>
              )}

              {recommendation && (
                 <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden animate-fade-in-up">
                    <div className="absolute top-0 right-0 opacity-10"><i className="fas fa-magic text-6xl text-indigo-500"></i></div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-3 flex items-center">
                           <i className="fas fa-robot mr-2"></i> Perfect Match For You
                        </p>
                        <div className="flex gap-3 items-center">
                            <div className="w-14 h-14 rounded-lg bg-white overflow-hidden flex-shrink-0">
                                <img src={recommendation.image_url} className="w-full h-full object-cover" alt={recommendation.name} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{recommendation.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">${recommendation.price}</p>
                            </div>
                            <button onClick={() => addToCart(recommendation)} className="bg-indigo-600 hover:bg-indigo-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                                <i className="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                    </div>
                 </div>
              )}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-surface dark:bg-slate-900 space-y-4">
             <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-sm">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-sm">
                  <span>Shipping</span>
                  <span className={progress === 100 ? "text-green-600 font-bold" : ""}>
                      {progress === 100 ? "FREE" : "$15.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-slate-900 dark:text-white pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span>Total</span>
                  <span>${(cartTotal + (progress === 100 ? 0 : 15) * 1.08).toFixed(2)}</span>
                </div>
             </div>
             
             <button 
               onClick={handleCheckout}
               className="w-full bg-primary hover:bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-glow transition-all flex justify-center items-center group"
             >
               Checkout Securely <i className="fas fa-lock ml-2 text-sm opacity-70"></i>
             </button>
             <button onClick={clearCart} className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors">
               Clear Cart
             </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
