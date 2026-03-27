import { Product, CategoryStats } from './types';

interface RawProduct {
  item_id: string;
  name: string;
  category: string;
  image_url: string | null;
  store_name: string;
  item_msid: string;
  current_price: number;
  current_date: string;
  previous_price: number | null;
  previous_date: string | null;
  price_change_pct: number | null;
  all_time_low: number;
  all_time_high: number;
  avg_price: number;
  price_history: { date: string; price: number }[];
  status: 'new' | 'returning' | 'stable' | 'disappeared';
  first_seen: string;
  last_seen: string;
  times_seen: number;
}

interface ProductsJSON {
  generated_at: string;
  latest_scrape: string;
  previous_scrape: string | null;
  total_products: number;
  new_count: number;
  returning_count: number;
  disappeared_count: number;
  products: RawProduct[];
}

export interface ScrapeMeta {
  latestScrape: string;
  previousScrape: string | null;
  newCount: number;
  returningCount: number;
  disappearedCount: number;
}

function mapProduct(p: RawProduct): Product {
  return {
    id: p.item_id,
    name: p.name,
    category: p.category,
    imageUrl: p.image_url,
    storeName: p.store_name,
    itemMsid: p.item_msid,
    price: p.current_price,
    currency: 'NZD',
    previousPrice: p.previous_price,
    previousDate: p.previous_date,
    priceChangePct: p.price_change_pct,
    allTimeLow: p.all_time_low,
    allTimeHigh: p.all_time_high,
    avgPrice: p.avg_price,
    priceHistory: p.price_history,
    status: p.status,
    firstSeen: p.first_seen,
    lastSeen: p.last_seen,
    timesSeen: p.times_seen,
  };
}

export async function fetchProducts(): Promise<{ products: Product[]; meta: ScrapeMeta }> {
  try {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/products.json`);
    const data: ProductsJSON = await response.json();

    return {
      products: data.products.map(mapProduct),
      meta: {
        latestScrape: data.latest_scrape,
        previousScrape: data.previous_scrape,
        newCount: data.new_count,
        returningCount: data.returning_count,
        disappearedCount: data.disappeared_count,
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      meta: { latestScrape: '', previousScrape: null, newCount: 0, returningCount: 0, disappearedCount: 0 },
    };
  }
}

export function getCategoryStats(products: Product[]): CategoryStats[] {
  const categoryMap = new Map<string, Product[]>();

  for (const product of products) {
    const existing = categoryMap.get(product.category);
    if (existing) {
      existing.push(product);
    } else {
      categoryMap.set(product.category, [product]);
    }
  }

  const stats: CategoryStats[] = [];

  categoryMap.forEach((categoryProducts, categoryName) => {
    const prices = categoryProducts.map(p => p.price);
    const changes = categoryProducts
      .filter(p => p.priceChangePct !== null)
      .map(p => p.priceChangePct!);

    stats.push({
      name: categoryName,
      productCount: categoryProducts.length,
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      avgPriceChange: changes.length > 0
        ? changes.reduce((a, b) => a + b, 0) / changes.length
        : 0,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    });
  });

  return stats.sort((a, b) => b.productCount - a.productCount);
}

export function getBiggestPriceDrops(products: Product[], limit: number = 12): Product[] {
  return products
    .filter(p => p.priceChangePct !== null && p.priceChangePct < 0)
    .sort((a, b) => (a.priceChangePct ?? 0) - (b.priceChangePct ?? 0))
    .slice(0, limit);
}
