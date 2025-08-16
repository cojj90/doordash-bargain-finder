import Papa from 'papaparse';
import { Product, CategoryStats } from './types';

interface CSVRow {
  Category: string;
  ID: string;
  Name: string;
  Price: string;
  'Original Price': string;
  'Discount %': string;
  Currency: string;
  'Display Price': string;
  'Store ID': string;
  'Store Name': string;
  'Item MSID': string;
  'Stock Level': string;
  Limit: string;
  'Image URL': string;
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    // In production, use the full URL; in development, use relative path
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/products.csv`);
    const csvText = await response.text();
    
    const result = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    return result.data.map((row) => ({
      category: row.Category || '',
      id: row.ID || '',
      name: row.Name || '',
      price: parseFloat(row.Price) || 0,
      originalPrice: row['Original Price'] ? parseFloat(row['Original Price']) : null,
      discount: row['Discount %'] ? parseInt(row['Discount %']) : null,
      currency: row.Currency || 'NZD',
      displayPrice: row['Display Price'] || '',
      storeId: row['Store ID'] || '',
      storeName: row['Store Name'] || '',
      itemMsid: row['Item MSID'] || '',
      stockLevel: row['Stock Level'] || '',
      limit: row.Limit || '',
      imageUrl: row['Image URL'] || '',
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export function getCategoryStats(products: Product[]): CategoryStats[] {
  const categoryMap = new Map<string, Product[]>();
  
  products.forEach(product => {
    const category = product.category;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(product);
  });
  
  const stats: CategoryStats[] = [];
  
  categoryMap.forEach((categoryProducts, categoryName) => {
    const prices = categoryProducts.map(p => p.price);
    const discounts = categoryProducts
      .filter(p => p.discount !== null)
      .map(p => p.discount!);
    
    stats.push({
      name: categoryName,
      productCount: categoryProducts.length,
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      avgDiscount: discounts.length > 0 
        ? discounts.reduce((a, b) => a + b, 0) / discounts.length 
        : 0,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    });
  });
  
  return stats.sort((a, b) => b.productCount - a.productCount);
}

export function getTopDeals(products: Product[], limit: number = 10): Product[] {
  return products
    .filter(p => p.discount !== null)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, limit);
}

export function getBiggestSavings(products: Product[], limit: number = 10): Product[] {
  return products
    .filter(p => p.originalPrice !== null)
    .map(p => ({
      ...p,
      savings: (p.originalPrice || 0) - p.price
    }))
    .sort((a, b) => b.savings - a.savings)
    .slice(0, limit);
}
