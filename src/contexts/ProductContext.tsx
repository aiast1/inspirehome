import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Product, Category, parseProductsFromJSON, extractCategories } from '@/lib/productParser';

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
        const cacheBust = `?t=${Date.now()}`;

        const [libertaResponse, otherResponse] = await Promise.all([
          fetch(`/data/liberta-products.json${cacheBust}`),
          fetch(`/data/other-products.json${cacheBust}`),
        ]);

        let libertaProducts: Product[] = [];
        let otherProducts: Product[] = [];

        if (libertaResponse.ok) {
          const libertaJson = await libertaResponse.json();
          libertaProducts = parseProductsFromJSON(libertaJson);
        }

        if (otherResponse.ok) {
          const otherJson = await otherResponse.json();
          otherProducts = parseProductsFromJSON(otherJson);
        }

        // Merge both sources, dedup by ID
        const productMap = new Map<string, Product>();
        for (const p of libertaProducts) productMap.set(p.id, p);
        for (const p of otherProducts) productMap.set(p.id, p);
        const allProducts = Array.from(productMap.values());

        const extractedCategories = extractCategories(allProducts);

        setProducts(allProducts);
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
