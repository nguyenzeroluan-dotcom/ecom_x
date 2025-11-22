

import React, { useMemo, useState } from 'react';
import { Product, ManagerTab } from '../../types';
import StatsCard from '../common/StatsCard';
import { generateBusinessSnapshot } from '../../services/geminiService';

// --- AI Snapshot Component ---
const AISnapshot: React.FC<{ products: Product[] }> = ({ products }) => {
    const [snapshot, setSnapshot] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await generateBusinessSnapshot(products);
            setSnapshot(result);
        } catch (e) {
            console.error(e);
            setSnapshot("Error generating analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center">
                <i className="fas fa-robot text-primary mr-2"></i> AI Business Snapshot
            </h3>
            <p className="text-sm text-slate-500 mb-4 flex-shrink-0">Get a strategic overview of your current inventory.</p>
            
            <div className="flex-grow bg-white dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 min-h-[150px] prose prose-sm dark:prose-invert max-w-none">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <i className="fas fa-spinner fa-spin text-2xl"></i>
                    </div>
                ) : snapshot ? (
                     <div className="whitespace-pre-wrap">{snapshot}</div>
                ) : (
                    <div className="flex items-center justify-center h-full text-center text-slate-400">
                        <p>Click below to generate an AI analysis.</p>
                    </div>
                )}
            </div>
            
            <button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-all shadow-md disabled:opacity-60"
            >
                {isLoading ? 'Analyzing...' : 'Generate Analysis'}
            </button>
        </div>
    );
};

// --- Pie Chart Component ---
const PieChart: React.FC<{ data: { name: string, value: number }[] }> = ({ data }) => {
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#3B82F6', '#8B5CF6'];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-400"><p>No category data.</p></div>;
    }

    const slices = data.map((item, index) => {
        const percentage = (item.value / total);
        const startAngle = (cumulative / total) * 360;
        cumulative += item.value;
        const endAngle = (cumulative / total) * 360;
        const largeArcFlag = percentage > 0.5 ? 1 : 0;
        
        const x1 = 50 + 40 * Math.cos(Math.PI * (startAngle - 90) / 180);
        const y1 = 50 + 40 * Math.sin(Math.PI * (startAngle - 90) / 180);
        const x2 = 50 + 40 * Math.cos(Math.PI * (endAngle - 90) / 180);
        const y2 = 50 + 40 * Math.sin(Math.PI * (endAngle - 90) / 180);

        return (
            <path
                key={item.name}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={colors[index % colors.length]}
            >
                <title>{`${item.name}: ${item.value} (${(percentage * 100).toFixed(1)}%)`}</title>
            </path>
        );
    });

    return (
        <div className="flex flex-col md:flex-row items-center gap-6 h-full">
            <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">{slices}</svg>
            <div className="flex-1 space-y-2">
                {data.slice(0, 5).map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }}></div>
                            <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


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

    const categoryData = useMemo(() => {
        const counts: { [key: string]: number } = {};
        products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
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
                <div className="lg:col-span-1">
                    <AISnapshot products={products} />
                </div>
                <div className="lg:col-span-2">
                     <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Category Distribution</h3>
                        <PieChart data={categoryData} />
                     </div>
                </div>
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