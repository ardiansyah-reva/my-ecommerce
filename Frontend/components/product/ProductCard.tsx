// components/product/ProductCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  const imageUrl = product.media && product.media[0]?.url
    ? `http://localhost:8000${product.media[0].url}`
    : '/placeholder-product.jpg';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {product.stock < 10 && product.stock > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Stok Terbatas
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Habis</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-800 line-clamp-2 h-12 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          {product.rating && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={16} fill="currentColor" />
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
          )}
          <span className="text-xs text-gray-500">
            Terjual {Math.floor(Math.random() * 500)}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-xl font-bold text-orange-600">
            {formatPrice(product.price)}
          </div>
          {product.brand && (
            <div className="text-xs text-gray-500 mt-1">{product.brand.name}</div>
          )}
        </div>

        <div className="mt-4">
          <Button
            onClick={() => onAddToCart?.(product)}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2"
            size="sm"
          >
            <ShoppingCart size={16} />
            {product.stock === 0 ? 'Habis' : 'Tambah ke Keranjang'}
          </Button>
        </div>
      </div>
    </div>
  );
};