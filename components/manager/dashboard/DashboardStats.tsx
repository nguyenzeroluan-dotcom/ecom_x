
import React from 'react';
import StatsCard from '../../common/StatsCard';

interface DashboardStatsProps {
    stats: {
        totalProducts: number;
        totalValue: number;
        lowStockCount: number;
        outOfStockCount: number;
    };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
                title="Total Products" 
                value={stats.totalProducts} 
                icon="fa-box" 
                colorClass="text-blue-500" 
                bgClass="bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300" 
            />
            <StatsCard 
                title="Inventory Value" 
                value={`$${stats.totalValue.toLocaleString()}`} 
                icon="fa-dollar-sign" 
                colorClass="text-green-500" 
                bgClass="bg-green-50 dark:bg-green-900/20 dark:text-green-300" 
            />
            <StatsCard 
                title="Low Stock Items" 
                value={stats.lowStockCount} 
                icon="fa-exclamation-triangle" 
                colorClass="text-orange-500" 
                bgClass="bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300" 
            />
            <StatsCard 
                title="Out of Stock" 
                value={stats.outOfStockCount} 
                icon="fa-times-circle" 
                colorClass="text-red-500" 
                bgClass="bg-red-50 dark:bg-red-900/20 dark:text-red-300" 
            />
        </div>
    );
};

export default DashboardStats;
