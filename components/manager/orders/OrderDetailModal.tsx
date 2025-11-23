
import React, { useState } from 'react';
import BaseModal from '../../modals/BaseModal';
import { Order } from '../../../types';
import { useModal } from '../../../contexts/ModalContext';
import OrderStatusBadge from './OrderStatusBadge';
import { updateOrder } from '../../../services/orderService';
import { useNotification } from '../../../contexts/NotificationContext';

const OrderDetailModal: React.FC = () => {
    const { isOpen, closeModal, modalProps } = useModal();
    const { order, onUpdate } = modalProps as { order: Order; onUpdate: () => void };
    const { addNotification } = useNotification();

    const [status, setStatus] = useState(order?.status || 'pending');
    const [trackingNumber, setTrackingNumber] = useState(order?.tracking_number || '');
    const [isLoading, setIsLoading] = useState(false);

    if (!order) return null;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Validation for shipped status
            if (status === 'shipped' && !trackingNumber.trim()) {
                alert("Please enter a tracking number for shipped orders.");
                setIsLoading(false);
                return;
            }

            await updateOrder(order.id, { 
                status, 
                tracking_number: trackingNumber 
            });
            
            addNotification('success', `Order #${order.id} updated successfully.`);
            onUpdate();
            closeModal();
        } catch (e: any) {
            addNotification('error', e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Status Workflow Steps
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = steps.indexOf(status);
    const isCancelled = status === 'cancelled' || status === 'returned';

    return (
        <BaseModal isOpen={isOpen} onClose={closeModal} size="xl" title={`Order #${order.id}`}>
            <div className="space-y-6">
                {/* Header / Status Bar */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Current Status</p>
                            <OrderStatusBadge status={status} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Order Date</p>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Customer</p>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{order.customer_name}</p>
                            <p className="text-xs text-slate-400">{order.customer_email}</p>
                        </div>
                    </div>

                    {/* Visual Timeline */}
                    {!isCancelled && (
                        <div className="relative flex items-center justify-between w-full mt-6 px-2">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-10"></div>
                            {steps.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center bg-white dark:bg-slate-800 px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                        idx <= currentStepIndex 
                                            ? 'bg-primary border-primary text-white' 
                                            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-300'
                                    }`}>
                                        {idx < currentStepIndex ? <i className="fas fa-check"></i> : <span>{idx + 1}</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold mt-1 uppercase ${idx <= currentStepIndex ? 'text-primary' : 'text-slate-400'}`}>{step}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items Column */}
                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Order Items</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-y-auto max-h-[300px] custom-scrollbar">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                        <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{item.product_name}</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Amount</span>
                                <span className="text-xl font-bold text-primary">${Number(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>

                        {order.ai_note && (
                            <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex gap-3">
                                <div className="shrink-0 pt-1"><i className="fas fa-robot text-indigo-500"></i></div>
                                <div>
                                    <p className="text-xs font-bold text-indigo-600 uppercase mb-1">AI Assistant Note</p>
                                    <p className="text-sm text-indigo-900 dark:text-indigo-200 italic">"{order.ai_note}"</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Workflow Actions</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Update Status</label>
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value as any)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="returned">Returned</option>
                                    </select>
                                </div>

                                {(status === 'shipped' || status === 'delivered') && (
                                    <div className="animate-fade-in">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tracking Number</label>
                                        <div className="relative">
                                            <i className="fas fa-truck absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs"></i>
                                            <input 
                                                type="text" 
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                placeholder="e.g., 1Z999AA101..."
                                                className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-indigo-600 text-white py-2 rounded-lg font-bold shadow-md transition-all flex items-center justify-center disabled:opacity-70"
                                >
                                    {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Update Order'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Quick Actions</h3>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1">
                                    <i className="fas fa-print"></i> Invoice
                                </button>
                                <button className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1">
                                    <i className="fas fa-envelope"></i> Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default OrderDetailModal;
