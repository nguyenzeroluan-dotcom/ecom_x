
import React, { useState, useMemo, useRef } from 'react';
import { Product, Category, CategoryData, ModalType } from '../../types';
import { updateCategoryName } from '../../services/categoryService';
import { uploadMediaAsset } from '../../services/mediaService';
import { useModal } from '../../contexts/ModalContext';
import DataViewContainer from '../common/view-modes/DataViewContainer';
import { ColumnDef } from '../common/view-modes/types';

interface CategoryManagerProps {
  products: Product[];
  categories: Category[];
  onSelectCategory: (category: string) => void;
  onAddCategory: (cat: Omit<Category, 'id'>) => Promise<boolean>;
  onUpdateCategory: (id: number, updates: Partial<Category>) => Promise<boolean>;
  onDeleteCategory: (id: number) => Promise<boolean>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  products, 
  categories: dbCategories, 
  onSelectCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const { openModal } = useModal();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aggregate Data Logic ... (Same as before)
  const aggregatedCategories: CategoryData[] = useMemo(() => {
    const map = new Map<string, CategoryData>();
    dbCategories.forEach(c => {
        map.set(c.name, {
            id: c.id,
            name: c.name,
            description: c.description,
            image_url: c.image_url,
            count: 0,
            totalValue: 0,
            is_db_persisted: true
        });
    });
    products.forEach(p => {
      const catName = p.category || 'Uncategorized';
      if (!map.has(catName)) {
        map.set(catName, { name: catName, count: 0, totalValue: 0, image_url: p.image_url, is_db_persisted: false });
      }
      const data = map.get(catName)!;
      data.count++;
      data.totalValue += (Number(p.price) * (p.stock || 0));
      if (!data.image_url) data.image_url = p.image_url;
    });
    return Array.from(map.values()).sort((a, b) => (b.is_db_persisted ? 1 : 0) - (a.is_db_persisted ? 1 : 0) || b.count - a.count);
  }, [products, dbCategories]);

  const resetForm = () => {
      setFormData({ name: '', description: '', image_url: '' });
      setEditId(null);
      setIsEditing(false);
  };

  const handleEdit = (cat: CategoryData) => {
      setFormData({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' });
      setEditId(cat.id || null); 
      setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setUploading(true);
          try {
              const asset = await uploadMediaAsset(e.target.files[0]);
              setFormData(prev => ({ ...prev, image_url: asset.public_url }));
          } catch (err: any) {
              alert("Upload failed: " + err.message);
          } finally {
              setUploading(false);
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editId) {
              const oldName = dbCategories.find(c => c.id === editId)?.name;
              await onUpdateCategory(editId, formData);
              if (oldName && oldName !== formData.name) await updateCategoryName(oldName, formData.name);
              openModal(ModalType.SUCCESS, { title: "Category Updated", message: "Category details updated successfully." });
          } else {
              await onAddCategory(formData);
              openModal(ModalType.SUCCESS, { title: "Category Created", message: "New category added to database." });
          }
          resetForm();
      } catch (error: any) {
          openModal(ModalType.CONFIRM, { title: "Error", message: error.message });
      }
  };

  const handleDelete = (cat: CategoryData) => {
      if (!cat.is_db_persisted) {
          alert("This category is not in the database, it only exists on products. Edit the products to remove it.");
          return;
      }
      openModal(ModalType.CONFIRM, {
          title: "Delete Category",
          message: `Are you sure you want to delete "${cat.name}"?`,
          isDestructive: true,
          onConfirm: async () => { if (cat.id) await onDeleteCategory(cat.id); }
      });
  };

  const handleSync = async (cat: CategoryData) => {
      try {
          await onAddCategory({ name: cat.name, description: `Auto-created from products`, image_url: cat.image_url });
          openModal(ModalType.SUCCESS, { title: "Synced", message: `Category "${cat.name}" is now managed in the database.` });
      } catch (e: any) { alert("Sync failed: " + e.message); }
  };

  // --- View Definitions ---

  const gridRenderer = (cat: CategoryData) => (
    <div className={`group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border ${cat.is_db_persisted ? 'border-slate-200 dark:border-slate-700' : 'border-orange-200 bg-orange-50/50 dark:bg-orange-900/10'} overflow-hidden flex flex-col transition-all hover:shadow-md h-full`}>
        <div className="h-32 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
            <img src={cat.image_url || 'https://via.placeholder.com/400?text=No+Image'} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-3 right-3 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => handleEdit(cat)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40"><i className="fas fa-edit"></i></button>
                <button onClick={() => handleDelete(cat)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40"><i className="fas fa-trash"></i></button>
            </div>
            {!cat.is_db_persisted && (
                <button onClick={() => handleSync(cat)} className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <i className="fas fa-exclamation-triangle"></i> Sync
                </button>
            )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cat.name}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 flex-grow">{cat.description || 'No description.'}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-sm">
                <div className="text-slate-500">Products: <span className="font-bold text-slate-800 dark:text-slate-200">{cat.count}</span></div>
                <button onClick={() => onSelectCategory(cat.name)} className="text-primary font-bold text-sm hover:underline">View</button>
            </div>
        </div>
    </div>
  );

  const listRenderer = (cat: CategoryData) => (
    <div className={`flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border ${cat.is_db_persisted ? 'border-slate-200 dark:border-slate-700' : 'border-orange-200 dark:border-orange-900'}`}>
        <img src={cat.image_url} alt={cat.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
        <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">{cat.name}</h3>
            <p className="text-xs text-slate-500">{cat.description || 'No description'}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
            <span className="font-bold text-slate-800 dark:text-slate-200">{cat.count} items</span>
            <span className="text-slate-500">${cat.totalValue.toLocaleString()} value</span>
        </div>
        <div className="flex gap-2 ml-4">
             <button onClick={() => handleEdit(cat)} className="p-2 text-slate-400 hover:text-blue-500"><i className="fas fa-edit"></i></button>
             <button onClick={() => handleDelete(cat)} className="p-2 text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Category Management</h2>
            <p className="text-sm text-slate-500">{aggregatedCategories.length} total categories</p>
        </div>
        <div className="flex gap-3">
            <button onClick={() => { resetForm(); setIsEditing(true); }} className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center">
                <i className="fas fa-plus mr-2"></i> Add Category
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}`}><i className="fas fa-th-large"></i></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}`}><i className="fas fa-list"></i></button>
            </div>
        </div>
      </div>

      {/* Modal Form */}
      {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                  {/* ... (Form content identical to before) ... */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editId ? 'Edit Category' : 'New Category'}</h3>
                      <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white" placeholder="e.g. Electronics" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                          <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none resize-none dark:bg-slate-900 dark:text-white" placeholder="Optional description..." />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Cover Image</label>
                          <div className="flex items-center gap-4">
                              {formData.image_url && <img src={formData.image_url} className="w-16 h-16 rounded-lg object-cover bg-slate-100" alt="" />}
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300">
                                  {uploading ? <i className="fas fa-spinner fa-spin"></i> : 'Upload Image'}
                              </button>
                              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                          </div>
                      </div>
                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={resetForm} className="flex-1 py-2 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                          <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-bold hover:bg-indigo-600 shadow-lg">Save Category</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Content via Generic Container */}
      <DataViewContainer
        data={aggregatedCategories}
        mode={viewMode === 'grid' ? 'grid' : 'list'} // Map simple toggle to ViewMode
        emptyMessage="No categories found."
        gridView={{
            renderItem: gridRenderer,
            gridClassName: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        }}
        listView={{
            renderItem: listRenderer
        }}
      />
    </div>
  );
};
