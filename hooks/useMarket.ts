
import { useState, useEffect, useMemo } from 'react';
import { Product, SortOption } from '../types';
import { getProducts } from '../services/productService';

export const useMarket = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      // Simulate slight delay for smooth transition/loading state visibility
      await new Promise(resolve => setTimeout(resolve, 800));
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
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

  // Filtering and Sorting Logic
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

  const resetFilters = () => {
      setSearch('');
      setSelectedCategory('All');
      setPriceRange([0, 1000]);
  };

  return {
    products,
    loading,
    filteredProducts,
    dynamicCategories,
    filters: {
        search,
        setSearch,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        sortOption,
        setSortOption,
        resetFilters
    }
  };
};
