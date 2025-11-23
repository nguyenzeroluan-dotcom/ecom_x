
import React, { useState, useEffect, useMemo } from 'react';
import { getAllOrders, archiveOrder, getArchivedOrders, permanentlyDeleteOrder } from '../../services/orderService';
import { Order, DeletedOrder, ModalType } from '../../types';
import { useModal } from '../../contexts/ModalContext';
import OrderTable from './orders/OrderTable';
import OrderDetailModal from './orders/OrderDetailModal';
import StatsCard from '../common/StatsCard';
import { useNotification } from '../../contexts/NotificationContext';

const OrderManager: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [archivedOrders, setArchivedOrders] = useState<DeletedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
    const { openModal } = useModal();
    const { addNotification } = useNotification();

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (viewMode === 'active') {
                const data = await getAllOrders();
                setOrders(data);
            } else {
                const data = await getArchivedOrders();
                setArchivedOrders(data);
            }
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
        fetchData();
    }, [viewMode]);

    const promptArchiveOrder = (id: number) => {
        openModal(ModalType.CONFIRM, {
            title: "Archive Order",
            message: "Are you sure you want to move this order to the Trash? You can restore or permanently delete it later.",
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await archiveOrder(id);
                    setOrders(prev => prev.filter(o => o.id !== id));
                    addNotification('success', 'Order archived successfully.');
                } catch (e: any) {
                    console.error("Archive failed", e);
                    if (e.message?.includes('relation "public.deleted_orders" does not exist') || e.message?.includes('42P01')) {
                        openModal(ModalType.CONFIRM, {
                            title: "Archiving Not Setup",
                            message: "The 'deleted_orders' table is missing. Please go to 'SQL Setup' and run Script #17.",
                            isDestructive: true
                        });
                    } else if (e.message?.includes('violates foreign key constraint') || e.message?.includes('deleted_orders_deleted_by_fkey')) {
                        openModal(ModalType.CONFIRM, {
                            title: "Database Constraint Error",
                            message: "The archiving table has a restrictive constraint that blocks the Demo Admin. Please go to 'SQL Setup' and re-run Script #17 to fix it.",
                            isDestructive: true
                        });
                    } else {
                        addNotification('error', 'Failed to archive order: ' + e.message);
                    }
                }
            }
        });
    };

    const promptPermanentDelete = (id: number) => {
        openModal(ModalType.CONFIRM, {
            title: "Permanently Delete Order",
            message: "WARNING: This action cannot be undone. The order record will be wiped from the database.",
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await permanentlyDeleteOrder(id);
                    setArchivedOrders(prev => prev.filter(o => o.id !== id));
                    addNotification('success', 'Order permanently deleted.');
                } catch (e: any) {
                    addNotification('error', 'Failed to delete: ' + e.message);
                }
            }
        });
    };

    const filteredOrders = useMemo(() => {
        if (viewMode === 'active') {
            return orders.filter(o => {
                const matchSearch = 
                    o.id.toString().includes(search) || 
                    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                    o.customer_email.toLowerCase().includes(search.toLowerCase());
                const matchStatus = statusFilter === 'all' || o.status === statusFilter;
                return matchSearch && matchStatus;
            });
        } else {
            // Archived filtering (simpler)
            return archivedOrders.filter(o => 
                o.original_id.toString().includes(search) || 
                o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                o.customer_email.toLowerCase().includes(search.toLowerCase())
            );
        }
    }, [orders, archivedOrders, search, statusFilter, viewMode]);

    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total_amount), 0)
    }), [orders]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Row (Only relevant for active orders) */}
            {viewMode === 'active' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard title="Total Orders" value={stats.total} icon="fa-shopping-bag" colorClass="text-blue-500" bgClass="bg-blue-50" />
                    <StatsCard title="Pending" value={stats.pending} icon="fa-clock" colorClass="text-yellow-500" bgClass="bg-yellow-50" />
                    <StatsCard title="Processing" value={stats.processing} icon="fa-cog fa-spin" colorClass="text-purple-500" bgClass="bg-purple-50" />
                    <StatsCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon="fa-dollar-sign" colorClass="text-green-500" bgClass="bg-green-50" />
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* View Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 shrink-0">
                    <button 
                        onClick={() => setViewMode('active')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'active' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
                    >
                        Active
                    </button>
                    <button 
                        onClick={() => setViewMode('archived')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'archived' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500' : 'text-slate-500'}`}
                    >
                        Trash ({archivedOrders.length})
                    </button>
                </div>

                <div className="relative flex-1 w-full">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        placeholder={viewMode === 'active' ? "Search active orders..." : "Search deleted orders..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    {viewMode === 'active' && (
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
                    )}
                    <button onClick={fetchData} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-primary transition-colors" title="Refresh">
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
                orders={viewMode === 'active' ? filteredOrders as Order[] : []} 
                archivedOrders={viewMode === 'archived' ? filteredOrders as DeletedOrder[] : []}
                isArchivedView={viewMode === 'archived'}
                onView={(order) => {
                    openModal(ModalType.ORDER_DETAIL, { order, onUpdate: fetchData }); 
                }}
                onDelete={promptArchiveOrder}
                onPermanentDelete={promptPermanentDelete}
            />
        </div>
    );
};

export default OrderManager;
