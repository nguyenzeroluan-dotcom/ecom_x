


import React, { useState, useRef, useEffect } from 'react';
import { Product, ModalType } from '../types';
import { useModal } from '../contexts/ModalContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import { usePreferences } from '../contexts/PreferencesContext';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
  index?: number; // For staggered animation
}

const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid', index = 0 }) => {
  const { openModal } = useModal();
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  const { wishlist, toggleWishlist, addToRecentlyViewed, addToCompare } = usePreferences();
  
  const stock = product.stock !== undefined ? product.stock : 10;
  const isLowStock = stock > 0 && stock < 5;
  const isOutOfStock = stock === 0;
  const isWishlisted = wishlist.includes(product.id);

  const rating = product.rating || 4.5;
  const reviews = product.reviews_count || Math.floor(Math.random() * 50) + 5;
  
  // Carousel State
  const { gallery_images } = product;
  const hasGallery = gallery_images && gallery_images.length > 0;
  const displayImages = hasGallery ? [product.image_url, ...gallery_images] : [product.image_url];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hoverIntervalRef = useRef<number | null>(null);

  const startImageCycle = () => {
      if (!hasGallery || displayImages.length <= 1) return;
      hoverIntervalRef.current = window.setInterval(() => {
          setCurrentImageIndex(prev => (prev + 1) % displayImages.length);
      }, 1200);
  };

  const stopImageCycle = () => {
      if (hoverIntervalRef.current) {
          clearInterval(hoverIntervalRef.current);
          hoverIntervalRef.current = null;
      }
      setCurrentImageIndex(0);
  };
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, []);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    addToRecentlyViewed(product);
    openModal(ModalType.PRODUCT_DETAIL, { product });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
      addNotification('success', `Added ${product.name} to cart`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    addNotification('info', isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCompare(product);
    addNotification('info', `${product.name} added to comparison.`);
  };


  const animationDelay = `${index * 50}ms`;

  if (layout === 'list') {
    return (
      <div 
        className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-glow border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 flex h-48 animate-fade-in-up"
        style={{ animationDelay }}
      >
        <div className="w-48 relative overflow-hidden cursor-pointer" onClick={handleQuickView}>
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none z-10"></div>
            {isOutOfStock && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white font-bold tracking-wider">SOLD OUT</div>}
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between relative">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">{product.category}</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 cursor-pointer hover:text-primary transition-colors font-display" onClick={handleQuickView}>{product.name}</h3>
                    </div>
                    <button onClick={handleWishlist} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-white hover:shadow-md'}`}>
                        <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
                    </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < Math.floor(rating) ? '' : 'text-slate-300 dark:text-slate-600'}`}></i>)}
                    </div>
                    <span className="text-xs text-slate-400">({reviews} reviews)</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{product.description}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">${Number(product.price).toFixed(2)}</span>
                <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-primary/25 hover:bg-primary dark:hover:bg-slate-200 transition-all disabled:opacity-50 active:scale-95"
                >
                    Add to Cart
                </button>
            </div>
        </div>
      </div>
    );
  }

  // Grid Layout (Default)
  return (
    <div 
      className={`group bg-white dark:bg-slate-800 rounded-2xl shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700/50 flex flex-col h-full opacity-0 animate-fade-in-up ${isOutOfStock ? 'opacity-75' : ''}`}
      style={{ animationDelay }}
      onMouseEnter={startImageCycle}
      onMouseLeave={stopImageCycle}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer rounded-t-2xl" onClick={handleQuickView}>
        {displayImages.map((img, idx) => (
             <img 
                key={idx}
                src={img} 
                alt={product.name}
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover transform transition-opacity duration-700 ease-out ${isOutOfStock ? 'grayscale' : ''} ${currentImageIndex === idx ? 'opacity-100' : 'opacity-0'}`}
             />
        ))}
        
        {hasGallery && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {displayImages.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${currentImageIndex === idx ? 'w-4 bg-white/90' : 'w-1.5 bg-white/50'}`}></div>
                ))}
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-10 pointer-events-none"></div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-gradient-to-t from-black/60 to-transparent transition-all duration-300 z-10"></div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
             <button onClick={handleQuickView} className="w-10 h-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white rounded-xl shadow-lg border border-white/20 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-200" title="Quick View">
                 <i className="fas fa-eye"></i>
             </button>
             <button onClick={handleWishlist} className={`w-10 h-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 rounded-xl shadow-lg border border-white/20 flex items-center justify-center transition-all duration-200 ${isWishlisted ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`} title="Wishlist">
                 <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
             </button>
              <button onClick={handleAddToCompare} className="w-10 h-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white rounded-xl shadow-lg border border-white/20 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-200" title="Add to Compare">
                 <i className="fas fa-balance-scale-right"></i>
             </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {isLowStock && <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-red-400 animate-pulse">Low Stock</span>}
            {(displayImages.length > 1) && (
                <span className="bg-slate-900/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5">
                    <i className="fas fa-images"></i> {displayImages.length}
                </span>
            )}
            {Number(product.price) > 100 && (
               <span className="bg-secondary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-secondary/50">BESTSELLER</span>
            )}
        </div>

        {isOutOfStock && (
             <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-[2px]">
                 <span className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold shadow-2xl transform -rotate-12 border-2 border-white tracking-widest">
                     SOLD OUT
                 </span>
             </div>
        )}

        <div className="absolute inset-x-4 bottom-4 z-20 transform translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)">
            <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white py-3.5 rounded-xl font-bold shadow-glass hover:bg-primary hover:text-white dark:hover:bg-primary border border-white/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <i className="fas fa-shopping-bag"></i> Add to Cart
            </button>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1 mb-2">
             <div className="text-yellow-400 text-xs flex gap-0.5">
                {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < Math.floor(rating) ? '' : 'text-slate-200 dark:text-slate-700'}`}></i>)}
             </div>
             <span className="text-[10px] text-slate-400 ml-1 font-medium">({reviews} reviews)</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 truncate cursor-pointer hover:text-primary transition-colors font-display tracking-tight" onClick={handleQuickView}>
          {product.name}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 h-10 leading-relaxed opacity-90">{product.description}</p>
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-slate-50 dark:border-slate-800">
             <div>
                <span className="text-xs text-slate-400 block mb-0.5">Price</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white font-display">${Number(product.price).toFixed(2)}</span>
             </div>
             {stock > 0 && stock < 10 && !isLowStock && (
                 <span className="text-[10px] text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">Only {stock} left</span>
             )}
             <button onClick={handleAddToCart} className="md:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white flex items-center justify-center">
                <i className="fas fa-plus"></i>
             </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
