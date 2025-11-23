
import React from 'react';
import { Product } from '../../types';
import ProductRating from './ProductRating';
import ProductBadges from './ProductBadges';

interface ProductCardGridProps {
  product: Product;
  animationDelay: string;
  // State from Hook
  displayImages: string[];
  currentImageIndex: number;
  hasGallery: boolean;
  isOutOfStock: boolean;
  isLowStock: boolean;
  isWishlisted: boolean;
  rating: number;
  reviews: number;
  stock: number;
  // Handlers from Hook
  handlers: {
    startImageCycle: () => void;
    stopImageCycle: () => void;
    handleQuickView: (e: React.MouseEvent) => void;
    handleAddToCart: (e: React.MouseEvent) => void;
    handleWishlist: (e: React.MouseEvent) => void;
    handleAddToCompare: (e: React.MouseEvent) => void;
  };
}

const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  product,
  animationDelay,
  displayImages,
  currentImageIndex,
  hasGallery,
  isOutOfStock,
  isLowStock,
  isWishlisted,
  rating,
  reviews,
  stock,
  handlers
}) => {
  return (
    <div
      className={`group bg-white dark:bg-slate-800 rounded-2xl shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700/50 flex flex-col h-full opacity-0 animate-fade-in-up ${isOutOfStock ? 'opacity-75' : ''}`}
      style={{ animationDelay }}
      onMouseEnter={handlers.startImageCycle}
      onMouseLeave={handlers.stopImageCycle}
    >
      {/* Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer rounded-t-2xl" onClick={handlers.handleQuickView}>
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

        {/* Action Overlay Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <button onClick={handlers.handleQuickView} className="w-10 h-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white rounded-xl shadow-lg border border-white/20 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-200" title="Quick View">
            <i className="fas fa-eye"></i>
          </button>
          <button onClick={handlers.handleWishlist} className={`w-10 h-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 rounded-xl shadow-lg border border-white/20 flex items-center justify-center transition-all duration-200 ${isWishlisted ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`} title="Wishlist">
            <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
          </button>
          <button onClick={handlers.handleAddToCompare} className="w-10 h-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white rounded-xl shadow-lg border border-white/20 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-200" title="Add to Compare">
            <i className="fas fa-balance-scale-right"></i>
          </button>
        </div>

        <ProductBadges product={product} isLowStock={isLowStock} galleryLength={displayImages.length} />

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-[2px]">
            <span className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold shadow-2xl transform -rotate-12 border-2 border-white tracking-widest">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Bottom Add to Cart (Grid) */}
        <div className="absolute inset-x-4 bottom-4 z-20 transform translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)">
          <button
            onClick={handlers.handleAddToCart}
            disabled={isOutOfStock}
            className="w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white py-3.5 rounded-xl font-bold shadow-glass hover:bg-primary hover:text-white dark:hover:bg-primary border border-white/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <i className="fas fa-shopping-bag"></i> Add to Cart
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <ProductRating rating={rating} reviews={reviews} />
        
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 truncate cursor-pointer hover:text-primary transition-colors font-display tracking-tight" onClick={handlers.handleQuickView}>
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
          {/* Mobile Add Button */}
          <button onClick={handlers.handleAddToCart} className="md:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white flex items-center justify-center">
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardGrid;
