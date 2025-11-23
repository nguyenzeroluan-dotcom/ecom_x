
import React, { useState, useEffect, useRef } from 'react';
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
    video_url: '',
    stock: '10',
    collection_id: null as number | null,
    is_digital: false,
    digital_content: ''
  });

  const [galleryImageCount, setGalleryImageCount] = useState(0);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<'youtube' | 'vimeo' | 'file' | null>(null);
  
  // URL Input State
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const magicInputRef = useRef<HTMLInputElement>(null);
  const activeId = initialData?.id || 'new';

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        sku: initialData.sku || '',
        price: initialData.price.toString(),
        category: initialData.category || 'Uncategorized',
        description: initialData.description,
        image_url: initialData.image_url,
        video_url: initialData.video_url || '',
        stock: initialData.stock !== undefined ? initialData.stock.toString() : '10',
        collection_id: initialData.collection_id || null,
        is_digital: initialData.is_digital || false,
        digital_content: initialData.digital_content || ''
      });
      
      if (initialData.gallery_images && initialData.gallery_images.length > 0) {
          setGalleryImageCount(initialData.gallery_images.length);
          setPreviewGallery(initialData.gallery_images);
      } else {
          setGalleryImageCount(0);
          setPreviewGallery([]);
      }
      // Trigger validation on load to set video type
      if (initialData.video_url) validateVideoUrl(initialData.video_url);
    } else {
      setFormData({ 
          name: '', 
          sku: '', 
          price: '', 
          category: categories[0] || 'Home', 
          description: '', 
          image_url: '', 
          video_url: '',
          stock: '20', 
          collection_id: null, 
          is_digital: false, 
          digital_content: '' 
      });
      setGalleryImageCount(0);
      setPreviewGallery([]);
      setVideoType(null);
    }
  }, [activeId, initialData]); 

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

    if (name === 'video_url') {
        validateVideoUrl(value);
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
              setFormData(prev => ({
                  ...prev,
                  image_url: media.imageUrl,
                  collection_id: media.collectionId,
              }));
              
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
          setFormData(prev => ({ 
              ...prev, 
              image_url: urlInputValue.trim(),
              collection_id: null 
          }));
          setPreviewGallery([]);
          setGalleryImageCount(0);
          setIsUrlMode(false);
          setUrlInputValue('');
      }
  };

  const handleRemoveMedia = () => {
      setFormData(prev => ({ ...prev, image_url: '', collection_id: null }));
      setPreviewGallery([]);
      setGalleryImageCount(0);
  };

  const handleMagicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const data = await onMagicAnalysis(e.target.files[0]);
      if (data) {
        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          price: data.price?.toString() || '',
          category: data.category || categories[0],
          description: data.description || '',
          image_url: data.image_url || '',
        }));
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

  const validateVideoUrl = (url: string) => {
      setVideoError(null);
      setVideoType(null);
      if (!url) return true;

      // YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
          setVideoType('youtube');
          return true;
      }
      // Vimeo
      if (url.includes('vimeo.com')) {
          setVideoType('vimeo');
          return true;
      }
      // Direct File
      if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
          setVideoType('file');
          return true;
      }
      
      setVideoError("Unknown video format. Use YouTube, Vimeo, or .mp4 link.");
      return false;
  };

  const getEmbedUrl = (url: string, type: string | null): string => {
      if (!type) return url;
      if (type === 'youtube') {
          let id = '';
          if (url.includes('youtu.be')) id = url.split('/').pop()?.split('?')[0] || '';
          else if (url.includes('v=')) id = url.split('v=')[1]?.split('&')[0] || '';
          return `https://www.youtube.com/embed/${id}`;
      }
      if (type === 'vimeo') {
          const id = url.split('/').pop();
          if (!url.includes('player.vimeo.com')) return `https://player.vimeo.com/video/${id}`;
      }
      return url;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (videoError) return;

    const success = await onSubmit({
      name: formData.name,
      sku: formData.sku || undefined,
      price: parseFloat(formData.price),
      description: formData.description,
      image_url: formData.image_url || 'https://via.placeholder.com/400',
      video_url: formData.video_url || undefined,
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      collection_id: formData.collection_id || undefined,
      is_digital: formData.is_digital,
      digital_content: formData.digital_content
    });
    
    if (success && !isEditing) {
      setFormData({ 
          name: '', 
          sku: '', 
          price: '', 
          category: categories[0] || 'Home', 
          description: '', 
          image_url: '', 
          video_url: '',
          stock: '20', 
          collection_id: null, 
          is_digital: false, 
          digital_content: '' 
      });
      setIsCustomCategory(false);
      setGalleryImageCount(0);
      setPreviewGallery([]);
      setVideoType(null);
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Book Content</label>
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
           <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Product Media</label>
                
                <div className="flex gap-4 items-start flex-wrap sm:flex-nowrap">
                    {/* Main Media Card */}
                    <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden group shadow-sm transition-all hover:border-primary shrink-0">
                        {formData.image_url ? (
                            <>
                                <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <button type="button" onClick={openMediaLibrary} className="text-white text-xs font-bold bg-white/20 px-2 py-1 rounded hover:bg-white/30">Change</button>
                                    <button type="button" onClick={handleRemoveMedia} className="text-red-300 text-xs font-bold hover:text-red-100">Remove</button>
                                </div>
                                {formData.collection_id && (
                                    <div className="absolute bottom-1 right-1 bg-primary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                        Gallery
                                    </div>
                                )}
                            </>
                        ) : isUrlMode ? (
                            <div className="p-2 w-full h-full flex flex-col justify-center gap-2 animate-fade-in">
                                <input 
                                    type="text"
                                    autoFocus 
                                    placeholder="https://..."
                                    className="w-full text-[10px] p-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-primary"
                                    value={urlInputValue}
                                    onChange={(e) => setUrlInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                />
                                <div className="flex gap-1">
                                    <button type="button" onClick={handleUrlSubmit} className="flex-1 bg-primary text-white text-[10px] rounded py-1 font-bold">OK</button>
                                    <button type="button" onClick={() => setIsUrlMode(false)} className="flex-1 bg-slate-200 text-slate-600 text-[10px] rounded py-1">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-400 gap-2">
                                <button type="button" onClick={openMediaLibrary} className="flex flex-col items-center hover:text-primary transition-colors">
                                    <i className="fas fa-image text-2xl"></i>
                                    <span className="text-[10px] font-bold mt-1">Library</span>
                                </button>
                                <div className="w-full h-px bg-slate-200 dark:bg-slate-600"></div>
                                <button type="button" onClick={() => setIsUrlMode(true)} className="text-[10px] font-bold hover:text-primary transition-colors">
                                    Paste URL
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Context / Preview Area */}
                    <div className="flex-1 flex flex-col min-h-[128px]">
                        <div className="mb-3">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Video URL (Optional) 
                                {videoType && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">{videoType}</span>}
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    name="video_url" 
                                    value={formData.video_url} 
                                    onChange={handleInputChange} 
                                    placeholder="https://youtube.com/watch?v=... or .mp4 link"
                                    className={`w-full text-sm border ${videoError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white`}
                                />
                                {formData.video_url && !videoError && (
                                    <div className="h-9 w-9 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-600 relative group">
                                        {videoType === 'youtube' || videoType === 'vimeo' ? (
                                            <div className="w-full h-full flex items-center justify-center bg-black text-white">
                                                <i className="fab fa-youtube text-xs"></i>
                                            </div>
                                        ) : (
                                            <video src={formData.video_url} className="w-full h-full object-cover" muted playsInline />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition-all">
                                            <i className="fas fa-play text-[8px] text-white"></i>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {videoError && <p className="text-[10px] text-red-500 mt-1">{videoError}</p>}
                            {formData.video_url && !videoError && (
                                 <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-black border border-slate-300 dark:border-slate-600 shadow-sm">
                                     {(videoType === 'youtube' || videoType === 'vimeo') ? (
                                         <iframe 
                                            src={getEmbedUrl(formData.video_url, videoType)} 
                                            className="w-full h-full" 
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen 
                                         />
                                     ) : (
                                         <video src={formData.video_url} controls className="w-full h-full" />
                                     )}
                                 </div>
                            )}
                        </div>

                        {formData.image_url ? (
                            <div className="animate-fade-in mt-auto">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-slate-800 dark:text-white">Cover Image Set</span>
                                    <i className="fas fa-check-circle text-green-500"></i>
                                </div>
                                {previewGallery.length > 0 ? (
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                            Linked Gallery: <span className="font-bold text-primary">{galleryImageCount} images</span>
                                        </p>
                                        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar max-w-[200px] sm:max-w-xs">
                                            {previewGallery.map((img, idx) => (
                                                <img key={idx} src={img} alt="" className="w-10 h-10 rounded object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0" />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Single image selected. <br/>To add a gallery, select a Collection from the library.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 dark:text-slate-400 italic mt-auto">
                                No media selected.<br/>Choose an image or collection to display.
                            </div>
                        )}
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
