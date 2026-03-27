'use client';

import { Product, CategoryStats } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp, Package, Sparkles, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useTranslations } from 'next-intl';

interface StatsDashboardProps {
  products: Product[];
  categoryStats: CategoryStats[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function StatsDashboard({ products, categoryStats }: StatsDashboardProps) {
  const t = useTranslations();
  const totalProducts = products.length;

  const priceDrops = products.filter(p => p.priceChangePct !== null && p.priceChangePct < 0);
  const priceRises = products.filter(p => p.priceChangePct !== null && p.priceChangePct > 0);
  const newProducts = products.filter(p => p.status === 'new' || p.status === 'returning');
  const atAllTimeLow = products.filter(p => p.price <= p.allTimeLow && p.timesSeen > 1);

  const stats = [
    {
      label: t('stats.totalProducts'),
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: t('stats.priceDrops'),
      value: priceDrops.length.toLocaleString(),
      icon: TrendingDown,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: t('stats.priceRises'),
      value: priceRises.length.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: t('stats.newReturning'),
      value: newProducts.length.toLocaleString(),
      icon: Sparkles,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  const pieData = categoryStats.slice(0, 8).map(cat => ({
    name: cat.name,
    value: cat.productCount,
  }));

  const barData = categoryStats.slice(0, 10).map(cat => ({
    name: cat.name.substring(0, 8),
    change: parseFloat(cat.avgPriceChange.toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-hidden"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            {t('stats.categoryDistribution')}
          </h3>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Avg Price Change by Category */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-hidden"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            {t('stats.avgPriceChangeByCategory')}
          </h3>
          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="change" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
