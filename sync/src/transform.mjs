/**
 * Create a URL-safe slug from text (supports Greek characters).
 */
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03ff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Resolve the markup multiplier for a product based on its primary category.
 */
function getMarkupRule(rawCategories, markupConfig) {
  for (const cat of rawCategories) {
    if (markupConfig.categoryOverrides[cat]) {
      return markupConfig.categoryOverrides[cat];
    }
  }
  return markupConfig.default;
}

/**
 * Map raw Liberta categories to site categories using the category map config.
 */
function mapCategories(rawCategories, categoryMap) {
  const mapped = [];

  for (const cat of rawCategories) {
    // Check if explicitly excluded
    if (categoryMap.excludeCategories && categoryMap.excludeCategories.includes(cat)) {
      continue;
    }

    if (cat in categoryMap.mapping) {
      const target = categoryMap.mapping[cat];
      if (target !== null && !mapped.includes(target)) {
        mapped.push(target);
      }
    } else if (categoryMap.passthrough) {
      if (!mapped.includes(cat)) {
        mapped.push(cat);
      }
    }
  }

  return mapped;
}

/**
 * Extract image URLs from a Liberta XML product, deduplicating.
 */
function extractImages(xmlProduct) {
  const images = [];
  const seen = new Set();

  if (xmlProduct.photo) {
    images.push(xmlProduct.photo);
    seen.add(xmlProduct.photo);
  }

  const photoItems = normalizeArray(xmlProduct.photos?.item);
  for (const url of photoItems) {
    if (url && typeof url === 'string' && !seen.has(url)) {
      images.push(url);
      seen.add(url);
    }
  }

  return images;
}

/**
 * Ensure a value is always an array (handles XML parser inconsistency
 * where single <item> becomes a string instead of array).
 */
function normalizeArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

/**
 * Transform a single Liberta XML product into our Product interface shape.
 * Returns null if the product should be skipped.
 */
export function transformProduct(xmlProduct, markupConfig, categoryMap) {
  const sku = String(xmlProduct.sku || '').trim();
  const name = String(xmlProduct.name || '').trim();
  const quantity = parseInt(xmlProduct.quantity) || 0;

  // Skip out-of-stock products
  if (quantity <= 0) return null;

  // Skip products without a name or SKU
  if (!name || !sku) return null;

  // Resolve categories
  const rawCategories = normalizeArray(xmlProduct.categories?.item);
  const mappedCategories = mapCategories(rawCategories, categoryMap);

  // Resolve pricing with markup
  const markupRule = getMarkupRule(rawCategories, markupConfig);
  const retailPrice = parseFloat(xmlProduct['retail-price']) || 0;
  if (retailPrice <= 0) return null;

  const price = parseFloat((retailPrice * markupRule.multiplier).toFixed(markupRule.roundTo));

  let salePrice = undefined;
  if (markupConfig.saleRules.useDiscountedPrice && xmlProduct['discounted-price']) {
    const discounted = parseFloat(xmlProduct['discounted-price']);
    if (discounted > 0 && discounted < retailPrice) {
      salePrice = parseFloat((discounted * markupRule.multiplier).toFixed(markupRule.roundTo));
    }
  }

  // Build description
  const description = String(xmlProduct.description || '');
  const comments = String(xmlProduct.comments || '');
  const fullDescription = comments ? `${description}\n\n${comments}` : description;
  const excerpt = description.substring(0, 200) + (description.length > 200 ? '...' : '');

  return {
    id: `liberta-${sku}`,
    title: name,
    slug: createSlug(name),
    description: fullDescription,
    excerpt,
    price,
    salePrice,
    images: extractImages(xmlProduct),
    categories: mappedCategories,
    color: xmlProduct.color ? String(xmlProduct.color) : undefined,
    dimensions: xmlProduct.dimensions ? String(xmlProduct.dimensions) : undefined,
    material: xmlProduct.material ? String(xmlProduct.material) : undefined,
    inStock: true,
    stock: quantity,
  };
}

/**
 * Transform all XML products, handling slug collisions.
 */
export function transformAllProducts(xmlProducts, markupConfig, categoryMap) {
  const products = [];
  const slugCounts = new Map();

  for (const xmlProduct of xmlProducts) {
    const product = transformProduct(xmlProduct, markupConfig, categoryMap);
    if (!product) continue;

    // Handle slug collisions
    if (slugCounts.has(product.slug)) {
      const count = slugCounts.get(product.slug) + 1;
      slugCounts.set(product.slug, count);
      product.slug = `${product.slug}-${count}`;
    } else {
      slugCounts.set(product.slug, 1);
    }

    products.push(product);
  }

  return products;
}
