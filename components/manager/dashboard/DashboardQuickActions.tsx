
import React from 'react';
import { ManagerTab } from '../../../types';

interface DashboardQuickActionsProps {
    setView: (view: ManagerTab) => void;
}

const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ setView }) => {
    return (
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
    );
};

export default DashboardQuickActions;
