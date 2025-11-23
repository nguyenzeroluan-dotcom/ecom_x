
import React from 'react';

interface OrderStatusBadgeProps {
    status: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
    let styles = '';
    let icon = '';

    switch (status.toLowerCase()) {
        case 'pending':
            styles = 'bg-yellow-100 text-yellow-700 border-yellow-200';
            icon = 'fa-clock';
            break;
        case 'processing':
            styles = 'bg-blue-100 text-blue-700 border-blue-200';
            icon = 'fa-cog fa-spin';
            break;
        case 'shipped':
            styles = 'bg-purple-100 text-purple-700 border-purple-200';
            icon = 'fa-shipping-fast';
            break;
        case 'delivered':
            styles = 'bg-green-100 text-green-700 border-green-200';
            icon = 'fa-check-circle';
            break;
        case 'cancelled':
            styles = 'bg-red-100 text-red-700 border-red-200';
            icon = 'fa-ban';
            break;
        case 'returned':
            styles = 'bg-orange-100 text-orange-700 border-orange-200';
            icon = 'fa-undo';
            break;
        default:
            styles = 'bg-slate-100 text-slate-700 border-slate-200';
            icon = 'fa-question';
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles}`}>
            <i className={`fas ${icon} text-[9px]`}></i>
            {status}
        </span>
    );
};

export default OrderStatusBadge;
