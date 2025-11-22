

import React from 'react';
import BaseModal from './BaseModal';
import { useModal } from '../../contexts/ModalContext';

const SuccessModal: React.FC = () => {
  const { isOpen, closeModal, modalProps } = useModal();
  const { title, message } = modalProps;

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} size="sm" title="">
      <div className="text-center py-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-small">
          <i className="fas fa-check text-4xl text-green-500"></i>
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{title || "Success!"}</h3>
        <p className="text-slate-500 mb-8">{message}</p>

        <button 
          onClick={closeModal}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all"
        >
          Continue
        </button>
      </div>
    </BaseModal>
  );
};

export default SuccessModal;