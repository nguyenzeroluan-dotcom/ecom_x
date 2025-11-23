
import React, { useState } from 'react';
import { Product } from '../../../types';
import { InvViewMode } from '../InventoryManager';
import DataViewContainer from '../../common/view-modes/DataViewContainer';
import { ColumnDef } from '../../common/view-modes/types';

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

  // --- 1. Table Columns ---
  const tableColumns: ColumnDef<Product>[] = [
    {
        header: 'Product',
        render: (p) => (
            <div className="flex items-center gap-3">
                <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                <span className="font-medium text-slate-900 dark:text-white">{p.name}</span>
            </div>
        )
    },
    {
        header: 'SKU',
        render: (p) => editingSku === p.id ? (
            <input
              type="text"
              value={skuValue}
              onChange={e => setSkuValue(e.target.value)}
              onBlur={() => saveSku(p.id)}
              onKeyDown={e => e.key === 'Enter' && saveSku(p.id)}
              autoFocus
              className="w-32 bg-white dark:bg-slate-900 border border-primary ring-2 ring-primary/20 rounded px-2 py-1 text-sm"
            />
        ) : (
            <div onClick={() => startEditSku(p)} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded text-sm font-mono text-slate-500 flex items-center gap-2 group">
                {p.sku || <span className="text-slate-400 italic text-xs">Add SKU</span>}
                <i className="fas fa-pencil-alt text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
        )
    },
    {
        header: 'Category',
        render: (p) => <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">{p.category}</span>
    },
    {
        header: 'Stock',
        render: (p) => <span className={`text-lg font-bold ${(p.stock || 0) < 10 ? 'text-orange-500' : 'text-slate-800 dark:text-white'}`}>{p.stock || 0}</span>
    },
    {
        header: 'Actions',
        className: 'text-center',
        render: (p) => (
            <button onClick={() => openStockModal(p)} className="text-primary font-bold text-sm hover:bg-primary/10 px-3 py-1.5 rounded transition-colors">
                Adjust Stock
            </button>
        )
    }
  ];

  // --- 2. Grid Renderer ---
  const renderGridItem = (p: Product) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full">
        <div className="aspect-square relative bg-slate-50 dark:bg-slate-900">
            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-slate-900 dark:text-white truncate">{p.name}</h3>
            <div className="text-xs text-slate-500 font-mono mt-1 mb-3 flex justify-between">
                <span>SKU: {p.sku || 'N/A'}</span>
            </div>
            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${ (p.stock||0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }`}>
                    {(p.stock||0)} in stock
                </span>
                <button onClick={() => openStockModal(p)} className="text-primary font-bold text-sm hover:underline">Adjust</button>
            </div>
        </div>
    </div>
  );

  // --- 3. List Renderer ---
  const renderListItem = (p: Product) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
        <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-slate-100" />
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
            <p className="text-xs text-slate-500 font-mono">SKU: {p.sku || 'N/A'}</p>
        </div>
        <div className="w-24 text-center">
            <span className="text-lg font-bold text-primary">{p.stock || 0}</span>
            <p className="text-xs text-slate-400">In Stock</p>
        </div>
        <button onClick={() => openStockModal(p)} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-sm">
            Adjust
        </button>
    </div>
  );

  return (
    <DataViewContainer 
        data={products}
        mode={viewMode}
        emptyMessage="No inventory items found."
        gridView={{ renderItem: renderGridItem }}
        listView={{ renderItem: renderListItem }}
        tableView={{ columns: tableColumns }}
    />
  );
};

export default InventoryOverview;
