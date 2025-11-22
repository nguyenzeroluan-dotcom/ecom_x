import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { Product, ModalType, MarketViewMode, SortOption } from '../types';
import { getProducts } from '../services/supabaseClient';
import { usePreferences } from '../contexts/PreferencesContext';
import { useModal } from '../contexts/ModalContext';
import { compareProductsAI } from '../services/geminiService';
import HeroCarousel from '../components/HeroCarousel';
import ProductFilters from '../components/ProductFilters';

const ProductSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden h-full flex flex-col shadow-sm relative">
        {/* Shimmer Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/40 to-transparent animate-shimmer" style={{ transform: 'skewX(-20deg)' }}></div>
        
        <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-700/50 relative"></div>
        <div className="p-5 flex-1 space-y-4">
            <div className="flex justify-between">
                 <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/3"></div>
                 <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-8"></div>
            </div>
            <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
            <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-700/50">
                 <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-20"></div>
            </div>
        </div>
    </div>
);

const MarketView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<MarketViewMode>('grid');
  
  // Contexts
  const { compareList, removeFromCompare, clearCompare, recentlyViewed } = usePreferences();
  const { openModal } = useModal();
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      // Artificial delay to show off the premium skeleton loader
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    fetch();
  }, []);

  // Dynamically generate categories from products
  const dynamicCategories = useMemo(() => {
    if (products.length === 0) {
      return ["All"];
    }
    const uniqueCategories = new Set(products.map(p => p.category).filter((c): c is string => !!c));
    return ["All", ...Array.from(uniqueCategories).sort()];
  }, [products]);

  const handleRunComparison = async () => {
    if (compareList.length < 2) return;
    setIsComparing(true);
    try {
        const result = await compareProductsAI(compareList);
        openModal(ModalType.COMPARISON, { 
          title: "AI Product Comparison", 
          content: result,
          products: compareList
        });
    } catch (e: any) {
        console.error(e);
        openModal(ModalType.SUCCESS, { title: "Error", message: "Failed to generate comparison. " + e.message });
    } finally {
        setIsComparing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    
    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    
    // Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // Price Range
    result = result.filter(p => {
        const price = Number(p.price);
        return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    result = [...result].sort((a, b) => {
        const pa = Number(a.price);
        const pb = Number(b.price);
        const na = a.name.toLowerCase();
        const nb = b.name.toLowerCase();

        switch(sortOption) {
            case 'price-asc': return pa - pb;
            case 'price-desc': return pb - pa;
            case 'name-asc': return na.localeCompare(nb);
            case 'newest': default: return Number(b.id) - Number(a.id);
        }
    });

    return result;
  }, [products, search, selectedCategory, priceRange, sortOption]);

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 pb-24 transition-colors duration-300">
      
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Breadcrumbs & Stats */}
        <div className="flex justify-between items-center mb-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
                <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
                <i className="fas fa-chevron-right text-[10px] opacity-50"></i>
                <span className="font-bold text-slate-800 dark:text-white">Marketplace</span>
            </div>
            <div className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                Showing <span className="font-bold text-primary">{filteredProducts.length}</span> results
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar Filters */}
            <div className="hidden lg:block col-span-1">
                <ProductFilters 
                    categories={dynamicCategories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
                 {/* Mobile Filter & Search Bar */}
                 <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-4 mb-6 sticky top-20 z-30 flex flex-col sm:flex-row gap-4 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90">
                    <div className="relative flex-1 group">
                        <input
                        type="text"
                        placeholder="Ask AI to find products (e.g. 'Cozy aesthetic')..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-700 dark:text-white placeholder-slate-400 shadow-inner"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                            <i className="fas fa-sparkles"></i>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="lg:hidden">
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="h-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-transparent text-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            >
                                {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-primary shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}><i className="fas fa-th-large"></i></button>
                            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-primary shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}><i className="fas fa-list"></i></button>
                        </div>
                    </div>
                 </div>

                {/* Product Grid */}
                {loading ? (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                       {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 animate-scale-in">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 animate-bounce-small">
                            <i className="fas fa-search text-4xl text-slate-300 dark:text-slate-600"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">No products found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search query.</p>
                        <button onClick={() => {setSearch(''); setSelectedCategory('All'); setPriceRange([0, 1000]);}} className="mt-6 text-primary font-bold hover:underline">Clear all filters</button>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                        {filteredProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} layout={viewMode} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
        
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
            <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                    <i className="fas fa-history text-slate-400 mr-2"></i> Recently Viewed
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {recentlyViewed.map(product => (
                        <div 
                           key={product.id} 
                           onClick={() => openModal(ModalType.PRODUCT_DETAIL, { product })}
                           className="group cursor-pointer bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm hover:shadow-lg border border-slate-100 dark:border-slate-700 transition-all">
                             <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden mb-3 relative">
                                 <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             </div>
                             <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{product.name}</p>
                             <p className="text-xs text-slate-500">${Number(product.price).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-6 animate-slide-in-up max-w-2xl w-[90%]">
            <div className="flex -space-x-3">
                {compareList.map(p => (
                    <img key={p.id} src={p.image_url} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 object-cover bg-slate-100" alt={p.name} />
                ))}
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{compareList.length} products selected</p>
                <button onClick={clearCompare} className="text-xs text-red-500 hover:underline font-medium">Clear all</button>
            </div>
            <button 
                onClick={handleRunComparison}
                disabled={compareList.length < 2 || isComparing}
                className="bg-primary hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
            >
                {isComparing ? <><i className="fas fa-spinner fa-spin mr-2"></i> Thinking...</> : <><i className="fas fa-balance-scale mr-2"></i> Compare with AI</>}
            </button>
        </div>
      )}
    </div>
  );
};

export default MarketView;