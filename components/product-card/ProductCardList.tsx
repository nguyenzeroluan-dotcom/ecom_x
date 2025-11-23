
import React from 'react';
import { Product } from '../../types';
import ProductRating from './ProductRating';

interface ProductCardListProps {
  product: Product;
  animationDelay: string;
  isOutOfStock: boolean;
  isWishlisted: boolean;
  rating: number;
  reviews: number;
  handlers: {
    handleQuickView: (e: React.MouseEvent) => void;
    handleAddToCart: (e: React.MouseEvent) => void;
    handleWishlist: (e: React.MouseEvent) => void;
  };
}

const ProductCardList: React.FC<ProductCardListProps> = ({
  product,
  animationDelay,
  isOutOfStock,
  isWishlisted,
  rating,
  reviews,
  handlers
}) => {
  return (
    <div
      className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-glow border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 flex h-48 animate-fade-in-up"
      style={{ animationDelay }}
    >
      <div className="w-48 relative overflow-hidden cursor-pointer" onClick={handlers.handleQuickView}>
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none z-10"></div>
        {isOutOfStock && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white font-bold tracking-wider">SOLD OUT</div>}
        {product.video_url && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
            <i className="fas fa-play"></i> Video
          </div>
        )}
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between relative">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">{product.category}</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 cursor-pointer hover:text-primary transition-colors font-display" onClick={handlers.handleQuickView}>{product.name}</h3>
            </div>
            <button onClick={handlers.handleWishlist} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-white hover:shadow-md'}`}>
              <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
            </button>
          </div>
          <ProductRating rating={rating} reviews={reviews} />
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">${Number(product.price).toFixed(2)}</span>
          <button
            onClick={handlers.handleAddToCart}
            disabled={isOutOfStock}
            className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-primary/25 hover:bg-primary dark:hover:bg-slate-200 transition-all disabled:opacity-50 active:scale-95"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardList;
