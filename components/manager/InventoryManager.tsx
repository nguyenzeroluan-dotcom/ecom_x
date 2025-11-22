
import React, { useState, useEffect } from 'react';
import { Product, InventoryLog } from '../../types';
import { updateProduct, getInventoryLogs, logInventoryChange } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { ModalType } from '../../types';
import { INVENTORY_ADVANCED_SQL } from '../../data/04_inventory_advanced';

interface InventoryManagerProps {
  products: Product[];
  onRefresh: () => void;
}

type InvViewMode = 'table' | 'grid' | 'list';

const InventoryManager: React.FC<InventoryManagerProps> = ({ products, onRefresh }) => {
  const { user } = useAuth();
  const { openModal } = useModal();
  
  const [view, setView] = useState<'overview' | 'audit'>('overview');
  const [viewMode, setViewMode] = useState<InvViewMode>('table');
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [sqlError, setSqlError] = useState(false);

  // Stock Adjustment Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState(1);
  const [adjustmentReason, setAdjustmentReason] = useState('restock');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockStep, setStockStep] = useState<'input' | 'confirm'>('input');

  // SKU Editing State
  const [editingSkuId, setEditingSkuId] = useState<string | number | null>(null);
  const [tempSku, setTempSku] = useState('');

  useEffect(() => {
      if (view === 'audit') {
          loadLogs();
      }
  }, [view]);

  const loadLogs = async () => {
      setLoadingLogs(true);
      setSqlError(false);
      try {
          const data = await getInventoryLogs();
          setLogs(data);
      } catch (e: any) {
          console.error(e);
          if (e.message?.includes('relation "public.inventory_logs" does not exist')) {
              setSqlError(true);
          }
      } finally {
          setLoadingLogs(false);
      }
  };

  const openStockModal = (product: Product, type: 'add' | 'remove') => {
      setSelectedProduct(product);
      setAdjustmentType(type);
      setAdjustmentAmount(1);
      setAdjustmentReason(type === 'add' ? 'restock' : 'sale');
      setAdjustmentNote('');
      setStockStep('input');
      setShowStockModal(true);
  };

  const handleReviewStock = (e: React.FormEvent) => {
      e.preventDefault();
      setStockStep('confirm');
  };

  const handleStockSubmit = async () => {
      if (!selectedProduct) return;

      setIsProcessing(true);
      const currentStock = selectedProduct.stock || 0;
      const change = adjustmentType === 'add' ? adjustmentAmount : -adjustmentAmount;
      const newStock = Math.max(0, currentStock + change);
      const actualChange = newStock - currentStock;

      try {
          if (actualChange !== 0) {
              await updateProduct(selectedProduct.id, { stock: newStock });
              await logInventoryChange(
                  selectedProduct.id,
                  selectedProduct.name,
                  currentStock,
                  newStock,
                  adjustmentReason,
                  user?.id,
                  adjustmentNote
              );
              onRefresh(); // Trigger parent refresh
              openModal(ModalType.SUCCESS, { title: "Stock Updated", message: `Inventory updated for ${selectedProduct.name}. New level: ${newStock}` });
          }
          setShowStockModal(false);
      } catch (err: any) {
          openModal(ModalType.CONFIRM, { title: "Error", message: err.message });
      } finally {
          setIsProcessing(false);
      }
  };

  const startSkuEdit = (product: Product) => {
      setEditingSkuId(product.id);
      setTempSku(product.sku || '');
  };

  const saveSku = async (id: string | number) => {
      if (tempSku.trim() === '') return;
      try {
          await updateProduct(id, { sku: tempSku.trim() });
          onRefresh();
      } catch (e) {
          console.error(e);
      } finally {
          setEditingSkuId(null);
      }
  };

  const generateAutoSkus = async () => {
      openModal(ModalType.CONFIRM, {
          title: "Auto-Generate SKUs",
          message: "This will generate SKUs for all products that are currently missing one. Continue?",
          onConfirm: async () => {
              const missingSkuProducts = products.filter(p => !p.sku);
              let count = 0;
              for (const p of missingSkuProducts) {
                  const prefix = p.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
                  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                  const newSku = `${prefix}-${random}`;
                  await updateProduct(p.id, { sku: newSku });
                  count++;
              }
              onRefresh();
              openModal(ModalType.SUCCESS, { title: "Complete", message: `Generated ${count} new SKUs.` });
          }
      });
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const lowStockCount = products.filter(p => (p.stock || 0) < 5 && (p.stock || 0) > 0).length;
  const totalStock = products.reduce((a,b) => a + (b.stock || 0), 0);
  const totalValue = products.reduce((a,b) => a + ((b.stock || 0) * Number(b.price)), 0);

  // ---------------------- RENDER HELPERS ----------------------

  const StockProgressBar = ({ stock }: { stock: number }) => {
      const max = 50; // Assume 50 is "full" for visual context
      const pct = Math.min(100, (stock / max) * 100);
      let color = 'bg-green-500';
      if (stock === 0) color = 'bg-slate-300';
      else if (stock < 5) color = 'bg-red-500';
      else if (stock < 15) color = 'bg-orange-500';

      return (
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
              <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
          </div>
      );
  };

  const StockStatusBadge = ({ stock }: { stock: number }) => {
      if (stock === 0) return <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] font-bold rounded uppercase">Out of Stock</span>;
      if (stock < 5) return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase animate-pulse">Low Stock</span>;
      return <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded uppercase">In Stock</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Top Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center">
               <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
                   <i className="fas fa-exclamation-triangle"></i>
               </div>
               <div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Low Stock Alerts</p>
                   <p className="text-xl font-bold text-slate-800 dark:text-white">{lowStockCount} items</p>
               </div>
           </div>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center">
               <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                   <i className="fas fa-cubes"></i>
               </div>
               <div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Total Inventory</p>
                   <p className="text-xl font-bold text-slate-800 dark:text-white">{totalStock} units</p>
               </div>
           </div>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center">
               <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                   <i className="fas fa-dollar-sign"></i>
               </div>
               <div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Inventory Value</p>
                   <p className="text-xl font-bold text-slate-800 dark:text-white">${totalValue.toLocaleString()}</p>
               </div>
           </div>
       </div>

       {/* Main Controls */}
       <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between gap-4 items-center">
           <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
               <button 
                  onClick={() => setView('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'overview' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400'}`}
               >
                   Stock Overview
               </button>
               <button 
                  onClick={() => setView('audit')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'audit' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400'}`}
               >
                   Audit Logs
               </button>
           </div>

           {view === 'overview' && (
               <div className="flex gap-3 w-full md:w-auto">
                   <div className="relative flex-1 md:w-64">
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search SKU or Name..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                        />
                   </div>
                   <button 
                      onClick={generateAutoSkus}
                      className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors whitespace-nowrap"
                   >
                       <i className="fas fa-magic mr-2"></i> Auto SKU
                   </button>
                   <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                       <button onClick={() => setViewMode('table')} className={`p-2 rounded transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-table"></i></button>
                       <button onClick={() => setViewMode('list')} className={`p-2 rounded transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-list"></i></button>
                       <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-th-large"></i></button>
                   </div>
               </div>
           )}
       </div>

       {/* View Content */}
       {view === 'overview' ? (
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
               
               {/* TABLE VIEW */}
               {viewMode === 'table' && (
                   <div className="overflow-x-auto">
                       <table className="w-full text-left">
                           <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                               <tr>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">SKU</th>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Stock Level</th>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Quick Actions</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                               {filtered.map(p => (
                                   <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                       <td className="px-6 py-4">
                                           <div className="flex items-center gap-3">
                                               <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover bg-slate-100" alt="" />
                                               <div>
                                                   <p className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</p>
                                                   <p className="text-xs text-slate-500">{p.category}</p>
                                               </div>
                                           </div>
                                       </td>
                                       <td className="px-6 py-4">
                                           {editingSkuId === p.id ? (
                                               <div className="flex items-center gap-1">
                                                   <input 
                                                        autoFocus
                                                        className="w-24 px-2 py-1 text-xs border border-primary rounded outline-none bg-white dark:bg-slate-900 dark:text-white"
                                                        value={tempSku}
                                                        onChange={e => setTempSku(e.target.value)}
                                                        onBlur={() => saveSku(p.id)}
                                                        onKeyDown={e => e.key === 'Enter' && saveSku(p.id)}
                                                   />
                                               </div>
                                           ) : (
                                               <div className="flex items-center gap-2 group cursor-pointer" onClick={() => startSkuEdit(p)}>
                                                   <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{p.sku || '---'}</span>
                                                   <i className="fas fa-pencil-alt text-[10px] text-slate-300 opacity-0 group-hover:opacity-100"></i>
                                               </div>
                                           )}
                                       </td>
                                       <td className="px-6 py-4 w-48">
                                           <div className="flex justify-between text-xs mb-1">
                                               <span className="font-bold text-slate-700 dark:text-slate-300">{p.stock || 0}</span>
                                               <span className="text-slate-400">Target: 50</span>
                                           </div>
                                           <StockProgressBar stock={p.stock || 0} />
                                       </td>
                                       <td className="px-6 py-4">
                                           <StockStatusBadge stock={p.stock || 0} />
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                           <div className="flex justify-end gap-2">
                                               <button onClick={() => openStockModal(p, 'remove')} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors" title="Remove Stock">
                                                   <i className="fas fa-minus"></i>
                                               </button>
                                               <button onClick={() => openStockModal(p, 'add')} className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-500 hover:bg-green-100 flex items-center justify-center transition-colors" title="Add Stock">
                                                   <i className="fas fa-plus"></i>
                                               </button>
                                           </div>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               )}

               {/* GRID VIEW */}
               {viewMode === 'grid' && (
                   <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                       {filtered.map(p => (
                           <div key={p.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col">
                               <div className="flex justify-between items-start mb-3">
                                   <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover bg-white" alt="" />
                                   <StockStatusBadge stock={p.stock || 0} />
                               </div>
                               <h4 className="font-bold text-slate-900 dark:text-white truncate mb-1">{p.name}</h4>
                               <div className="flex justify-between items-center mb-3">
                                   <span className="text-xs font-mono text-slate-500">{p.sku || 'NO SKU'}</span>
                                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{p.stock} Units</span>
                               </div>
                               <StockProgressBar stock={p.stock || 0} />
                               <div className="mt-4 grid grid-cols-2 gap-2">
                                   <button onClick={() => openStockModal(p, 'remove')} className="py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20">- Stock</button>
                                   <button onClick={() => openStockModal(p, 'add')} className="py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-green-500 text-xs font-bold hover:bg-green-50 dark:hover:bg-green-900/20">+ Stock</button>
                               </div>
                           </div>
                       ))}
                   </div>
               )}

               {/* LIST VIEW */}
               {viewMode === 'list' && (
                   <div className="p-4 space-y-3">
                       {filtered.map(p => (
                           <div key={p.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                               <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover bg-white" alt="" />
                               <div className="flex-1 min-w-0">
                                   <h4 className="font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
                                   <p className="text-xs text-slate-500">SKU: {p.sku || '-'}</p>
                               </div>
                               <div className="w-32 hidden md:block">
                                   <StockProgressBar stock={p.stock || 0} />
                               </div>
                               <div className="text-right px-4">
                                   <p className="text-lg font-bold text-slate-800 dark:text-white">{p.stock}</p>
                                   <p className="text-[10px] text-slate-500 uppercase">Units</p>
                               </div>
                               <div className="flex gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                                   <button onClick={() => openStockModal(p, 'remove')} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-red-500 border border-slate-200 dark:border-slate-600 hover:bg-red-50 flex items-center justify-center"><i className="fas fa-minus"></i></button>
                                   <button onClick={() => openStockModal(p, 'add')} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-green-500 border border-slate-200 dark:border-slate-600 hover:bg-green-50 flex items-center justify-center"><i className="fas fa-plus"></i></button>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
           </div>
       ) : (
           // AUDIT LOG VIEW
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {sqlError ? (
                    <div className="p-8 text-center">
                        <div className="text-red-500 text-5xl mb-4"><i className="fas fa-database"></i></div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Missing Audit Table</h3>
                        <p className="text-slate-500 mb-6">The `inventory_logs` table has not been created yet.</p>
                        <div className="bg-slate-900 rounded-lg p-4 text-left overflow-x-auto max-w-2xl mx-auto">
                            <button onClick={() => navigator.clipboard.writeText(INVENTORY_ADVANCED_SQL)} className="text-xs text-white bg-white/20 px-2 py-1 rounded mb-2 hover:bg-white/30">Copy SQL</button>
                            <pre className="text-green-400 text-xs font-mono">{INVENTORY_ADVANCED_SQL}</pre>
                        </div>
                    </div>
                ) : loadingLogs ? (
                   <div className="p-12 flex justify-center"><i className="fas fa-spinner fa-spin text-primary text-2xl"></i></div>
               ) : logs.length === 0 ? (
                   <div className="p-12 text-center text-slate-400">
                       <i className="fas fa-clipboard-list text-4xl mb-2"></i>
                       <p>No inventory changes recorded yet.</p>
                   </div>
               ) : (
                   <div className="overflow-x-auto">
                       <table className="w-full text-left">
                           <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                               <tr>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Change</th>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Reason</th>
                                   <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Stock</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                               {logs.map(log => (
                                   <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                       <td className="px-6 py-4 text-xs text-slate-500">
                                           {new Date(log.created_at).toLocaleString()}
                                       </td>
                                       <td className="px-6 py-4 font-bold text-sm text-slate-800 dark:text-white">
                                           {log.product_name}
                                       </td>
                                       <td className="px-6 py-4">
                                           <span className={`font-bold text-sm ${log.change_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                               {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                                           </span>
                                       </td>
                                       <td className="px-6 py-4">
                                           <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 capitalize">
                                               {log.reason}
                                           </span>
                                           {log.note && <p className="text-[10px] text-slate-400 mt-1 italic">{log.note}</p>}
                                       </td>
                                       <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                           {log.previous_stock} → <span className="font-bold text-slate-800 dark:text-white">{log.new_stock}</span>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               )}
           </div>
       )}

       {/* Updated Stock Adjustment Modal with Confirmation Step */}
       {showStockModal && selectedProduct && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                   {/* Header */}
                   <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                       <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                           {stockStep === 'input' ? (adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock') : 'Confirm Update'}
                       </h3>
                       <button onClick={() => setShowStockModal(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                   </div>
                   
                   {/* Content */}
                   <form onSubmit={stockStep === 'input' ? handleReviewStock : (e) => { e.preventDefault(); handleStockSubmit(); }} className="p-6 space-y-6">
                       
                       {stockStep === 'input' ? (
                           <>
                            {/* Input Step */}
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                <img src={selectedProduct.image_url} className="w-14 h-14 rounded-lg bg-white object-cover" alt="" />
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedProduct.name}</p>
                                    <p className="text-xs text-slate-500">Current Stock: <span className="font-bold">{selectedProduct.stock || 0}</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            required
                                            value={adjustmentAmount}
                                            onChange={e => setAdjustmentAmount(parseInt(e.target.value))}
                                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-3 text-xl font-bold text-center focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white"
                                        />
                                        <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-bold ${adjustmentType === 'add' ? 'text-green-500' : 'text-red-500'}`}>
                                            {adjustmentType === 'add' ? '+' : '-'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Total</label>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-3 text-xl font-bold text-center text-slate-600 dark:text-slate-300">
                                        {Math.max(0, (selectedProduct.stock || 0) + (adjustmentType === 'add' ? adjustmentAmount : -adjustmentAmount))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason Code</label>
                                <select 
                                    value={adjustmentReason}
                                    onChange={e => setAdjustmentReason(e.target.value)}
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white bg-white"
                                >
                                    <option value="restock">Restock Shipment</option>
                                    <option value="sale">Direct Sale</option>
                                    <option value="adjustment">Inventory Count Adjustment</option>
                                    <option value="damage">Damaged / Expired</option>
                                    <option value="return">Customer Return</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes (Optional)</label>
                                <textarea 
                                    rows={2}
                                    value={adjustmentNote}
                                    onChange={e => setAdjustmentNote(e.target.value)}
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white resize-none"
                                    placeholder="e.g. PO #1234"
                                />
                            </div>
                           </>
                       ) : (
                           <>
                            {/* Confirmation Step */}
                            <div className="text-center py-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${adjustmentType === 'add' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                                    <i className={`fas ${adjustmentType === 'add' ? 'fa-arrow-up' : 'fa-arrow-down'} text-2xl`}></i>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    {adjustmentType === 'add' ? 'Adding Stock' : 'Removing Stock'}
                                </h4>
                                <p className="text-slate-500 text-sm mb-6">Please review the inventory change.</p>

                                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Product</span>
                                        <span className="font-bold text-slate-800 dark:text-white">{selectedProduct.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Adjustment</span>
                                        <span className={`font-bold ${adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                                            {adjustmentType === 'add' ? '+' : '-'}{adjustmentAmount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                                        <span className="text-slate-500">New Balance</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {Math.max(0, (selectedProduct.stock || 0) + (adjustmentType === 'add' ? adjustmentAmount : -adjustmentAmount))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Reason</span>
                                        <span className="text-slate-800 dark:text-white capitalize">{adjustmentReason}</span>
                                    </div>
                                </div>
                            </div>
                           </>
                       )}

                       <div className="pt-2 flex gap-3">
                           {stockStep === 'confirm' && (
                               <button 
                                type="button" 
                                onClick={() => setStockStep('input')}
                                className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                               >
                                   Back
                               </button>
                           )}
                           {stockStep === 'input' && (
                               <button 
                                type="button" 
                                onClick={() => setShowStockModal(false)}
                                className="flex-1 py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                               >
                                   Cancel
                               </button>
                           )}
                           
                           <button 
                               type="submit" 
                               disabled={isProcessing}
                               className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${adjustmentType === 'add' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                           >
                               {stockStep === 'input' ? 'Review Update' : (isProcessing ? <i className="fas fa-spinner fa-spin"></i> : 'Confirm Update')}
                           </button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default InventoryManager;
