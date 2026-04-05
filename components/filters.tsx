'use client';

import { FilterOptions } from '@/lib/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import * as Slider from '@radix-ui/react-slider';
import { useTranslations } from 'next-intl';
import { CategoryFilter } from './category-filter';

interface FiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
  maxPrice: number;
}

export function Filters({ filters, onFiltersChange, categories, maxPrice }: FiltersProps) {
  const t = useTranslations();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Search Bar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('filters.searchProducts')}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('filters.sortBy')}
        </label>
        <Select.Root value={filters.sortBy} onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as FilterOptions['sortBy'] })}>
          <Select.Trigger className="w-full px-4 py-2 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50 text-gray-900">
            <Select.Value className="text-gray-900" />
            <Select.Icon>
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50">
              <Select.Viewport>
                <Select.Item value="price-drop" className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer outline-none text-gray-900">
                  <Select.ItemText>{t('filters.sortOptions.priceDrop')}</Select.ItemText>
                </Select.Item>
                <Select.Item value="near-low" className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer outline-none text-gray-900">
                  <Select.ItemText>{t('filters.sortOptions.nearLow')}</Select.ItemText>
                </Select.Item>
                <Select.Item value="price-low" className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer outline-none text-gray-900">
                  <Select.ItemText>{t('filters.sortOptions.priceLow')}</Select.ItemText>
                </Select.Item>
                <Select.Item value="price-high" className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer outline-none text-gray-900">
                  <Select.ItemText>{t('filters.sortOptions.priceHigh')}</Select.ItemText>
                </Select.Item>
                <Select.Item value="name" className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer outline-none text-gray-900">
                  <Select.ItemText>{t('filters.sortOptions.name')}</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategories={filters.categories}
        onCategoryToggle={(category) => {
          if (filters.categories.includes(category)) {
            onFiltersChange({ ...filters, categories: filters.categories.filter(c => c !== category) });
          } else {
            onFiltersChange({ ...filters, categories: [...filters.categories, category] });
          }
        }}
      />

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('filters.priceRange')} ({t('filters.priceRangeLabel', { min: filters.priceRange[0], max: filters.priceRange[1] })})
        </label>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={filters.priceRange}
          onValueChange={(value: number[]) => onFiltersChange({ ...filters, priceRange: [value[0], value[1]] })}
          max={maxPrice}
          step={1}
          minStepsBetweenThumbs={1}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </Slider.Root>
      </div>

      {/* Minimum Price Drop */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('filters.minPriceDropLabel', { percent: filters.minPriceDrop })}
        </label>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[filters.minPriceDrop]}
          onValueChange={(value: number[]) => onFiltersChange({ ...filters, minPriceDrop: value[0] })}
          max={50}
          step={1}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-green-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-green-500 rounded-full hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </Slider.Root>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFiltersChange({
          categories: [],
          priceRange: [0, maxPrice],
          minPriceDrop: 0,
          searchQuery: '',
          sortBy: 'near-low',
          statusFilter: 'all',
        })}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <X className="w-4 h-4" />
        {t('filters.clearFilters')}
      </button>
    </div>
  );
}
