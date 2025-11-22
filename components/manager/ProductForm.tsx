

import React, { useState, useEffect } from 'react';
import { Product, ModalType } from '../../types';
import { useModal } from '../../contexts/ModalContext';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<boolean>;
  onCancel: () => void;
  isEditing: boolean;
  isLoading: boolean;
  isAnalyzing: boolean;
  onMagicAnalysis: (file: File) => Promise<any>;
  availableCategories?: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
  isLoading,
  isAnalyzing,
  onMagicAnalysis,
  availableCategories = []
}) => {
  const { openModal } = useModal();
  const categories = availableCategories.length > 0 ? availableCategories : ['Home', 'Electronics', 'Fashion', 'Office', 'Art'];

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: '',
    description: '',
    image_url: '',
    stock: '10',
    collection_id: undefined as number | undefined
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const magicInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        sku: initialData.sku || '',
        price: initialData.price.toString(),
        category: initialData.category || 'Uncategorized',
        description: initialData.description,
        image_url: initialData.image_url,
        stock: initialData.stock !== undefined ? initialData.stock.toString() : '10',
        collection_id: initialData.collection_id
      });
    } else {
      setFormData({ name: '', sku: '', price: '', category: categories[0] || 'Home', description: '', image_url: '', stock: '20', collection_id: undefined });
    }
  }, [initialData, categories]);

  const generateSku = () => {
      const prefix = formData.name.substring(0, 3).toUpperCase() || 'PRD';
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setFormData(prev => ({ ...prev, sku: `${prefix}-${random}` }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'category' && value === 'NEW_CUSTOM') {
        setIsCustomCategory(true);
        setFormData(prev => ({ ...prev, category: '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const openMediaLibrary = () => {
      openModal(ModalType.MEDIA_SELECTOR, {
          onSelect: (media: { imageUrl?: string, collectionId?: number, collectionImages?: string[] }) => {
              setFormData(prev => ({
                ...prev,
                // If a collection is chosen, its first image becomes the main image unless a specific image was also picked.
                image_url: media.imageUrl || (media.collectionImages && media.collectionImages[0]) || prev.image_url,
                collection_id: media.collectionId ?? prev.collection_id
              }));
          }
      });
  };

  const handleMagicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const data = await onMagicAnalysis(e.target.files[0]);
      if (data) {
        setFormData({
          name: data.name || '',
          sku: '',
          price: data.price?.toString() || '',
          category: data.category || categories[0],
          description: data.description || '',
          image_url: data.image_url || '',
          stock: '20',
          collection_id: undefined
        });
        setTimeout(() => generateSku(), 100);
      }
      if (magicInputRef.current) magicInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit({
      name: formData.name,
      sku: formData.sku || undefined,
      price: parseFloat(formData.price),
      description: formData.description,
      image_url: formData.image_url || 'https://via.placeholder.com/400',
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      collection_id: formData.collection_id
    });
    if (success && !isEditing) {
      setFormData({ name: '', sku: '', price: '', category: categories[0] || 'Home', description: '', image_url: '', stock: '20', collection_id: undefined });
      setIsCustomCategory(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isEditing && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
            <i className="fas fa-magic text-9xl"></i>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2 flex items-center">
              <i className="fas fa-sparkles mr-2 text-yellow-300"></i> AI Auto-Import
            </h3>
            <p className="text-indigo-100 text-sm mb-4">
              Upload a photo and let Gemini Vision auto-fill details.
            </p>
            <button 
              type="button"
              onClick={() => magicInputRef.current?.click()}
              disabled={isAnalyzing}
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl py-3 px-4 font-semibold text-white transition-all flex items-center justify-center"
            >
              {isAnalyzing ? <><i className="fas fa-circle-notch fa-spin mr-2"></i> Analyzing...</> : <><i className="fas fa-camera mr-2"></i> Upload & Analyze</>}
            </button>
            <input type="file" ref={magicInputRef} onChange={handleMagicUpload} className="hidden" accept="image/*" />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-24">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          {isEditing && (
            <button onClick={onCancel} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-2 py-1 rounded transition">Cancel</button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white" placeholder="e.g. Modern Lamp" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                <div className="relative">
                    <input 
                        type="text" 
                        name="sku" 
                        value={formData.sku} 
                        onChange={handleInputChange} 
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white" 
                        placeholder="e.g. LMP-001" 
                    />
                    <button 
                        type="button"
                        onClick={generateSku}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-primary"
                        title="Generate SKU"
                    >
                        <i className="fas fa-random"></i>
                    </button>
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
              <input type="number" name="price" required step="0.01" value={formData.price} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white" placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              {isCustomCategory ? (
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="category" 
                        required
                        autoFocus 
                        value={formData.category} 
                        onChange={handleInputChange} 
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white" 
                        placeholder="New Category Name"
                      />
                      <button type="button" onClick={() => setIsCustomCategory(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded hover:bg-slate-300"><i className="fas fa-times"></i></button>
                  </div>
              ) : (
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white dark:bg-slate-900 dark:text-white">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="NEW_CUSTOM" className="font-bold text-primary">+ Add New Category</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
              <input type="number" name="stock" required step="1" value={formData.stock} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white" placeholder="10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none dark:bg-slate-900 dark:text-white" placeholder="Product details..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Media</label>
            <div className="flex gap-4 items-center">
               <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 flex-shrink-0 flex items-center justify-center">
                 {formData.image_url ? (
                   <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <i className="fas fa-image text-2xl text-slate-300"></i>
                 )}
               </div>
               <div className="flex flex-col">
                  <button type="button" onClick={openMediaLibrary} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-slate-300 font-bold">
                    {formData.collection_id ? 'Change Media' : 'Set Media'}
                  </button>
                  <p className="text-xs text-slate-400 mt-2">
                    {formData.collection_id ? `Collection #${formData.collection_id} assigned` : 'Set cover image & gallery.'}
                  </p>
               </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center ${isEditing ? 'bg-secondary hover:bg-green-600 shadow-green-500/20' : 'bg-primary hover:bg-indigo-600 shadow-indigo-500/20'} disabled:opacity-50`}>
            {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</> : isEditing ? <><i className="fas fa-save mr-2"></i> Update Product</> : <><i className="fas fa-plus mr-2"></i> Add Product</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
