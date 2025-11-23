
import React, { useState, useEffect, useMemo } from 'react';
import { getAllOrders, deleteOrder } from '../../services/orderService';
import { Order, ModalType } from '../../types';
import { useModal } from '../../contexts/ModalContext';
import OrderTable from './orders/OrderTable';
import OrderDetailModal from './orders/OrderDetailModal';
import StatsCard from '../common/StatsCard';

const OrderManager: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getAllOrders();
            setOrders(data);
            setError(null);
        } catch (e: any) {
            setError(e.message);
            if (e.message.includes('tracking_number')) {
                openModal(ModalType.CONFIRM, {
                    title: "Database Update Required",
                    message: "The orders table needs new columns for the management system. Please run Script #14 in SQL Setup.",
                    isDestructive: true
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    const handleDeleteOrder = async (id: number) => {
        try {
            await deleteOrder(id);
            setOrders(prev => prev.filter(o => o.id !== id));
        } catch (e: any) {
            alert("Failed to delete: " + e.message);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchSearch = 
                o.id.toString().includes(search) || 
                o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                o.customer_email.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === 'all' || o.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [orders, search, statusFilter]);

    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total_amount), 0)
    }), [orders]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Orders" value={stats.total} icon="fa-shopping-bag" colorClass="text-blue-500" bgClass="bg-blue-50" />
                <StatsCard title="Pending" value={stats.pending} icon="fa-clock" colorClass="text-yellow-500" bgClass="bg-yellow-50" />
                <StatsCard title="Processing" value={stats.processing} icon="fa-cog fa-spin" colorClass="text-purple-500" bgClass="bg-purple-50" />
                <StatsCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon="fa-dollar-sign" colorClass="text-green-500" bgClass="bg-green-50" />
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 w-full">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search order ID, customer, email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white cursor-pointer capitalize"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button onClick={fetchOrders} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-primary transition-colors" title="Refresh">
                        <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 text-sm">
                    <p className="font-bold">Error loading orders:</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Table */}
            <OrderTable 
                orders={filteredOrders} 
                onView={(order) => {
                    setViewingOrder(order);
                    openModal(ModalType.ORDER_DETAIL, { order, onUpdate: fetchOrders }); 
                }}
                onDelete={handleDeleteOrder}
            />
        </div>
    );
};

export default OrderManager;
