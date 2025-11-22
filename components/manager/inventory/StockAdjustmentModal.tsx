import React, { useState } from 'react';
import { Product } from '../../../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirm: (product: Product, amount: number, type: 'add' | 'remove', reason: string, note: string) => Promise<boolean>;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, product, onConfirm }) => {
  const [type, setType] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('restock');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof amount !== 'number' || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setIsLoading(true);
    const success = await onConfirm(product, amount, type, reason, note);
    setIsLoading(false);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Adjust Stock for:</h3>
          <p className="text-primary font-medium">{product.name}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
              <button type="button" onClick={() => setType('add')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${type === 'add' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}>Add Stock</button>
              <button type="button" onClick={() => setType('remove')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${type === 'remove' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}>Remove Stock</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Quantity</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : parseInt(e.target.value))}
                  min="1"
                  required
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Reason</label>
                <select value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none bg-white dark:bg-slate-900 dark:text-white">
                  {type === 'add' ? (
                    <>
                      <option value="restock">Restock</option>
                      <option value="return">Customer Return</option>
                    </>
                  ) : (
                    <>
                      <option value="sale">Manual Sale</option>
                      <option value="damage">Damaged</option>
                    </>
                  )}
                  <option value="adjustment">Count Adjustment</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g., Found during cycle count"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white"
              />
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-center">
              <span className="text-slate-500 text-sm">Current Stock: </span>
              <span className="font-bold text-lg text-slate-800 dark:text-white">{product.stock || 0}</span>
              {typeof amount === 'number' && amount > 0 && (
                <>
                  <i className="fas fa-arrow-right text-slate-400 mx-2"></i>
                  <span className="font-bold text-lg text-primary">{Math.max(0, (product.stock || 0) + (type === 'add' ? amount : -amount))}</span>
                </>
              )}
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg font-bold text-sm text-white bg-primary hover:bg-indigo-600 shadow-lg disabled:opacity-50">
              {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Confirm Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
