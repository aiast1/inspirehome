export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  price: number;
  salePrice?: number;
  images: string[];
  categories: string[];
  color?: string;
  dimensions?: string;
  material?: string;
  inStock: boolean;
  stock: number;
}

export interface Category {
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  name: string;
  slug: string;
  parentCategory: string;
}

// Create slug from text
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03ff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Parse products from JSON array (pre-processed by sync script)
export function parseProductsFromJSON(jsonData: unknown[]): Product[] {
  if (!Array.isArray(jsonData)) return [];

  return jsonData
    .filter((item): item is Record<string, unknown> =>
      !!item && typeof item === 'object' && 'id' in item && 'title' in item && 'price' in item
    )
    .map(item => ({
      id: String(item.id),
      title: String(item.title),
      slug: String(item.slug || '') || createSlug(String(item.title)),
      description: String(item.description || ''),
      excerpt: String(item.excerpt || ''),
      price: Number(item.price) || 0,
      salePrice: item.salePrice ? Number(item.salePrice) : undefined,
      images: Array.isArray(item.images) ? item.images.map(String) : [],
      categories: Array.isArray(item.categories) ? item.categories.map(String) : [],
      color: item.color ? String(item.color) : undefined,
      dimensions: item.dimensions ? String(item.dimensions) : undefined,
      material: item.material ? String(item.material) : undefined,
      inStock: item.inStock !== false,
      stock: Number(item.stock) || 0,
    }))
    .filter(p => p.price > 0);
}

// Extract unique categories from products
export function extractCategories(products: Product[]): Category[] {
  const categoryMap = new Map<string, Set<string>>();

  for (const product of products) {
    for (const cat of product.categories) {
      if (cat.includes('>')) {
        const [parent, child] = cat.split('>').map(s => s.trim());
        if (!categoryMap.has(parent)) {
          categoryMap.set(parent, new Set());
        }
        if (child) {
          categoryMap.get(parent)!.add(child);
        }
      } else if (cat && !cat.includes('OFFERS') && !cat.includes('SPECIAL') && !cat.includes('Families')) {
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, new Set());
        }
      }
    }
  }

  const categories: Category[] = [];

  categoryMap.forEach((subcats, name) => {
    const subcategories: Subcategory[] = Array.from(subcats).map(sub => ({
      name: sub,
      slug: createSlug(sub),
      parentCategory: name,
    }));

    categories.push({
      name,
      slug: createSlug(name),
      subcategories,
    });
  });

  return categories.sort((a, b) => a.name.localeCompare(b.name, 'el'));
}

// Filter products by category
export function filterProductsByCategory(products: Product[], categorySlug: string): Product[] {
  const normalizedSlug = categorySlug.toLowerCase().replace(/-/g, ' ');
  return products.filter(product =>
    product.categories.some(cat => {
      const normalizedCat = cat.toLowerCase();
      return normalizedCat.includes(normalizedSlug) ||
        createSlug(cat).includes(categorySlug.toLowerCase());
    })
  );
}

// Search products
export function searchProducts(products: Product[], query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(product =>
    product.title.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.categories.some(cat => cat.toLowerCase().includes(lowerQuery))
  );
}

// Get similar products (same category)
export function getSimilarProducts(products: Product[], currentProduct: Product, limit = 4): Product[] {
  const mainCategory = currentProduct.categories[0]?.split('>')[0]?.trim();
  if (!mainCategory) return products.slice(0, limit);

  return products
    .filter(p =>
      p.id !== currentProduct.id &&
      p.categories.some(cat => cat.includes(mainCategory))
    )
    .slice(0, limit);
}
