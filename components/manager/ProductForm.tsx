
import React, { useState, useEffect, useRef } from 'react';
import { Product, ModalType } from '../../types';
import { useModal } from '../../contexts/ModalContext';
import { generateProductDescription } from '../../services/geminiService';

// View Components
import ProductAIImport from './product/form/ProductAIImport';
import ProductBasicInfo from './product/form/ProductBasicInfo';
import ProductDigitalSettings from './product/form/ProductDigitalSettings';
import ProductDescription from './product/form/ProductDescription';
import ProductMediaSection from './product/form/ProductMediaSection';

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
        <ProductAIImport 
          onMagicUpload={handleMagicUpload}
          isAnalyzing={isAnalyzing}
          magicInputRef={magicInputRef}
        />
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          {isEditing && (
            <button onClick={onCancel} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-2 py-1 rounded transition">Cancel</button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <ProductBasicInfo 
            formData={formData}
            handleInputChange={handleInputChange}
            generateSku={generateSku}
            categories={categories}
            isCustomCategory={isCustomCategory}
            setIsCustomCategory={setIsCustomCategory}
          />

          <ProductDigitalSettings 
            formData={formData}
            handleCheckboxChange={handleCheckboxChange}
            handleInputChange={handleInputChange}
          />

          <ProductDescription 
            description={formData.description}
            handleInputChange={handleInputChange}
            handleGenerateDescription={handleGenerateDescription}
            isGeneratingDesc={isGeneratingDesc}
          />

          <ProductMediaSection 
            formData={formData}
            handleInputChange={handleInputChange}
            videoError={videoError}
            videoType={videoType}
            isUrlMode={isUrlMode}
            setIsUrlMode={setIsUrlMode}
            urlInputValue={urlInputValue}
            setUrlInputValue={setUrlInputValue}
            handleUrlSubmit={handleUrlSubmit}
            openMediaLibrary={openMediaLibrary}
            handleRemoveMedia={handleRemoveMedia}
            previewGallery={previewGallery}
            galleryImageCount={galleryImageCount}
          />

          <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center ${isEditing ? 'bg-secondary hover:bg-green-600 shadow-green-500/20' : 'bg-primary hover:bg-indigo-600 shadow-indigo-500/20'} disabled:opacity-50`}>
            {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</> : isEditing ? <><i className="fas fa-save mr-2"></i> Update Product</> : <><i className="fas fa-plus mr-2"></i> Add Product</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
