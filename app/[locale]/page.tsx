'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Product, FilterOptions } from '@/lib/types';
import { fetchProducts, getCategoryStats, getTopDeals, getBiggestSavings } from '@/lib/data';
import { calculateSavings } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { Filters } from '@/components/filters';
import { FiltersHorizontal } from '@/components/filters-horizontal';
import { StatsDashboard } from '@/components/stats-dashboard';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import * as Tabs from '@radix-ui/react-tabs';
import * as Popover from '@radix-ui/react-popover';
import { TrendingUp, DollarSign, Grid3x3, BarChart, Loader2, Search, Filter, ChevronUp, X, Flame, PiggyBank, LayoutGrid, ChartBar, Menu, Settings, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 30;

export default function Home() {
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset displayed items when filters change
  useEffect(() => {
    setDisplayedItems(ITEMS_PER_PAGE);
  }, [filters]);

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

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayedItems);
  }, [filteredProducts, displayedItems]);

  const hasMore = displayedItems < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    // Simulate a small delay for smooth loading experience
    setTimeout(() => {
      setDisplayedItems(prev => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, filteredProducts.length]);

  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    loading: isLoadingMore,
    onLoadMore: loadMore,
  });

  const topDeals = useMemo(() => getTopDeals(products, 12), [products]);
  const biggestSavings = useMemo(() => getBiggestSavings(products, 12), [products]);
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price)), [products]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.searchQuery) count++;
    if (filters.minDiscount > 0) count++;
    if (filters.hasLimit !== null) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (filters.sortBy !== 'discount') count++;
    return count;
  }, [filters, maxPrice]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('app.loadingBargains')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 hidden md:block">{t('app.title')}</h1>
            </div>

            {/* Right side - Navigation and Language */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Navigation Tabs */}
              <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex flex-col items-center justify-center gap-0.5 w-20 sm:w-24 py-2 rounded-lg transition-all text-xs sm:text-sm ${
                  activeTab === 'browse' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="font-medium hidden sm:block">{t('navigation.browseAll')}</span>
                <span className="font-medium sm:hidden">{t('navigation.browseShort')}</span>
              </button>
              
              {/* <button
                onClick={() => setActiveTab('top-deals')}
                className={`flex flex-col items-center justify-center gap-0.5 w-20 sm:w-24 py-2 rounded-lg transition-all text-xs sm:text-sm ${
                  activeTab === 'top-deals' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Flame className="w-5 h-5" />
                <span className="font-medium hidden sm:block">{t('navigation.topDeals')}</span>
                <span className="font-medium sm:hidden">{t('navigation.topDealsShort')}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('biggest-savings')}
                className={`flex flex-col items-center justify-center gap-0.5 w-20 sm:w-24 py-2 rounded-lg transition-all text-xs sm:text-sm ${
                  activeTab === 'biggest-savings' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <PiggyBank className="w-5 h-5" />
                <span className="font-medium hidden sm:block">{t('navigation.biggestSavings')}</span>
                <span className="font-medium sm:hidden">{t('navigation.biggestSavingsShort')}</span>
              </button> */}
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex flex-col items-center justify-center gap-0.5 w-20 sm:w-24 py-2 rounded-lg transition-all text-xs sm:text-sm ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ChartBar className="w-5 h-5" />
                <span className="font-medium">{t('navigation.analytics')}</span>
              </button>
              </nav>

              {/* Menu Button */}
              <Popover.Root open={showMenu} onOpenChange={setShowMenu}>
                <Popover.Trigger asChild>
                  <button className="flex flex-col items-center justify-center gap-0.5 w-20 sm:w-24 py-2 rounded-lg transition-all text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <Menu className="w-5 h-5" />
                    <span className="font-medium">{t('navigation.menu')}</span>
                  </button>
                </Popover.Trigger>
                
                <Popover.Portal>
                  <Popover.Content 
                    className="z-50 mt-2 w-56 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden"
                    sideOffset={5}
                    align="end"
                  >
                    <div className="p-2">
                      {/* Language Section */}
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Language
                        </div>
                        <LanguageSwitcher />
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      {/* Settings (placeholder for future) */}
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-sm">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          {/* Browse Tab with Infinite Scroll */}
          <Tabs.Content value="browse">
            <div className="">
              {/* Filters - Desktop */}
              <div className="hidden lg:block">
                <FiltersHorizontal
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                  maxPrice={maxPrice}
                />
              </div>

              {/* Mobile Filters Modal - Keep existing */}
              <AnimatePresence>
                {showMobileFilters && (
                  <>
                    {/* Backdrop - More subtle */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setShowMobileFilters(false)}
                      className="fixed inset-0 bg-black z-40 lg:hidden"
                    />
                    
                    {/* Filter Panel */}
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                      className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto lg:hidden"
                    >
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">{t('filters.title')}</h2>
                        <button
                          onClick={() => setShowMobileFilters(false)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      <div className="p-4">
                        <Filters
                          filters={filters}
                          onFiltersChange={setFilters}
                          categories={categories}
                          maxPrice={maxPrice}
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Results Counter */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {filteredProducts.length === 0 
                    ? t('product.noProductsFound')
                    : t('app.dealsFound', { count: filteredProducts.length })
                  }
                </span>
              </div>

              {/* Full Width Product Grid */}
              <div>
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('product.noProductsFound')}</h3>
                    <p className="text-gray-600">{t('product.adjustFilters')}</p>
                  </div>
                ) : (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={filters.searchQuery + filters.sortBy}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
                      >
                        {visibleProducts.map((product, index) => (
                          <ProductCard key={product.id} product={product} index={index % ITEMS_PER_PAGE} />
                        ))}
                      </motion.div>
                    </AnimatePresence>

                    {/* Infinite scroll trigger */}
                    {hasMore && (
                      <div 
                        ref={loadMoreRef}
                        className="flex justify-center items-center py-8"
                      >
                        {isLoadingMore ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            <span className="text-gray-600">{t('app.loadingMoreProducts')}</span>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            {t('app.scrollToLoadMore')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show count */}
                    {!hasMore && visibleProducts.length > 0 && (
                      <div className="mt-8 text-center">
                        <p className="text-gray-600">
                          {t('product.showingProducts', { shown: visibleProducts.length, total: filteredProducts.length })}
                        </p>
                      </div>
                    )}
                  </>
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

      {/* Floating Filter Button - Mobile Only */}
      {activeTab === 'browse' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={() => setShowMobileFilters(true)}
          className="fixed bottom-20 left-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors lg:hidden z-30 flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-30"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}