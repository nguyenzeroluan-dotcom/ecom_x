

import React from 'react';
import BaseModal from './BaseModal';
import { useModal } from '../../contexts/ModalContext';

const ConfirmModal: React.FC = () => {
  const { isOpen, closeModal, modalProps } = useModal();
  const { title, message, onConfirm, isDestructive = false } = modalProps;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} size="sm" title={title || "Please Confirm"}>
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDestructive ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
        }`}>
          <i className={`fas ${isDestructive ? 'fa-exclamation-triangle' : 'fa-question'} text-2xl`}></i>
        </div>
        
        <p className="text-slate-600 mb-8 text-lg">
          {message}
        </p>

        <div className="flex gap-3">
          <button 
            onClick={closeModal}
            className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-colors ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-primary hover:bg-indigo-600 shadow-indigo-500/20'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;