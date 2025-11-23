
import React from 'react';
import { Product, MarketViewMode } from '../types';
import { useProductCard } from '../hooks/useProductCard';
import ProductCardGrid from './product-card/ProductCardGrid';
import ProductCardList from './product-card/ProductCardList';
import ProductCardCompact from './product-card/ProductCardCompact';
import ProductCardFlip from './product-card/ProductCardFlip';

interface ProductCardProps {
  product: Product;
  layout?: MarketViewMode; // Updated type
  index?: number; // For staggered animation
}

const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid', index = 0 }) => {
  // Hook contains all business logic, state, and handlers
  const {
    stock,
    isLowStock,
    isOutOfStock,
    isWishlisted,
    rating,
    reviews,
    displayImages,
    currentImageIndex,
    hasGallery,
    handlers
  } = useProductCard(product);

  const animationDelay = `${index * 50}ms`;

  switch (layout) {
    case 'list':
      return (
        <ProductCardList 
          product={product}
          animationDelay={animationDelay}
          isOutOfStock={isOutOfStock}
          isWishlisted={isWishlisted}
          rating={rating}
          reviews={reviews}
          handlers={handlers}
        />
      );
    case 'compact':
      return (
        <ProductCardCompact
          product={product}
          animationDelay={animationDelay}
          isOutOfStock={isOutOfStock}
          isLowStock={isLowStock}
          isWishlisted={isWishlisted}
          rating={rating}
          handlers={handlers}
        />
      );
    case 'flip':
      return (
        <ProductCardFlip
          product={product}
          animationDelay={animationDelay}
          isOutOfStock={isOutOfStock}
          isWishlisted={isWishlisted}
          rating={rating}
          reviews={reviews}
          displayImages={displayImages}
          handlers={handlers}
        />
      );
    case 'grid':
    default:
      return (
        <ProductCardGrid 
          product={product}
          animationDelay={animationDelay}
          displayImages={displayImages}
          currentImageIndex={currentImageIndex}
          hasGallery={hasGallery}
          isOutOfStock={isOutOfStock}
          isLowStock={isLowStock}
          isWishlisted={isWishlisted}
          rating={rating}
          reviews={reviews}
          stock={stock}
          handlers={handlers}
        />
      );
  }
};

export default ProductCard;
