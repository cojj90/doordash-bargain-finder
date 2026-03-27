'use client';

import { Product } from '@/lib/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Package, TrendingDown, TrendingUp, Minus, Sparkles, RotateCcw, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const t = useTranslations();

  const priceDrop = product.priceChangePct !== null && product.priceChangePct < 0;
  const priceRise = product.priceChangePct !== null && product.priceChangePct > 0;
  const isAtAllTimeLow = product.price <= product.allTimeLow;
  const isDisappeared = product.status === 'disappeared';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative",
        "hover:shadow-lg transition-all duration-300",
        priceDrop && "ring-2 ring-green-500 ring-opacity-50",
        isDisappeared && "opacity-60"
      )}
    >
      {/* Price Change Badge */}
      {product.priceChangePct !== null && product.priceChangePct !== 0 && !isDisappeared && (
        <div className={cn(
          "absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-white font-bold text-xs shadow-lg flex items-center gap-1",
          priceDrop ? "bg-green-500" : "bg-red-500"
        )}>
          {priceDrop
            ? <TrendingDown className="w-3.5 h-3.5" />
            : <TrendingUp className="w-3.5 h-3.5" />
          }
          {Math.abs(product.priceChangePct)}%
        </div>
      )}

      {/* Status Badge */}
      {product.status !== 'stable' && (
        <div className={cn(
          "absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-white font-bold text-xs shadow-lg flex items-center gap-1",
          product.status === 'new' ? "bg-purple-500"
            : product.status === 'returning' ? "bg-blue-500"
            : "bg-gray-500"
        )}>
          {product.status === 'new' && <><Sparkles className="w-3.5 h-3.5" /> {t('product.statusNew')}</>}
          {product.status === 'returning' && <><RotateCcw className="w-3.5 h-3.5" /> {t('product.statusBack')}</>}
          {product.status === 'disappeared' && <><EyeOff className="w-3.5 h-3.5" /> {t('product.statusGone')}</>}
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
        {/* Category + All-time Low Badge */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
            {t(`categories.${product.category}`)}
          </span>
          {isAtAllTimeLow && product.timesSeen > 1 && (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
              {t('product.allTimeLow')}
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
            <span className={cn("text-2xl font-bold", isDisappeared ? "text-gray-400" : "text-gray-900")}>
              {formatCurrency(product.price, product.currency)}
            </span>
            {!isDisappeared && product.previousPrice !== null && product.previousPrice !== product.price && (
              <span className="text-sm line-through text-gray-400">
                {formatCurrency(product.previousPrice, product.currency)}
              </span>
            )}
          </div>

          {/* Price context */}
          {isDisappeared ? (
            <p className="text-xs text-gray-400">
              {t('product.lastSeen', { date: formatDate(product.lastSeen) })}
            </p>
          ) : product.timesSeen > 1 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {priceDrop && (
                <span className="text-green-600 font-medium">
                  {t('product.save', { amount: formatCurrency(product.previousPrice! - product.price, product.currency) })}
                </span>
              )}
              {priceRise && (
                <span className="text-red-500 font-medium">
                  {t('product.up', { amount: formatCurrency(product.price - product.previousPrice!, product.currency) })}
                </span>
              )}
              {!priceDrop && !priceRise && product.previousPrice !== null && (
                <span className="flex items-center gap-1">
                  <Minus className="w-3 h-3" /> {t('product.noChange')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price vs historical low */}
        {product.timesSeen > 1 && !isDisappeared && (
          <PricePositionBar product={product} />
        )}
      </div>
    </motion.div>
  );
}

function PricePositionBar({ product }: { product: Product }) {
  const t = useTranslations();
  const range = product.allTimeHigh - product.allTimeLow;
  const aboveLow = product.price - product.allTimeLow;

  // No meaningful range to show
  if (range === 0) return null;

  const pct = Math.min(Math.max((aboveLow / range) * 100, 0), 100);
  const atLow = product.price <= product.allTimeLow;
  const atHigh = product.price >= product.allTimeHigh;

  return (
    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
      {/* Bar */}
      <div className="relative h-1.5 bg-gradient-to-r from-green-200 via-yellow-100 to-red-200 rounded-full">
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm",
            atLow ? "bg-green-500" : atHigh ? "bg-red-500" : "bg-amber-500"
          )}
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span>{formatCurrency(product.allTimeLow, product.currency)}</span>
        {atLow ? (
          <span className="text-green-600 font-semibold">{t('product.lowestEver')}</span>
        ) : (
          <span>
            {t('product.aboveLow', { amount: formatCurrency(aboveLow, product.currency) })}
          </span>
        )}
        <span>{formatCurrency(product.allTimeHigh, product.currency)}</span>
      </div>
    </div>
  );
}
