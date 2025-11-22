
import React, { useMemo } from 'react';
import { Product, ManagerTab } from '../../types';
import StatsCard from '../common/StatsCard';

interface DashboardProps {
    products: Product[];
    setView: (view: ManagerTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, setView }) => {
    
    const stats = useMemo(() => {
        const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * (p.stock || 0)), 0);
        const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10);
        return {
            totalProducts: products.length,
            totalValue: totalValue,
            lowStockCount: lowStock.length,
            outOfStockCount: products.filter(p => (p.stock || 0) === 0).length,
            lowStockItems: lowStock.slice(0, 5)
        };
    }, [products]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Products" value={stats.totalProducts} icon="fa-box" colorClass="text-blue-500" bgClass="bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300" />
                <StatsCard title="Inventory Value" value={`$${stats.totalValue.toLocaleString()}`} icon="fa-dollar-sign" colorClass="text-green-500" bgClass="bg-green-50 dark:bg-green-900/20 dark:text-green-300" />
                <StatsCard title="Low Stock Items" value={stats.lowStockCount} icon="fa-exclamation-triangle" colorClass="text-orange-500" bgClass="bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300" />
                <StatsCard title="Out of Stock" value={stats.outOfStockCount} icon="fa-times-circle" colorClass="text-red-500" bgClass="bg-red-50 dark:bg-red-900/20 dark:text-red-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                             <button onClick={() => setView('PRODUCTS')} className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <i className="fas fa-plus-circle text-primary"></i>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Add New Product</span>
                            </button>
                             <button onClick={() => setView('INVENTORY')} className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <i className="fas fa-warehouse text-secondary"></i>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Manage Inventory</span>
                            </button>
                             <button onClick={() => setView('USERS')} className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <i className="fas fa-users text-purple-500"></i>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">View Users</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="lg:col-span-2">
                     <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                           <h3 className="text-lg font-bold text-slate-800 dark:text-white">Low Stock Alerts</h3>
                           <p className="text-sm text-slate-500">These items need attention soon.</p>
                        </div>
                        {stats.lowStockItems.length > 0 ? (
                             <div className="p-4 space-y-3">
                                {stats.lowStockItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-lg text-orange-500">{item.stock}</span>
                                            <p className="text-xs text-slate-400">units left</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        ) : (
                            <div className="p-12 text-center text-slate-400">
                                <i className="fas fa-check-circle text-3xl text-green-500 mb-2"></i>
                                <p>Inventory levels are healthy!</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
