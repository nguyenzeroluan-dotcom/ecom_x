
import React from 'react';
import { Product } from '../types';
import { useProductCard } from '../hooks/useProductCard';
import ProductCardGrid from './product-card/ProductCardGrid';
import ProductCardList from './product-card/ProductCardList';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
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

  if (layout === 'list') {
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
  }

  // Grid Layout (Default)
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
};

export default ProductCard;
