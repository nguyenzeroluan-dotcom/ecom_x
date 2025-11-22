

import React from 'react';
import { useModal } from '../../contexts/ModalContext';
import { ModalType } from '../../types';
import ProductDetailModal from './ProductDetailModal';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import ComparisonModal from './ComparisonModal';
import AuthModal from './AuthModal';
import MediaSelectorModal from '../manager/media/MediaSelectorModal';

const ModalRoot: React.FC = () => {
  const { isOpen, modalType } = useModal();

  if (!isOpen) return null;

  switch (modalType) {
    case ModalType.PRODUCT_DETAIL:
      return <ProductDetailModal />;
    case ModalType.CONFIRM:
      return <ConfirmModal />;
    case ModalType.SUCCESS:
      return <SuccessModal />;
    case ModalType.COMPARISON:
      return <ComparisonModal />;
    case ModalType.AUTH:
      return <AuthModal />;
    case ModalType.MEDIA_SELECTOR:
      return <MediaSelectorModal />;
    default:
      return null;
  }
};

export default ModalRoot;