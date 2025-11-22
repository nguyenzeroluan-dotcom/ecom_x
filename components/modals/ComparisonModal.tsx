
import React from 'react';
import BaseModal from './BaseModal';
import { useModal } from '../../contexts/ModalContext';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../types';

const ComparisonModal: React.FC = () => {
  const { isOpen, closeModal, modalProps } = useModal();
  const { title, content, products } = modalProps;
  const { addToCart } = useCart();

  // Simple parser to try and format markdown-like tables if possible, 
  // or just render clean text
  const renderContent = (text: string) => {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-700 overflow-x-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {text}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} size="xl" title={title || "Product Comparison"}>
      <div className="space-y-6">
        
        {/* Selected Products Header */}
        <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
          {products && (products as Product[]).map(product => (
            <div key={product.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{product.name}</p>
                <p className="text-xs text-primary font-bold">${Number(product.price).toFixed(2)}</p>
              </div>
              <button 
                onClick={() => addToCart(product)}
                className="ml-auto w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white rounded-full transition-colors text-slate-500"
                title="Add to Cart"
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
            </div>
          ))}
        </div>

        {/* AI Analysis Content */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-wider">
              <i className="fas fa-sparkles"></i> AI Analysis Result
           </div>
           {renderContent(content)}
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={closeModal}
            className="bg-slate-900 dark:bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ComparisonModal;
