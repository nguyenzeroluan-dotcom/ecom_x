

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ModalType, ModalContextType } from '../types';

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(ModalType.NONE);
  const [modalProps, setModalProps] = useState<any>({});

  const openModal = (type: ModalType, props: any = {}) => {
    setModalType(type);
    setModalProps(props);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setModalType(ModalType.NONE);
      setModalProps({});
    }, 300); // Clear state after animation
  };

  return (
    <ModalContext.Provider value={{ isOpen, modalType, modalProps, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};