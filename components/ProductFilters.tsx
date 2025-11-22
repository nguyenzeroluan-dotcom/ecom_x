
import React from 'react';
import { SortOption } from '../types';

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  sortOption: SortOption;
  onSortChange: (opt: SortOption) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceChange,
  sortOption,
  onSortChange
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-slate-700 h-fit sticky top-24">
       <div className="flex items-center justify-between mb-6">
         <h3 className="font-bold text-slate-900 dark:text-white">Filters</h3>
         <i className="fas fa-filter text-slate-400"></i>
       </div>

       {/* Categories */}
       <div className="mb-8">
         <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Categories</h4>
         <div className="space-y-2">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => onSelectCategory(cat)}
               className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                 selectedCategory === cat 
                 ? 'bg-primary/10 text-primary font-bold' 
                 : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
               }`}
             >
               {cat}
             </button>
           ))}
         </div>
       </div>

       {/* Price Range */}
       <div className="mb-8">
         <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Price Range</h4>
         <div className="px-2">
            <input 
              type="range" 
              min="0" 
              max="1000" 
              step="10"
              value={priceRange[1]}
              onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
         </div>
       </div>

       {/* Sorting */}
       <div>
         <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Sort By</h4>
         <select 
           value={sortOption}
           onChange={(e) => onSortChange(e.target.value as SortOption)}
           className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
         >
           <option value="newest">Newest Arrivals</option>
           <option value="price-asc">Price: Low to High</option>
           <option value="price-desc">Price: High to Low</option>
           <option value="name-asc">Name: A-Z</option>
         </select>
       </div>
    </div>
  );
};

export default ProductFilters;
