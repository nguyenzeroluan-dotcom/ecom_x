
import React from 'react';
import BaseModal from '../../modals/BaseModal';
import { useModal } from '../../../contexts/ModalContext';
import { Product, ModalType } from '../../../types';
import ImageCarousel from '../../common/ImageCarousel';

const ProductDetailAdminModal: React.FC = () => {
  const { isOpen, closeModal, modalProps, openModal } = useModal();
  const { product, onEdit, onDelete } = modalProps as { 
      product: Product; 
      onEdit: (p: Product) => void; 
      onDelete: (id: number | string) => void; 
  };

  if (!product) return null;

  // Construct display media: [Cover, Video?, ...Gallery]
  const displayImages = [product.image_url];
  if (product.video_url) {
      displayImages.push(product.video_url);
  }
  if (product.gallery_images && product.gallery_images.length > 0) {
      displayImages.push(...product.gallery_images);
  }

  const handleEditClick = () => {
      onEdit(product);
      closeModal();
  };

  const handleDeleteClick = () => {
      // Close this modal first, then let the delete confirmation open from the manager
      closeModal();
      setTimeout(() => onDelete(product.id), 100);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} size="lg" title="Product Details (Admin View)">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Media Section */}
        <div className="w-full md:w-1/2">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <ImageCarousel images={displayImages} alt={product.name} />
          </div>
          
          {/* Media Stats */}
          <div className="mt-4 flex gap-4 text-xs text-slate-500 dark:text-slate-400 justify-center">
              <span className="flex items-center gap-1"><i className="fas fa-image"></i> {displayImages.length} Media Items</span>
              {product.video_url && <span className="flex items-center gap-1 text-primary font-bold"><i className="fas fa-video"></i> Video</span>}
              {product.collection_id && (
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold"><i className="fas fa-layer-group"></i> Collection #{product.collection_id}</span>
              )}
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="space-y-6 flex-1">
              
              {/* Header Info */}
              <div>
                  <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          {product.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          (product.stock || 0) > 5 ? 'bg-green-100 text-green-700' : 
                          (product.stock || 0) > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                          {(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{product.name}</h2>
                  <p className="text-sm text-slate-500 font-mono">SKU: {product.sku || 'N/A'}</p>
              </div>

              {/* Price & Stock Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">Price</p>
                      <p className="text-xl font-bold text-primary">${Number(product.price).toFixed(2)}</p>
                  </div>
                  <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">Inventory</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{product.stock} units</p>
                  </div>
              </div>

              {/* Description */}
              <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Description</h4>
                  <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto custom-scrollbar p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg">
                      <p>{product.description}</p>
                  </div>
              </div>

              {/* Digital Info */}
              {product.is_digital && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 flex items-start gap-3">
                      <i className="fas fa-file-download text-purple-500 mt-1"></i>
                      <div>
                          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">Digital Product</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400 truncate w-48">Content attached.</p>
                      </div>
                  </div>
              )}
          </div>

          {/* Actions */}
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700 flex gap-4">
              <button 
                  onClick={handleEditClick}
                  className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                  <i className="fas fa-edit"></i> Edit Product
              </button>
              <button 
                  onClick={handleDeleteClick}
                  className="w-12 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all border border-red-100 dark:border-red-900/50"
                  title="Delete Product"
              >
                  <i className="fas fa-trash"></i>
              </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ProductDetailAdminModal;
