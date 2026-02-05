import { createHash } from 'crypto';

/**
 * Hash a product's relevant fields for change detection.
 */
function hashProduct(product) {
  const relevant = {
    title: product.title,
    price: product.price,
    salePrice: product.salePrice,
    stock: product.stock,
    images: product.images,
    categories: product.categories,
    description: product.description,
    color: product.color,
    dimensions: product.dimensions,
    material: product.material,
  };
  return createHash('md5').update(JSON.stringify(relevant)).digest('hex');
}

/**
 * Compute delta between new products and previous sync state.
 * Returns { delta, newHashes } where newHashes can be saved for next run.
 */
export function computeDelta(newProducts, previousHashes) {
  const newHashes = {};
  const delta = {
    new: [],
    removed: [],
    changed: [],
    unchanged: 0,
  };

  for (const product of newProducts) {
    const hash = hashProduct(product);
    newHashes[product.id] = hash;

    if (!previousHashes[product.id]) {
      delta.new.push(product.id);
    } else if (previousHashes[product.id] !== hash) {
      delta.changed.push(product.id);
    } else {
      delta.unchanged++;
    }
  }

  for (const id of Object.keys(previousHashes)) {
    if (!newHashes[id]) {
      delta.removed.push(id);
    }
  }

  return { delta, newHashes };
}

/**
 * Check if there are any actual changes in the delta.
 */
export function hasChanges(delta) {
  return delta.new.length > 0 || delta.removed.length > 0 || delta.changed.length > 0;
}
