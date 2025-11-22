

import React from 'react';
import { useModal } from '../../contexts/ModalContext';
import { ModalType } from '../../types';
import ProductDetailModal from './ProductDetailModal';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import ComparisonModal from './ComparisonModal';
import AuthModal from './AuthModal';
import MediaSelectorModal from '../manager/media/MediaSelectorModal';
import MediaDetailModal from '../manager/media/MediaDetailModal';
import CollectionManagerModal from '../manager/media/CollectionManagerModal';
import CollectionEditModal from '../manager/media/CollectionEditModal';

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
    case ModalType.MEDIA_DETAIL:
      return <MediaDetailModal />;
    case ModalType.COLLECTION_MANAGER:
      return <CollectionManagerModal />;
    case ModalType.COLLECTION_EDIT:
        return <CollectionEditModal />;
    default:
      return null;
  }
};

export default ModalRoot;