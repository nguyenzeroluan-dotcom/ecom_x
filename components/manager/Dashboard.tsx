
import React, { useMemo } from 'react';
import { Product, ManagerTab } from '../../types';
import DashboardView from './dashboard/DashboardView';

interface DashboardProps {
    products: Product[];
    setView: (view: ManagerTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, setView }) => {
    
    // Logic: Calculate Inventory Statistics
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

    // Logic: Process Category Data for Charts
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
        <DashboardView 
            stats={stats} 
            categoryData={categoryData} 
            products={products} 
            setView={setView} 
        />
    );
};

export default Dashboard;
