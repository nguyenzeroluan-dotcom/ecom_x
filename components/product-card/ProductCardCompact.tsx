
import React from 'react';
import { Product } from '../../types';
import ProductRating from './ProductRating';

interface ProductCardCompactProps {
  product: Product;
  animationDelay: string;
  isOutOfStock: boolean;
  isLowStock: boolean;
  isWishlisted: boolean;
  rating: number;
  handlers: {
    handleQuickView: (e: React.MouseEvent) => void;
    handleAddToCart: (e: React.MouseEvent) => void;
    handleWishlist: (e: React.MouseEvent) => void;
    handleAddToCompare: (e: React.MouseEvent) => void;
  };
}

const ProductCardCompact: React.FC<ProductCardCompactProps> = ({
  product,
  animationDelay,
  isOutOfStock,
  isLowStock,
  isWishlisted,
  rating,
  handlers
}) => {
  return (
    <div
      className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all duration-200 flex items-center p-3 gap-4 animate-fade-in-up"
      style={{ animationDelay }}
      onClick={handlers.handleQuickView}
    >
      {/* Tiny Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 relative">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        {isOutOfStock && <div className="absolute inset-0 bg-black/50" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</h3>
            <p className="text-xs text-slate-500 truncate">{product.sku || product.category}</p>
        </div>
        
        <div className="hidden md:block md:col-span-3">
             <ProductRating rating={rating} reviews={0} showCount={false} />
        </div>

        <div className="md:col-span-2 text-right md:text-left">
             <span className="font-bold text-sm text-slate-900 dark:text-white">${Number(product.price).toFixed(2)}</span>
        </div>

        <div className="md:col-span-2 hidden md:block">
            {isOutOfStock ? (
                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">Out</span>
            ) : isLowStock ? (
                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">Low</span>
            ) : (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">In Stock</span>
            )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
            onClick={handlers.handleWishlist}
            className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isWishlisted ? 'text-red-500' : 'text-slate-400'}`}
        >
            <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
        </button>
        <button 
            onClick={handlers.handleAddToCart}
            disabled={isOutOfStock}
            className="bg-primary text-white p-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 shadow-sm"
        >
            <i className="fas fa-cart-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default ProductCardCompact;
