
import React from 'react';

interface ProductRatingProps {
  rating: number;
  reviews: number;
  showCount?: boolean;
}

const ProductRating: React.FC<ProductRatingProps> = ({ rating, reviews, showCount = true }) => {
  return (
    <div className="flex items-center gap-1 mb-2">
      <div className="text-yellow-400 text-xs flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <i 
            key={i} 
            className={`fas fa-star ${i < Math.floor(rating) ? '' : 'text-slate-200 dark:text-slate-700'}`}
          ></i>
        ))}
      </div>
      {showCount && (
        <span className="text-[10px] text-slate-400 ml-1 font-medium">({reviews} reviews)</span>
      )}
    </div>
  );
};

export default ProductRating;
