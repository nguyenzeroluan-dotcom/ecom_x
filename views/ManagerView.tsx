
import React, { useState, useMemo } from 'react';
import { useProductManager } from '../hooks/useProductManager';
import { ManagerTab, UserProfile, ViewState } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Import Layout Components
import ManagerSidebar from '../components/manager/ManagerSidebar';
import ManagerHeader from '../components/manager/ManagerHeader';

// Import Tab Components
import Dashboard from '../components/manager/Dashboard';
import OrderManager from '../components/manager/OrderManager'; // NEW
import ProductManager from '../components/ProductManager';
import EBookManager from '../components/manager/EBookManager';
import { CategoryManager } from '../components/manager/CategoryManager';
import InventoryManager from '../components/manager/InventoryManager';
import MediaManager from '../components/manager/MediaManager';
import ForecastManager from '../components/manager/ForecastManager';
import UserManager from '../components/manager/UserManager';
import RoleManager from '../components/manager/RoleManager';
import SqlViewer from '../components/manager/SqlViewer';
import AccessDeniedView from './AccessDeniedView';

const DEMO_DATA = [
  { name: "Ultra-Slim 4K Monitor", price: 349.99, category: "Electronics", description: "27-inch display with HDR support.", image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80", stock: 12 },
  { name: "Vintage Leather Satchel", price: 129.50, category: "Fashion", description: "Handcrafted genuine leather bag.", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80", stock: 5 },
  { name: "Smart Home Hub", price: 89.99, category: "Electronics", description: "Control your home with voice.", image_url: "https://images.unsplash.com/photo-1558002038-109177381793?auto=format&fit=crop&w=400&q=80", stock: 25 },
  { name: "Abstract Canvas Print", price: 59.00, category: "Art", description: "Modern art piece, 24x36 inches.", image_url: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=400&q=80", stock: 8 },
  { name: "Ergonomic Mesh Chair", price: 249.00, category: "Office", description: "High-back chair with lumbar support.", image_url: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=400&q=80", stock: 3 },
];

export const TABS: { id: ManagerTab, label: string, icon: string, adminOnly: boolean }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: 'fa-home', adminOnly: false },
    { id: 'ORDERS', label: 'Orders', icon: 'fa-shopping-bag', adminOnly: false }, // NEW
    { id: 'PRODUCTS', label: 'Products', icon: 'fa-box', adminOnly: false },
    { id: 'EBOOKS', label: 'E-Books', icon: 'fa-book', adminOnly: false },
    { id: 'CATEGORIES', label: 'Categories', icon: 'fa-tags', adminOnly: false },
    { id: 'INVENTORY', label: 'Inventory', icon: 'fa-warehouse', adminOnly: false },
    { id: 'MEDIA', label: 'Media', icon: 'fa-images', adminOnly: false },
    { id: 'FORECAST', label: 'AI Forecast', icon: 'fa-chart-line', adminOnly: false },
    { id: 'USERS', label: 'Users', icon: 'fa-users', adminOnly: true },
    { id: 'ROLES', label: 'Roles', icon: 'fa-shield-alt', adminOnly: true },
    { id: 'DATABASE', label: 'SQL Setup', icon: 'fa-database', adminOnly: true },
];

interface ManagerViewProps {
    setView: (view: ViewState) => void;
}

const ManagerView: React.FC<ManagerViewProps> = ({ setView }) => {
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
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { user, signOut, isAdmin } = useAuth();
  
    const uniqueCategories = useMemo(() => {
        const cats = new Set(products.map(p => p.category || 'Uncategorized'));
        categories.forEach(c => cats.add(c.name));
        return ['All', ...Array.from(cats).sort()];
    }, [products, categories]);

    const handleCategorySelect = (category: string) => {
        setProductCategoryFilter(category);
        setActiveTab('PRODUCTS');
    };
    
    const tabComponents: Record<ManagerTab, React.ReactNode> = {
        DASHBOARD: <Dashboard products={products} setView={setActiveTab} />,
        ORDERS: <OrderManager />, // NEW
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
        EBOOKS: <EBookManager />,
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

    const currentTabInfo = TABS.find(t => t.id === activeTab) || TABS[0];

    return (
        <div className="bg-slate-100 dark:bg-slate-950 min-h-screen">
            <div className="relative lg:flex">
                <ManagerSidebar 
                    tabs={TABS}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    user={user as UserProfile}
                    signOut={signOut}
                    isAdmin={isAdmin}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                    setView={setView}
                />
                <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                    <div className="py-8 px-4 sm:px-6 lg:px-8">
                        <ManagerHeader 
                            title={currentTabInfo.label}
                            onSeedData={() => handleSeedData(DEMO_DATA)}
                            seeding={seeding}
                        />

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl shadow-sm animate-fade-in">
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
                        
                        <div>
                            {tabComponents[activeTab]}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ManagerView;