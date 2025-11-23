
import React from 'react';
import { Order, DeletedOrder } from '../../../types';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderTableProps {
    orders: Order[];
    archivedOrders: DeletedOrder[];
    isArchivedView: boolean;
    onView: (order: Order) => void;
    onDelete: (id: number) => void;
    onPermanentDelete: (id: number) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, archivedOrders, isArchivedView, onView, onDelete, onPermanentDelete }) => {
    
    const displayData = isArchivedView ? archivedOrders : orders;

    if (displayData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <i className="fas fa-clipboard-list text-4xl mb-3"></i>
                <p>No {isArchivedView ? 'archived' : 'active'} orders found.</p>
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
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{isArchivedView ? 'Deleted At' : 'Date'}</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {displayData.map((item) => {
                            // Determine if item is Order or DeletedOrder for type safety
                            const isOrder = !isArchivedView;
                            // Safe type casting based on view mode
                            const activeItem = isOrder ? (item as Order) : null;
                            const archivedItem = !isOrder ? (item as DeletedOrder) : null;

                            const id = isOrder ? activeItem!.id : archivedItem!.id;
                            const displayId = isOrder ? activeItem!.id : archivedItem!.original_id;
                            const date = isOrder ? activeItem!.created_at : archivedItem!.deleted_at;
                            const customerName = isOrder ? activeItem!.customer_name : archivedItem!.customer_name;
                            const customerEmail = isOrder ? activeItem!.customer_email : archivedItem!.customer_email;
                            const total = isOrder ? activeItem!.total_amount : archivedItem!.total_amount;
                            
                            return (
                                <tr 
                                    key={id} 
                                    onClick={isOrder ? () => onView(activeItem!) : undefined}
                                    className={`transition-colors group ${isOrder ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}
                                >
                                    <td className="px-6 py-4">
                                        <span className={`font-mono text-sm font-bold ${isArchivedView ? 'text-red-400 decoration-line-through' : 'text-primary'}`}>#{displayId}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{new Date(date).toLocaleDateString()}</span>
                                        <p className="text-xs text-slate-400">{new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{customerName}</span>
                                            <span className="text-xs text-slate-500">{customerEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isOrder ? (
                                            <OrderStatusBadge status={activeItem!.status} />
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 border border-red-200">Deleted</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">${Number(total).toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {isOrder && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onView(activeItem!); }} 
                                                    className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-primary hover:text-white transition-colors" 
                                                    title="View Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                            )}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isOrder) onDelete(id);
                                                    else onPermanentDelete(id);
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    isOrder 
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40' 
                                                    : 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                                                }`} 
                                                title={isOrder ? "Move to Trash" : "Permanently Delete"}
                                            >
                                                <i className={`fas ${isOrder ? 'fa-trash' : 'fa-times-circle'}`}></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderTable;
