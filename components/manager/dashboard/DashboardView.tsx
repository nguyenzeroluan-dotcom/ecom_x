
import React from 'react';
import { Product, ManagerTab } from '../../../types';
import DashboardStats from './DashboardStats';
import AISnapshotCard from './AISnapshotCard';
import CategoryChart from './CategoryChart';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardLowStock from './DashboardLowStock';

interface DashboardViewProps {
    stats: {
        totalProducts: number;
        totalValue: number;
        lowStockCount: number;
        outOfStockCount: number;
        lowStockItems: Product[];
    };
    categoryData: { name: string; value: number }[];
    products: Product[];
    setView: (view: ManagerTab) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats, categoryData, products, setView }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Row: Stats */}
            <DashboardStats stats={stats} />

            {/* Middle Row: AI & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <AISnapshotCard products={products} />
                </div>
                <div className="lg:col-span-2">
                    <CategoryChart data={categoryData} />
                </div>
            </div>

            {/* Bottom Row: Actions & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <DashboardQuickActions setView={setView} />
                </div>
                <div className="lg:col-span-2">
                    <DashboardLowStock lowStockItems={stats.lowStockItems} />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
