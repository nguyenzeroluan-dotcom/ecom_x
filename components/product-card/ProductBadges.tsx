
import React from 'react';
import { Product } from '../../types';

interface ProductBadgesProps {
  product: Product;
  isLowStock: boolean;
  galleryLength: number;
}

const ProductBadges: React.FC<ProductBadgesProps> = ({ product, isLowStock, galleryLength }) => {
  return (
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 pointer-events-none">
      {isLowStock && (
        <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-red-400 animate-pulse">
          Low Stock
        </span>
      )}
      {galleryLength > 1 && (
        <span className="bg-slate-900/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5">
          <i className="fas fa-images"></i> {galleryLength}
        </span>
      )}
      {product.video_url && (
        <span className="bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5">
          <i className="fas fa-play-circle"></i> Video
        </span>
      )}
      {Number(product.price) > 100 && (
        <span className="bg-secondary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg border border-secondary/50">
          BESTSELLER
        </span>
      )}
    </div>
  );
};

export default ProductBadges;
