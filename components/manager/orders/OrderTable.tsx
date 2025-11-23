
import React, { useState } from 'react';
import { Order } from '../../../types';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderTableProps {
    orders: Order[];
    onView: (order: Order) => void;
    onDelete: (orderId: number) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onView, onDelete }) => {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDeleteClick = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to archive this order?")) {
            setDeletingId(id);
            await onDelete(id);
            setDeletingId(null);
        }
    };

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <i className="fas fa-clipboard-list text-4xl mb-3"></i>
                <p>No orders found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {orders.map((order) => (
                            <tr 
                                key={order.id} 
                                onClick={() => onView(order)}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4">
                                    <span className="font-mono text-sm font-bold text-primary">#{order.id}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 dark:text-slate-300">{new Date(order.created_at).toLocaleDateString()}</span>
                                    <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">{order.customer_name}</span>
                                        <span className="text-xs text-slate-500">{order.customer_email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <OrderStatusBadge status={order.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">${Number(order.total_amount).toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onView(order)} 
                                            className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-primary hover:text-white transition-colors" 
                                            title="View Details"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteClick(e, order.id)} 
                                            disabled={deletingId === order.id}
                                            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" 
                                            title="Archive Order"
                                        >
                                            {deletingId === order.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderTable;
