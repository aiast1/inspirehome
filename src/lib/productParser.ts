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

// Parse CSV line considering quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Extract image URLs from the images field
function parseImages(imageField: string): string[] {
  if (!imageField) return [];

  const uniqueImages = new Set<string>();
  const normalizedKeys = new Set<string>(); // To track normalized versions
  const parts = imageField.split(' | ');

  for (const part of parts) {
    const urlMatch = part.match(/(https?:\/\/[^\s!]+)/);
    if (urlMatch) {
      const url = urlMatch[1];
      // Normalize URL (remove protocol and query params for comparison)
      const normalized = url.replace(/^https?:\/\//, '').split('?')[0];

      if (!normalizedKeys.has(normalized)) {
        normalizedKeys.add(normalized);
        uniqueImages.add(url);
      }
    }
  }

  return Array.from(uniqueImages);
}

// Parse categories from the tax:product_cat field
function parseCategories(categoryField: string): string[] {
  if (!categoryField) return [];
  return categoryField.split('|').map(cat => cat.trim()).filter(Boolean);
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

// Parse products from CSV text
export function parseProductsFromCSV(csvText: string): Product[] {
  // Remove BOM if present
  const cleanText = csvText.replace(/^\uFEFF/, '');

  // Split by lines, handling multiline quoted fields
  const records: string[][] = [];
  let currentRecord: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRecord.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in \r\n
      }
      if (currentField || currentRecord.length > 0) {
        currentRecord.push(currentField.trim());
        if (currentRecord.length > 1) {
          records.push(currentRecord);
        }
        currentRecord = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }

  // Don't forget the last record
  if (currentField || currentRecord.length > 0) {
    currentRecord.push(currentField.trim());
    if (currentRecord.length > 1) {
      records.push(currentRecord);
    }
  }

  if (records.length < 2) return [];

  const products: Product[] = [];

  // Find column indices from header
  const header = records[0];
  const indices = {
    title: header.findIndex(h => h.includes('post_title')),
    slug: header.findIndex(h => h === 'post_name'),
    content: header.findIndex(h => h === 'post_content'),
    excerpt: header.findIndex(h => h === 'post_excerpt'),
    price: header.findIndex(h => h === 'regular_price'),
    salePrice: header.findIndex(h => h === 'sale_price'),
    stock: header.findIndex(h => h === 'stock'),
    stockStatus: header.findIndex(h => h === 'stock_status'),
    images: header.findIndex(h => h === 'images'),
    categories: header.findIndex(h => h === 'tax:product_cat'),
    color: header.findIndex(h => h === 'attribute:pa_chroma'),
    dimensions: header.findIndex(h => h === 'attribute:pa_diastaseis'),
    material: header.findIndex(h => h === 'attribute:pa_yliko'),
  };

  // Process each record (skip header, limit for performance)
  const maxProducts = 30000; // Limit initial load for performance - increased for larger catalog
  for (let i = 1; i < Math.min(records.length, maxProducts + 1); i++) {
    const fields = records[i];
    if (!fields || fields.length < 5) continue;

    try {
      const title = fields[indices.title] || '';
      const priceStr = fields[indices.price] || '0';
      const salePriceStr = fields[indices.salePrice];
      const stockStr = fields[indices.stock] || '0';
      const stockStatus = fields[indices.stockStatus] || '';

      if (!title) continue;

      const product: Product = {
        id: `product-${i}`,
        title,
        slug: fields[indices.slug] || createSlug(title),
        description: fields[indices.content] || '',
        excerpt: fields[indices.excerpt] || '',
        price: parseFloat(priceStr) || 0,
        salePrice: salePriceStr ? parseFloat(salePriceStr) : undefined,
        images: parseImages(fields[indices.images] || ''),
        categories: parseCategories(fields[indices.categories] || ''),
        color: fields[indices.color] || undefined,
        dimensions: fields[indices.dimensions] || undefined,
        material: fields[indices.material] || undefined,
        inStock: stockStatus !== 'outofstock',
        stock: parseInt(stockStr) || 0,
      };

      if (product.price > 0) {
        products.push(product);
      }
    } catch (error) {
      // Skip malformed lines
      continue;
    }
  }

  return products;
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
