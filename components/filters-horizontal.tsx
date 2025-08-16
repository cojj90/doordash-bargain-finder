'use client';

import { FilterOptions } from '@/lib/types';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as Slider from '@radix-ui/react-slider';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWineBottle, FaBaby, FaBreadSlice, FaPaintBrush, FaCandyCane, FaCheese,
  FaSnowflake, FaHome, FaDrumstickBite, FaBox, FaShower, FaDog, FaPills,
  FaCarrot, FaCookie, FaGlassWhiskey, FaGlassMartiniAlt
} from 'react-icons/fa';
import { 
  GiMilkCarton, GiFlour, GiMeat, GiChocolateBar, GiSlicedBread, GiTomato,
  GiPopcorn, GiFlowerPot, GiFishCorpse, GiPill, GiHotMeal, GiCampingTent
} from 'react-icons/gi';
import { MdLocalPharmacy, MdPets } from 'react-icons/md';
import { BiSolidWine } from 'react-icons/bi';

interface FiltersHorizontalProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
  maxPrice: number;
}

// Simplified icon mapping for categories
const categoryIcons: Record<string, React.ElementType> = {
  alcohol: BiSolidWine,
  baby: FaBaby,
  bakery: GiSlicedBread,
  beauty: FaPaintBrush,
  candy: GiChocolateBar,
  deli: FaCheese,
  diary: GiMilkCarton, // dairy misspelled in data
  dairy: GiMilkCarton,
  drinks: FaGlassMartiniAlt,
  flowers: GiFlowerPot,
  frozen: FaSnowflake,
  household: FaHome,
  meat: GiMeat,
  medecine: MdLocalPharmacy, // medicine misspelled
  medicine: MdLocalPharmacy,
  outdoor: GiCampingTent,
  pantry: GiFlour,
  personal: FaShower,
  pet: MdPets,
  pets: MdPets,
  prepared: GiHotMeal,
  produce: GiTomato,
  seafood: GiFishCorpse,
  snacks: GiPopcorn,
  viatamin: GiPill, // vitamin misspelled
  vitamin: GiPill,
};

