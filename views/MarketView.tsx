
import React, { useState } from 'react';
import { ModalType, MarketViewMode, ViewState } from '../types';
import { useMarket } from '../hooks/useMarket';
import { usePreferences } from '../contexts/PreferencesContext';
import { useModal } from '../contexts/ModalContext';
import { compareProductsAI } from '../services/geminiService';

// Components
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import ProductFilters from '../components/ProductFilters';
import ProductSkeleton from '../components/market/ProductSkeleton';
import AISearchBar from '../components/market/AISearchBar';
import MarketControlBar from '../components/market/MarketControlBar';
import MarketEmptyState from '../components/market/MarketEmptyState';
import CompareFloatingBar from '../components/market/CompareFloatingBar';
import RecentlyViewed from '../components/market/RecentlyViewed';

interface MarketViewProps {
  setView: (view: ViewState) => void;
}

const MarketView: React.FC<MarketViewProps> = ({ setView }) => {
  // State from Hook
  const { 
    loading, 
    filteredProducts, 
    dynamicCategories, 
    filters 
  } = useMarket();

  // View State (UI Only)
  const [viewMode, setViewMode] = useState<MarketViewMode>('grid');
  const [isComparing, setIsComparing] = useState(false);
  
  // Contexts
  const { compareList, clearCompare, recentlyViewed } = usePreferences();
  const { openModal } = useModal();

  // Handlers
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

  const handleProductClick = (product: any) => {
      openModal(ModalType.PRODUCT_DETAIL, { product });
  };

  // Helper for Grid Layout Class
  const getGridClass = () => {
      switch(viewMode) {
          case 'grid': return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6';
          case 'compact': return 'grid-cols-1 gap-3'; // Single column stack for compact
          case 'flip': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8';
          case 'list': default: return 'grid-cols-1 gap-6';
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-24 transition-colors duration-300">
      
      <HeroCarousel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

        <AISearchBar 
            onFocus={() => setView(ViewState.CHAT)}
            onClick={() => setView(ViewState.CHAT)}
        />
        
        <MarketControlBar 
            resultCount={filteredProducts.length}
            categories={dynamicCategories}
            selectedCategory={filters.selectedCategory}
            onSelectCategory={filters.setSelectedCategory}
            viewMode={viewMode}
            setViewMode={setViewMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar Filters */}
            <div className="hidden lg:block col-span-1">
                <ProductFilters 
                    categories={dynamicCategories}
                    selectedCategory={filters.selectedCategory}
                    onSelectCategory={filters.setSelectedCategory}
                    priceRange={filters.priceRange}
                    onPriceChange={filters.setPriceRange}
                    sortOption={filters.sortOption}
                    onSortChange={filters.setSortOption}
                />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
                {/* Product Grid */}
                {loading ? (
                    <div className={getGridClass() + ' grid'}>
                       {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <MarketEmptyState onReset={filters.resetFilters} />
                ) : (
                    <div className={getGridClass() + ' grid'}>
                        {filteredProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} layout={viewMode} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
        
        <RecentlyViewed 
            products={recentlyViewed}
            onProductClick={handleProductClick}
        />

      </div>

      <CompareFloatingBar 
          compareList={compareList}
          onClear={clearCompare}
          onRunComparison={handleRunComparison}
          isComparing={isComparing}
      />
    </div>
  );
};

export default MarketView;
