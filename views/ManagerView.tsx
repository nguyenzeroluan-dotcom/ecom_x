import React, { useState, useMemo } from 'react';
import { useProductManager } from '../hooks/useProductManager';
import { ManagerTab } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AccessDeniedView from './AccessDeniedView';

// Import Tab Components
import Dashboard from '../components/manager/Dashboard';
import ProductManager from '../components/ProductManager';
import CategoryManager from '../components/manager/CategoryManager';
import InventoryManager from '../components/manager/InventoryManager';
import MediaManager from '../components/manager/MediaManager';
import ForecastManager from '../components/manager/ForecastManager';
import UserManager from '../components/manager/UserManager';
import RoleManager from '../components/manager/RoleManager';
import SqlViewer from '../components/manager/SqlViewer';

const DEMO_DATA = [
  { name: "Ultra-Slim 4K Monitor", price: 349.99, category: "Electronics", description: "27-inch display with HDR support.", image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80", stock: 12 },
  { name: "Vintage Leather Satchel", price: 129.50, category: "Fashion", description: "Handcrafted genuine leather bag.", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80", stock: 5 },
  { name: "Smart Home Hub", price: 89.99, category: "Electronics", description: "Control your home with voice.", image_url: "https://images.unsplash.com/photo-1558002038-109177381793?auto=format&fit=crop&w=400&q=80", stock: 25 },
  { name: "Abstract Canvas Print", price: 59.00, category: "Art", description: "Modern art piece, 24x36 inches.", image_url: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=400&q=80", stock: 8 },
  { name: "Ergonomic Mesh Chair", price: 249.00, category: "Office", description: "High-back chair with lumbar support.", image_url: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=400&q=80", stock: 3 },
];

const TABS: { id: ManagerTab, label: string, icon: string, adminOnly: boolean }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: 'fa-home', adminOnly: false },
    { id: 'PRODUCTS', label: 'Products', icon: 'fa-box', adminOnly: false },
    { id: 'CATEGORIES', label: 'Categories', icon: 'fa-tags', adminOnly: false },
    { id: 'INVENTORY', label: 'Inventory', icon: 'fa-warehouse', adminOnly: false },
    { id: 'MEDIA', label: 'Media', icon: 'fa-images', adminOnly: false },
    { id: 'FORECAST', label: 'AI Forecast', icon: 'fa-chart-line', adminOnly: false },
    { id: 'USERS', label: 'Users', icon: 'fa-users', adminOnly: true },
    { id: 'ROLES', label: 'Roles', icon: 'fa-shield-alt', adminOnly: true },
    { id: 'DATABASE', label: 'SQL Setup', icon: 'fa-database', adminOnly: true },
];

const ManagerView: React.FC = () => {
    const { 
        products, 
        categories, 
        loading, 
        error, 
        setupRequired, 
        seeding, 
        isAnalyzing,
        refreshData,
        handleSaveProduct,
        handleDeleteProduct,
        handleDeleteProducts,
        handleAddCategory,
        handleUpdateCategory,
        handleDeleteCategory,
        handleSeedData,
        handleMagicAnalysis,
        dismissError
    } = useProductManager();
  
    const [activeTab, setActiveTab] = useState<ManagerTab>('DASHBOARD');
    const [productCategoryFilter, setProductCategoryFilter] = useState('All');
    const { isAdmin } = useAuth();
  
    const uniqueCategories = useMemo(() => {
        const cats = new Set(products.map(p => p.category || 'Uncategorized'));
        categories.forEach(c => cats.add(c.name));
        return ['All', ...Array.from(cats).sort()];
    }, [products, categories]);

    const handleCategorySelect = (category: string) => {
        setProductCategoryFilter(category);
        setActiveTab('PRODUCTS');
    };
    
    // Using a map for cleaner rendering logic and prop drilling
    const tabComponents: Record<ManagerTab, React.ReactNode> = {
        DASHBOARD: <Dashboard products={products} setView={setActiveTab} />,
        PRODUCTS: <ProductManager 
            products={products}
            categories={uniqueCategories}
            loading={loading}
            isAnalyzing={isAnalyzing}
            handleSaveProduct={handleSaveProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleDeleteProducts={handleDeleteProducts}
            handleMagicAnalysis={handleMagicAnalysis}
            categoryFilter={productCategoryFilter}
            setCategoryFilter={setProductCategoryFilter}
        />,
        CATEGORIES: <CategoryManager 
            products={products} 
            categories={categories}
            onSelectCategory={handleCategorySelect}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
        />,
        INVENTORY: <InventoryManager products={products} onRefresh={refreshData} />,
        MEDIA: <MediaManager />,
        FORECAST: <ForecastManager products={products} />,
        USERS: isAdmin ? <UserManager /> : <AccessDeniedView setView={() => setActiveTab('DASHBOARD')} />,
        ROLES: isAdmin ? <RoleManager /> : <AccessDeniedView setView={() => setActiveTab('DASHBOARD')} />,
        DATABASE: isAdmin ? <SqlViewer /> : <AccessDeniedView setView={() => setActiveTab('DASHBOARD')} />,
    };

    const visibleTabs = TABS.filter(tab => !tab.adminOnly || isAdmin);

    return (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-100 dark:bg-slate-950 min-h-screen">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-slate-500">Real-time inventory and user management</p>
            </div>
            <button
                onClick={() => handleSeedData(DEMO_DATA)}
                disabled={seeding}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {seeding ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-database mr-2"></i>}
                {seeding ? "Adding Data..." : "Generate Demo Data"}
            </button>
          </div>
    
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl shadow-sm animate-fade-in">
               <div className="flex items-center">
                 <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
                 <div>
                    <h4 className="font-bold text-red-800 dark:text-red-300">Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    {setupRequired && <p className="text-sm text-red-700 dark:text-red-400 mt-1">Please go to the 'SQL Setup' tab to resolve.</p>}
                 </div>
                 <button onClick={dismissError} className="ml-auto text-red-500"><i className="fas fa-times"></i></button>
               </div>
            </div>
          )}
          
          <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
              <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
                  {visibleTabs.map(tab => (
                      <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                              ${activeTab === tab.id 
                                  ? 'border-primary text-primary' 
                                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                              }
                          `}
                      >
                          <i className={`fas ${tab.icon} mr-2 opacity-70`}></i>
                          {tab.label}
                      </button>
                  ))}
              </nav>
          </div>
    
          <div>
            {tabComponents[activeTab]}
          </div>
        </div>
    );
};

export default ManagerView;