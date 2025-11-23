
import React, { useState } from 'react';
import { Product } from '../../types';
import ProductRating from './ProductRating';

interface ProductCardFlipProps {
  product: Product;
  animationDelay: string;
  isOutOfStock: boolean;
  isWishlisted: boolean;
  rating: number;
  reviews: number;
  displayImages: string[];
  handlers: {
    handleQuickView: (e: React.MouseEvent) => void;
    handleAddToCart: (e: React.MouseEvent) => void;
    handleWishlist: (e: React.MouseEvent) => void;
    handleAddToCompare: (e: React.MouseEvent) => void;
  };
}

const ProductCardFlip: React.FC<ProductCardFlipProps> = ({
  product,
  animationDelay,
  isOutOfStock,
  isWishlisted,
  rating,
  reviews,
  displayImages,
  handlers
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
        className="group h-[380px] w-full perspective-1000 animate-fade-in-up"
        style={{ animationDelay }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
    >
        <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* FRONT */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="relative h-3/4 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img src={displayImages[0]} alt={product.name} className="w-full h-full object-cover" />
                    {isOutOfStock && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold tracking-wider">SOLD OUT</div>}
                    
                    <div className="absolute top-3 left-3">
                        <span className="bg-white/90 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase">{product.category}</span>
                    </div>
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between bg-white dark:bg-slate-800">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{product.name}</h3>
                        <ProductRating rating={rating} reviews={reviews} showCount={false} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary font-display">${Number(product.price).toFixed(2)}</span>
                        <i className="fas fa-sync text-slate-300 text-xs animate-spin-slow" style={{ animationDuration: '3s' }}></i>
                    </div>
                </div>
            </div>

            {/* BACK */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden flex flex-col p-6 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold leading-tight">{product.name}</h3>
                        <button onClick={handlers.handleWishlist} className={`transition-colors ${isWishlisted ? 'text-red-500' : 'text-slate-500 hover:text-white'}`}>
                            <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-lg`}></i>
                        </button>
                    </div>

                    <div className="mb-4">
                        <ProductRating rating={rating} reviews={reviews} />
                    </div>

                    <p className="text-sm text-slate-300 line-clamp-4 mb-6 leading-relaxed">
                        {product.description}
                    </p>

                    <div className="mt-auto space-y-3">
                        <button 
                            onClick={handlers.handleAddToCart}
                            disabled={isOutOfStock}
                            className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <div className="flex gap-2">
                            <button onClick={handlers.handleQuickView} className="flex-1 bg-slate-800 border border-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                                Details
                            </button>
                            <button onClick={handlers.handleAddToCompare} className="flex-1 bg-slate-800 border border-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                                Compare
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default ProductCardFlip;
