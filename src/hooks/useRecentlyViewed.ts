import { useState, useEffect } from 'react';
import { Product } from '@/lib/productParser';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 4;

export function useRecentlyViewed() {
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);

    // Load from storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setRecentProducts(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load recently viewed products', error);
        }
    }, []);

    // Add a product to history
    const addToHistory = (product: Product) => {
        setRecentProducts(prev => {
            // Remove if already exists (to move to top)
            const filtered = prev.filter(p => p.id !== product.id);
            // Add to front
            const updated = [product, ...filtered].slice(0, MAX_ITEMS);

            // Save to storage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (error) {
                console.error('Failed to save recently viewed product', error);
            }

            return updated;
        });
    };

    return { recentProducts, addToHistory };
}
