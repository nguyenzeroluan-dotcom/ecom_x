

import React, { useState } from 'react';
import { Product } from '../../types';
import { deleteProducts } from '../../services/supabaseClient';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  viewMode: 'table' | 'grid' | 'list';
  onEdit: (product: Product) => void;
  onDelete: (id: number | string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, loading, viewMode, onEdit, onDelete }) => {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const toggleSelectAll = () => {
      if (selectedIds.length === products.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(products.map(p => p.id));
      }
  };

  const toggleSelect = (id: string | number) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const handleBulkDelete = async () => {
      if (window.confirm(`Delete ${selectedIds.length} products?`)) {
          try {
              await deleteProducts(selectedIds);
              setSelectedIds([]);
              // In a real app, we'd call a refresh function passed via props here
              // But for simplicity, we'll rely on the parent to refresh via subscription or manual reload
              window.location.reload(); 
          } catch (e: any) {
              alert(e.message);
          }
      }
  };

  if (loading) {
     return <div className="flex justify-center p-12"><i className="fas fa-spinner fa-spin text-2xl text-primary"></i></div>;
  }

  if (products.length === 0) {
     return (
         <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <i className="fas fa-box-open text-4xl mb-2"></i>
            <p>No products found.</p>
         </div>
     );
  }

  // --- Bulk Action Bar ---
  const BulkActionBar = () => (
      selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-sm animate-slide-up-toast sticky top-0 z-20 shadow-md">
              <span className="font-bold">{selectedIds.length} selected</span>
              <div className="flex gap-4">
                  <button onClick={() => setSelectedIds([])} className="hover:underline">Cancel</button>
                  <button onClick={handleBulkDelete} className="text-red-400 hover:text-red-300 font-bold flex items-center gap-2">
                      <i className="fas fa-trash"></i> Delete Selected
                  </button>
              </div>
          </div>
      )
  );

  // --- GRID VIEW ---
  if (viewMode === 'grid') {
    return (
      <div className="relative">
          <BulkActionBar />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
            {products.map(product => (
            <div key={product.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden flex flex-col ${selectedIds.includes(product.id) ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-700'}`}>
                <div className="aspect-square relative group">
                    <img src={product.image_url || 'https://via.placeholder.com/100'} alt={product.name} className="w-full h-full object-cover" />
                    
                    {/* Checkbox Overlay */}
                    <div className={`absolute top-2 left-2 z-10 ${selectedIds.includes(product.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <input 
                            type="checkbox" 
                            checked={selectedIds.includes(product.id)} 
                            onChange={() => toggleSelect(product.id)}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                    </div>
                    
                    {(product.stock || 0) < 5 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">Low Stock</span>
                    )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white truncate w-32">{product.name}</h3>
                            <p className="text-xs text-slate-500 font-mono">{product.sku || '-'}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">{product.category}</span>
                    </div>
                    
                    <div className="mt-auto pt-4 flex justify-between items-center">
                    <span className="font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                    <div className="flex gap-2">
                        <button onClick={() => onEdit(product)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors"><i className="fas fa-edit"></i></button>
                        <button onClick={() => onDelete(product.id)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-red-50 hover:text-red-600 transition-colors"><i className="fas fa-trash"></i></button>
                    </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  if (viewMode === 'list') {
     return (
       <div className="relative">
           <BulkActionBar />
           <div className="space-y-3 p-4">
            {products.map(product => (
            <div key={product.id} className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border flex items-center gap-4 ${selectedIds.includes(product.id) ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-700'}`}>
                <input 
                    type="checkbox" 
                    checked={selectedIds.includes(product.id)} 
                    onChange={() => toggleSelect(product.id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{product.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mb-1">SKU: {product.sku || 'N/A'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-slate-900 dark:text-white">${Number(product.price).toFixed(2)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ (product.stock||0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }`}>
                        {(product.stock||0) > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                    </span>
                </div>
                <div className="flex gap-2 border-l border-slate-100 dark:border-slate-700 pl-4">
                    <button onClick={() => onEdit(product)} className="text-slate-400 hover:text-blue-500"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onDelete(product.id)} className="text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
                </div>
            </div>
            ))}
        </div>
       </div>
     );
  }

  // --- TABLE VIEW (Default) ---
  return (
      <div className="flex flex-col h-full">
        <BulkActionBar />
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <tr>
                <th className="px-6 py-3 w-10">
                    <input 
                        type="checkbox" 
                        checked={products.length > 0 && selectedIds.length === products.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((product) => {
                    const stock = product.stock ?? 0;
                    const isLowStock = stock < 5;
                    const isOutOfStock = stock === 0;

                    return (
                    <tr key={product.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${selectedIds.includes(product.id) ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}>
                        <td className="px-6 py-4">
                            <input 
                                type="checkbox" 
                                checked={selectedIds.includes(product.id)} 
                                onChange={() => toggleSelect(product.id)}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 mr-3 border border-slate-200 dark:border-slate-600 relative">
                            <img className={`h-full w-full object-cover ${isOutOfStock ? 'grayscale opacity-75' : ''}`} src={product.image_url || 'https://via.placeholder.com/100'} alt="" />
                            </div>
                            <div>
                            <div className={`text-sm font-medium ${isOutOfStock ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{product.name}</div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{product.sku || '-'}</td>
                        <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                            {product.category}
                        </span>
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center">
                            {isOutOfStock ? (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold uppercase">Out of Stock</span>
                            ) : isLowStock ? (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-bold flex items-center">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5 animate-pulse"></span>
                                {stock} left
                                </span>
                            ) : (
                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{stock}</span>
                            )}
                        </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                        ${Number(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => onEdit(product)} className="text-slate-400 hover:text-blue-500 transition-colors p-1" title="Edit">
                            <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => onDelete(product.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete">
                            <i className="fas fa-trash"></i>
                        </button>
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

export default ProductTable;
