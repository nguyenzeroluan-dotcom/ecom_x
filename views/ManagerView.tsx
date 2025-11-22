
import React, { useState, useMemo } from 'react';
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
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied</h3>
                          <p className="text-slate-500">You need Admin privileges to manage users.</p>
                      </div>
                  );
              }
              return <UserManager />;
          case 'ROLES':
              if (!isAdmin) {
                  return (
                      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-red-100">
                          <i className="fas fa-lock text-4xl text-red-400 mb-4"></i>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied</h3>
                          <p className="text-slate-500">You need Admin privileges to manage roles.</p>
                      </div>
                  );
              }
              return <RoleManager />;
          case 'CATEGORIES':
              return (
                  <CategoryManager 
                    products={state.products} 
                    categories={state.categories}
                    onSelectCategory={handleCategorySelect}
                    onAddCategory={actions.handleAddCategory}
                    onUpdateCategory={actions.handleUpdateCategory}
                    onDeleteCategory={actions.handleDeleteCategory}
                  />
              );
          case 'INVENTORY':
              return (
                  <InventoryManager 
                    products={state.products}
                    onRefresh={actions.refreshData} // Properly connected refresh
                  />
              );
          case 'FORECAST':
              return (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Deep Thinking Inventory Analysis</h2>
                        <button 
                            onClick={handleGenerateForecast}
                            disabled={isForecasting}
                            className="bg-primary text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {isForecasting ? 'Thinking...' : 'Run Analysis'}
                        </button>
                    </div>
                    {isForecasting ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-indigo-600 font-medium animate-pulse">Gemini Thinking Model is analyzing supply chain data...</p>
                        </div>
                    ) : forecastReport ? (
                        <div className="prose prose-indigo max-w-none dark:prose-invert whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                            {forecastReport}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <i className="fas fa-brain text-6xl mb-4 opacity-20"></i>
                            <p>Click "Run Analysis" to generate a strategic report based on {state.products.length} items.</p>
                        </div>
                    )}
                </div>
              );
          case 'PRODUCTS':
          default:
              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-1">
                    <ProductForm 
                        initialData={editingProduct}
                        onSubmit={handleSubmit}
                        onCancel={handleCancelEdit}
                        isEditing={isEditing}
                        isLoading={state.loading || state.uploading}
                        isAnalyzing={state.isAnalyzing}
                        onUpload={actions.handleImageUpload}
                        onMagicAnalysis={actions.handleMagicAnalysis}
                        availableCategories={uniqueCategories.filter(c => c !== 'All')}
                    />
                    </div>

                    {/* Right Column: List/Grid/Table */}
                    <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full min-h-[600px]">
                        
                        {/* Toolbar */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-48">
                                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Search products..." 
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <select 
                                    value={categoryFilter}
                                    onChange={e => setCategoryFilter(e.target.value)}
                                    className="py-2 pl-2 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm focus:ring-1 focus:ring-primary"
                                >
                                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                <button 
                                    onClick={() => setInventoryViewMode('table')}
                                    className={`p-2 rounded-md transition-all ${inventoryViewMode === 'table' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                ><i className="fas fa-table"></i></button>
                                <button 
                                    onClick={() => setInventoryViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${inventoryViewMode === 'list' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                ><i className="fas fa-list"></i></button>
                                <button 
                                    onClick={() => setInventoryViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${inventoryViewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                ><i className="fas fa-th-large"></i></button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            <ProductTable 
                                products={paginatedProducts}
                                loading={state.loading}
                                viewMode={inventoryViewMode}
                                onEdit={handleEdit}
                                onDelete={actions.handleDeleteProduct}
                            />
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 disabled:opacity-50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    >Previous</button>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 disabled:opacity-50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    >Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
              );
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Store Manager</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview for {state.products.length} products</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <button
            onClick={() => actions.handleSeedData(DEMO_DATA)}
            disabled={state.seeding}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-50"
           >
             {state.seeding ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-database mr-2"></i>}
             Generate Data
           </button>
        </div>
      </div>

      {/* Error Banner for Database Setup */}
      {(state.setupRequired || state.error) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl shadow-sm animate-fade-in">
              <div className="flex items-start">
                  <div className="flex-shrink-0">
                      <i className="fas fa-exclamation-circle text-red-500 mt-1"></i>
                  </div>
                  <div className="ml-3 w-full">
                      <h3 className="text-lg font-bold text-red-800 mb-1">
                          {state.setupRequired ? "Database Setup Required" : "Error"}
                      </h3>
                      <p className="text-sm text-red-700 mb-3">
                          {state.error || "Missing database tables detected."}
                      </p>
                      
                      {state.setupRequired && (
                          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner border border-slate-700">
                              <div className="flex justify-between items-center mb-2">
                                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">SQL Setup Script</p>
                                  <button 
                                     onClick={() => navigator.clipboard.writeText(DATABASE_SETUP_SQL)}
                                     className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition flex items-center gap-2"
                                  >
                                      <i className="fas fa-copy"></i> Copy SQL
                                  </button>
                              </div>
                              <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
{DATABASE_SETUP_SQL}
                              </pre>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-8 overflow-x-auto">
          {[
              { id: 'PRODUCTS', icon: 'fa-box', label: 'Products' },
              { id: 'CATEGORIES', icon: 'fa-tags', label: 'Categories' },
              { id: 'INVENTORY', icon: 'fa-warehouse', label: 'Stock & SKU' },
              { id: 'FORECAST', icon: 'fa-chart-line', label: 'Deep Forecast' },
              // Only show Users/Roles tab if admin
              ...(isAdmin ? [
                  { id: 'USERS', icon: 'fa-users', label: 'Users' },
                  { id: 'ROLES', icon: 'fa-user-shield', label: 'Roles & Permissions' }
              ] : []),
              // SQL Setup Tab
              { id: 'DATABASE', icon: 'fa-database', label: 'SQL Setup' }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ManagerTab)}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                  <i className={`fas ${tab.icon} mr-2`}></i> {tab.label}
              </button>
          ))}
      </div>

      {renderTabContent()}

    </div>
  );
};

export default ManagerView;
