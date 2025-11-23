
import React, { useState } from 'react';
import { Product } from '../../types';
import DataViewContainer from '../common/view-modes/DataViewContainer';
import { ColumnDef } from '../common/view-modes/types';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  viewMode: 'table' | 'grid' | 'list';
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  onDelete: (id: number | string) => void;
  onBulkDelete: (ids: (string | number)[]) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, loading, viewMode, onEdit, onView, onDelete, onBulkDelete }) => {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);

  const toggleSelect = (id: string | number) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
      setSelectedIds(selectedIds.length === products.length ? [] : products.map(p => p.id));
  };

  // --- Bulk Action Bar ---
  const BulkActionBar = () => (
      selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-sm animate-slide-up-toast sticky top-0 z-20 shadow-md rounded-t-xl mb-[-10px]">
              <span className="font-bold">{selectedIds.length} selected</span>
              <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedIds([])} className="text-slate-300 hover:text-white transition-colors text-xs">Clear</button>
                  <div className="relative">
                      <button onClick={() => setIsBulkMenuOpen(prev => !prev)} className="bg-primary px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-2">
                         Bulk Actions <i className="fas fa-chevron-down text-xs"></i>
                      </button>
                      {isBulkMenuOpen && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-10">
                               <button onClick={() => { onBulkDelete(selectedIds); setIsBulkMenuOpen(false); setSelectedIds([]); }} className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">Delete Selected</button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )
  );

  // --- 1. Table Configuration ---
  const tableColumns: ColumnDef<Product>[] = [
    {
      header: '',
      className: 'w-10',
      render: (p) => (
        <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(p.id); }} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
      )
    },
    {
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 relative">
              <img className="h-full w-full object-cover" src={p.image_url} alt="" />
           </div>
           <div className="font-medium text-sm text-slate-900 dark:text-white hover:text-primary cursor-pointer" onClick={() => onView(p)}>{p.name}</div>
        </div>
      )
    },
    { header: 'SKU', accessorKey: 'sku', className: 'text-xs font-mono text-slate-500' },
    { 
      header: 'Category', 
      render: (p) => <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{p.category}</span>
    },
    { 
      header: 'Stock', 
      render: (p) => {
        const stock = p.stock || 0;
        if(stock === 0) return <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>;
        if(stock < 5) return <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">Low ({stock})</span>;
        return <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{stock}</span>;
      }
    },
    { header: 'Price', render: (p) => <span className="font-bold text-slate-700 dark:text-slate-200">${Number(p.price).toFixed(2)}</span> },
    {
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-2">
           <button onClick={(e) => {e.stopPropagation(); onView(p)}} className="p-1.5 text-slate-400 hover:text-primary"><i className="fas fa-eye"></i></button>
           <button onClick={(e) => {e.stopPropagation(); onEdit(p)}} className="p-1.5 text-slate-400 hover:text-blue-500"><i className="fas fa-edit"></i></button>
           <button onClick={(e) => {e.stopPropagation(); onDelete(p.id)}} className="p-1.5 text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
        </div>
      )
    }
  ];

  // --- 2. Grid Card Renderer ---
  const renderGridItem = (product: Product) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden flex flex-col h-full transition-all ${selectedIds.includes(product.id) ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-700'}`}>
      <div className="aspect-square relative group cursor-pointer" onClick={() => onView(product)}>
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 z-10" onClick={e => e.stopPropagation()}>
              <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">View</button>
          </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-900 dark:text-white truncate flex-1 mr-2" onClick={() => onView(product)}>{product.name}</h3>
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">{product.category}</span>
          </div>
          <div className="mt-auto flex justify-between items-center">
             <span className="font-bold text-primary">${Number(product.price).toFixed(2)}</span>
             <div className="flex gap-1">
                <button onClick={(e) => {e.stopPropagation(); onEdit(product)}} className="p-2 text-slate-400 hover:text-blue-500"><i className="fas fa-edit"></i></button>
                <button onClick={(e) => {e.stopPropagation(); onDelete(product.id)}} className="p-2 text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
             </div>
          </div>
      </div>
    </div>
  );

  // --- 3. List Item Renderer ---
  const renderListItem = (product: Product) => (
    <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border flex items-center gap-4 ${selectedIds.includes(product.id) ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-700'}`}>
        <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => onView(product)}>
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(product)}>
            <h4 className="font-bold text-slate-900 dark:text-white truncate hover:text-primary">{product.name}</h4>
            <p className="text-xs text-slate-500 font-mono">SKU: {product.sku || 'N/A'}</p>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[80px]">
            <span className="font-bold text-slate-900 dark:text-white">${Number(product.price).toFixed(2)}</span>
            <span className="text-xs text-slate-500">{product.stock} units</span>
        </div>
        <div className="flex gap-2 border-l border-slate-100 dark:border-slate-700 pl-4">
            <button onClick={() => onView(product)} className="text-slate-400 hover:text-primary"><i className="fas fa-eye"></i></button>
            <button onClick={() => onEdit(product)} className="text-slate-400 hover:text-blue-500"><i className="fas fa-edit"></i></button>
            <button onClick={() => onDelete(product.id)} className="text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
        </div>
    </div>
  );

  return (
      <div className="relative">
        <BulkActionBar />
        <DataViewContainer 
          data={products}
          isLoading={loading}
          mode={viewMode}
          emptyMessage="No products found matching your criteria."
          onItemClick={(item) => onView(item)} // General click handler
          gridView={{
            renderItem: renderGridItem,
            gridClassName: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
          }}
          listView={{
            renderItem: renderListItem
          }}
          tableView={{
            columns: tableColumns
          }}
        />
      </div>
  );
};

export default ProductTable;
