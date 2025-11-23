
import React from 'react';
import { Product } from '../../types';

interface RecentlyViewedProps {
    products: Product[];
    onProductClick: (product: Product) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ products, onProductClick }) => {
  if (products.length === 0) return null;

  return (
    <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <i className="fas fa-history text-slate-400 mr-2"></i> Recently Viewed
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map(product => (
                <div 
                    key={product.id} 
                    onClick={() => onProductClick(product)}
                    className="group cursor-pointer bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm hover:shadow-lg border border-slate-100 dark:border-slate-700 transition-all hover:-translate-y-1">
                        <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden mb-3 relative">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{product.name}</p>
                        <p className="text-xs text-slate-500">${Number(product.price).toFixed(2)}</p>
                </div>
            ))}
        </div>
    </div>
  );
};

export default RecentlyViewed;
