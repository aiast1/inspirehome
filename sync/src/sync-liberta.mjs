import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseXmlFeed } from './xml-parser.mjs';
import { transformAllProducts } from './transform.mjs';
import { computeDelta, hasChanges } from './delta.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PROJECT_ROOT = resolve(ROOT, '..');

// File paths
const MARKUP_PATH = resolve(ROOT, 'config/markup.json');
const CATEGORY_MAP_PATH = resolve(ROOT, 'config/category-map.json');
const LAST_SYNC_PATH = resolve(ROOT, 'data/last-sync.json');
const SYNC_HISTORY_PATH = resolve(PROJECT_ROOT, 'public/data/sync-history.json');
const OUTPUT_PATH = resolve(PROJECT_ROOT, 'public/data/liberta-products.json');

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function loadLastSync() {
  if (!existsSync(LAST_SYNC_PATH)) {
    return { lastSync: null, productCount: 0, productHash: {}, delta: {} };
  }
  return loadJson(LAST_SYNC_PATH);
}

async function main() {
  const feedUrl = process.env.LIBERTA_FEED_URL;
  if (!feedUrl) {
    console.error('ERROR: LIBERTA_FEED_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Loading configuration...');
  const markupConfig = loadJson(MARKUP_PATH);
  const categoryMap = loadJson(CATEGORY_MAP_PATH);
  const lastSync = loadLastSync();

  console.log(`Fetching XML feed from Liberta...`);
  let xmlText;
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    xmlText = await response.text();
    console.log(`Downloaded ${(xmlText.length / 1024 / 1024).toFixed(1)}MB of XML data`);
  } catch (err) {
    console.error(`ERROR: Failed to fetch XML feed: ${err.message}`);
    process.exit(1);
  }

  console.log('Parsing XML...');
  let xmlProducts;
  try {
    xmlProducts = parseXmlFeed(xmlText);
    console.log(`Parsed ${xmlProducts.length} products from XML`);
  } catch (err) {
    console.error(`ERROR: Failed to parse XML: ${err.message}`);
    process.exit(1);
  }

  console.log('Transforming products...');
  const products = transformAllProducts(xmlProducts, markupConfig, categoryMap);
  console.log(`Transformed ${products.length} valid in-stock products`);

  // Safety check: abort if zero products (likely a feed error)
  if (products.length === 0) {
    console.error('ERROR: Zero valid products after transformation. Aborting to prevent data wipe.');
    process.exit(1);
  }

  console.log('Computing delta...');
  const { delta, newHashes } = computeDelta(products, lastSync.productHash || {});

  if (!hasChanges(delta)) {
    console.log('No changes detected. Skipping file writes.');
    process.exit(0);
  }

  // Log delta summary
  console.log(`Delta summary:`);
  console.log(`  New products:     ${delta.new.length}`);
  console.log(`  Removed products: ${delta.removed.length}`);
  console.log(`  Changed products: ${delta.changed.length}`);
  console.log(`  Unchanged:        ${delta.unchanged}`);

  // Write product JSON
  console.log(`Writing ${products.length} products to ${OUTPUT_PATH}...`);
  writeFileSync(OUTPUT_PATH, JSON.stringify(products, null, 2), 'utf-8');

  // Write sync state
  const now = new Date().toISOString();
  const syncState = {
    lastSync: now,
    productCount: products.length,
    productHash: newHashes,
    delta: {
      new: delta.new.length,
      removed: delta.removed.length,
      changed: delta.changed.length,
      unchanged: delta.unchanged,
      newIds: delta.new.slice(0, 50),
      removedIds: delta.removed.slice(0, 50),
      changedIds: delta.changed.slice(0, 50),
    },
  };
  writeFileSync(LAST_SYNC_PATH, JSON.stringify(syncState, null, 2), 'utf-8');

  // Append to sync history (keep last 90 entries)
  let history = [];
  if (existsSync(SYNC_HISTORY_PATH)) {
    try { history = JSON.parse(readFileSync(SYNC_HISTORY_PATH, 'utf-8')); } catch {}
  }
  history.unshift({
    timestamp: now,
    productCount: products.length,
    delta: {
      new: delta.new.length,
      removed: delta.removed.length,
      changed: delta.changed.length,
      unchanged: delta.unchanged,
    },
    sampleNewIds: delta.new.slice(0, 10),
    sampleRemovedIds: delta.removed.slice(0, 10),
    sampleChangedIds: delta.changed.slice(0, 10),
  });
  if (history.length > 90) history = history.slice(0, 90);
  writeFileSync(SYNC_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');

  console.log('Sync complete!');
}

main();
