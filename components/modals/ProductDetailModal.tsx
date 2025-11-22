


import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { useModal } from '../../contexts/ModalContext';
import { useCart } from '../../contexts/CartContext';
import { Product, AIReview } from '../../types';
import { generateAIReviews } from '../../services/geminiService';
import ImageCarousel from '../common/ImageCarousel';

const ProductDetailModal: React.FC = () => {
  const { isOpen, closeModal, modalProps } = useModal();
  const { addToCart } = useCart();
  const product = modalProps.product as Product;
  
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [reviews, setReviews] = useState<AIReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  if (!product) return null;
  
  const displayImages = (product.gallery_images && product.gallery_images.length > 0) 
      ? product.gallery_images 
      : [product.image_url];

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

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} size="lg" title="Product Details">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image */}
        <div className="w-full md:w-1/2">
          <div className="aspect-square">
            <ImageCarousel images={displayImages} alt={product.name} />
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex gap-4 border-b border-slate-100 dark:border-slate-700 mb-4">
             <button 
                className={`pb-2 font-bold text-sm ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
                onClick={() => setActiveTab('details')}
             >
                 Overview
             </button>
             <button 
                className={`pb-2 font-bold text-sm ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
                onClick={() => { setActiveTab('reviews'); fetchReviews(); }}
             >
                 AI Reviews
             </button>
          </div>

          {activeTab === 'details' ? (
              <>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h2>
                <div className="text-4xl font-bold text-primary mb-6">
                    ${Number(product.price).toFixed(2)}
                </div>
                <div className="prose prose-slate dark:prose-invert mb-8 flex-grow">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>
                </div>
              </>
          ) : (
              <div className="flex-grow space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {loadingReviews && <div className="text-center py-8 text-slate-400"><i className="fas fa-spinner fa-spin text-2xl"></i><p>Generating personas...</p></div>}
                  {!loadingReviews && reviews.map((review, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                          <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-800 dark:text-white text-sm">{review.persona}</span>
                              <div className="text-yellow-400 text-xs">
                                  {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-slate-300'}`}></i>)}
                              </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm italic">"{review.text}"</p>
                      </div>
                  ))}
              </div>
          )}

          <div className="flex gap-4 mt-auto pt-4">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-slate-900 dark:bg-primary hover:bg-primary text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center group"
            >
              <span className="mr-2">Add to Cart</span>
              <i className="fas fa-arrow-right transform group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ProductDetailModal;
