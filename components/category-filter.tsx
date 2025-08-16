'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  FaWineBottle, // alcohol
  FaBaby, // baby
  FaBreadSlice, // bakery
  FaPaintBrush, // beauty
  FaCandyCane, // candy
  FaCheese, // deli
  FaTv, // electronics
  FaSnowflake, // frozen
  FaShoppingBasket, // grocery
  FaHeartbeat, // health
  FaHome, // household
  FaDrumstickBite, // meat
  FaBox, // other
  FaShower, // personal_care
  FaDog, // pets
  FaPills, // pharmacy
  FaCarrot, // produce
  FaCookie, // snacks
  FaGamepad, // toys
  FaGlassWhiskey, // dairy (milk glass)
  FaTshirt, // apparel
  FaCar, // automotive
  FaBook, // books
  FaSeedling, // floral
  FaGlassMartiniAlt // drinks
} from 'react-icons/fa';
import { 
  GiMilkCarton, // dairy
  GiFlour, // pantry
  GiMeat, // meat
  GiChocolateBar, // candy
  GiSlicedBread, // bakery
  GiTomato, // produce
  GiPopcorn, // snacks
  GiFlowerPot, // floral/flowers
  GiFishCorpse, // seafood
  GiPill, // vitamins
  GiHotMeal, // prepared food
  GiCampingTent // outdoor
} from 'react-icons/gi';
import {
  MdLocalPharmacy, // pharmacy/medicine
  MdPets, // pets
  MdLocalGroceryStore // grocery
} from 'react-icons/md';
import {
  BiSolidWine // alcohol
} from 'react-icons/bi';
import {
  TbMeat // alternative meat icon
} from 'react-icons/tb';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
}

// Map categories to icons and colors with better, more specific icons
const categoryConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  alcohol: { icon: BiSolidWine, color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
  baby: { icon: FaBaby, color: 'text-pink-600', bgColor: 'bg-pink-50 hover:bg-pink-100' },
  bakery: { icon: GiSlicedBread, color: 'text-amber-600', bgColor: 'bg-amber-50 hover:bg-amber-100' },
  beauty: { icon: FaPaintBrush, color: 'text-rose-600', bgColor: 'bg-rose-50 hover:bg-rose-100' },
  candy: { icon: GiChocolateBar, color: 'text-indigo-600', bgColor: 'bg-indigo-50 hover:bg-indigo-100' },
  deli: { icon: FaCheese, color: 'text-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100' },
  diary: { icon: GiMilkCarton, color: 'text-blue-500', bgColor: 'bg-blue-50 hover:bg-blue-100' }, // dairy misspelled in data
  dairy: { icon: GiMilkCarton, color: 'text-blue-500', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  drinks: { icon: FaGlassMartiniAlt, color: 'text-purple-500', bgColor: 'bg-purple-50 hover:bg-purple-100' },
  flowers: { icon: GiFlowerPot, color: 'text-pink-600', bgColor: 'bg-pink-50 hover:bg-pink-100' },
  frozen: { icon: FaSnowflake, color: 'text-cyan-600', bgColor: 'bg-cyan-50 hover:bg-cyan-100' },
  household: { icon: FaHome, color: 'text-slate-600', bgColor: 'bg-slate-50 hover:bg-slate-100' },
  meat: { icon: GiMeat, color: 'text-red-700', bgColor: 'bg-red-50 hover:bg-red-100' },
  medecine: { icon: MdLocalPharmacy, color: 'text-teal-600', bgColor: 'bg-teal-50 hover:bg-teal-100' }, // medicine misspelled
  medicine: { icon: MdLocalPharmacy, color: 'text-teal-600', bgColor: 'bg-teal-50 hover:bg-teal-100' },
  outdoor: { icon: GiCampingTent, color: 'text-green-700', bgColor: 'bg-green-50 hover:bg-green-100' },
  pantry: { icon: GiFlour, color: 'text-yellow-700', bgColor: 'bg-yellow-50 hover:bg-yellow-100' },
  personal: { icon: FaShower, color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
  personal_care: { icon: FaShower, color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
  pet: { icon: MdPets, color: 'text-orange-700', bgColor: 'bg-orange-50 hover:bg-orange-100' },
  pets: { icon: MdPets, color: 'text-orange-700', bgColor: 'bg-orange-50 hover:bg-orange-100' },
  prepared: { icon: GiHotMeal, color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100' },
  produce: { icon: GiTomato, color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100' },
  seafood: { icon: GiFishCorpse, color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  snacks: { icon: GiPopcorn, color: 'text-yellow-600', bgColor: 'bg-yellow-50 hover:bg-yellow-100' },
  viatamin: { icon: GiPill, color: 'text-emerald-600', bgColor: 'bg-emerald-50 hover:bg-emerald-100' }, // vitamin misspelled
  vitamin: { icon: GiPill, color: 'text-emerald-600', bgColor: 'bg-emerald-50 hover:bg-emerald-100' },
  // Legacy/other categories that might exist
  electronics: { icon: FaTv, color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
  grocery: { icon: MdLocalGroceryStore, color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100' },
  health: { icon: FaHeartbeat, color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100' },
  pharmacy: { icon: MdLocalPharmacy, color: 'text-teal-600', bgColor: 'bg-teal-50 hover:bg-teal-100' },
  toys: { icon: FaGamepad, color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
  apparel: { icon: FaTshirt, color: 'text-indigo-600', bgColor: 'bg-indigo-50 hover:bg-indigo-100' },
  automotive: { icon: FaCar, color: 'text-gray-700', bgColor: 'bg-gray-50 hover:bg-gray-100' },
  books: { icon: FaBook, color: 'text-amber-700', bgColor: 'bg-amber-50 hover:bg-amber-100' },
  floral: { icon: GiFlowerPot, color: 'text-pink-600', bgColor: 'bg-pink-50 hover:bg-pink-100' },
  other: { icon: FaBox, color: 'text-gray-600', bgColor: 'bg-gray-50 hover:bg-gray-100' },
};

export function CategoryFilter({ categories, selectedCategories, onCategoryToggle }: CategoryFilterProps) {
  const t = useTranslations();

  // Get config with fallback for unknown categories
  const getCategoryConfig = (category: string) => {
    return categoryConfig[category.toLowerCase()] || {
      icon: FaBox,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {t('filters.categories')}
        </label>
        {selectedCategories.length > 0 && (
          <span className="text-xs text-gray-500">
            {selectedCategories.length} selected
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        {categories.map((category) => {
          const config = getCategoryConfig(category);
          const Icon = config.icon;
          const isSelected = selectedCategories.includes(category);
          
          return (
            <motion.button
              key={category}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryToggle(category)}
              className={`
                relative flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500 text-white shadow-md' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex-shrink-0">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                {t(`categories.${category}`)}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1"
                >
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      {selectedCategories.length > 0 && (
        <button
          onClick={() => selectedCategories.forEach(cat => onCategoryToggle(cat))}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear categories
        </button>
      )}
    </div>
  );
}
