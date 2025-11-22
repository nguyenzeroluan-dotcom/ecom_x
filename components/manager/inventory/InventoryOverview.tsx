import React, { useState } from 'react';
import { Product } from '../../../types';
import { InvViewMode } from '../InventoryManager';

interface InventoryOverviewProps {
  products: Product[];
  viewMode: InvViewMode;
  handleSkuUpdate: (id: string | number, newSku: string) => Promise<boolean>;
  openStockModal: (product: Product) => void;
}

const InventoryOverview: React.FC<InventoryOverviewProps> = ({ products, viewMode, handleSkuUpdate, openStockModal }) => {
  const [editingSku, setEditingSku] = useState<string | number | null>(null);
  const [skuValue, setSkuValue] = useState('');

  const startEditSku = (product: Product) => {
    setEditingSku(product.id);
    setSkuValue(product.sku || '');
  };

  const saveSku = async (id: string | number) => {
    const success = await handleSkuUpdate(id, skuValue);
    if (success) {
      setEditingSku(null);
    }
  };

  const renderContent = () => {
    if (products.length === 0) {
      return (
        <div className="text-center py-20 text-slate-400">
          <i className="fas fa-box-open text-4xl mb-3"></i>
          <p>No products match your search.</p>
        </div>
      );
    }

    // Grid View
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
              <div className="aspect-square relative group bg-slate-50 dark:bg-slate-900">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{p.name}</h3>
                <div className="text-xs text-slate-500 font-mono mt-1 mb-3">SKU: {p.sku || 'N/A'}</div>
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${ (p.stock||0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }`}>
                    {(p.stock||0)} in stock
                  </span>
                  <button onClick={() => openStockModal(p)} className="text-primary font-bold text-sm hover:underline">Adjust</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // List View
    if (viewMode === 'list') {
      return (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-slate-100" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
                <p className="text-xs text-slate-500 font-mono">SKU: {p.sku || 'N/A'}</p>
              </div>
              <div className="w-24 text-center">
                <span className="text-lg font-bold text-primary">{p.stock || 0}</span>
                <p className="text-xs text-slate-400">In Stock</p>
              </div>
              <button onClick={() => openStockModal(p)} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-sm">Adjust Stock</button>
            </div>
          ))}
        </div>
      );
    }
    
    // Table View (Default)
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                  <span className="font-medium text-slate-900 dark:text-white">{p.name}</span>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-500">
                  {editingSku === p.id ? (
                    <input
                      type="text"
                      value={skuValue}
                      onChange={e => setSkuValue(e.target.value)}
                      onBlur={() => saveSku(p.id)}
                      onKeyDown={e => e.key === 'Enter' && saveSku(p.id)}
                      autoFocus
                      className="w-32 bg-white dark:bg-slate-900 border border-primary ring-2 ring-primary/20 rounded px-2 py-1"
                    />
                  ) : (
                    <span onClick={() => startEditSku(p)} className="cursor-pointer hover:bg-slate-100 p-1 rounded">
                      {p.sku || <span className="text-slate-400">Click to add</span>}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4"><span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">{p.category}</span></td>
                <td className="px-6 py-4 text-lg font-bold text-slate-800 dark:text-white">{p.stock || 0}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => openStockModal(p)} className="text-primary font-bold text-sm hover:underline">Adjust Stock</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default InventoryOverview;
