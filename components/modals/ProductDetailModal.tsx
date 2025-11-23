
import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { useModal } from '../../contexts/ModalContext';
import { useCart } from '../../contexts/CartContext';
import { Product, AIReview, EBookMetadata } from '../../types';
import { generateAIReviews } from '../../services/geminiService';
import { getEBookMetadata } from '../../services/ebookService';
import ImageCarousel from '../common/ImageCarousel';
import BookReader from '../reader/BookReader';

const ProductDetailModal: React.FC = () => {
  const { isOpen, closeModal, modalProps } = useModal();
  const { addToCart } = useCart();
  const product = modalProps.product as Product;
  
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [reviews, setReviews] = useState<AIReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // E-Book Preview State
  const [ebookMeta, setEbookMeta] = useState<EBookMetadata | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
      // Fetch ebook metadata if digital
      if (product && product.is_digital) {
          getEBookMetadata(product.id).then(setEbookMeta).catch(console.error);
      } else {
          setEbookMeta(null);
      }
      // Reset states
      setIsPreviewOpen(false);
      setReviews([]);
      setActiveTab('details');
  }, [product]);

  if (!product) return null;
  
  // If Preview Mode is Active, render Reader INSTEAD of Modal content
  if (isPreviewOpen) {
      return <BookReader product={product} onClose={() => setIsPreviewOpen(false)} mode="preview" />;
  }
  
  // Construct display media: [Cover, Video?, ...Gallery]
  const displayImages = [product.image_url];
  if (product.video_url) {
      displayImages.push(product.video_url);
  }
  if (product.gallery_images && product.gallery_images.length > 0) {
      displayImages.push(...product.gallery_images);
  }

  const handleAddToCart = () => {
    addToCart(product);
    closeModal();
  };

  const fetchReviews = async () => {
      if (reviews.length > 0) return;
      setLoadingReviews(true);
      try {
          const data = await generateAIReviews(product.name);
          setReviews(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingReviews(false);
      }
  };

  const canPreview = product.is_digital && ebookMeta && (ebookMeta.preview_percentage || 0) > 0;

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} size="lg" title="Product Details">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image */}
        <div className="w-full md:w-1/2">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
            <ImageCarousel images={displayImages} alt={product.name} />
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex gap-4 border-b border-slate-100 dark:border-slate-700 mb-4">
             <button 
                className={`pb-2 font-bold text-sm transition-colors ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => setActiveTab('details')}
             >
                 Overview
             </button>
             <button 
                className={`pb-2 font-bold text-sm transition-colors ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => { setActiveTab('reviews'); fetchReviews(); }}
             >
                 AI Reviews
             </button>
          </div>

          {activeTab === 'details' ? (
              <>
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{product.name}</h2>
                    {product.is_digital && (
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <i className="fas fa-bolt"></i> Instant
                        </span>
                    )}
                </div>
                
                <div className="text-4xl font-bold text-primary mb-6 font-display">
                    ${Number(product.price).toFixed(2)}
                </div>
                
                <div className="prose prose-slate dark:prose-invert mb-8 flex-grow custom-scrollbar overflow-y-auto max-h-[200px]">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>
                </div>
              </>
          ) : (
              <div className="flex-grow space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {loadingReviews && (
                      <div className="text-center py-8 text-slate-400">
                          <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                          <p className="text-sm">Analyzing sentiment...</p>
                      </div>
                  )}
                  {!loadingReviews && reviews.map((review, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 animate-fade-in">
                          <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                  <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-[10px]"><i className="fas fa-user"></i></div>
                                  {review.persona}
                              </span>
                              <div className="text-yellow-400 text-xs">
                                  {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-slate-300'}`}></i>)}
                              </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm italic">"{review.text}"</p>
                      </div>
                  ))}
              </div>
          )}

          <div className="flex gap-3 mt-auto pt-4">
            {canPreview && (
                <button 
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary py-4 rounded-xl font-bold transition-all flex items-center justify-center group"
                >
                    <i className="fas fa-book-open mr-2 group-hover:scale-110 transition-transform"></i> Preview
                </button>
            )}
            
            <button 
              onClick={handleAddToCart}
              className={`flex-1 bg-slate-900 dark:bg-primary hover:bg-primary dark:hover:bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center group ${!canPreview ? 'w-full' : ''}`}
            >
              <span className="mr-2">Add to Cart</span>
              <i className="fas fa-shopping-bag transform group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ProductDetailModal;
