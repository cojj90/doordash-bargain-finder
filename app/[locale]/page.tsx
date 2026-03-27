'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Product, FilterOptions } from '@/lib/types';
import { fetchProducts, getCategoryStats, ScrapeMeta } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { FiltersHorizontal } from '@/components/filters-horizontal';
import { StatsDashboard } from '@/components/stats-dashboard';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import * as Tabs from '@radix-ui/react-tabs';
import * as Popover from '@radix-ui/react-popover';
import { TrendingUp, Loader2, Search, Filter, ChevronUp, X, LayoutGrid, ChartBar, Menu, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filters } from '@/components/filters';

const ITEMS_PER_PAGE = 30;

export default function Home() {
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ScrapeMeta | null>(null);
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
    minPriceDrop: 0,
    searchQuery: '',
    sortBy: 'price-drop',
    statusFilter: 'all',
  });

  useEffect(() => {
    const loadProducts = async () => {
      const { products: data, meta: scrapeMeta } = await fetchProducts();
      setProducts(data);
      setMeta(scrapeMeta);
      const maxPrice = Math.max(...data.map(p => p.price), 0);
      setFilters(prev => ({ ...prev, priceRange: [0, Math.ceil(maxPrice)] }));
      setLoading(false);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    filtered = filtered.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    if (filters.minPriceDrop > 0) {
      filtered = filtered.filter(p =>
        p.priceChangePct !== null && p.priceChangePct <= -filters.minPriceDrop
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === filters.statusFilter);
    }

    const disappeared = filtered.filter(p => p.status === 'disappeared');
    const active = filtered.filter(p => p.status !== 'disappeared');

    const sortFn = (a: Product, b: Product) => {
      switch (filters.sortBy) {
        case 'price-drop':
          return (a.priceChangePct ?? 0) - (b.priceChangePct ?? 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    };

    active.sort(sortFn);
    disappeared.sort(sortFn);

    return [...active, ...disappeared];
  }, [products, filters]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayedItems);
  }, [filteredProducts, displayedItems]);

  const hasMore = displayedItems < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
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

  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.searchQuery) count++;
    if (filters.minPriceDrop > 0) count++;
    if (filters.statusFilter !== 'all') count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (filters.sortBy !== 'price-drop') count++;
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
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 hidden md:block">{t('app.title')}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
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
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('app.language')}
                        </div>
                        <LanguageSwitcher />
                      </div>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.Content value="browse">
            <div className="">
              {/* Scrape Summary Banner */}
              {meta && (meta.newCount > 0 || meta.returningCount > 0 || meta.disappearedCount > 0) && (
                <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-gray-500">
                    {meta.previousScrape
                      ? t('app.updatedVs', { latest: formatDate(meta.latestScrape), previous: formatDate(meta.previousScrape) })
                      : t('app.updated', { date: formatDate(meta.latestScrape) })}:
                  </span>
                  {meta.newCount > 0 && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, statusFilter: prev.statusFilter === 'new' ? 'all' : 'new' }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-colors ${
                        filters.statusFilter === 'new'
                          ? 'bg-purple-500 text-white'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      {t('app.countNew', { count: meta.newCount })}
                    </button>
                  )}
                  {meta.returningCount > 0 && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, statusFilter: prev.statusFilter === 'returning' ? 'all' : 'returning' }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-colors ${
                        filters.statusFilter === 'returning'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      {t('app.countReturned', { count: meta.returningCount })}
                    </button>
                  )}
                  {meta.disappearedCount > 0 && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, statusFilter: prev.statusFilter === 'disappeared' ? 'all' : 'disappeared' }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-colors ${
                        filters.statusFilter === 'disappeared'
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t('app.countGone', { count: meta.disappearedCount })}
                    </button>
                  )}
                  {filters.statusFilter !== 'all' && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, statusFilter: 'all' }))}
                      className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <div className="hidden lg:block pb-4">
                <FiltersHorizontal
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                  maxPrice={maxPrice}
                />
              </div>

              <AnimatePresence>
                {showMobileFilters && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setShowMobileFilters(false)}
                      className="fixed inset-0 bg-black z-40 lg:hidden"
                    />

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

              <div className="flex items-center justify-between pb-4">
                <span className="text-sm text-gray-600">
                  {filteredProducts.length === 0
                    ? t('product.noProductsFound')
                    : t('app.dealsFound', { count: filteredProducts.length })
                  }
                </span>
              </div>

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

          <Tabs.Content value="analytics">
            <StatsDashboard products={products} categoryStats={categoryStats} />
          </Tabs.Content>
        </Tabs.Root>
      </main>

      {activeTab === 'browse' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={() => setShowMobileFilters(true)}
          className="fixed bottom-14 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors lg:hidden z-30"
        >
          <Filter className="w-6 h-6" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </motion.button>
      )}

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-28 right-4 lg:bottom-14 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-30"
            aria-label={t('app.scrollToTop')}
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 inset-x-0 z-20 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center">
          <a
            href="https://buymeacoffee.com/bargain.hunter"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <Coffee className="w-4 h-4" />
            {t('app.buyMeACoffee')}
          </a>
        </div>
      </footer>
    </div>
  );
}
