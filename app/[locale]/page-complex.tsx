'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Product, FilterOptions } from '@/lib/types';
import { fetchProducts, getCategoryStats, getTopDeals, getBiggestSavings } from '@/lib/data';
import { calculateSavings } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { Filters } from '@/components/filters';
import { StatsDashboard } from '@/components/stats-dashboard';
import { LanguageSwitcher } from '@/components/language-switcher';
import * as Tabs from '@radix-ui/react-tabs';
import { TrendingUp, DollarSign, Grid3x3, BarChart, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 1000],
    minDiscount: 0,
    searchQuery: '',
    sortBy: 'discount',
    hasLimit: null,
  });

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
      const maxPrice = Math.max(...data.map(p => p.price));
      setFilters(prev => ({ ...prev, priceRange: [0, Math.ceil(maxPrice)] }));
      setLoading(false);
    };
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort();
  }, [products]);

  const categoryStats = useMemo(() => {
    return getCategoryStats(products);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Apply price range filter
    filtered = filtered.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Apply minimum discount filter
    if (filters.minDiscount > 0) {
      filtered = filtered.filter(p => (p.discount || 0) >= filters.minDiscount);
    }

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Apply limit filter
    if (filters.hasLimit !== null) {
      filtered = filtered.filter(p => 
        filters.hasLimit ? p.limit !== '' : p.limit === ''
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'discount':
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'savings':
        filtered.sort((a, b) => 
          calculateSavings(b.originalPrice, b.price) - 
          calculateSavings(a.originalPrice, a.price)
        );
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [products, filters]);

  const topDeals = useMemo(() => getTopDeals(products, 12), [products]);
  const biggestSavings = useMemo(() => getBiggestSavings(products, 12), [products]);
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price)), [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bargains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
                <p className="text-sm text-gray-600">{t('app.subtitle', { count: products.length })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {t('app.dealsFound', { count: filteredProducts.length })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex gap-2 mb-8 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            <Tabs.Trigger
              value="browse"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 hover:text-gray-900"
            >
              <Grid3x3 className="w-4 h-4" />
              {t('navigation.browseAll')}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="top-deals"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 hover:text-gray-900"
            >
              <TrendingUp className="w-4 h-4" />
              {t('navigation.topDeals')}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="biggest-savings"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 hover:text-gray-900"
            >
              <DollarSign className="w-4 h-4" />
              {t('navigation.biggestSavings')}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="analytics"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 hover:text-gray-900"
            >
              <BarChart className="w-4 h-4" />
              {t('navigation.analytics')}
            </Tabs.Trigger>
          </Tabs.List>

          {/* Browse Tab */}
          <Tabs.Content value="browse">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <Filters
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                  maxPrice={maxPrice}
                />
              </div>
              <div className="lg:col-span-3">
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('product.noProductsFound')}</h3>
                    <p className="text-gray-600">{t('product.adjustFilters')}</p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={filters.searchQuery + filters.sortBy}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                      {filteredProducts.slice(0, 30).map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
                {filteredProducts.length > 30 && (
                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      {t('product.showingProducts', { shown: 30, total: filteredProducts.length })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Tabs.Content>

          {/* Top Deals Tab */}
          <Tabs.Content value="top-deals">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{t('topDeals.title')}</h2>
                <p>{t('topDeals.subtitle')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {topDeals.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>
          </Tabs.Content>

          {/* Biggest Savings Tab */}
          <Tabs.Content value="biggest-savings">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{t('biggestSavings.title')}</h2>
                <p>{t('biggestSavings.subtitle')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {biggestSavings.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>
          </Tabs.Content>

          {/* Analytics Tab */}
          <Tabs.Content value="analytics">
            <StatsDashboard products={products} categoryStats={categoryStats} />
          </Tabs.Content>
        </Tabs.Root>
      </main>
    </div>
  );
}