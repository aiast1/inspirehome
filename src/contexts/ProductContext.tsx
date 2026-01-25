import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Product, Category, parseProductsFromCSV, extractCategories } from '@/lib/productParser';

interface ProductContextType {
  products: Product[];
  inStockProducts: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  priceRange: { min: number; max: number };
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch('/data/products.csv?t=' + new Date().getTime());
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const csvText = await response.text();
        const parsedProducts = parseProductsFromCSV(csvText);
        const extractedCategories = extractCategories(parsedProducts);

        setProducts(parsedProducts);
        setCategories(extractedCategories);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Only show in-stock products by default
  const inStockProducts = useMemo(() =>
    products.filter(p => p.inStock),
    [products]
  );

  // Calculate price range from in-stock products
  const priceRange = useMemo(() => {
    if (inStockProducts.length === 0) return { min: 0, max: 1000 };
    const prices = inStockProducts.map(p => p.salePrice || p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }, [inStockProducts]);

  return (
    <ProductContext.Provider value={{
      products,
      inStockProducts,
      categories,
      isLoading,
      error,
      priceRange
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
