export interface Product {
  category: string;
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  currency: string;
  displayPrice: string;
  storeId: string;
  storeName: string;
  itemMsid: string;
  stockLevel: string;
  limit: string;
  imageUrl: string;
}

export interface CategoryStats {
  name: string;
  productCount: number;
  avgPrice: number;
  avgDiscount: number;
  minPrice: number;
  maxPrice: number;
}

export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  minDiscount: number;
  searchQuery: string;
  sortBy: 'discount' | 'price-low' | 'price-high' | 'name' | 'savings';
  hasLimit: boolean | null;
}
