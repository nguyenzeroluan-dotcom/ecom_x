
import React, { useState, useEffect } from 'react';
import { Product, ModalType } from '../../types';
import { useModal } from '../../contexts/ModalContext';
import { generateProductDescription } from '../../services/geminiService';

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
  const categories = availableCategories.length > 0 ? availableCategories : ['Home', 'Electronics', 'Fashion', 'Office', 'Art', 'E-Books'];

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: '',
    description: '',
    image_url: '',
    stock: '10',
    collection_id: undefined as number | undefined,
    is_digital: false,
    digital_content: ''
  });

  const [galleryImageCount, setGalleryImageCount] = useState(0);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  // URL Input State
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

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
        collection_id: initialData.collection_id,
        is_digital: initialData.is_digital || false,
        digital_content: initialData.digital_content || ''
      });
      
      // Initialize gallery preview from initialData
      if (initialData.gallery_images && initialData.gallery_images.length > 0) {
          setGalleryImageCount(initialData.gallery_images.length);
          setPreviewGallery(initialData.gallery_images);
      } else {
          setGalleryImageCount(0);
          setPreviewGallery([]);
      }
    } else {
      setFormData({ name: '', sku: '', price: '', category: categories[0] || 'Home', description: '', image_url: '', stock: '20', collection_id: undefined, is_digital: false, digital_content: '' });
      setGalleryImageCount(0);
      setPreviewGallery([]);
    }
  }, [initialData, categories]);

  // Auto-detect digital category
  useEffect(() => {
      if (formData.category.toLowerCase().includes('book') || formData.category.toLowerCase().includes('digital')) {
          setFormData(prev => ({ ...prev, is_digital: true }));
      }
  }, [formData.category]);

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  }

  const openMediaLibrary = () => {
      openModal(ModalType.MEDIA_SELECTOR, {
          currentSelection: {
              imageUrl: formData.image_url,
              collectionId: formData.collection_id,
          },
          onSelect: (media: { imageUrl: string; collectionId: number | null, imageCount: number, previewImages?: string[] }) => {
              // Update form data with new selections
              setFormData(prev => ({
                  ...prev,
                  image_url: media.imageUrl,
                  collection_id: media.collectionId === null ? undefined : media.collectionId,
              }));
              
              // Update preview state immediately
              setGalleryImageCount(media.imageCount || 0);
              if (media.previewImages && media.previewImages.length > 0) {
                  setPreviewGallery(media.previewImages);
              } else {
                  setPreviewGallery([]);
              }
          }
      });
  };

  const handleUrlSubmit = () => {
      if (urlInputValue.trim()) {
          setFormData(prev => ({ ...prev, image_url: urlInputValue.trim() }));
          // Don't clear collection_id here unless explicit, 
          // user might want a custom cover URL for a gallery product
          setShowUrlInput(false);
          setUrlInputValue('');
      }
  };

  const handleMagicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const data = await onMagicAnalysis(e.target.files[0]);
      if (data) {
        setFormData({
          ...formData,
          name: data.name || '',
          price: data.price?.toString() || '',
          category: data.category || categories[0],
          description: data.description || '',
          image_url: data.image_url || '',
        });
        setTimeout(() => generateSku(), 100);
      }
      if (magicInputRef.current) magicInputRef.current.value = '';
    }
  };

  const handleGenerateDescription = async () => {
      if (!formData.name) {
          alert("Please enter a product name first.");
          return;
      }
      setIsGeneratingDesc(true);
      try {
          const desc = await generateProductDescription(formData.name, formData.category);
          setFormData(prev => ({ ...prev, description: desc }));
      } catch (e) {
          console.error(e);
          alert("Failed to generate description.");
      } finally {
          setIsGeneratingDesc(false);
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
      collection_id: formData.collection_id,
      is_digital: formData.is_digital,
      digital_content: formData.digital_content
    });
    if (success && !isEditing) {
      setFormData({ name: '', sku: '', price: '', category: categories[0] || 'Home', description: '', image_url: '', stock: '20', collection_id: undefined, is_digital: false, digital_content: '' });
      setIsCustomCategory(false);
      setGalleryImageCount(0);
      setPreviewGallery([]);
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

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-600">
              <input 
                type="checkbox" 
                id="is_digital" 
                name="is_digital" 
                checked={formData.is_digital} 
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
              />
              <label htmlFor="is_digital" className="text-sm font-bold text-slate-700 dark:text-slate-300">Digital Product / E-Book</label>
          </div>

          {formData.is_digital && (
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Book Content / Digital Data
                      <span className="text-xs text-slate-400 ml-2 font-normal">(Paste text or URL for demo)</span>
                  </label>
                  <textarea 
                    name="digital_content" 
                    rows={6} 
                    value={formData.digital_content} 
                    onChange={handleInputChange} 
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none dark:bg-slate-900 dark:text-white font-mono text-xs" 
                    placeholder="# Chapter 1..." 
                  />
              </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                 <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                    {isGeneratingDesc ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                    Auto-generate
                 </button>
            </div>
            <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none dark:bg-slate-900 dark:text-white" placeholder="Product details..." />
          </div>

           {/* Product Media Section */}
           <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Product Media</label>
                    <div className="flex gap-2">
                        <button 
                            type="button" 
                            onClick={() => setShowUrlInput(!showUrlInput)} 
                            className="text-xs text-slate-500 hover:text-primary font-medium flex items-center gap-1 bg-white dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600"
                        >
                            <i className="fas fa-link"></i> {showUrlInput ? 'Cancel URL' : 'Paste URL'}
                        </button>
                    </div>
                </div>

                {showUrlInput && (
                    <div className="mb-4 flex gap-2 animate-fade-in">
                        <input 
                            type="text" 
                            value={urlInputValue} 
                            onChange={(e) => setUrlInputValue(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white"
                        />
                        <button type="button" onClick={handleUrlSubmit} className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-indigo-600">Apply</button>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div className="flex gap-4 items-start">
                        {/* Main Cover Image Preview */}
                        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 flex-shrink-0 flex items-center justify-center relative group shadow-sm">
                            {formData.image_url ? (
                                <>
                                    <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
                                    {formData.collection_id && (
                                        <div className="absolute bottom-1 right-1 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <i className="fas fa-layer-group"></i> Gallery
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-slate-400">
                                    <i className="fas fa-image text-2xl mb-1"></i>
                                    <span className="text-[10px]">No Cover</span>
                                </div>
                            )}
                            <div 
                                onClick={openMediaLibrary} 
                                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <i className="fas fa-pen mb-1"></i>
                                <span className="text-xs font-bold">Change</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col justify-center gap-3 py-2">
                             <button type="button" onClick={openMediaLibrary} className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-600 shadow-sm text-left transition-colors">
                                <i className="fas fa-folder-open mr-2 text-yellow-500"></i> Select from Library
                            </button>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                                Choose a cover image or assign a full gallery collection.
                            </p>
                        </div>
                    </div>

                    {/* Gallery Preview Strip */}
                    {previewGallery.length > 0 && (
                        <div className="mt-2 animate-fade-in">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between">
                                <span>Gallery Preview ({galleryImageCount})</span>
                                {formData.collection_id && <span className="text-primary">Linked Collection #{formData.collection_id}</span>}
                            </p>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {previewGallery.map((img, idx) => (
                                    <div key={idx} className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-slate-200 dark:border-slate-600 relative group bg-slate-200 dark:bg-slate-800">
                                        <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
