
import React from 'react';
import { Product } from '../../../types';

interface DashboardLowStockProps {
    lowStockItems: Product[];
}

const DashboardLowStock: React.FC<DashboardLowStockProps> = ({ lowStockItems }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Low Stock Alerts</h3>
                <p className="text-sm text-slate-500">These items need attention soon.</p>
            </div>
            {lowStockItems.length > 0 ? (
                <div className="p-4 space-y-3">
                    {lowStockItems.map(item => (
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
    );
};

export default DashboardLowStock;
