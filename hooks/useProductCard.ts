import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, ModalType } from '../types';
import { useModal } from '../contexts/ModalContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import { usePreferences } from '../contexts/PreferencesContext';

export const useProductCard = (product: Product) => {
  const { openModal } = useModal();
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  const { wishlist, toggleWishlist, addToRecentlyViewed, addToCompare } = usePreferences();

  // Derived State
  const stock = product.stock !== undefined ? product.stock : 10;
  const isLowStock = stock > 0 && stock < 5;
  const isOutOfStock = stock === 0;
  const isWishlisted = wishlist.includes(product.id);
  const rating = product.rating || 4.5;
  const reviews = product.reviews_count || Math.floor(Math.random() * 50) + 5;

  // Carousel Logic
  const { gallery_images } = product;
  const hasGallery = gallery_images && gallery_images.length > 0;
  const displayImages = useMemo(() => 
    hasGallery ? [product.image_url, ...gallery_images!] : [product.image_url], 
  [product.image_url, gallery_images, hasGallery]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hoverIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, []);

  const startImageCycle = () => {
    if (!hasGallery || displayImages.length <= 1) return;
    hoverIntervalRef.current = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }, 1200);
  };

  const stopImageCycle = () => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }
    setCurrentImageIndex(0);
  };

  // Handlers
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    addToRecentlyViewed(product);
    openModal(ModalType.PRODUCT_DETAIL, { product });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
      addNotification('success', `Added ${product.name} to cart`);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    addNotification('info', isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCompare(product);
    addNotification('info', `${product.name} added to comparison.`);
  };

  return {
    // State & Data
    stock,
    isLowStock,
    isOutOfStock,
    isWishlisted,
    rating,
    reviews,
    displayImages,
    currentImageIndex,
    hasGallery,
    
    // Handlers
    handlers: {
      startImageCycle,
      stopImageCycle,
      handleQuickView,
      handleAddToCart,
      handleWishlist,
      handleAddToCompare
    }
  };
};