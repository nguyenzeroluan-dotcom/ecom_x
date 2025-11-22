import React, { useState, useMemo, useEffect } from 'react';
import { useProductManager } from '../hooks/useProductManager';
import ProductForm from '../components/manager/ProductForm';
import ProductTable from '../components/manager/ProductTable';
import CategoryManager from '../components/manager/CategoryManager';
import InventoryManager from '../components/manager/InventoryManager';
import UserManager from '../components/manager/UserManager';
import RoleManager from '../components/manager/RoleManager';
import SqlViewer from '../components/manager/SqlViewer';
import { Product, ManagerTab } from '../types';
import { forecastInventory } from '../services/geminiService';
import { DATABASE_SETUP_SQL } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const DEMO_DATA = [
  { name: "Ultra-Slim 4K Monitor", price: 349.99, category: "Electronics", description: "27-inch display with HDR support.", image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80", stock: 12 },
  { name: "Vintage Leather Satchel", price: 129.50, category: "Fashion", description: "Handcrafted genuine leather bag.", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80", stock: 5 },
];

const ManagerView: React.FC = () => {
  const { state, actions } = useProductManager();
  const [activeTab, setActiveTab] = useState<ManagerTab>('PRODUCTS');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { isAdmin } = useAuth(); // Check permission
  
  // View States
  const [inventoryViewMode, setInventoryViewMode] = useState<'table' | 'grid' | 'list'>('table');
  
  // Filter & Pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // AI States
  const [forecastReport, setForecastReport] = useState('');
  const [isForecasting, setIsForecasting] = useState(false);

  // Derived Categories list for dropdowns (Merge DB categories and product categories)
  const uniqueCategories = useMemo(() => {
      const cats = new Set(state.products.map(p => p.category || 'Uncategorized'));
      state.categories.forEach(c => cats.add(c.name));
      return ['All', ...Array.from(cats).sort()];
  }, [state.products, state.categories]);

  // Reset pagination to the first page whenever search or category filters change.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    const success = await actions.handleSaveProduct(data, editingProduct?.id);
    if (success) handleCancelEdit();
    return success;
  };

  const handleGenerateForecast = async () => {
      setIsForecasting(true);
      try {
          const report = await forecastInventory(state.products);
          setForecastReport(report || "Analysis failed.");
      } catch (e) {
          console.error(e);
          setForecastReport("Error generating forecast.");
      } finally {
          setIsForecasting(false);
      }
  };

  const handleCategorySelect = (category: string) => {
      setCategoryFilter(category);
      setActiveTab('PRODUCTS');
  };

  // Filtering Logic
  const filteredProducts = useMemo(() => {
      return state.products.filter(p => {
          const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
          const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
          return matchSearch && matchCat;
      });
  }, [state.products, search, categoryFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const renderTabContent = () => {
      switch(activeTab) {
          case 'DATABASE':
              return <SqlViewer />;
          case 'USERS':
              // RBAC Protection
              if (!isAdmin) {
                  return (
                      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-red-100">
                          <i className="fas fa-lock text-4xl text-red-400 mb-4"></i>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Permission Denied</h3>
                          <p className="text-slate-500">You must be an Admin to manage users.</p>
                      </div>
                  );
              }
              return <UserManager />;
          case 'ROLES':
              if (!isAdmin) {
                  return (
                       <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-red-100">
                          <i className="fas fa-shield-alt text-4xl text-red-400 mb-4"></i>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Permission Denied</h3>
                          <p className="text-slate-500">You must be an Admin to manage roles.</p>
                      </div>
                  );
              }
              return <RoleManager />;
          case 'INVENTORY':
              return <InventoryManager products={state.products} onRefresh={actions.refreshData} />;
          case 'CATEGORIES':
              return <CategoryManager 
                  products={state.products} 
                  categories={state.categories}
                  onSelectCategory={handleCategorySelect}
                  onAddCategory={actions.handleAddCategory}
                  onUpdateCategory={actions.handleUpdateCategory}
                  onDeleteCategory={actions.handleDeleteCategory}
              />;
          case 'FORECAST':
              return (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                      <h3 className="text-xl font-bold mb-4">AI Inventory Forecast</h3>
                      <button onClick={handleGenerateForecast} disabled={isForecasting} className="bg-primary text-white px-4 py-2 rounded-lg font-bold mb-4">
                          {isForecasting ? 'Forecasting...' : 'Generate Report'}
                      </button>
                      <div className="prose dark:prose-invert max-w-none">{forecastReport || 'Report will appear here...'}</div>
                  </div>
              );
          case 'PRODUCTS':
          default:
              return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form on left */}
                    <div className="lg:col-span-1">
                       <ProductForm
                           initialData={editingProduct}
                           isEditing={isEditing}
                           onSubmit={handleSubmit}
                           onCancel={handleCancelEdit}
                           isLoading={state.loading}
                           isAnalyzing={state.isAnalyzing}
                           onUpload={actions.handleImageUpload}
                           onMagicAnalysis={actions.handleMagicAnalysis}
                           availableCategories={uniqueCategories.filter(c => c !== 'All')}
                       />
                    </div>
                    {/* Table on right */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                             <div className="relative flex-1 w-full">
                                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white transition-shadow"
                                />
                             </div>
                             <div className="flex gap-3 w-full sm:w-auto">
                                <select 
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="py-2.5 pl-3 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white cursor-pointer"
                                >
                                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                                    <button onClick={() => setInventoryViewMode('table')} className={`p-2 rounded-lg ${inventoryViewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-table"></i></button>
                                    <button onClick={() => setInventoryViewMode('list')} className={`p-2 rounded-lg ${inventoryViewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-list"></i></button>
                                    <button onClick={() => setInventoryViewMode('grid')} className={`p-2 rounded-lg ${inventoryViewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-th-large"></i></button>
                                </div>
                             </div>
                        </div>

                       <ProductTable
                           products={paginatedProducts}
                           loading={state.loading}
                           viewMode={inventoryViewMode}
                           onEdit={handleEdit}
                           onDelete={actions.handleDeleteProduct}
                       />

                       {/* Pagination Controls */}
                       {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4 text-sm">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50">&laquo;</button>
                                <span className="text-slate-600 dark:text-slate-400 font-bold">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50">&raquo;</button>
                            </div>
                       )}

                    </div>
                  </div>
              );
      }
  };

  const TABS: { id: ManagerTab, label: string, icon: string }[] = [
      { id: 'PRODUCTS', label: 'Products', icon: 'fa-box' },
      { id: 'CATEGORIES', label: 'Categories', icon: 'fa-tags' },
      { id: 'INVENTORY', label: 'Inventory', icon: 'fa-warehouse' },
      { id: 'FORECAST', label: 'AI Forecast', icon: 'fa-chart-line' },
      { id: 'USERS', label: 'Users', icon: 'fa-users' },
      { id: 'ROLES', label: 'Roles', icon: 'fa-shield-alt' },
      { id: 'DATABASE', label: 'SQL Setup', icon: 'fa-database' },
  ];

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500">Real-time inventory and user management</p>
      </div>

      {/* Error & Setup Guide */}
      {state.error && (!state.products || state.products.length === 0) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl shadow-sm animate-fade-in">
          {/* ... error display logic ... */}
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
              {TABS.map(tab => (
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

      {/* Main Content Area */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ManagerView;
