export interface PricePoint {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  storeName: string;
  itemMsid: string;

  price: number;
  currency: string;

  previousPrice: number | null;
  previousDate: string | null;
  priceChangePct: number | null;

  allTimeLow: number;
  allTimeHigh: number;
  avgPrice: number;
  priceHistory: PricePoint[];

  status: 'new' | 'returning' | 'stable' | 'disappeared';
  firstSeen: string;
  lastSeen: string;
  timesSeen: number;
}

export interface CategoryStats {
  name: string;
  productCount: number;
  avgPrice: number;
  avgPriceChange: number;
  minPrice: number;
  maxPrice: number;
}

export type ProductStatus = 'new' | 'returning' | 'stable' | 'disappeared';

export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  minPriceDrop: number;
  searchQuery: string;
  sortBy: 'price-drop' | 'price-low' | 'price-high' | 'name';
  statusFilter: 'all' | ProductStatus;
}
