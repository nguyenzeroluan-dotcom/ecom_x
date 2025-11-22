import React, { useState, useMemo, useRef } from 'react';
import { Product, Category, CategoryData, ModalType } from '../../types';
import { updateCategoryName } from '../../services/categoryService';
import { uploadMediaAsset } from '../../services/mediaService';
import { useModal } from '../../contexts/ModalContext';
import { useProductManager } from '../../hooks/useProductManager'; // For actions context if needed, but props here

interface CategoryManagerProps {
  products: Product[];
  categories: Category[];
  onSelectCategory: (category: string) => void;
  onAddCategory: (cat: Omit<Category, 'id'>) => Promise<boolean>;
  onUpdateCategory: (id: number, updates: Partial<Category>) => Promise<boolean>;
  onDeleteCategory: (id: number) => Promise<boolean>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
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

  // Aggregate Data: Merge DB categories with Product categories
  const aggregatedCategories: CategoryData[] = useMemo(() => {
    const map = new Map<string, CategoryData>();
    
    // 1. Start with DB Categories
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

    // 2. Aggregate Products
    products.forEach(p => {
      const catName = p.category || 'Uncategorized';
      if (!map.has(catName)) {
        // Found a category in products that isn't in DB
        map.set(catName, { 
            name: catName, 
            count: 0, 
            totalValue: 0, 
            image_url: p.image_url,
            is_db_persisted: false
        });
      }
      
      const data = map.get(catName)!;
      data.count++;
      data.totalValue += (Number(p.price) * (p.stock || 0));
      // If DB didn't provide an image, use product image
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
      setFormData({
          name: cat.name,
          description: cat.description || '',
          image_url: cat.image_url || ''
      });
      setEditId(cat.id || null); // If null, it means it's a product-derived category only
      setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          setUploading(true);
          try {
              // FIX: Use the 'public_url' property from the returned asset object
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
              // Update existing DB category
              const oldName = dbCategories.find(c => c.id === editId)?.name;
              await onUpdateCategory(editId, formData);
              
              // If name changed, update products too
              if (oldName && oldName !== formData.name) {
                  await updateCategoryName(oldName, formData.name);
              }
              openModal(ModalType.SUCCESS, { title: "Category Updated", message: "Category details updated successfully." });
          } else {
              // Create new
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
          message: `Are you sure you want to delete "${cat.name}"? Products in this category will remain but might be orphaned if you don't update them.`,
          isDestructive: true,
          onConfirm: async () => {
              if (cat.id) await onDeleteCategory(cat.id);
          }
      });
  };

  const handleSync = async (cat: CategoryData) => {
      // Convert a product-only category to a DB category
      try {
          await onAddCategory({
              name: cat.name,
              description: `Auto-created from products`,
              image_url: cat.image_url
          });
          openModal(ModalType.SUCCESS, { title: "Synced", message: `Category "${cat.name}" is now managed in the database.` });
      } catch (e: any) {
          alert("Sync failed: " + e.message);
      }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Category Management</h2>
            <p className="text-sm text-slate-500">{aggregatedCategories.length} total categories</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => { resetForm(); setIsEditing(true); }}
                className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center"
            >
                <i className="fas fa-plus mr-2"></i> Add Category
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-400'}`}><i className="fas fa-th-large"></i></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-400'}`}><i className="fas fa-list"></i></button>
            </div>
        </div>
      </div>

      {/* Form Modal Overlay */}
      {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editId ? 'Edit Category' : 'New Category'}</h3>
                      <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                          <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white"
                            placeholder="e.g. Electronics"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                          <textarea 
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none resize-none dark:bg-slate-900 dark:text-white"
                            placeholder="Optional description..."
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Cover Image</label>
                          <div className="flex items-center gap-4">
                              {formData.image_url && <img src={formData.image_url} className="w-16 h-16 rounded-lg object-cover bg-slate-100" alt="" />}
                              <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300"
                              >
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

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aggregatedCategories.map((cat) => (
            <div key={cat.name} className={`group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border ${cat.is_db_persisted ? 'border-slate-200 dark:border-slate-700' : 'border-orange-200 bg-orange-50/50 dark:bg-orange-900/10'} overflow-hidden flex flex-col transition-all hover:shadow-md`}>
                
                <div className="h-32 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                    <img src={cat.image_url || 'https://via.placeholder.com/400?text=No+Image'} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                        <h3 className="text-white font-bold text-lg truncate w-full">{cat.name}</h3>
                        <p className="text-white/70 text-xs line-clamp-1">{cat.description || (cat.is_db_persisted ? 'No description' : 'Product-derived category')}</p>
                    </div>
                    {!cat.is_db_persisted && (
                        <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            Unsynced
                        </span>
                    )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold">Items</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{cat.count}</p>
                        </div>
                        <div className="text-center border-l border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold">Value</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">${cat.totalValue.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-auto flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button onClick={() => onSelectCategory(cat.name)} className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 py-2 rounded-lg text-xs font-bold" title="View Products">
                            <i className="fas fa-eye"></i>
                        </button>
                        {cat.is_db_persisted ? (
                            <>
                                <button onClick={() => handleEdit(cat)} className="flex-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 py-2 rounded-lg text-xs font-bold" title="Edit Details">
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button onClick={() => handleDelete(cat)} className="flex-1 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 dark:text-red-400 py-2 rounded-lg text-xs font-bold" title="Delete">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </>
                        ) : (
                            <button onClick={() => handleSync(cat)} className="flex-[2] bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 text-orange-700 dark:text-orange-400 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                                <i className="fas fa-sync"></i> Add to DB
                            </button>
                        )}
                    </div>
                </div>
            </div>
            ))}
        </div>
      ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Description</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {aggregatedCategories.map(cat => (
                          <tr key={cat.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-6 py-4 flex items-center gap-3">
                                  <img src={cat.image_url} className="w-8 h-8 rounded bg-slate-200 object-cover" alt="" />
                                  <span className="font-bold text-slate-900 dark:text-white">{cat.name}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-xs">
                                  {cat.description || '-'}
                              </td>
                              <td className="px-6 py-4">
                                  {cat.is_db_persisted ? <span className="text-green-600 text-xs font-bold">Active</span> : <span className="text-orange-500 text-xs font-bold">Unsynced</span>}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                      {cat.is_db_persisted ? (
                                          <>
                                            <button onClick={() => handleEdit(cat)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDelete(cat)} className="text-red-500 hover:bg-red-50 p-2 rounded"><i className="fas fa-trash"></i></button>
                                          </>
                                      ) : (
                                          <button onClick={() => handleSync(cat)} className="text-orange-500 hover:bg-orange-50 p-2 rounded text-xs font-bold">Sync</button>
                                      )}
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}
      
    </div>
  );
};

export default CategoryManager;
