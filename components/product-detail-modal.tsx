'use client';

import { Product } from '@/lib/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { X, TrendingDown, TrendingUp, BarChart3, Eye, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useEffect } from 'react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const t = useTranslations();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const chartData = product.priceHistory.map(p => {
    const y = +p.date.slice(0, 4);
    const m = +p.date.slice(4, 6) - 1;
    const d = +p.date.slice(6, 8);
    return { timestamp: new Date(y, m, d).getTime(), price: p.price };
  });

  const hasChart = chartData.length > 1;

  const priceMin = Math.min(...product.priceHistory.map(p => p.price));
  const priceMax = Math.max(...product.priceHistory.map(p => p.price));
  const yPadding = (priceMax - priceMin) * 0.15 || 1;
  const yDomain: [number, number] = [
    Math.max(0, Math.floor(priceMin - yPadding)),
    Math.ceil(priceMax + yPadding),
  ];

  const stats = [
    { label: t('product.allTimeLow'), value: formatCurrency(product.allTimeLow, product.currency), color: 'text-green-600' },
    { label: t('product.allTimeHigh'), value: formatCurrency(product.allTimeHigh, product.currency), color: 'text-red-500' },
    { label: t('product.averagePrice'), value: formatCurrency(product.avgPrice, product.currency), color: 'text-blue-600' },
    { label: t('product.observations'), value: String(product.timesSeen), color: 'text-gray-700' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex gap-4 pr-10">
            <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gray-50 relative overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  sizes="80px"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                {t(`categories.${product.category}`)}
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1 leading-tight">
                {product.name}
              </h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(product.price, product.currency)}
                </span>
                {product.previousPrice !== null && product.previousPrice !== product.price && (
                  <span className="text-sm line-through text-gray-400">
                    {formatCurrency(product.previousPrice, product.currency)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={cn("text-sm font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              {t('product.priceHistory')}
            </h3>

            {hasChart ? (
              <div className="w-full bg-gray-50 rounded-xl p-3">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      scale="time"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(ts) => {
                        const d = new Date(ts);
                        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        return `${d.getDate()} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
                      }}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      domain={yDomain}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickFormatter={(v) => `$${v}`}
                      width={55}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value, product.currency), t('filters.price')]}
                      labelFormatter={(ts) => {
                        const d = new Date(ts);
                        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                      }}
                      contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
                    />
                    <ReferenceLine
                      y={product.allTimeLow}
                      stroke="#16a34a"
                      strokeDasharray="4 4"
                      label={{ value: t('product.allTimeLow'), position: 'left', fontSize: 10, fill: '#16a34a' }}
                    />
                    <ReferenceLine
                      y={product.avgPrice}
                      stroke="#3b82f6"
                      strokeDasharray="4 4"
                      label={{ value: t('product.averagePrice'), position: 'left', fontSize: 10, fill: '#3b82f6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Eye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t('product.notEnoughData')}</p>
              </div>
            )}
          </div>

          {/* First/Last seen */}
          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-4">
            <span>{t('product.firstSeen', { date: formatDate(product.firstSeen) })}</span>
            <span>{t('product.lastSeenDate', { date: formatDate(product.lastSeen) })}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
