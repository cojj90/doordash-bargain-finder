'use client';

import { Product } from '@/lib/types';
import { formatCurrency, calculateSavings, cn } from '@/lib/utils';
import { ShoppingCart, Tag, Package, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const t = useTranslations();
  const savings = calculateSavings(product.originalPrice, product.price);
  const hasHighDiscount = product.discount && product.discount >= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative",
        "hover:shadow-lg transition-all duration-300",
        hasHighDiscount && "ring-2 ring-red-500 ring-opacity-50"
      )}
    >
      {/* Discount Badge - Always visible */}
      {product.discount && (
        <div className={cn(
          "absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg",
          product.discount >= 40 ? "bg-red-500" : 
          product.discount >= 30 ? "bg-orange-500" : 
          product.discount >= 20 ? "bg-yellow-500" : "bg-blue-500"
        )}>
          {t('product.off', { percent: product.discount })}
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-48 bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
            {t(`categories.${product.category}`)}
          </span>
          {product.limit && (
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {t('product.limit', { count: product.limit })}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[48px]">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.originalPrice, product.currency)}
              </span>
            )}
          </div>
          
          {savings > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('product.save', { amount: formatCurrency(savings, product.currency) })}
              </span>
            </div>
          )}
        </div>

        {/* Store Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {product.storeName} • {product.storeId}
          </p>
        </div>

        {/* Action Button */}
        <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <ShoppingCart className="w-4 h-4" />
          {t('product.viewDeal')}
        </button>
      </div>
    </motion.div>
  );
}