export function FiltersHorizontal({ filters, onFiltersChange, categories, maxPrice }: FiltersHorizontalProps) {
  const t = useTranslations();
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  
  // Helper to format price range label
  const getPriceLabel = () => {
    if (filters.priceRange[0] === 0 && filters.priceRange[1] === maxPrice) {
      return 'Any price';
    }
    return `$${filters.priceRange[0]} - $${filters.priceRange[1]}`;
  };

  // Helper to format discount label
  const getDiscountLabel = () => {
    if (filters.minDiscount === 0) return 'Any discount';
    return `${filters.minDiscount}%+ off`;
  };

  // Count active filters for each category
  const priceActive = filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice;
  const discountActive = filters.minDiscount > 0;
  const categoriesActive = filters.categories.length > 0;

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              placeholder={t('filters.searchPlaceholder')}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {/* Price Filter */}
          <Popover.Root open={openPopover === 'price'} onOpenChange={(open) => setOpenPopover(open ? 'price' : null)}>
            <Popover.Trigger asChild>
              <button className={`px-4 py-2 text-sm border rounded-full flex items-center gap-2 transition-colors ${
                priceActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}>
                <span>{t('filters.price')}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="bg-white rounded-xl shadow-xl border border-gray-200 p-5 z-50 w-72" sideOffset={8}>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">{t('filters.priceRange')}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('filters.range')}</span>
                      <span className="font-medium text-gray-900">${filters.priceRange[0]} - ${filters.priceRange[1]}</span>
                    </div>
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
                      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-grab active:cursor-grabbing shadow-sm" />
                      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-grab active:cursor-grabbing shadow-sm" />
                    </Slider.Root>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>$0</span>
                      <span>${maxPrice}</span>
                    </div>
                  </div>

                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
                    <div className="pt-2 border-t">
                      <button
                        onClick={() => {
                          onFiltersChange({ ...filters, priceRange: [0, maxPrice] });
                          setOpenPopover(null);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {t('filters.clearPriceFilter')}
                      </button>
                    </div>
                  )}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Discount Filter */}
          <Popover.Root open={openPopover === 'discount'} onOpenChange={(open) => setOpenPopover(open ? 'discount' : null)}>
            <Popover.Trigger asChild>
              <button className={`px-4 py-2 text-sm border rounded-full flex items-center gap-2 transition-colors ${
                discountActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}>
                <span>{t('filters.discount')}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="bg-white rounded-xl shadow-xl border border-gray-200 p-5 z-50 w-72" sideOffset={8}>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">{t('filters.minimumDiscount')}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('filters.atLeast')}</span>
                      <span className="font-medium text-gray-900">{filters.minDiscount}% off</span>
                    </div>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-5"
                      value={[filters.minDiscount]}
                      onValueChange={(value: number[]) => onFiltersChange({ ...filters, minDiscount: value[0] })}
                      max={50}
                      step={1}
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-grab active:cursor-grabbing shadow-sm" />
                    </Slider.Root>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {filters.minDiscount > 0 && (
                    <div className="pt-2 border-t">
                      <button
                        onClick={() => {
                          onFiltersChange({ ...filters, minDiscount: 0 });
                          setOpenPopover(null);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {t('filters.clearDiscountFilter')}
                      </button>
                    </div>
                  )}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Categories Filter */}
          <Popover.Root open={openPopover === 'categories'} onOpenChange={(open) => setOpenPopover(open ? 'categories' : null)}>
            <Popover.Trigger asChild>
              <button className={`min-w-[140px] px-4 py-2 text-sm border rounded-full flex items-center justify-between gap-2 transition-colors ${
                categoriesActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}>
                <div className="flex items-center gap-1">
                  <span>{t('filters.categories')}</span>
                  {categoriesActive && <span className="text-xs">({filters.categories.length})</span>}
                </div>
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="bg-white rounded-xl shadow-xl border border-gray-200 p-5 z-50 w-[420px] max-h-[500px] overflow-y-auto" sideOffset={8}>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">{t('filters.categories')}</h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map((category) => {
                      const Icon = categoryIcons[category] || FaBox; // Fallback to box icon
                      const isSelected = filters.categories.includes(category);
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            if (isSelected) {
                              onFiltersChange({ ...filters, categories: filters.categories.filter(c => c !== category) });
                            } else {
                              onFiltersChange({ ...filters, categories: [...filters.categories, category] });
                            }
                          }}
                          className={`relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                          <span className="text-xs font-medium capitalize leading-tight text-center">
                            {t(`categories.${category}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {filters.categories.length > 0 && (
                    <div className="pt-2 border-t">
                      <button
                        onClick={() => {
                          onFiltersChange({ ...filters, categories: [] });
                          setOpenPopover(null);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {t('filters.clearAllCategories')}
                      </button>
                    </div>
                  )}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        {/* Sort By - Right Aligned */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('filters.sortBy')}</span>
          <Popover.Root open={openPopover === 'sort'} onOpenChange={(open) => setOpenPopover(open ? 'sort' : null)}>
            <Popover.Trigger asChild>
              <button className="px-4 py-2 text-sm border border-gray-200 rounded-full flex items-center gap-2 hover:bg-gray-50 text-gray-700 font-medium">
                <span>{t(`filters.sortOptions.${filters.sortBy.replace('-', '_').replace('price_low', 'priceLow').replace('price_high', 'priceHigh')}`)}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 w-56" sideOffset={8} align="end">
                <div className="space-y-1">
                  {(['discount', 'savings', 'price-low', 'price-high', 'name'] as const).map((option) => {
                    const translationKey = option.replace('-', '_').replace('price_low', 'priceLow').replace('price_high', 'priceHigh');
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          onFiltersChange({ ...filters, sortBy: option });
                          setOpenPopover(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                          filters.sortBy === option
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t(`filters.sortOptions.${translationKey}`)}</span>
                        {filters.sortBy === option && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>

      {/* Active Filters Pills */}
      {/* {(filters.searchQuery || priceActive || discountActive || categoriesActive) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">{t('filters.active')}:</span>
          
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              "{filters.searchQuery}"
              <button
                onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
                className="hover:text-gray-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {priceActive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {getPriceLabel()}
              <button
                onClick={() => onFiltersChange({ ...filters, priceRange: [0, maxPrice] })}
                className="hover:text-gray-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {discountActive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {getDiscountLabel()}
              <button
                onClick={() => onFiltersChange({ ...filters, minDiscount: 0 })}
                className="hover:text-gray-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.categories.map((category) => (
            <span key={category} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">
              {t(`categories.${category}`)}
              <button
                onClick={() => onFiltersChange({ ...filters, categories: filters.categories.filter(c => c !== category) })}
                className="hover:text-gray-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          <button
            onClick={() => onFiltersChange({
              categories: [],
              priceRange: [0, maxPrice],
              minDiscount: 0,
              searchQuery: '',
              sortBy: 'discount',
              hasLimit: null,
            })}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('filters.clearAll')}
          </button>
        </div>
      )} */}
    </div>
  );
}