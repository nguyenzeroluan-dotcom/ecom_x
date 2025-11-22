import React, { useState, useMemo, useEffect } from 'react';
import { Product, ManagerViewMode } from '../types';
import ProductForm from './manager/ProductForm';
import ProductTable from './manager/ProductTable';

interface ProductManagerProps {
  products: Product[];
  categories: string[];
  loading: boolean;
  isAnalyzing: boolean;
  handleSaveProduct: (data: Omit<Product, 'id'>, id?: string | number) => Promise<boolean>;
  handleDeleteProduct: (id: string | number) => void;
  handleDeleteProducts: (ids: (string | number)[]) => void;
  handleMagicAnalysis: (file: File) => Promise<any>;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  categories,
  loading,
  isAnalyzing,
  handleSaveProduct,
  handleDeleteProduct,
  handleDeleteProducts,
  handleMagicAnalysis,
  categoryFilter,
  setCategoryFilter
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [viewMode, setViewMode] = useState<ManagerViewMode>('table');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    const success = await handleSaveProduct(data, editingProduct?.id);
    if (success) handleCancelEdit();
    return success;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
        return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <ProductForm
          initialData={editingProduct}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          isLoading={loading}
          isAnalyzing={isAnalyzing}
          onMagicAnalysis={handleMagicAnalysis}
          availableCategories={categories.filter(c => c !== 'All')}
        />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white transition-shadow"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2.5 pl-3 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-table"></i></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-list"></i></button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><i className="fas fa-th-large"></i></button>
            </div>
          </div>
        </div>

        <ProductTable
          products={paginatedProducts}
          loading={loading}
          viewMode={viewMode}
          onEdit={handleEdit}
          onDelete={handleDeleteProduct}
          onBulkDelete={handleDeleteProducts}
        />

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 text-sm">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50">&laquo;</button>
            <span className="text-slate-600 dark:text-slate-400 font-bold">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50">&raquo;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;